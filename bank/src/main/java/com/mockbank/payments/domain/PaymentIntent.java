package com.mockbank.payments.domain;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.*;
import com.mockbank.merchants.domain.Merchant;

@Entity
@Table(name = "payment_intent")
public class PaymentIntent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_ref", nullable = false, unique = true, length = 64)
    private String paymentRef;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "merchant_id")
    private Merchant merchant;

    @Column(name = "external_order_id", nullable = false, length = 128)
    private String externalOrderId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency = "RSD";

    @Column(nullable = false, length = 32)
    private String status = "CREATED";

    @Column(name = "return_url_success", length = 2048)
    private String returnUrlSuccess;

    @Column(name = "return_url_failure", length = 2048)
    private String returnUrlFailure;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected PaymentIntent() {}

    public PaymentIntent(String paymentRef, Merchant merchant, String externalOrderId, BigDecimal amount, String currency,
            String returnUrlSuccess, String returnUrlFailure, Instant expiresAt) {
        this.paymentRef = paymentRef;
        this.merchant = merchant;
        this.externalOrderId = externalOrderId;
        this.amount = amount;
        this.currency = currency;
        this.returnUrlSuccess = returnUrlSuccess;
        this.returnUrlFailure = returnUrlFailure;
        this.expiresAt = expiresAt;
    }

    @PrePersist void onCreate() { Instant now = Instant.now(); createdAt = now; updatedAt = now; }
    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }

    public Long getId() { return id; }
    public String getPaymentRef() { return paymentRef; }
    public Merchant getMerchant() { return merchant; }
    public String getExternalOrderId() { return externalOrderId; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReturnUrlSuccess() { return returnUrlSuccess; }
    public String getReturnUrlFailure() { return returnUrlFailure; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
