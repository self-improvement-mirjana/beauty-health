package com.beautyhealth.catalog.read;

import java.math.BigDecimal;

/**
 * Flat row for storefront listing (single SQL round-trip, no N+1).
 */
public record ProductListingRow(
        long productId,
        String title,
        String slug,
        String brandName,
        String brandSlug,
        String primaryImageUrl,
        BigDecimal regularPrice,
        BigDecimal salePrice,
        Long primaryVariantId,
        long variantCount,
        long totalStock,
        long optionGroupCount,
        BigDecimal ratingAverage,
        long reviewCount) {
}
