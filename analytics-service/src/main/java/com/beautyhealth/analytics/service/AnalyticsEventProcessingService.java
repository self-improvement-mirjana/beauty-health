package com.beautyhealth.analytics.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.beautyhealth.analytics.domain.AnalyticsEventRaw;
import com.beautyhealth.analytics.domain.AnalyticsFunnelDaily;
import com.beautyhealth.analytics.domain.AnalyticsKpiDaily;
import com.beautyhealth.analytics.domain.AnalyticsPaymentsDaily;
import com.beautyhealth.analytics.repo.AnalyticsEventRawRepository;
import com.beautyhealth.analytics.repo.AnalyticsFunnelDailyRepository;
import com.beautyhealth.analytics.repo.AnalyticsKpiDailyRepository;
import com.beautyhealth.analytics.repo.AnalyticsPaymentsDailyRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AnalyticsEventProcessingService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsEventProcessingService.class);

    private final AnalyticsEventRawRepository rawRepository;
    private final AnalyticsKpiDailyRepository kpiRepository;
    private final AnalyticsPaymentsDailyRepository paymentsRepository;
    private final AnalyticsFunnelDailyRepository funnelRepository;
    private final ObjectMapper objectMapper;

    public AnalyticsEventProcessingService(AnalyticsEventRawRepository rawRepository,
            AnalyticsKpiDailyRepository kpiRepository, AnalyticsPaymentsDailyRepository paymentsRepository,
            AnalyticsFunnelDailyRepository funnelRepository, ObjectMapper objectMapper) {
        this.rawRepository = rawRepository;
        this.kpiRepository = kpiRepository;
        this.paymentsRepository = paymentsRepository;
        this.funnelRepository = funnelRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void process(String payloadJson) {
        JsonNode root;
        try {
            root = objectMapper.readTree(payloadJson);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid JSON payload", e);
        }
        String eventId = text(root, "eventId");
        if (rawRepository.existsByEventId(eventId)) {
            log.info("[analytics] consume SKIP duplicate eventId={}", eventId);
            return;
        }
        String eventType = text(root, "eventType");
        Instant occurredAt = Instant.parse(text(root, "occurredAt"));
        String source = text(root, "source");
        rawRepository.save(new AnalyticsEventRaw(eventId, eventType, occurredAt, source, payloadJson));
        log.info("[analytics] db RAW INSERT eventId={} type={} source={} occurredAt={}",
                eventId, eventType, source, occurredAt);
        LocalDate day = occurredAt.atZone(ZoneOffset.UTC).toLocalDate();
        JsonNode payload = root.get("payload");
        switch (eventType) {
            case "order_created" -> {
                applyOrderCreated(day, payload);
                log.info("[analytics] db AGG kpi_daily +1 order day={} eventId={}", day, eventId);
            }
            case "payment_authorized" -> {
                applyPaymentSuccess(day);
                log.info("[analytics] db AGG payments_daily +1 success day={} eventId={}", day, eventId);
            }
            case "payment_failed", "payment_expired" -> {
                applyPaymentFailure(day);
                log.info("[analytics] db AGG payments_daily +1 failure day={} eventId={} ({})", day, eventId,
                        eventType);
            }
            case "checkout_started", "checkout_open" -> {
                applyCheckoutStart(day);
                log.info("[analytics] db AGG funnel_daily +1 checkout_start day={} eventId={} ({})", day, eventId,
                        eventType);
            }
            default -> log.info("[analytics] db AGG (no aggregate for type={}) eventId={}", eventType, eventId);
        }
    }

    private void applyOrderCreated(LocalDate day, JsonNode payload) {
        BigDecimal amount = payload != null && payload.has("amount")
                ? payload.get("amount").decimalValue()
                : BigDecimal.ZERO;
        AnalyticsKpiDaily row = kpiRepository.findByDay(day).orElseGet(() -> kpiRepository.save(new AnalyticsKpiDaily(day)));
        row.addOrder(amount);
    }

    private void applyPaymentSuccess(LocalDate day) {
        AnalyticsPaymentsDaily row = paymentsRepository.findByDay(day)
                .orElseGet(() -> paymentsRepository.save(new AnalyticsPaymentsDaily(day)));
        row.incrementSuccess();
    }

    private void applyPaymentFailure(LocalDate day) {
        AnalyticsPaymentsDaily row = paymentsRepository.findByDay(day)
                .orElseGet(() -> paymentsRepository.save(new AnalyticsPaymentsDaily(day)));
        row.incrementFailure();
    }

    private void applyCheckoutStart(LocalDate day) {
        AnalyticsFunnelDaily row = funnelRepository.findByDay(day)
                .orElseGet(() -> funnelRepository.save(new AnalyticsFunnelDaily(day)));
        row.incrementCheckoutStart();
    }

    private static String text(JsonNode root, String field) {
        JsonNode node = root.get(field);
        if (node == null || node.isNull()) {
            throw new IllegalArgumentException("Missing field: " + field);
        }
        return node.asText();
    }
}
