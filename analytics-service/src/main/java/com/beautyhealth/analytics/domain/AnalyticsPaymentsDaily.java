package com.beautyhealth.analytics.domain;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "analytics_payments_daily")
public class AnalyticsPaymentsDaily {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_day", nullable = false, unique = true)
    private LocalDate day;

    @Column(name = "success_count", nullable = false)
    private long successCount;

    @Column(name = "failure_count", nullable = false)
    private long failureCount;

    protected AnalyticsPaymentsDaily() {
    }

    public AnalyticsPaymentsDaily(LocalDate day) {
        this.day = day;
    }

    public LocalDate getDay() {
        return day;
    }

    public long getSuccessCount() {
        return successCount;
    }

    public long getFailureCount() {
        return failureCount;
    }

    public void incrementSuccess() {
        successCount++;
    }

    public void incrementFailure() {
        failureCount++;
    }
}
