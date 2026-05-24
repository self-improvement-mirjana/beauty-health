package com.beautyhealth.analytics.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.beautyhealth.analytics.api.dto.AnalyticsIngestRequest;
import com.beautyhealth.analytics.api.dto.AnalyticsIngestResponse;
import com.beautyhealth.analytics.model.AnalyticsEventEnvelope;

@Service
public class AnalyticsIngestService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsIngestService.class);

    private static final Pattern UUID_PATTERN = Pattern
            .compile("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");
    private static final Set<String> PII_KEYS = Set.of("email", "phone", "address", "fullName", "recipientName",
            "recipientPhone", "addressLine1", "addressLine2");

    private final AnalyticsOutboxService outboxService;

    public AnalyticsIngestService(AnalyticsOutboxService outboxService) {
        this.outboxService = outboxService;
    }

    @Transactional
    public AnalyticsIngestResponse ingest(List<AnalyticsIngestRequest.AnalyticsIngestEventItem> events) {
        int accepted = 0;
        List<String> rejected = new ArrayList<>();
        log.info("[analytics] ingest START batchSize={}", events.size());
        for (AnalyticsIngestRequest.AnalyticsIngestEventItem item : events) {
            String validationError = validate(item);
            if (validationError != null) {
                log.warn("[analytics] ingest REJECT eventId={} type={} reason={}",
                        item.eventId(), item.eventType(), validationError);
                rejected.add(item.eventId());
                continue;
            }
            AnalyticsEventEnvelope envelope = new AnalyticsEventEnvelope(item.eventId(), item.eventType(),
                    item.occurredAt(), item.source(), item.actorType(), item.actorId(), item.sessionId(),
                    item.correlationId(), item.schemaVersion(), item.payload());
            outboxService.enqueue(envelope);
            accepted++;
        }
        log.info("[analytics] ingest DONE accepted={} rejected={}", accepted, rejected.size());
        return new AnalyticsIngestResponse(accepted, rejected.size(), rejected);
    }

    static String validate(AnalyticsIngestRequest.AnalyticsIngestEventItem item) {
        if (!UUID_PATTERN.matcher(item.eventId()).matches()) {
            return "invalid eventId";
        }
        if (!"v1".equals(item.schemaVersion())) {
            return "unsupported schemaVersion";
        }
        if (!"storefront".equals(item.source())) {
            return "invalid source for ingest";
        }
        if (!AnalyticsEventFactory.ALLOWED_EVENT_TYPES.contains(item.eventType())) {
            return "unknown eventType";
        }
        if (!Set.of("guest", "user").contains(item.actorType())) {
            return "invalid actorType";
        }
        if (item.payload() == null || item.payload().isEmpty()) {
            return "empty payload";
        }
        if (containsPii(item.payload())) {
            return "payload contains PII";
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private static boolean containsPii(Map<String, Object> payload) {
        for (Map.Entry<String, Object> entry : payload.entrySet()) {
            String key = entry.getKey().toLowerCase(Locale.ROOT);
            if (PII_KEYS.contains(key)) {
                return true;
            }
            Object value = entry.getValue();
            if (value instanceof Map<?, ?> nested) {
                if (containsPii((Map<String, Object>) nested)) {
                    return true;
                }
            }
        }
        return false;
    }
}
