package com.mockbank.payments.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record CreatePaymentRequest(
    @NotBlank String externalOrderId,
    @Positive BigDecimal amount,
    String currency,
    String returnUrlSuccess,
    String returnUrlFailure,
    Integer expiresInSec
) {}
