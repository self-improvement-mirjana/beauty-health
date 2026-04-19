package com.beautyhealth.cart.api.dto;

import java.util.List;

import com.beautyhealth.common.money.MoneyResponse;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Korpa sa stavkama i zbirom (RSD). Prazna korpa: items=[], empty=true.")
public record CartResponse(
        List<CartItemResponse> items,
        int lineCount,
        int totalQuantity,
        boolean empty,
        MoneyResponse subtotal) {
}
