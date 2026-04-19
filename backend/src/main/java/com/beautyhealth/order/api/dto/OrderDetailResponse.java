package com.beautyhealth.order.api.dto;

import java.time.Instant;
import java.util.List;

import com.beautyhealth.common.money.MoneyResponse;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Detalj narudžbine (vlasnik ili moderator).")
public record OrderDetailResponse(
        long id,
        Instant createdAt,
        String status,
        MoneyResponse total,
        String deliverySummaryText,
        String recipientName,
        String recipientPhone,
        String addressLine1,
        String addressLine2,
        String city,
        String postalCode,
        String countryCode,
        String paymentProvider,
        String paymentStatus,
        List<OrderLineResponse> lines) {
}
