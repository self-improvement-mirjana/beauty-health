package com.beautyhealth.catalog.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.beautyhealth.common.error.ErrorCodes;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.beautyhealth.catalog.api.dto.CatalogCtaType;
import com.beautyhealth.catalog.api.dto.ProductCardResponse;
import com.beautyhealth.catalog.read.CatalogReadService;
import com.beautyhealth.common.error.GlobalExceptionHandler;
import com.beautyhealth.common.money.MoneyResponse;

@WebMvcTest(controllers = PublicProductController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class PublicProductControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CatalogReadService catalogReadService;

    @Test
    void searchWithoutQueryReturns400() throws Exception {
        mockMvc.perform(get("/api/v1/products/search").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ErrorCodes.BAD_REQUEST));
    }

    @Test
    void listProductsReturnsPage() throws Exception {
        ProductCardResponse card = new ProductCardResponse(
                "Test",
                "test-slug",
                "B",
                "b",
                null,
                MoneyResponse.rsd(new BigDecimal("99.00")),
                null,
                CatalogCtaType.ADD_TO_CART,
                true,
                false,
                1L,
                4.5,
                10L);
        Page<ProductCardResponse> page = new PageImpl<>(List.of(card), PageRequest.of(0, 20), 1);
        when(catalogReadService.listProducts(any(), any(), any(), any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/products").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].slug").value("test-slug"))
                .andExpect(jsonPath("$.content[0].ctaType").value("ADD_TO_CART"));
    }

    @Test
    void listProductsWithSlugsUsesBySlugsService() throws Exception {
        ProductCardResponse card = new ProductCardResponse(
                "Test",
                "test-slug",
                "B",
                "b",
                null,
                MoneyResponse.rsd(new BigDecimal("99.00")),
                null,
                CatalogCtaType.ADD_TO_CART,
                true,
                false,
                1L,
                4.5,
                10L);
        Page<ProductCardResponse> page = new PageImpl<>(List.of(card), PageRequest.of(0, 20), 1);
        when(catalogReadService.listProductsBySlugs(any(), any())).thenReturn(page);

        mockMvc.perform(
                        get("/api/v1/products")
                                .param("slugs", "a")
                                .param("slugs", "b")
                                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));

        verify(catalogReadService).listProductsBySlugs(any(), any());
    }

    @Test
    void listProductsBindsRepeatedCategoryFacetParams() throws Exception {
        Page<ProductCardResponse> page = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);
        when(catalogReadService.listProducts(any(), any(), any(), any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(
                        get("/api/v1/products")
                                .param("categorySlug", "lice")
                                .param("categoryFacet", "osetljiva-koza")
                                .param("categoryFacet", "normalna")
                                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));

        verify(catalogReadService)
                .listProducts(
                        isNull(),
                        eq("lice"),
                        argThat(
                                facets ->
                                        facets.size() == 2
                                                && facets.contains("osetljiva-koza")
                                                && facets.contains("normalna")),
                        isNull(),
                        isNull(),
                        isNull(),
                        any(Pageable.class));
    }

    @Test
    void listProductsAcceptsCommaSeparatedCategoryFacetInOneParam() throws Exception {
        Page<ProductCardResponse> page = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);
        when(catalogReadService.listProducts(any(), any(), any(), any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(
                        get("/api/v1/products")
                                .param("categorySlug", "lice")
                                .param("categoryFacet", "masna-koza-tip-koze,mesovita-i-normalna-koza")
                                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));

        verify(catalogReadService)
                .listProducts(
                        isNull(),
                        eq("lice"),
                        argThat(
                                facets ->
                                        facets.size() == 2
                                                && facets.contains("masna-koza-tip-koze")
                                                && facets.contains("mesovita-i-normalna-koza")),
                        isNull(),
                        isNull(),
                        isNull(),
                        any(Pageable.class));
    }
}
