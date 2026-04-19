package com.beautyhealth.cart.api.dto;

import com.beautyhealth.common.money.MoneyResponse;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Sažetak za badge (broj linija, ukupna količina, prazno, subtotal).")
public record CartSummaryResponse(
        int lineCount,
        int totalQuantity,
        boolean empty,
        MoneyResponse subtotal) {
}
