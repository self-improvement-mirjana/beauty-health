package com.beautyhealth.order.api.dto;

import java.time.Instant;

import com.beautyhealth.common.money.MoneyResponse;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Stavka liste narudžbina korisnika (pregled bez adrese).")
public record UserOrderSummaryResponse(long id, String status, MoneyResponse total, Instant createdAt, int lineCount) {
}
