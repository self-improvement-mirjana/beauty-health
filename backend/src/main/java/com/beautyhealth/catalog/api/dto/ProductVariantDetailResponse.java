package com.beautyhealth.catalog.api.dto;

import java.util.List;

import com.beautyhealth.common.money.MoneyResponse;

public record ProductVariantDetailResponse(
        Long id,
        String sku,
        String name,
        MoneyResponse moneyRegular,
        MoneyResponse moneySale,
        boolean inStock,
        List<SelectedOptionValueResponse> selectedOptions) {
}
