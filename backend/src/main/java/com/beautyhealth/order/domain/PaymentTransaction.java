package com.beautyhealth.order.domain;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "payment_transaction")
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id")
    private ShopOrder order;

    @Column(nullable = false, length = 64)
    private String provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PaymentRecordStatus status = PaymentRecordStatus.PENDING;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency = "RSD";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected PaymentTransaction() {
    }

    public PaymentTransaction(ShopOrder order, String provider, PaymentRecordStatus status, BigDecimal amount,
            String currency) {
        this.order = order;
        this.provider = provider;
        this.status = status;
        this.amount = amount;
        this.currency = currency;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public ShopOrder getOrder() {
        return order;
    }

    public String getProvider() {
        return provider;
    }

    public PaymentRecordStatus getStatus() {
        return status;
    }
}
