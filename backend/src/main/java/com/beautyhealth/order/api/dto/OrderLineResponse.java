package com.beautyhealth.order.api.dto;

import com.beautyhealth.common.money.MoneyResponse;

public record OrderLineResponse(long id, long variantId, String productSlug, String productName, int quantity,
        MoneyResponse unitPrice, MoneyResponse lineTotal) {
}
