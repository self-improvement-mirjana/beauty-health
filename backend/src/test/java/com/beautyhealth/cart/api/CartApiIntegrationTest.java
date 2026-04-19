package com.beautyhealth.cart.api;

import static org.assertj.core.api.Assertions.assertThat;
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

import com.beautyhealth.common.error.ErrorCodes;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CartApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void cartPingStillWorks() throws Exception {
        mockMvc.perform(get("/api/v1/cart/ping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));
    }

    @Test
    void guestFirstGetReturnsTokenHeader() throws Exception {
        MvcResult r = mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.empty").value(true))
                .andReturn();
        assertThat(r.getResponse().getHeader(CartController.GUEST_CART_TOKEN_HEADER)).isNotBlank();
    }

    @Test
    void addItemWithoutGuestHeaderCreatesCart() throws Exception {
        MvcResult r = mockMvc.perform(post("/api/v1/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":1,\"quantity\":1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.empty").value(false))
                .andExpect(jsonPath("$.items[0].variantId").value(1))
                .andReturn();
        assertThat(r.getResponse().getHeader(CartController.GUEST_CART_TOKEN_HEADER)).isNotBlank();
    }

    @Test
    void sameVariantPostIncreasesQuantity() throws Exception {
        MvcResult g = mockMvc.perform(get("/api/v1/cart")).andReturn();
        String tok = g.getResponse().getHeader(CartController.GUEST_CART_TOKEN_HEADER);
        mockMvc.perform(post("/api/v1/cart/items")
                        .header(CartController.GUEST_CART_TOKEN_HEADER, tok)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":1,\"quantity\":2}"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/cart/items")
                        .header(CartController.GUEST_CART_TOKEN_HEADER, tok)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":1,\"quantity\":3}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(5));
    }

    @Test
    void addItemExceedingStockReturns409() throws Exception {
        MvcResult g = mockMvc.perform(get("/api/v1/cart")).andReturn();
        String tok = g.getResponse().getHeader(CartController.GUEST_CART_TOKEN_HEADER);
        mockMvc.perform(post("/api/v1/cart/items")
                        .header(CartController.GUEST_CART_TOKEN_HEADER, tok)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":1,\"quantity\":25}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(ErrorCodes.CONFLICT));
    }

    @Test
    void summaryMatchesCartTotals() throws Exception {
        MvcResult g = mockMvc.perform(get("/api/v1/cart")).andReturn();
        String tok = g.getResponse().getHeader(CartController.GUEST_CART_TOKEN_HEADER);
        mockMvc.perform(post("/api/v1/cart/items")
                        .header(CartController.GUEST_CART_TOKEN_HEADER, tok)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":1,\"quantity\":2}"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/cart/summary").header(CartController.GUEST_CART_TOKEN_HEADER, tok))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.empty").value(false))
                .andExpect(jsonPath("$.lineCount").value(1))
                .andExpect(jsonPath("$.totalQuantity").value(2));
    }

    @Test
    void mergeGuestCartIntoRegisteredUser() throws Exception {
        MvcResult g = mockMvc.perform(get("/api/v1/cart")).andReturn();
        String guestTok = g.getResponse().getHeader(CartController.GUEST_CART_TOKEN_HEADER);
        mockMvc.perform(post("/api/v1/cart/items")
                        .header(CartController.GUEST_CART_TOKEN_HEADER, guestTok)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":1,\"quantity\":2}"))
                .andExpect(status().isOk());

        String email = "cart-merge-" + UUID.randomUUID() + "@example.com";
        String registerJson = "{\"email\":\"" + email + "\",\"password\":\"mergePass1\",\"fullName\":\"Merge User\"}";
        MvcResult reg = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode body = objectMapper.readTree(reg.getResponse().getContentAsString());
        String access = body.get("accessToken").asText();

        mockMvc.perform(post("/api/v1/cart/merge")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + access)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"guestCartToken\":\"" + guestTok + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].quantity").value(2));

        mockMvc.perform(get("/api/v1/cart").header(HttpHeaders.AUTHORIZATION, "Bearer " + access))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(2));
    }

    @Test
    void mergeWithoutAuthReturns401() throws Exception {
        mockMvc.perform(post("/api/v1/cart/merge")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"guestCartToken\":\"00000000-0000-0000-0000-000000000001\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCodes.UNAUTHORIZED));
    }
}
