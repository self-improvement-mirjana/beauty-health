package com.beautyhealth.catalog.api.dto;

public record BrandSummaryResponse(Long id, String name, String slug, String logoUrl, long productCount) {
}
