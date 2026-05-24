package com.beautyhealth.analytics.publish;

import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.beautyhealth.analytics.domain.AnalyticsOutbox;
import com.beautyhealth.analytics.domain.OutboxStatus;
import com.beautyhealth.analytics.repo.AnalyticsOutboxRepository;
import com.beautyhealth.config.AnalyticsProperties;

@Component
public class AnalyticsOutboxPublisher {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsOutboxPublisher.class);
    private static final long SEND_TIMEOUT_SECONDS = 10;

    private final AnalyticsOutboxRepository outboxRepository;
    private final ObjectProvider<KafkaTemplate<String, String>> kafkaTemplateProvider;
    private final AnalyticsProperties analyticsProperties;

    public AnalyticsOutboxPublisher(AnalyticsOutboxRepository outboxRepository,
            ObjectProvider<KafkaTemplate<String, String>> kafkaTemplateProvider,
            AnalyticsProperties analyticsProperties) {
        this.outboxRepository = outboxRepository;
        this.kafkaTemplateProvider = kafkaTemplateProvider;
        this.analyticsProperties = analyticsProperties;
    }

    @Scheduled(fixedDelayString = "${app.analytics.outbox.poll-interval-ms:5000}")
    @Transactional
    public void publishPending() {
        if (!analyticsProperties.getKafka().isEnabled()) {
            return;
        }
        KafkaTemplate<String, String> kafkaTemplate = kafkaTemplateProvider.getIfAvailable();
        if (kafkaTemplate == null) {
            return;
        }
        int batchSize = analyticsProperties.getOutbox().getBatchSize();
        List<AnalyticsOutbox> pending = outboxRepository.findBatchByStatus(OutboxStatus.PENDING,
                PageRequest.of(0, batchSize));
        if (pending.isEmpty()) {
            return;
        }
        log.info("[analytics] outbox PUBLISH batch start size={} topic={}", pending.size(),
                analyticsProperties.getTopic());
        int ok = 0;
        int fail = 0;
        for (AnalyticsOutbox row : pending) {
            if (publishOne(row, kafkaTemplate)) {
                ok++;
            } else {
                fail++;
            }
        }
        log.info("[analytics] outbox PUBLISH batch done published={} failed={}", ok, fail);
    }

    private boolean publishOne(AnalyticsOutbox row, KafkaTemplate<String, String> kafkaTemplate) {
        if (row.getStatus() == OutboxStatus.PUBLISHED) {
            return true;
        }
        try {
            var metadata = kafkaTemplate.send(row.getTopic(), row.getEventId(), row.getPayloadJson())
                    .get(SEND_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            row.markPublished();
            log.info("[analytics] outbox -> KAFKA SENT eventId={} type={} topic={} partition={} offset={}",
                    row.getEventId(), row.getEventType(), row.getTopic(),
                    metadata.getRecordMetadata().partition(), metadata.getRecordMetadata().offset());
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            row.markRetryPending("Interrupted while publishing");
            log.warn("[analytics] outbox publish INTERRUPTED eventId={}", row.getEventId());
            return false;
        } catch (ExecutionException | TimeoutException e) {
            row.markRetryPending(shortMessage(e));
            log.warn("[analytics] outbox publish FAILED eventId={} reason={}", row.getEventId(), e.getMessage());
            return false;
        }
    }

    private static String shortMessage(Exception e) {
        String msg = e.getMessage();
        if (msg == null || msg.isBlank()) {
            return e.getClass().getSimpleName();
        }
        return msg;
    }
}
