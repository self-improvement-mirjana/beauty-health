package com.beautyhealth.order.service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.beautyhealth.config.BankPaymentProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class BankClient {

    private static final Logger log = LoggerFactory.getLogger(BankClient.class);
    private final BankPaymentProperties props;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public BankClient(BankPaymentProperties props, ObjectMapper objectMapper) {
        this.props = props;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();
    }

    public record PaymentIntentResult(String paymentRef, String redirectUrl, Instant expiresAt) {}

    public PaymentIntentResult createPaymentIntent(long orderId, BigDecimal amount, String currency) {
        try {
            String bodyJson = objectMapper.writeValueAsString(new CreatePaymentBody(
                    String.valueOf(orderId), amount, currency, null, null, 900));

            String timestamp = Instant.now().toString();
            String nonce = UUID.randomUUID().toString();
            String canonical = buildCanonical("POST", "/api/v1/payments", timestamp, nonce, bodyJson);
            String signature = sign(canonical);
            String alg = "RSA".equals(props.getSigningMode()) ? "RSA-SHA256" : "HMAC-SHA256";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(props.getBaseUrl() + "/api/v1/payments"))
                    .header("Content-Type", "application/json")
                    .header("X-Merchant-Id", props.getMerchantSlug())
                    .header("X-Signature", signature)
                    .header("X-Signature-Alg", alg)
                    .header("X-Timestamp", timestamp)
                    .header("X-Nonce", nonce)
                    .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                log.error("Bank API error: {} {}", response.statusCode(), response.body());
                throw new RuntimeException("Bank payment creation failed: HTTP " + response.statusCode());
            }

            JsonNode node = objectMapper.readTree(response.body());
            return new PaymentIntentResult(
                    node.get("paymentRef").asText(),
                    node.get("redirectUrl").asText(),
                    Instant.parse(node.get("expiresAt").asText()));
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Bank API call failed", e);
        }
    }

    public boolean verifyWebhookSignature(String signature, String signatureAlg, String timestamp, String nonce, String body) {
        try {
            String canonical = buildCanonical("POST", "/api/v1/payments/webhook", timestamp, nonce, body);
            if ("RSA-SHA256".equals(signatureAlg)) {
                String publicKeyPem = props.getBankPublicKeyPem();
                PublicKey publicKey = decodePublicKey(publicKeyPem);
                Signature sig = Signature.getInstance("SHA256withRSA");
                sig.initVerify(publicKey);
                sig.update(canonical.getBytes(StandardCharsets.UTF_8));
                return sig.verify(Base64.getDecoder().decode(signature));
            } else if ("HMAC-SHA256".equals(signatureAlg)) {
                String expected = hmacSign(canonical, props.getPrivateKeyPem());
                return java.security.MessageDigest.isEqual(expected.getBytes(), signature.getBytes());
            }
            return false;
        } catch (Exception e) {
            log.warn("Webhook signature verification failed", e);
            return false;
        }
    }

    private String sign(String data) {
        try {
            if ("RSA".equals(props.getSigningMode())) {
                PrivateKey pk = decodePrivateKey(props.getPrivateKeyPem());
                Signature sig = Signature.getInstance("SHA256withRSA");
                sig.initSign(pk);
                sig.update(data.getBytes(StandardCharsets.UTF_8));
                return Base64.getEncoder().encodeToString(sig.sign());
            } else {
                return hmacSign(data, props.getPrivateKeyPem());
            }
        } catch (Exception e) {
            throw new RuntimeException("Signing failed", e);
        }
    }

    private static String hmacSign(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getEncoder().encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("HMAC signing failed", e);
        }
    }

    private static String buildCanonical(String method, String path, String timestamp, String nonce, String body) {
        return method.toUpperCase() + "\n" + path + "\n" + timestamp + "\n" + nonce + "\n" + (body != null ? body : "");
    }

    private static PrivateKey decodePrivateKey(String pem) {
        try {
            String stripped = pem.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replaceAll("\\s", "");
            return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(stripped)));
        } catch (Exception e) { throw new RuntimeException("Invalid private key", e); }
    }

    private static PublicKey decodePublicKey(String pem) {
        try {
            String stripped = pem.replace("-----BEGIN PUBLIC KEY-----", "").replace("-----END PUBLIC KEY-----", "").replaceAll("\\s", "");
            return KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(Base64.getDecoder().decode(stripped)));
        } catch (Exception e) { throw new RuntimeException("Invalid public key", e); }
    }

    record CreatePaymentBody(String externalOrderId, BigDecimal amount, String currency,
            String returnUrlSuccess, String returnUrlFailure, int expiresInSec) {}
}
