package com.beautyhealth.analytics.domain;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "analytics_funnel_daily")
public class AnalyticsFunnelDaily {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_day", nullable = false, unique = true)
    private LocalDate day;

    @Column(name = "checkout_start_count", nullable = false)
    private long checkoutStartCount;

    protected AnalyticsFunnelDaily() {
    }

    public AnalyticsFunnelDaily(LocalDate day) {
        this.day = day;
    }

    public LocalDate getDay() {
        return day;
    }

    public long getCheckoutStartCount() {
        return checkoutStartCount;
    }

    public void incrementCheckoutStart() {
        checkoutStartCount++;
    }
}
