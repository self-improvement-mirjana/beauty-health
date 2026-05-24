package com.beautyhealth.analytics.model;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AnalyticsEventEnvelope(
        String eventId,
        String eventType,
        String occurredAt,
        String source,
        String actorType,
        String actorId,
        String sessionId,
        String correlationId,
        String schemaVersion,
        Map<String, Object> payload) {
}
