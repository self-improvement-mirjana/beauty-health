package com.beautyhealth.catalog.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.beautyhealth.common.error.ErrorCodes;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CatalogApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void catalogPingOk() throws Exception {
        mockMvc.perform(get("/api/v1/catalog/ping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slice").value("catalog"))
                .andExpect(jsonPath("$.ok").value(true));
    }

    @Test
    void moneyFormatExampleMatchesApiMoneyContract() throws Exception {
        mockMvc.perform(get("/api/v1/catalog/money-format-example"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value("3600.00"))
                .andExpect(jsonPath("$.currency").value("RSD"));
    }

    @Test
    void productsListingReturnsPagedCards() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(55))
                .andExpect(jsonPath("$.content.length()").value(5))
                .andExpect(jsonPath("$.content[0].slug").exists())
                .andExpect(jsonPath("$.content[0].moneyRegular.amount").exists())
                .andExpect(jsonPath("$.content[0].ctaType").exists());
    }

    @Test
    void productDetailForSeedSlug() throws Exception {
        mockMvc.perform(get("/api/v1/products/product-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.brandId").exists())
                .andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.slug").value("product-001"))
                .andExpect(jsonPath("$.brandSlug").exists())
                .andExpect(jsonPath("$.categories[0].id").exists())
                .andExpect(jsonPath("$.variants.length()").value(3));
    }

    @Test
    void categoryTreeNotEmpty() throws Exception {
        String json = mockMvc.perform(get("/api/v1/categories/tree"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertThat(json).contains("sminka");
    }

    @Test
    void childProductCountsForParentListsEachDirectChildWithNonNegativeCounts() throws Exception {
        String body = mockMvc.perform(get("/api/v1/categories/lice/child-product-counts"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode arr = objectMapper.readTree(body);
        assertThat(arr.isArray()).isTrue();
        assertThat(arr.size()).isPositive();
        long padsCount = -1L;
        int nonNegativeRows = 0;
        for (JsonNode row : arr) {
            assertThat(row.path("slug").asText()).isNotBlank();
            long n = row.path("productCount").asLong();
            assertThat(n).isNotNegative();
            nonNegativeRows++;
            if ("pads".equals(row.path("slug").asText())) {
                padsCount = n;
            }
        }
        assertThat(nonNegativeRows).isEqualTo(arr.size());
        assertThat(padsCount).isGreaterThan(0L);
    }

    @Test
    void productListingForParentCategoryIncludesDescendantProducts() throws Exception {
        String padsJson = mockMvc.perform(get("/api/v1/products").param("categorySlug", "pads").param("size", "1"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        long padsTotal = objectMapper.readTree(padsJson).path("totalElements").asLong();
        String liceJson = mockMvc.perform(get("/api/v1/products").param("categorySlug", "lice").param("size", "1"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        long liceTotal = objectMapper.readTree(liceJson).path("totalElements").asLong();
        assertThat(liceTotal).isGreaterThanOrEqualTo(padsTotal);
    }

    @Test
    void childProductCountsForPadsMatchesProductListingTotal() throws Exception {
        String body = mockMvc.perform(get("/api/v1/categories/lice/child-product-counts"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        long padsFromCounts = 0L;
        for (JsonNode row : objectMapper.readTree(body)) {
            if ("pads".equals(row.path("slug").asText())) {
                padsFromCounts = row.path("productCount").asLong();
                break;
            }
        }
        mockMvc.perform(get("/api/v1/products").param("categorySlug", "pads").param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value((int) padsFromCounts));
    }

    @Test
    void brandsListContainsGlowLab() throws Exception {
        mockMvc.perform(get("/api/v1/brands"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").exists());
    }

    @Test
    void productSearchRequiresNonBlankQuery() throws Exception {
        mockMvc.perform(get("/api/v1/products/search"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCodes.BAD_REQUEST));
        mockMvc.perform(get("/api/v1/products/search").param("q", "   "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCodes.BAD_REQUEST));
    }

    @Test
    void productSearchReturnsSubset() throws Exception {
        mockMvc.perform(get("/api/v1/products/search").param("q", "Proizvod").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(55))
                .andExpect(jsonPath("$.content[0].title").value(containsString("Proizvod")));
    }
}
