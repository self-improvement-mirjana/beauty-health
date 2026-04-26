package com.mockbank.payments.service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.TimeUnit;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.mockbank.config.BankProperties;
import com.mockbank.credentials.domain.MerchantCredential;
import com.mockbank.credentials.repo.MerchantCredentialRepository;
import com.mockbank.merchants.domain.Merchant;
import com.mockbank.merchants.repo.MerchantRepository;
import com.mockbank.signing.*;

@Service
public class SignatureVerificationService {

    private final MerchantRepository merchantRepo;
    private final MerchantCredentialRepository credentialRepo;
    private final BankProperties bankProperties;
    private final Cache<String, Boolean> nonceCache;

    public SignatureVerificationService(MerchantRepository merchantRepo, MerchantCredentialRepository credentialRepo, BankProperties bankProperties) {
        this.merchantRepo = merchantRepo;
        this.credentialRepo = credentialRepo;
        this.bankProperties = bankProperties;
        this.nonceCache = Caffeine.newBuilder()
                .maximumSize(bankProperties.getSigning().getNonceCacheSize())
                .expireAfterWrite(bankProperties.getSigning().getNonceCacheTtlMinutes(), TimeUnit.MINUTES)
                .build();
    }

    public Merchant verifyAndGetMerchant(String merchantSlug, String signature, String signatureAlg,
            String serial, String timestamp, String nonce, String payload) {
        Merchant merchant = merchantRepo.findBySlug(merchantSlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown merchant"));
        if (!"ACTIVE".equals(merchant.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Merchant inactive");
        }

        Instant ts;
        try { ts = Instant.parse(timestamp); }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid timestamp"); }

        long toleranceSec = bankProperties.getSigning().getTimestampToleranceSeconds();
        if (Duration.between(ts, Instant.now()).abs().getSeconds() > toleranceSec) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Timestamp out of tolerance");
        }

        if (nonceCache.getIfPresent(nonce) != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nonce already used");
        }
        nonceCache.put(nonce, Boolean.TRUE);

        MerchantCredential cred;
        if (serial != null && !serial.isBlank()) {
            cred = credentialRepo.findBySerial(serial)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credential not found"));
            if (!cred.getMerchant().getId().equals(merchant.getId()) || !cred.isActive()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credential invalid");
            }
        } else {
            String credType = "RSA-SHA256".equals(signatureAlg) ? "RSA_KEYPAIR" : "HMAC_SECRET";
            var actives = credentialRepo.findActiveByMerchantAndType(merchant.getId(), credType);
            if (actives.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No active credential");
            }
            cred = actives.get(0);
        }

        boolean valid;
        if ("RSA-SHA256".equals(signatureAlg)) {
            valid = RsaVerifier.verify(payload, signature, cred.getPublicKeyPem());
        } else if ("HMAC-SHA256".equals(signatureAlg)) {
            String masterKey = bankProperties.getMasterKey();
            String hmacSecret = AesEncryptor.decrypt(cred.getHmacSecretEncrypted(), masterKey);
            valid = HmacVerifier.verify(payload, signature, hmacSecret);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported signature algorithm");
        }

        if (!valid) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid signature");
        }
        return merchant;
    }
}
