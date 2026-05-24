package com.beautyhealth.analytics.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.beautyhealth.analytics.api.dto.AnalyticsIngestRequest;
import com.beautyhealth.analytics.api.dto.AnalyticsIngestResponse;
import com.beautyhealth.analytics.model.AnalyticsEventTypes;

@ExtendWith(MockitoExtension.class)
class AnalyticsIngestServiceTest {

    @Mock
    private AnalyticsOutboxService outboxService;

    @InjectMocks
    private AnalyticsIngestService ingestService;

    @Test
    void validEventIsAccepted() {
        var item = validItem(AnalyticsEventTypes.PAGE_VIEW, Map.of("path", "/shop"));
        AnalyticsIngestResponse response = ingestService.ingest(List.of(item));
        assertThat(response.acceptedCount()).isEqualTo(1);
        assertThat(response.rejectedCount()).isZero();
        verify(outboxService).enqueue(any());
    }

    @Test
    void wrongSchemaVersionIsRejected() {
        var item = new AnalyticsIngestRequest.AnalyticsIngestEventItem(
                "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
                AnalyticsEventTypes.PAGE_VIEW,
                "2026-05-24T10:00:00Z",
                "storefront",
                "guest",
                null,
                "sess",
                null,
                "v2",
                Map.of("path", "/"));
        AnalyticsIngestResponse response = ingestService.ingest(List.of(item));
        assertThat(response.acceptedCount()).isZero();
        assertThat(response.rejectedCount()).isEqualTo(1);
        verify(outboxService, never()).enqueue(any());
    }

    @Test
    void invalidEventDoesNotBlockValidOnes() {
        var bad = new AnalyticsIngestRequest.AnalyticsIngestEventItem(
                "not-a-uuid",
                AnalyticsEventTypes.PAGE_VIEW,
                "2026-05-24T10:00:00Z",
                "storefront",
                "guest",
                null,
                "sess",
                null,
                "v1",
                Map.of("path", "/"));
        var good = validItem(AnalyticsEventTypes.PRODUCT_VIEW, Map.of("productSlug", "serum"));
        AnalyticsIngestResponse response = ingestService.ingest(List.of(bad, good));
        assertThat(response.acceptedCount()).isEqualTo(1);
        assertThat(response.rejectedCount()).isEqualTo(1);
    }

    private static AnalyticsIngestRequest.AnalyticsIngestEventItem validItem(String type, Map<String, Object> payload) {
        return new AnalyticsIngestRequest.AnalyticsIngestEventItem(
                "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
                type,
                "2026-05-24T10:00:00Z",
                "storefront",
                "guest",
                null,
                "sess",
                null,
                "v1",
                payload);
    }
}
