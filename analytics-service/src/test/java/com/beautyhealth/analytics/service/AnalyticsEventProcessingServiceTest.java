package com.beautyhealth.analytics.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.beautyhealth.analytics.repo.AnalyticsEventRawRepository;
import com.beautyhealth.analytics.repo.AnalyticsKpiDailyRepository;

@SpringBootTest
@ActiveProfiles("test")
class AnalyticsEventProcessingServiceTest {

    @Autowired
    private AnalyticsEventProcessingService processingService;

    @Autowired
    private AnalyticsEventRawRepository rawRepository;

    @Autowired
    private AnalyticsKpiDailyRepository kpiRepository;

    @Test
    void orderCreatedIncrementsKpiOnce() {
        String payload = """
                {"eventId":"bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee","eventType":"order_created","occurredAt":"2026-05-24T12:00:00Z","source":"backend","actorType":"user","schemaVersion":"v1","payload":{"orderId":1,"amount":100.00,"currency":"RSD","paymentMethod":"COD"}}
                """;
        processingService.process(payload);
        processingService.process(payload);

        assertThat(rawRepository.count()).isEqualTo(1);
        assertThat(kpiRepository.findAll()).hasSize(1);
        assertThat(kpiRepository.findAll().get(0).getOrderCount()).isEqualTo(1);
    }
}
