package com.beautyhealth.moderation.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import com.beautyhealth.config.AnalyticsProperties;
import com.beautyhealth.moderation.api.dto.AdminFunnelReportResponse;
import com.beautyhealth.moderation.api.dto.AdminKpiSummaryResponse;
import com.beautyhealth.moderation.api.dto.AdminPaymentsReportResponse;
import org.springframework.web.client.RestClient;

@Service
public class AnalyticsReportProxyService {

    private final RestClient restClient;

    public AnalyticsReportProxyService(AnalyticsProperties analyticsProperties) {
        this.restClient = RestClient.builder()
                .baseUrl(analyticsProperties.getService().getBaseUrl())
                .defaultHeader("X-API-Key", analyticsProperties.getService().getApiKey())
                .build();
    }

    public AdminKpiSummaryResponse kpiSummary() {
        return get("/api/v1/reports/kpi-summary", AdminKpiSummaryResponse.class);
    }

    public AdminPaymentsReportResponse payments() {
        return get("/api/v1/reports/payments", AdminPaymentsReportResponse.class);
    }

    public AdminFunnelReportResponse funnel() {
        return get("/api/v1/reports/funnel", AdminFunnelReportResponse.class);
    }

    private <T> T get(String path, Class<T> type) {
        try {
            return restClient.get().uri(path).retrieve().body(type);
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().is5xxServerError()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Analytics service unavailable");
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Analytics service error");
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Analytics service unreachable");
        }
    }
}
