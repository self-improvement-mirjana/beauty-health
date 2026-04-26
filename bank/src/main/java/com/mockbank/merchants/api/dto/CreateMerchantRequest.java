package com.mockbank.merchants.api.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateMerchantRequest(
    @NotBlank String name,
    @NotBlank String slug,
    String returnUrlSuccess,
    String returnUrlFailure,
    String webhookUrl,
    String signingMode
) {}
