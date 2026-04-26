package com.mockbank.merchants.domain;

import java.time.Instant;

import jakarta.persistence.*;

@Entity
@Table(name = "merchant")
public class Merchant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 128)
    private String slug;

    @Column(name = "return_url_success", length = 2048)
    private String returnUrlSuccess;

    @Column(name = "return_url_failure", length = 2048)
    private String returnUrlFailure;

    @Column(name = "webhook_url", length = 2048)
    private String webhookUrl;

    @Column(name = "signing_mode", nullable = false, length = 16)
    private String signingMode = "RSA";

    @Column(nullable = false, length = 32)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Merchant() {}

    public Merchant(String name, String slug, String returnUrlSuccess, String returnUrlFailure, String webhookUrl, String signingMode) {
        this.name = name;
        this.slug = slug;
        this.returnUrlSuccess = returnUrlSuccess;
        this.returnUrlFailure = returnUrlFailure;
        this.webhookUrl = webhookUrl;
        this.signingMode = signingMode;
    }

    @PrePersist void onCreate() { Instant now = Instant.now(); createdAt = now; updatedAt = now; }
    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getReturnUrlSuccess() { return returnUrlSuccess; }
    public void setReturnUrlSuccess(String url) { this.returnUrlSuccess = url; }
    public String getReturnUrlFailure() { return returnUrlFailure; }
    public void setReturnUrlFailure(String url) { this.returnUrlFailure = url; }
    public String getWebhookUrl() { return webhookUrl; }
    public void setWebhookUrl(String url) { this.webhookUrl = url; }
    public String getSigningMode() { return signingMode; }
    public void setSigningMode(String mode) { this.signingMode = mode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
