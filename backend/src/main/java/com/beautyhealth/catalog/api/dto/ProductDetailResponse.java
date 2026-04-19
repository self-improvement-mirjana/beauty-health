package com.beautyhealth.catalog.api.dto;

import java.util.List;

public record ProductDetailResponse(
        long id,
        long brandId,
        String title,
        String slug,
        String primaryImageUrl,
        String brandName,
        String brandSlug,
        String shortDescription,
        String description,
        boolean featured,
        boolean active,
        List<ProductCategoryLinkResponse> categories,
        List<ProductOptionResponse> options,
        List<ProductVariantDetailResponse> variants,
        Double ratingAverage,
        long reviewCount) {
}
