package com.beautyhealth.review.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ReviewApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void postThenGetReviewsNeverIncludesEmailInJson() throws Exception {
        mockMvc.perform(post("/api/v1/products/product-001/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                "{\"authorName\":\"Tester\",\"authorEmail\":\"secret.reviewer@example.com\",\"rating\":4,\"body\":\"Kratka recenzija.\",\"publicEmail\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authorName").value("Tester"))
                .andExpect(jsonPath("$.rating").value(4))
                .andExpect(jsonPath("$.body").value("Kratka recenzija."));

        String listJson = mockMvc.perform(get("/api/v1/products/product-001/reviews").param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(listJson).doesNotContain("authorEmail");
        assertThat(listJson).doesNotContain("secret.reviewer@");
    }

    @Test
    void getReviewsUnknownProductReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/products/non-existent-slug-xyz/reviews"))
                .andExpect(status().isNotFound());
    }
}
