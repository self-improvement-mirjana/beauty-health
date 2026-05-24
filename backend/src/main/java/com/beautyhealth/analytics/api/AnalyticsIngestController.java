package com.beautyhealth.analytics.api;

import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.analytics.api.dto.AnalyticsIngestRequest;
import com.beautyhealth.analytics.api.dto.AnalyticsIngestResponse;
import com.beautyhealth.analytics.service.AnalyticsIngestService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Analytics", description = "Storefront telemetry ingest.")
@RestController
@RequestMapping(value = "/api/v1/analytics", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class AnalyticsIngestController {

    private final AnalyticsIngestService ingestService;

    public AnalyticsIngestController(AnalyticsIngestService ingestService) {
        this.ingestService = ingestService;
    }

    @Operation(summary = "Bulk ingest storefront analytics events")
    @PostMapping(value = "/events", consumes = MediaType.APPLICATION_JSON_VALUE)
    public AnalyticsIngestResponse ingest(@Valid @RequestBody AnalyticsIngestRequest request) {
        return ingestService.ingest(request.events());
    }
}
