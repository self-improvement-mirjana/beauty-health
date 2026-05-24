package com.beautyhealth.analytics.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.beautyhealth.analytics.api.dto.AnalyticsIngestResponse;
import com.beautyhealth.analytics.service.AnalyticsIngestService;
import com.beautyhealth.common.error.GlobalExceptionHandler;

@WebMvcTest(controllers = AnalyticsIngestController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AnalyticsIngestControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalyticsIngestService ingestService;

    @Test
    void ingestReturnsCounts() throws Exception {
        when(ingestService.ingest(any())).thenReturn(new AnalyticsIngestResponse(1, 0, List.of()));

        mockMvc.perform(post("/api/v1/analytics/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"events":[{"eventId":"aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee","eventType":"page_view","occurredAt":"2026-05-24T10:00:00Z","source":"storefront","actorType":"guest","sessionId":"s","schemaVersion":"v1","payload":{"path":"/"}}]}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.acceptedCount").value(1));
    }
}
