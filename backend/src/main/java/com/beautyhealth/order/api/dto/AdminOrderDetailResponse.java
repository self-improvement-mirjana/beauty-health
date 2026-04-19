package com.beautyhealth.order.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Detalj narudžbine za moderatora (PII: email kupca; bez password hash-a).")
public record AdminOrderDetailResponse(long customerUserId, String customerEmail, OrderDetailResponse order) {
}
