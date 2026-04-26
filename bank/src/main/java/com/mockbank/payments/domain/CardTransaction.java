package com.mockbank.payments.domain;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.*;
import com.mockbank.cards.domain.VirtualCard;

@Entity
@Table(name = "card_transaction")
public class CardTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "intent_id")
    private PaymentIntent intent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id")
    private VirtualCard card;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency = "RSD";

    @Column(name = "decline_reason")
    private String declineReason;

    @Column(name = "processed_at", nullable = false)
    private Instant processedAt;

    protected CardTransaction() {}

    public CardTransaction(PaymentIntent intent, VirtualCard card, String status, BigDecimal amount, String currency, String declineReason) {
        this.intent = intent;
        this.card = card;
        this.status = status;
        this.amount = amount;
        this.currency = currency;
        this.declineReason = declineReason;
        this.processedAt = Instant.now();
    }

    public Long getId() { return id; }
    public PaymentIntent getIntent() { return intent; }
    public VirtualCard getCard() { return card; }
    public String getStatus() { return status; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getDeclineReason() { return declineReason; }
    public Instant getProcessedAt() { return processedAt; }
}
