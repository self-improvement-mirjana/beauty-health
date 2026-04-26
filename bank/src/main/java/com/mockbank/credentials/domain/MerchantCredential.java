package com.mockbank.credentials.domain;

import java.time.Instant;

import jakarta.persistence.*;

import com.mockbank.merchants.domain.Merchant;

@Entity
@Table(name = "merchant_credential")
public class MerchantCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "merchant_id")
    private Merchant merchant;

    @Column(nullable = false, length = 32)
    private String type;

    @Column(nullable = false, unique = true, length = 64)
    private String serial;

    @Column(name = "fingerprint_sha256", length = 128)
    private String fingerprintSha256;

    @Column(name = "public_key_pem", columnDefinition = "TEXT")
    private String publicKeyPem;

    @Column(name = "private_key_pem_encrypted", columnDefinition = "TEXT")
    private String privateKeyPemEncrypted;

    @Column(name = "hmac_secret_encrypted", columnDefinition = "TEXT")
    private String hmacSecretEncrypted;

    @Column(name = "valid_from", nullable = false)
    private Instant validFrom;

    @Column(name = "valid_to", nullable = false)
    private Instant validTo;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected MerchantCredential() {}

    public MerchantCredential(Merchant merchant, String type, String serial, String fingerprintSha256,
            String publicKeyPem, String privateKeyPemEncrypted, String hmacSecretEncrypted,
            Instant validFrom, Instant validTo) {
        this.merchant = merchant;
        this.type = type;
        this.serial = serial;
        this.fingerprintSha256 = fingerprintSha256;
        this.publicKeyPem = publicKeyPem;
        this.privateKeyPemEncrypted = privateKeyPemEncrypted;
        this.hmacSecretEncrypted = hmacSecretEncrypted;
        this.validFrom = validFrom;
        this.validTo = validTo;
    }

    @PrePersist void onCreate() { createdAt = Instant.now(); }

    public Long getId() { return id; }
    public Merchant getMerchant() { return merchant; }
    public String getType() { return type; }
    public String getSerial() { return serial; }
    public String getFingerprintSha256() { return fingerprintSha256; }
    public String getPublicKeyPem() { return publicKeyPem; }
    public String getPrivateKeyPemEncrypted() { return privateKeyPemEncrypted; }
    public String getHmacSecretEncrypted() { return hmacSecretEncrypted; }
    public Instant getValidFrom() { return validFrom; }
    public Instant getValidTo() { return validTo; }
    public Instant getRevokedAt() { return revokedAt; }
    public void setRevokedAt(Instant revokedAt) { this.revokedAt = revokedAt; }
    public boolean isActive() { return revokedAt == null && Instant.now().isBefore(validTo) && Instant.now().isAfter(validFrom); }
}
