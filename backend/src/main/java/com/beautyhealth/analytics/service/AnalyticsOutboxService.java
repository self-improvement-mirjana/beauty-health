package com.beautyhealth.analytics.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.beautyhealth.analytics.domain.AnalyticsOutbox;
import com.beautyhealth.analytics.model.AnalyticsEventEnvelope;
import com.beautyhealth.analytics.repo.AnalyticsOutboxRepository;
import com.beautyhealth.config.AnalyticsProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AnalyticsOutboxService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsOutboxService.class);

    private final AnalyticsOutboxRepository outboxRepository;
    private final AnalyticsProperties analyticsProperties;
    private final ObjectMapper objectMapper;

    public AnalyticsOutboxService(AnalyticsOutboxRepository outboxRepository, AnalyticsProperties analyticsProperties,
            ObjectMapper objectMapper) {
        this.outboxRepository = outboxRepository;
        this.analyticsProperties = analyticsProperties;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void enqueue(AnalyticsEventEnvelope envelope) {
        if (outboxRepository.existsByEventId(envelope.eventId())) {
            log.info("[analytics] outbox SKIP duplicate eventId={} type={}", envelope.eventId(), envelope.eventType());
            return;
        }
        String json;
        try {
            json = objectMapper.writeValueAsString(envelope);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid analytics envelope", e);
        }
        outboxRepository.save(new AnalyticsOutbox(envelope.eventId(), envelope.eventType(),
                analyticsProperties.getTopic(), json));
        log.info("[analytics] outbox ENQUEUE eventId={} type={} source={} topic={} payloadBytes={}",
                envelope.eventId(), envelope.eventType(), envelope.source(), analyticsProperties.getTopic(), json.length());
    }
}
