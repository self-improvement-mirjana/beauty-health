package com.beautyhealth.moderation.api;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.moderation.api.dto.AdminFunnelReportResponse;
import com.beautyhealth.moderation.api.dto.AdminKpiSummaryResponse;
import com.beautyhealth.moderation.api.dto.AdminPaymentsReportResponse;
import com.beautyhealth.moderation.service.AnalyticsReportProxyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "moderation")
@RestController
@RequestMapping(value = "/api/v1/admin/analytics", produces = MediaType.APPLICATION_JSON_VALUE)
@SecurityRequirement(name = "bearer-jwt")
public class AdminAnalyticsController {

    private final AnalyticsReportProxyService proxyService;

    public AdminAnalyticsController(AnalyticsReportProxyService proxyService) {
        this.proxyService = proxyService;
    }

    @GetMapping("/kpi-summary")
    @Operation(summary = "KPI agregati iz analytics-service")
    public AdminKpiSummaryResponse kpiSummary() {
        return proxyService.kpiSummary();
    }

    @GetMapping("/payments")
    @Operation(summary = "Payment agregati iz analytics-service")
    public AdminPaymentsReportResponse payments() {
        return proxyService.payments();
    }

    @GetMapping("/funnel")
    @Operation(summary = "Funnel agregati iz analytics-service")
    public AdminFunnelReportResponse funnel() {
        return proxyService.funnel();
    }
}
