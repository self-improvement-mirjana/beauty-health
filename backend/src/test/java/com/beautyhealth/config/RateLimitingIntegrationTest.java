package com.beautyhealth.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import com.beautyhealth.common.error.ErrorCodes;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = { "app.rate-limit.enabled=true", "app.rate-limit.login-per-minute=2",
        "app.rate-limit.review-posts-per-hour=2" })
class RateLimitingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void loginReturns429AfterBurst() throws Exception {
        String body = "{\"email\":\"nope@example.com\",\"password\":\"wrongPass1\"}";
        for (int i = 0; i < 2; i++) {
            mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isUnauthorized());
        }
        mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value(ErrorCodes.RATE_LIMITED));
    }

    @Test
    void productReviewPostReturns429AfterBurst() throws Exception {
        for (int i = 0; i < 2; i++) {
            String json = reviewJson("r" + i + "@ex.com");
            mockMvc.perform(post("/api/v1/products/product-001/reviews").contentType(MediaType.APPLICATION_JSON).content(json))
                    .andExpect(status().isOk());
        }
        mockMvc.perform(post("/api/v1/products/product-001/reviews").contentType(MediaType.APPLICATION_JSON)
                        .content(reviewJson("r-final@ex.com")))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value(ErrorCodes.RATE_LIMITED));
    }

    private static String reviewJson(String email) {
        return """
                {"authorName":"A","authorEmail":"%s","rating":5,"body":"Kratka recenzija za rate limit test.","publicEmail":false}
                """.formatted(email);
    }
}
