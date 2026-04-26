package com.mockbank.payments.api.dto;

import java.time.Instant;

public record CreatePaymentResponse(
    String paymentRef,
    String redirectUrl,
    Instant expiresAt
) {}
