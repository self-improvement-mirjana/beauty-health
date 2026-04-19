package com.beautyhealth.cart.api.dto;

import com.beautyhealth.common.money.MoneyResponse;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Stavka korpe sa snapshot cenom po komadu.")
public record CartItemResponse(
        @Schema(description = "ID reda u cart_item") long id,
        @Schema(description = "ID varijante") long variantId,
        String productSlug,
        String productName,
        String variantLabel,
        String sku,
        int quantity,
        MoneyResponse unitPrice,
        MoneyResponse lineTotal) {
}
