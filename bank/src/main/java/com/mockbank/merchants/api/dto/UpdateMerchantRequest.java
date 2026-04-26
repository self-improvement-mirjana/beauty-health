package com.mockbank.merchants.api.dto;

public record UpdateMerchantRequest(
    String name,
    String slug,
    String returnUrlSuccess,
    String returnUrlFailure,
    String webhookUrl,
    String signingMode,
    String status
) {}
