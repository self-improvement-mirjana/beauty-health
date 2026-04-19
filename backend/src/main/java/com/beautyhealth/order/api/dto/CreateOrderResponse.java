package com.beautyhealth.order.api.dto;

import com.beautyhealth.common.money.MoneyResponse;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Potvrda kreirane narudžbine.")
public record CreateOrderResponse(
        long orderId,
        String status,
        MoneyResponse total,
        String deliverySummaryText) {
}
