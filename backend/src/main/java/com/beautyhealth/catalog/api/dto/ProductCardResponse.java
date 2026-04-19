package com.beautyhealth.catalog.api.dto;

import com.beautyhealth.common.money.MoneyResponse;

public record ProductCardResponse(
        String title,
        String slug,
        String brandName,
        String brandSlug,
        String primaryImageUrl,
        MoneyResponse moneyRegular,
        MoneyResponse moneySale,
        CatalogCtaType ctaType,
        boolean inStock,
        boolean chooseOptionsRequired,
        Long primaryVariantId,
        Double ratingAverage,
        long reviewCount) {
}
