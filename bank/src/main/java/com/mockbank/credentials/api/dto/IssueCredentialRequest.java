package com.mockbank.credentials.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record IssueCredentialRequest(
    @NotBlank String type,
    @Min(1) int validityDays
) {}
