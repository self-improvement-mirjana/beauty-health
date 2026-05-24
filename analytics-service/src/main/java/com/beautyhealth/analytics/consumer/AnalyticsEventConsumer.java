package com.beautyhealth.analytics.consumer;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.beautyhealth.analytics.service.AnalyticsEventProcessingService;

@Component
public class AnalyticsEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsEventConsumer.class);

    private final AnalyticsEventProcessingService processingService;

    public AnalyticsEventConsumer(AnalyticsEventProcessingService processingService) {
        this.processingService = processingService;
    }

    @KafkaListener(topics = "${app.analytics.topic}", groupId = "${spring.kafka.consumer.group-id}")
    public void onMessage(ConsumerRecord<String, String> record) {
        String key = record.key();
        String payload = record.value();
        int payloadBytes = payload != null ? payload.length() : 0;
        log.info("[analytics] kafka RECEIVED key={} topic={} partition={} offset={} payloadBytes={}",
                key, record.topic(), record.partition(), record.offset(), payloadBytes);
        try {
            processingService.process(payload);
        } catch (Exception e) {
            log.error("[analytics] kafka PROCESS FAILED key={} offset={} reason={}", key, record.offset(),
                    e.getMessage());
            throw e;
        }
    }
}
