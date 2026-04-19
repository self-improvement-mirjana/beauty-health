package com.beautyhealth.order.api.dto;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Proizvod/varijanta iz ranijih porudžbina za brzi ponovni kupovinu.")
public record BuyAgainItemResponse(long variantId, String productSlug, String productName, Instant lastOrderedAt,
        long totalQuantityOrdered) {
}
