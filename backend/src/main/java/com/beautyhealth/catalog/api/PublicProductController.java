package com.beautyhealth.catalog.api;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.beautyhealth.catalog.api.dto.ProductCardResponse;
import com.beautyhealth.catalog.api.dto.ProductDetailResponse;
import com.beautyhealth.catalog.read.CatalogReadService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping(value = "/api/v1/products", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicProductController {

    private final CatalogReadService catalogReadService;

    public PublicProductController(CatalogReadService catalogReadService) {
        this.catalogReadService = catalogReadService;
    }

    @GetMapping("/search")
    @Operation(summary = "Pretraga proizvoda po nazivu (isti DTO kao lista proizvoda)",
            description = "Obavezan parametar `q` (ne sme biti prazan). Opciono: `categorySlug`, `categoryFacet` "
                    + "(više vrednosti OR: ponavljanje ili `slug1,slug2`), `brandSlug`. "
                    + "Sortiranje: Spring `sort` npr. `sort=price,asc`, `sort=name,asc`, `sort=ratingAvg,desc` "
                    + "(dozvoljena polja: id, name, price, featured, createdAt, ratingAvg). "
                    + "Prazan ili izostavljen `q` → HTTP 400 sa `ApiError` telom (B02).")
    public Page<ProductCardResponse> searchProducts(
            @Parameter(hidden = true) HttpServletRequest request,
            @Parameter(description = "Tekst pretrage (obavezno, ne-prazan)", required = true, example = "Proizvod")
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String brandSlug,
            @RequestParam(required = false) Integer minRating,
            @PageableDefault(size = 20) Pageable pageable) {
        if (q == null || q.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parameter q is required and must not be blank");
        }
        return catalogReadService.searchProducts(brandSlug, categorySlug, categoryFacetsFromRequest(request), q.trim(),
                sanitizeMinRating(minRating), pageable);
    }

    @GetMapping
    @Operation(summary = "Lista aktivnih proizvoda (listing kartica)",
            description = "Opciono `slugs` (više vrednosti): kartice samo za te proizvode, red kao u listi ako nije zadato sortiranje. "
                    + "Maks. 200 slug-ova. Ne kombinovati sa filterima kategorije/brenda. "
                    + "`categoryFacet`: OR između slug-ova (ponavljajući parametar ili jedan `slug1,slug2`); "
                    + "sa `categorySlug` se kombinuje AND.")
    public Page<ProductCardResponse> listProducts(
            @Parameter(hidden = true) HttpServletRequest request,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String brandSlug,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) List<String> slugs,
            @PageableDefault(size = 20) Pageable pageable) {
        if (slugs != null && !slugs.isEmpty()) {
            return catalogReadService.listProductsBySlugs(slugs, pageable);
        }
        return catalogReadService.listProducts(brandSlug, categorySlug, categoryFacetsFromRequest(request), featured,
                q, sanitizeMinRating(minRating), pageable);
    }

    /**
     * Prvo standardni servlet parametri; ako su prazni a u {@link HttpServletRequest#getQueryString()} i dalje postoji
     * {@code categoryFacet}, parsiramo ručno (zaobilazi retke slučajeve kada kontejner ne popuni mapu parametara).
     */
    private static List<String> categoryFacetsFromRequest(HttpServletRequest request) {
        List<String> primary = sanitizeCategoryFacets(request.getParameterValues("categoryFacet"));
        if (!primary.isEmpty()) {
            return primary;
        }
        return sanitizeCategoryFacets(rawCategoryFacetValuesFromQueryString(request.getQueryString()));
    }

    private static String[] rawCategoryFacetValuesFromQueryString(String queryString) {
        if (queryString == null || queryString.isBlank()) {
            return null;
        }
        List<String> vals = new ArrayList<>();
        for (String segment : queryString.split("&")) {
            if (segment.isEmpty()) {
                continue;
            }
            int eq = segment.indexOf('=');
            String keyEnc = eq > 0 ? segment.substring(0, eq) : segment;
            String key = urlDecodeQueryComponent(keyEnc);
            if (!"categoryFacet".equals(key)) {
                continue;
            }
            String rawVal = eq >= 0 && eq + 1 <= segment.length() ? segment.substring(eq + 1) : "";
            vals.add(urlDecodeQueryComponent(rawVal));
        }
        return vals.isEmpty() ? null : vals.toArray(String[]::new);
    }

    private static String urlDecodeQueryComponent(String s) {
        try {
            return URLDecoder.decode(s, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException ex) {
            return s;
        }
    }

    /**
     * Parsiranje facet slug-ova: sve vrednosti za ime {@code categoryFacet}; svaka vrednost može biti {@code slug1,slug2}.
     */
    private static List<String> sanitizeCategoryFacets(String[] raw) {
        if (raw == null || raw.length == 0) {
            return List.of();
        }
        LinkedHashSet<String> out = new LinkedHashSet<>();
        for (String s : raw) {
            if (s == null || s.isBlank()) {
                continue;
            }
            for (String part : s.split(",")) {
                String p = part.trim();
                if (!p.isEmpty()) {
                    out.add(p);
                    if (out.size() >= 20) {
                        return List.copyOf(out);
                    }
                }
            }
        }
        return List.copyOf(out);
    }

    /** 1–5; van opsega ili null → bez filtera proseka ocene. */
    private static Integer sanitizeMinRating(Integer minRating) {
        if (minRating == null) {
            return null;
        }
        if (minRating < 1 || minRating > 5) {
            return null;
        }
        return minRating;
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Detalj proizvoda (PDP)")
    public ProductDetailResponse productDetail(@PathVariable String slug) {
        return catalogReadService.productDetail(slug);
    }
}
