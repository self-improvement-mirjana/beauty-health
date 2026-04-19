package com.beautyhealth.order.api.dto;

import java.time.Instant;

import com.beautyhealth.common.money.MoneyResponse;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Stavka liste narudžbina za moderatora.")
public record AdminOrderSummaryResponse(long id, String status, Instant createdAt, long customerUserId, String customerEmail,
        MoneyResponse total) {
}
