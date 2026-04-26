package com.mockbank.cards.domain;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.*;

import com.mockbank.clients.domain.BankClient;

@Entity
@Table(name = "virtual_card")
public class VirtualCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id")
    private BankClient client;

    @Column(nullable = false, unique = true, length = 19)
    private String pan;

    @Column(name = "pan_last4", nullable = false, length = 4)
    private String panLast4;

    @Column(name = "exp_month", nullable = false)
    private int expMonth;

    @Column(name = "exp_year", nullable = false)
    private int expYear;

    @Column(name = "cvv_hash", nullable = false)
    private String cvvHash;

    @Column(name = "holder_name", nullable = false)
    private String holderName;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(nullable = false, length = 3)
    private String currency = "RSD";

    @Column(nullable = false, length = 32)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected VirtualCard() {}

    public VirtualCard(BankClient client, String pan, String cvvHash, String holderName, BigDecimal balance, int expMonth, int expYear) {
        this.client = client;
        this.pan = pan;
        this.panLast4 = pan.substring(pan.length() - 4);
        this.cvvHash = cvvHash;
        this.holderName = holderName;
        this.balance = balance;
        this.expMonth = expMonth;
        this.expYear = expYear;
    }

    @PrePersist void onCreate() { Instant now = Instant.now(); createdAt = now; updatedAt = now; }
    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }

    public Long getId() { return id; }
    public BankClient getClient() { return client; }
    public String getPan() { return pan; }
    public String getPanLast4() { return panLast4; }
    public int getExpMonth() { return expMonth; }
    public int getExpYear() { return expYear; }
    public String getCvvHash() { return cvvHash; }
    public String getHolderName() { return holderName; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    public String getCurrency() { return currency; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
