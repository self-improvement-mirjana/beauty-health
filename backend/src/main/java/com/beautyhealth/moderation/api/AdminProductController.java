package com.beautyhealth.moderation.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.catalog.api.dto.ProductDetailResponse;
import com.beautyhealth.catalog.read.CatalogReadService;
import com.beautyhealth.moderation.api.dto.AdminCreateProductRequest;
import com.beautyhealth.moderation.api.dto.AdminProductCreatedResponse;
import com.beautyhealth.moderation.api.dto.AdminUpdateProductRequest;
import com.beautyhealth.moderation.api.dto.AdminVariantInventoryBody;
import com.beautyhealth.moderation.api.dto.AdminVariantInventoryLineResponse;
import com.beautyhealth.moderation.api.dto.AdminVariantPricesRequest;
import com.beautyhealth.moderation.service.ModerationCatalogWriteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/admin/products", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "moderation")
@SecurityRequirement(name = "bearer-jwt")
public class AdminProductController {

    private final ModerationCatalogWriteService moderationCatalogWriteService;
    private final CatalogReadService catalogReadService;

    public AdminProductController(ModerationCatalogWriteService moderationCatalogWriteService,
            CatalogReadService catalogReadService) {
        this.moderationCatalogWriteService = moderationCatalogWriteService;
        this.catalogReadService = catalogReadService;
    }

    @GetMapping("/detail")
    @Operation(summary = "Detalj proizvoda za moderaciju (uklj. neaktivan)")
    public ProductDetailResponse moderationDetail(@RequestParam("slug") String slug) {
        return catalogReadService.moderatorProductDetail(slug.trim());
    }

    @GetMapping("/{productId}/variants/{variantId}/inventory")
    @Operation(summary = "Trenutne zalihe varijante po magacinima")
    public List<AdminVariantInventoryLineResponse> variantInventory(@PathVariable long productId,
            @PathVariable long variantId) {
        return moderationCatalogWriteService.getVariantInventory(productId, variantId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Kreiranje proizvoda sa varijantama i zalihama")
    public AdminProductCreatedResponse create(@RequestBody @Valid AdminCreateProductRequest request) {
        return moderationCatalogWriteService.createProduct(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Izmena proizvoda (brend, kategorije, marketing polja)")
    public AdminProductCreatedResponse update(@PathVariable long id, @RequestBody @Valid AdminUpdateProductRequest request) {
        return moderationCatalogWriteService.updateProduct(id, request);
    }

    @PatchMapping("/{productId}/variants/{variantId}/prices")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Izmena cena varijante")
    public void patchPrices(@PathVariable long productId, @PathVariable long variantId,
            @RequestBody @Valid AdminVariantPricesRequest request) {
        moderationCatalogWriteService.updateVariantPrices(productId, variantId, request);
    }

    @PatchMapping("/{productId}/variants/{variantId}/inventory")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Zamena zaliha varijante po magacinima (store_location)")
    public void patchInventory(@PathVariable long productId, @PathVariable long variantId,
            @RequestBody @Valid AdminVariantInventoryBody body) {
        moderationCatalogWriteService.replaceVariantInventory(productId, variantId, body);
    }
}
