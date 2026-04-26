package com.mockbank.webhook;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mockbank.config.BankProperties;
import com.mockbank.credentials.domain.MerchantCredential;
import com.mockbank.credentials.repo.MerchantCredentialRepository;
import com.mockbank.merchants.domain.Merchant;
import com.mockbank.payments.domain.PaymentIntent;
import com.mockbank.signing.*;

@Component
public class WebhookSender {

    private static final Logger log = LoggerFactory.getLogger(WebhookSender.class);
    private final MerchantCredentialRepository credentialRepo;
    private final BankProperties bankProperties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public WebhookSender(MerchantCredentialRepository credentialRepo, BankProperties bankProperties, ObjectMapper objectMapper) {
        this.credentialRepo = credentialRepo;
        this.bankProperties = bankProperties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    }

    @Async
    public void sendAsync(PaymentIntent intent) {
        Merchant merchant = intent.getMerchant();
        if (merchant.getWebhookUrl() == null || merchant.getWebhookUrl().isBlank()) {
            log.info("No webhook URL for merchant {}, skipping", merchant.getSlug());
            return;
        }

        int maxRetries = bankProperties.getWebhook().getMaxRetries();
        long delayMs = bankProperties.getWebhook().getInitialDelayMs();

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                sendWebhook(intent, merchant);
                log.info("Webhook sent for {} to {} (attempt {})", intent.getPaymentRef(), merchant.getWebhookUrl(), attempt);
                return;
            } catch (Exception e) {
                log.warn("Webhook attempt {} failed for {}: {}", attempt, intent.getPaymentRef(), e.getMessage());
                if (attempt < maxRetries) {
                    try { Thread.sleep(delayMs); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); return; }
                    delayMs *= 2;
                }
            }
        }
        log.error("All webhook attempts exhausted for {}", intent.getPaymentRef());
    }

    private void sendWebhook(PaymentIntent intent, Merchant merchant) throws Exception {
        var payload = new WebhookPayload(intent.getPaymentRef(), intent.getExternalOrderId(),
                intent.getStatus(), intent.getAmount(), intent.getCurrency(), Instant.now());
        String bodyJson = objectMapper.writeValueAsString(payload);

        String timestamp = Instant.now().toString();
        String nonce = UUID.randomUUID().toString();
        String canonical = SignaturePayloadBuilder.build("POST", "/api/v1/payments/webhook", timestamp, nonce, bodyJson);

        String signature;
        String alg;
        String serial = "";

        var rsaCreds = credentialRepo.findActiveByMerchantAndType(merchant.getId(), "RSA_KEYPAIR");
        if (!rsaCreds.isEmpty()) {
            MerchantCredential cred = rsaCreds.get(0);
            String privateKeyPem = AesEncryptor.decrypt(cred.getPrivateKeyPemEncrypted(), bankProperties.getMasterKey());
            signature = RsaSigner.sign(canonical, privateKeyPem);
            alg = "RSA-SHA256";
            serial = cred.getSerial();
        } else {
            var hmacCreds = credentialRepo.findActiveByMerchantAndType(merchant.getId(), "HMAC_SECRET");
            if (hmacCreds.isEmpty()) throw new RuntimeException("No credentials for webhook signing");
            MerchantCredential cred = hmacCreds.get(0);
            String secret = AesEncryptor.decrypt(cred.getHmacSecretEncrypted(), bankProperties.getMasterKey());
            signature = HmacSigner.sign(canonical, secret);
            alg = "HMAC-SHA256";
            serial = cred.getSerial();
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(merchant.getWebhookUrl()))
                .header("Content-Type", "application/json")
                .header("X-Merchant-Id", merchant.getSlug())
                .header("X-Signature", signature)
                .header("X-Signature-Alg", alg)
                .header("X-Signature-Serial", serial)
                .header("X-Timestamp", timestamp)
                .header("X-Nonce", nonce)
                .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new RuntimeException("Webhook returned HTTP " + response.statusCode());
        }
    }

    record WebhookPayload(String paymentRef, String externalOrderId, String status, java.math.BigDecimal amount, String currency, Instant processedAt) {}
}
