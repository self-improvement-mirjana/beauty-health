package com.beautyhealth.order.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.beautyhealth.catalog.repo.InventoryRowRepository;
import com.beautyhealth.common.error.ErrorCodes;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class OrderApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private InventoryRowRepository inventoryRowRepository;

    @Test
    void createOrderWithoutAuthReturns401() throws Exception {
        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCodes.UNAUTHORIZED));
    }

    @Test
    void listOrdersWithoutAuthReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/orders"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCodes.UNAUTHORIZED));
    }

    @Test
    void checkoutHappyPathClearsCartAndReturns201() throws Exception {
        String email = "order-hp-" + UUID.randomUUID() + "@example.com";
        String reg = "{\"email\":\"" + email + "\",\"password\":\"orderHp1\",\"fullName\":\"Order HP\"}";
        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reg))
                .andExpect(status().isCreated())
                .andReturn();
        String token = objectMapper.readTree(regRes.getResponse().getContentAsString()).get("accessToken").asText();

        mockMvc.perform(post("/api/v1/cart/items")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":1,\"quantity\":2}"))
                .andExpect(status().isOk());

        String checkout = """
                {"recipientName":"A B","recipientPhone":"0601234567","addressLine1":"Ulica 1","addressLine2":null,
                "city":"Beograd","postalCode":"11000","countryCode":"RS"}""";

        MvcResult orderRes = mockMvc.perform(post("/api/v1/orders")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkout))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").exists())
                .andExpect(jsonPath("$.status").value("NEW"))
                .andExpect(jsonPath("$.total.amount").exists())
                .andExpect(jsonPath("$.deliverySummaryText").exists())
                .andReturn();

        long orderId = objectMapper.readTree(orderRes.getResponse().getContentAsString()).get("orderId").asLong();

        mockMvc.perform(get("/api/v1/orders/" + orderId).header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId))
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.lines.length()").value(1))
                .andExpect(jsonPath("$.lines[0].quantity").value(2))
                .andExpect(jsonPath("$.paymentProvider").value("COD"));

        mockMvc.perform(get("/api/v1/orders").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value(orderId))
                .andExpect(jsonPath("$.content[0].lineCount").value(1));

        mockMvc.perform(get("/api/v1/orders/buy-again").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].variantId").value(1))
                .andExpect(jsonPath("$[0].totalQuantityOrdered").value(2));

        mockMvc.perform(get("/api/v1/cart").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.empty").value(true));
    }

    @Test
    void checkoutEmptyCartReturns400() throws Exception {
        String email = "order-empty-" + UUID.randomUUID() + "@example.com";
        String reg = "{\"email\":\"" + email + "\",\"password\":\"orderEm1\",\"fullName\":\"Empty\"}";
        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reg))
                .andExpect(status().isCreated())
                .andReturn();
        String token = objectMapper.readTree(regRes.getResponse().getContentAsString()).get("accessToken").asText();

        String checkout = """
                {"recipientName":"A B","recipientPhone":"060","addressLine1":"X","city":"Y","postalCode":"1","countryCode":"RS"}""";
        mockMvc.perform(post("/api/v1/orders")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkout))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCodes.BAD_REQUEST));
    }

    @Test
    void checkoutInsufficientStockReturns409() throws Exception {
        String email = "order-409-" + UUID.randomUUID() + "@example.com";
        String reg = "{\"email\":\"" + email + "\",\"password\":\"order4091\",\"fullName\":\"Stock\"}";
        MvcResult regRes = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reg))
                .andExpect(status().isCreated())
                .andReturn();
        String token = objectMapper.readTree(regRes.getResponse().getContentAsString()).get("accessToken").asText();

        mockMvc.perform(post("/api/v1/cart/items")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":1,\"quantity\":1}"))
                .andExpect(status().isOk());

        var rows = inventoryRowRepository.lockRowsByVariantId(1L);
        rows.forEach(row -> row.setQuantity(0));
        inventoryRowRepository.saveAll(rows);

        String checkout = """
                {"recipientName":"A B","recipientPhone":"060","addressLine1":"X","city":"Y","postalCode":"1","countryCode":"RS"}""";
        mockMvc.perform(post("/api/v1/orders")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkout))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(ErrorCodes.CONFLICT));
    }
}
