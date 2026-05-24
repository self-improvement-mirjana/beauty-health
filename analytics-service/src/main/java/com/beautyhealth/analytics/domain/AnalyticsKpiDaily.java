package com.beautyhealth.analytics.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "analytics_kpi_daily")
public class AnalyticsKpiDaily {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_day", nullable = false, unique = true)
    private LocalDate day;

    @Column(name = "order_count", nullable = false)
    private long orderCount;

    @Column(name = "revenue_total", nullable = false, precision = 14, scale = 2)
    private BigDecimal revenueTotal;

    protected AnalyticsKpiDaily() {
    }

    public AnalyticsKpiDaily(LocalDate day) {
        this.day = day;
        this.orderCount = 0;
        this.revenueTotal = BigDecimal.ZERO;
    }

    public LocalDate getDay() {
        return day;
    }

    public long getOrderCount() {
        return orderCount;
    }

    public BigDecimal getRevenueTotal() {
        return revenueTotal;
    }

    public void addOrder(BigDecimal amount) {
        orderCount++;
        revenueTotal = revenueTotal.add(amount);
    }
}
