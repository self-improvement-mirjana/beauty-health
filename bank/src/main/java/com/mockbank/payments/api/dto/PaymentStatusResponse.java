package com.mockbank.payments.api.dto;

import java.time.Instant;
import com.mockbank.common.money.MoneyResponse;

public record PaymentStatusResponse(
    String paymentRef,
    String externalOrderId,
    String status,
    MoneyResponse amount,
    Instant createdAt,
    Instant updatedAt
) {}
