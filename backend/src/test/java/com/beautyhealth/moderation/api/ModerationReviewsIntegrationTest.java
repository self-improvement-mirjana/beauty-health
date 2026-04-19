package com.beautyhealth.moderation.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.beautyhealth.common.error.ErrorCodes;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Sql(scripts = "/sql/moderation-test-moderator.sql", config = @SqlConfig(transactionMode = SqlConfig.TransactionMode.ISOLATED))
class ModerationReviewsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String moderatorToken;

    @BeforeEach
    void loginModerator() throws Exception {
        MvcResult r = mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"moderator-it@test\",\"password\":\"ModeratorLocal1!\"}"))
                .andExpect(status().isOk())
                .andReturn();
        moderatorToken = objectMapper.readTree(r.getResponse().getContentAsString()).get("accessToken").asText();
    }

    @Test
    void moderatorListsApprovesThenPublicSeesReview() throws Exception {
        mockMvc.perform(post("/api/v1/products/product-001/reviews").contentType(MediaType.APPLICATION_JSON)
                        .content(
                                "{\"authorName\":\"ModRev\",\"authorEmail\":\"mod-rev@example.com\",\"rating\":5,\"body\":\"Telo.\",\"publicEmail\":false}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/products/product-001/reviews").param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty());

        MvcResult adminList = mockMvc.perform(get("/api/v1/admin/reviews").param("size", "20")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].approved").value(false))
                .andExpect(jsonPath("$.content[0].authorEmail").value("mod-rev@example.com"))
                .andReturn();
        long reviewId = objectMapper.readTree(adminList.getResponse().getContentAsString()).get("content").get(0).get("id").asLong();

        mockMvc.perform(patch("/api/v1/admin/reviews/" + reviewId + "/approval")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"approved\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.approved").value(true));

        mockMvc.perform(get("/api/v1/products/product-001/reviews").param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].authorName").value("ModRev"))
                .andExpect(jsonPath("$.content[0].rating").value(5));
    }

    @Test
    void customerCannotAccessAdminReviews() throws Exception {
        String email = "rev-cust-" + UUID.randomUUID() + "@example.com";
        String reg = "{\"email\":\"" + email + "\",\"password\":\"RevCust123!\",\"fullName\":\"R\"}";
        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(reg))
                .andExpect(status().isCreated())
                .andReturn();
        String token = objectMapper.readTree(regRes.getResponse().getContentAsString()).get("accessToken").asText();

        mockMvc.perform(get("/api/v1/admin/reviews").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(ErrorCodes.FORBIDDEN));
    }
}
