package com.beautyhealth.analytics.api;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.analytics.api.dto.FunnelReportResponse;
import com.beautyhealth.analytics.api.dto.KpiSummaryResponse;
import com.beautyhealth.analytics.api.dto.PaymentsReportResponse;
import com.beautyhealth.analytics.service.AnalyticsReportService;

@RestController
@RequestMapping(value = "/api/v1/reports", produces = MediaType.APPLICATION_JSON_VALUE)
public class ReportController {

    private final AnalyticsReportService reportService;

    public ReportController(AnalyticsReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/kpi-summary")
    public KpiSummaryResponse kpiSummary() {
        return reportService.kpiSummary();
    }

    @GetMapping("/payments")
    public PaymentsReportResponse payments() {
        return reportService.payments();
    }

    @GetMapping("/funnel")
    public FunnelReportResponse funnel() {
        return reportService.funnel();
    }
}
