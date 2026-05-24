package com.beautyhealth.analytics.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.beautyhealth.analytics.api.dto.FunnelReportResponse;
import com.beautyhealth.analytics.api.dto.KpiSummaryResponse;
import com.beautyhealth.analytics.api.dto.PaymentsReportResponse;
import com.beautyhealth.analytics.domain.AnalyticsFunnelDaily;
import com.beautyhealth.analytics.domain.AnalyticsKpiDaily;
import com.beautyhealth.analytics.domain.AnalyticsPaymentsDaily;
import com.beautyhealth.analytics.repo.AnalyticsFunnelDailyRepository;
import com.beautyhealth.analytics.repo.AnalyticsKpiDailyRepository;
import com.beautyhealth.analytics.repo.AnalyticsPaymentsDailyRepository;

@Service
@Transactional(readOnly = true)
public class AnalyticsReportService {

    private final AnalyticsKpiDailyRepository kpiRepository;
    private final AnalyticsPaymentsDailyRepository paymentsRepository;
    private final AnalyticsFunnelDailyRepository funnelRepository;

    public AnalyticsReportService(AnalyticsKpiDailyRepository kpiRepository,
            AnalyticsPaymentsDailyRepository paymentsRepository, AnalyticsFunnelDailyRepository funnelRepository) {
        this.kpiRepository = kpiRepository;
        this.paymentsRepository = paymentsRepository;
        this.funnelRepository = funnelRepository;
    }

    public KpiSummaryResponse kpiSummary() {
        List<AnalyticsKpiDaily> rows = kpiRepository.findAll();
        long orders = rows.stream().mapToLong(AnalyticsKpiDaily::getOrderCount).sum();
        BigDecimal revenue = rows.stream().map(AnalyticsKpiDaily::getRevenueTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new KpiSummaryResponse(orders, revenue);
    }

    public PaymentsReportResponse payments() {
        List<AnalyticsPaymentsDaily> rows = paymentsRepository.findAll();
        long success = rows.stream().mapToLong(AnalyticsPaymentsDaily::getSuccessCount).sum();
        long failure = rows.stream().mapToLong(AnalyticsPaymentsDaily::getFailureCount).sum();
        long total = success + failure;
        double rate = total == 0 ? 0.0 : (success * 100.0 / total);
        return new PaymentsReportResponse(success, failure, BigDecimal.valueOf(rate).setScale(2, RoundingMode.HALF_UP));
    }

    public FunnelReportResponse funnel() {
        List<AnalyticsFunnelDaily> rows = funnelRepository.findAll();
        long checkoutStarts = rows.stream().mapToLong(AnalyticsFunnelDaily::getCheckoutStartCount).sum();
        List<AnalyticsKpiDaily> kpiRows = kpiRepository.findAll();
        long orders = kpiRows.stream().mapToLong(AnalyticsKpiDaily::getOrderCount).sum();
        return new FunnelReportResponse(checkoutStarts, orders);
    }
}
