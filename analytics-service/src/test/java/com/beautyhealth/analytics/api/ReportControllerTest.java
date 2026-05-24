package com.beautyhealth.analytics.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void reportsRequireApiKey() throws Exception {
        mockMvc.perform(get("/api/v1/reports/kpi-summary")).andExpect(status().isUnauthorized());
    }

    @Test
    void reportsOkWithApiKey() throws Exception {
        mockMvc.perform(get("/api/v1/reports/kpi-summary").header("X-API-Key", "test-key"))
                .andExpect(status().isOk());
    }
}
