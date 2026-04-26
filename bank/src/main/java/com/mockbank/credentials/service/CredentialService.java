package com.mockbank.credentials.service;

import java.security.KeyPair;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.mockbank.config.BankProperties;
import com.mockbank.credentials.api.dto.IssueCredentialRequest;
import com.mockbank.credentials.api.dto.IssueCredentialResponse;
import com.mockbank.credentials.api.dto.RevealResponse;
import com.mockbank.credentials.domain.MerchantCredential;
import com.mockbank.credentials.repo.MerchantCredentialRepository;
import com.mockbank.merchants.domain.Merchant;
import com.mockbank.merchants.repo.MerchantRepository;
import com.mockbank.signing.AesEncryptor;
import com.mockbank.signing.KeyPairGeneratorUtil;
import com.mockbank.signing.PemUtils;

@Service
public class CredentialService {

    private final MerchantCredentialRepository credentialRepo;
    private final MerchantRepository merchantRepo;
    private final BankProperties bankProperties;

    public CredentialService(MerchantCredentialRepository credentialRepo, MerchantRepository merchantRepo, BankProperties bankProperties) {
        this.credentialRepo = credentialRepo;
        this.merchantRepo = merchantRepo;
        this.bankProperties = bankProperties;
    }

    @Transactional
    public IssueCredentialResponse issue(long merchantId, IssueCredentialRequest req) {
        Merchant merchant = merchantRepo.findById(merchantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchant not found"));

        String serial = KeyPairGeneratorUtil.generateSerial();
        Instant now = Instant.now();
        Instant validTo = now.plus(req.validityDays(), ChronoUnit.DAYS);
        String masterKey = bankProperties.getMasterKey();

        if ("RSA_KEYPAIR".equals(req.type())) {
            KeyPair kp = KeyPairGeneratorUtil.generateRsaKeyPair();
            String publicPem = PemUtils.encodePublicKey(kp.getPublic());
            String privatePem = PemUtils.encodePrivateKey(kp.getPrivate());
            String fingerprint = KeyPairGeneratorUtil.fingerprint(kp.getPublic());
            String encryptedPrivate = AesEncryptor.encrypt(privatePem, masterKey);

            MerchantCredential cred = new MerchantCredential(merchant, "RSA_KEYPAIR", serial,
                    fingerprint, publicPem, encryptedPrivate, null, now, validTo);
            credentialRepo.save(cred);

            return new IssueCredentialResponse(cred.getId(), serial, "RSA_KEYPAIR", fingerprint, privatePem, null, publicPem);
        } else if ("HMAC_SECRET".equals(req.type())) {
            String secret = KeyPairGeneratorUtil.generateHmacSecret();
            String encryptedSecret = AesEncryptor.encrypt(secret, masterKey);

            MerchantCredential cred = new MerchantCredential(merchant, "HMAC_SECRET", serial,
                    null, null, null, encryptedSecret, now, validTo);
            credentialRepo.save(cred);

            return new IssueCredentialResponse(cred.getId(), serial, "HMAC_SECRET", null, null, secret, null);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown credential type: " + req.type());
        }
    }

    @Transactional
    public RevealResponse reveal(long merchantId, long credentialId) {
        MerchantCredential cred = credentialRepo.findById(credentialId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Credential not found"));
        if (!cred.getMerchant().getId().equals(merchantId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Credential not found");
        }
        String masterKey = bankProperties.getMasterKey();
        String privateKeyPem = null;
        String hmacSecret = null;
        if (cred.getPrivateKeyPemEncrypted() != null) {
            privateKeyPem = AesEncryptor.decrypt(cred.getPrivateKeyPemEncrypted(), masterKey);
        }
        if (cred.getHmacSecretEncrypted() != null) {
            hmacSecret = AesEncryptor.decrypt(cred.getHmacSecretEncrypted(), masterKey);
        }
        return new RevealResponse(privateKeyPem, hmacSecret);
    }

    @Transactional
    public void revoke(long merchantId, long credentialId) {
        MerchantCredential cred = credentialRepo.findById(credentialId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Credential not found"));
        if (!cred.getMerchant().getId().equals(merchantId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Credential not found");
        }
        if (cred.getRevokedAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already revoked");
        }
        cred.setRevokedAt(Instant.now());
    }
}
