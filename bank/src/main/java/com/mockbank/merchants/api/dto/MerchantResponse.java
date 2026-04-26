package com.mockbank.merchants.api.dto;

import java.time.Instant;
import java.util.List;

import com.mockbank.credentials.api.dto.CredentialResponse;

public record MerchantResponse(
    long id,
    String name,
    String slug,
    String returnUrlSuccess,
    String returnUrlFailure,
    String webhookUrl,
    String signingMode,
    String status,
    Instant createdAt,
    List<CredentialResponse> credentials
) {}
