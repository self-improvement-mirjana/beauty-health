package com.beautyhealth.moderation.api;

import static org.assertj.core.api.Assertions.assertThat;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Sql(scripts = "/sql/moderation-test-moderator.sql", config = @SqlConfig(transactionMode = SqlConfig.TransactionMode.ISOLATED))
class ModerationCatalogWriteIntegrationTest {

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
    void createProductThenPublicCatalogShowsUpdatedPrice() throws Exception {
        String slug = "b10-admin-widget";
        String body = """
                {
                  "brandId": 1,
                  "name": "B10 Admin Widget",
                  "slug": "%s",
                  "description": "Test",
                  "shortDescription": "Short",
                  "featured": false,
                  "active": true,
                  "categoryIds": [1],
                  "variants": [
                    {
                      "sku": "B10-ADM-SKU-1",
                      "name": "Default",
                      "regularPrice": 100.00,
                      "salePrice": null,
                      "defaultVariant": true,
                      "inventory": [
                        {"storeLocationId": 1, "quantity": 2},
                        {"storeLocationId": 2, "quantity": 1},
                        {"storeLocationId": 3, "quantity": 0}
                      ]
                    }
                  ]
                }
                """.formatted(slug);

        MvcResult created = mockMvc.perform(post("/api/v1/admin/products").header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value(slug))
                .andReturn();
        long productId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(get("/api/v1/products/" + slug))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.variants[0].moneyRegular.amount").value("100.00"));

        MvcResult detail = mockMvc.perform(get("/api/v1/products/" + slug)).andExpect(status().isOk()).andReturn();
        JsonNode variants = objectMapper.readTree(detail.getResponse().getContentAsString()).get("variants");
        assertThat(variants.isArray()).isTrue();
        long variantId = variants.get(0).get("id").asLong();

        String patchPrices = "{\"regularPrice\":199.99,\"salePrice\":null}";
        mockMvc.perform(
                        patch("/api/v1/admin/products/" + productId + "/variants/" + variantId + "/prices")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(patchPrices))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/products/" + slug))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.variants[0].moneyRegular.amount").value("199.99"));
    }

    @Test
    void adminCanReadStoreLocationsProductDetailAndVariantInventory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/store-locations").header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists());

        MvcResult detail = mockMvc.perform(
                        get("/api/v1/admin/products/detail").param("slug", "product-001")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.slug").value("product-001"))
                .andReturn();
        long productId = objectMapper.readTree(detail.getResponse().getContentAsString()).get("id").asLong();
        long variantId = objectMapper.readTree(detail.getResponse().getContentAsString()).get("variants").get(0).get("id").asLong();

        mockMvc.perform(
                        get("/api/v1/admin/products/" + productId + "/variants/" + variantId + "/inventory")
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].storeLocationId").exists())
                .andExpect(jsonPath("$[0].quantity").exists());
    }

    @Test
    void categoryDeleteRejectedWhenSubcategoriesExist() throws Exception {
        String pslug = "m03-p-" + UUID.randomUUID().toString().substring(0, 8);
        String cslug = "m03-c-" + UUID.randomUUID().toString().substring(0, 8);
        String parentBody = """
                {"name":"M03 parent","slug":"%s","description":null,"parentCategoryId":null,"sortOrder":0,"active":true}
                """.formatted(pslug);
        MvcResult parentRes = mockMvc.perform(post("/api/v1/admin/categories").header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(parentBody))
                .andExpect(status().isCreated())
                .andReturn();
        long parentId = objectMapper.readTree(parentRes.getResponse().getContentAsString()).get("id").asLong();
        String childBody = """
                {"name":"M03 child","slug":"%s","description":null,"parentCategoryId":%d,"sortOrder":0,"active":true}
                """.formatted(cslug, parentId);
        mockMvc.perform(post("/api/v1/admin/categories").header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(childBody))
                .andExpect(status().isCreated());

        mockMvc.perform(delete("/api/v1/admin/categories/" + parentId).header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));
    }

    @Test
    void categoryParentCycleRejected() throws Exception {
        String pslug = "m03-p2-" + UUID.randomUUID().toString().substring(0, 8);
        String cslug = "m03-c2-" + UUID.randomUUID().toString().substring(0, 8);
        String parentBody = """
                {"name":"M03 parent2","slug":"%s","description":null,"parentCategoryId":null,"sortOrder":0,"active":true}
                """.formatted(pslug);
        MvcResult parentRes = mockMvc.perform(post("/api/v1/admin/categories").header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(parentBody))
                .andExpect(status().isCreated())
                .andReturn();
        long parentId = objectMapper.readTree(parentRes.getResponse().getContentAsString()).get("id").asLong();
        String childBody = """
                {"name":"M03 child2","slug":"%s","description":null,"parentCategoryId":%d,"sortOrder":0,"active":true}
                """.formatted(cslug, parentId);
        MvcResult childRes = mockMvc.perform(post("/api/v1/admin/categories").header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(childBody))
                .andExpect(status().isCreated())
                .andReturn();
        long childId = objectMapper.readTree(childRes.getResponse().getContentAsString()).get("id").asLong();

        String badUpdate = """
                {"name":"M03 parent2","slug":"%s","description":null,"parentCategoryId":%d,"sortOrder":0,"active":true}
                """.formatted(pslug, childId);
        mockMvc.perform(put("/api/v1/admin/categories/" + parentId).header(HttpHeaders.AUTHORIZATION, "Bearer " + moderatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badUpdate))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }
}
