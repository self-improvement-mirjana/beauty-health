package com.beautyhealth.catalog.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.catalog.api.dto.BrandSummaryResponse;
import com.beautyhealth.catalog.api.dto.ProductCardResponse;
import com.beautyhealth.catalog.read.CatalogReadService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping(value = "/api/v1/brands", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicBrandController {

    private final CatalogReadService catalogReadService;

    public PublicBrandController(CatalogReadService catalogReadService) {
        this.catalogReadService = catalogReadService;
    }

    @GetMapping
    @Operation(summary = "Lista brendova")
    public List<BrandSummaryResponse> listBrands() {
        return catalogReadService.listBrands();
    }

    @GetMapping("/{slug}/products")
    @Operation(summary = "Proizvodi brenda (paginacija kao /api/v1/products)")
    public Page<ProductCardResponse> brandProducts(@PathVariable("slug") String brandSlug,
            @PageableDefault(size = 20) Pageable pageable) {
        return catalogReadService.listProductsForBrand(brandSlug, pageable);
    }
}
