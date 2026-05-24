package com.beautyhealth.analytics.api.dto;

import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record AnalyticsIngestRequest(@NotEmpty @Valid List<AnalyticsIngestEventItem> events) {

    public record AnalyticsIngestEventItem(
            @NotBlank String eventId,
            @NotBlank String eventType,
            @NotBlank String occurredAt,
            @NotBlank String source,
            @NotBlank String actorType,
            String actorId,
            String sessionId,
            String correlationId,
            @NotBlank String schemaVersion,
            @NotNull Map<String, Object> payload) {
    }
}
