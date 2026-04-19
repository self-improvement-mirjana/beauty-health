package com.beautyhealth.catalog.api;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.catalog.api.dto.CategoryChildProductCountRow;
import com.beautyhealth.catalog.api.dto.CategoryTreeNodeResponse;
import com.beautyhealth.catalog.read.CatalogReadService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping(value = "/api/v1/categories", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicCategoryController {

    private final CatalogReadService catalogReadService;

    public PublicCategoryController(CatalogReadService catalogReadService) {
        this.catalogReadService = catalogReadService;
    }

    @GetMapping("/tree")
    @Operation(summary = "Stablo aktivnih kategorija za navigaciju")
    public List<CategoryTreeNodeResponse> tree() {
        return catalogReadService.categoryTree();
    }

    @GetMapping("/product-counts")
    @Operation(summary = "Broj aktivnih proizvoda u podstablu za više slug-ova",
            description = "Parametar `slug` ponoviti po svakom slug-u. Koristi se za izveštaje / budući UI; padajući meni u storefrontu ne prikazuje brojeve (Sephora stil).")
    public List<CategoryChildProductCountRow> productCountsBySlugs(
            @RequestParam(name = "slug", required = false) List<String> slugs) {
        return catalogReadService.productCountsForSlugs(slugs == null ? List.of() : slugs);
    }

    @GetMapping("/{parentSlug}/child-product-counts")
    @Operation(summary = "Broj aktivnih proizvoda po direktnoj podkategoriji (roditelj po slug-u)")
    public List<CategoryChildProductCountRow> childProductCounts(@PathVariable String parentSlug) {
        return catalogReadService.childCategoryProductCounts(parentSlug);
    }
}
