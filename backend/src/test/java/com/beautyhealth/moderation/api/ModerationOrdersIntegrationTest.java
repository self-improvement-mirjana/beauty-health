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
class ModerationOrdersIntegrationTest {

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
    void moderatorListsAndPatchesOrderStatus() throws Exception {
        String email = "mod-ord-" + UUID.randomUUID() + "@example.com";
        String reg = "{\"email\":\"" + email + "\",\"password\":\"ModOrd123!\",\"fullName\":\"Buyer\"}";
        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(reg))
                .andExpect(status().isCreated())
                .andReturn();
        String buyerToken = objectMapper.readTree(regRes.getResponse().getContentAsString()).get("accessToken").asText();

        mockMvc.perform(post("/api/v1/cart/items").header(HttpHeaders.AUTHORIZATION, "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":1,\"quantity\":1}"))
                .andExpect(status().isOk());

        String checkout = """
                {"recipientName":"A B","recipientPhone":"060","addressLine1":"X","city":"Y","postalCode":"1","countryCode":"RS"}""";
        MvcResult orderRes = mockMvc.perform(post("/api/v1/orders").header(HttpHeaders.AUTHORIZATION, "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkout))
                .andExpect(status().isCreated())
                .andReturn();
        long orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).get("orderId").asLong();

        mockMvc.perform(get("/api/v1/admin/orders").header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").exists());

        mockMvc.perform(get("/api/v1/admin/orders/" + orderId).header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerUserId").exists())
                .andExpect(jsonPath("$.customerEmail").value(email))
                .andExpect(jsonPath("$.order.id").value(orderId));

        mockMvc.perform(
                        patch("/api/v1/admin/orders/" + orderId + "/status").header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"CONFIRMED\"}"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/admin/orders/" + orderId).header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.order.status").value("CONFIRMED"));

        mockMvc.perform(
                        patch("/api/v1/admin/orders/" + orderId + "/status").header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(ErrorCodes.CONFLICT));
    }

    @Test
    void customerCannotPatchOrderStatus() throws Exception {
        String email = "mod-ord-cust-" + UUID.randomUUID() + "@example.com";
        String reg = "{\"email\":\"" + email + "\",\"password\":\"ModOrd456!\",\"fullName\":\"Cust\"}";
        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(reg))
                .andExpect(status().isCreated())
                .andReturn();
        String token = objectMapper.readTree(regRes.getResponse().getContentAsString()).get("accessToken").asText();

        mockMvc.perform(patch("/api/v1/admin/orders/1/status").header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CONFIRMED\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(ErrorCodes.FORBIDDEN));
    }

    @Test
    void moderatorCanLookupUserByEmail() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users").param("email", "moderator-it@test")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("moderator-it@test"))
                .andExpect(jsonPath("$.roles").isArray())
                .andExpect(jsonPath("$.orderCount").exists());
    }
}
