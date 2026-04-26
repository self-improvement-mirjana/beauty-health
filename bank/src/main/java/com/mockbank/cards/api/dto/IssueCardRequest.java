package com.mockbank.cards.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record IssueCardRequest(
    @NotBlank String holderName,
    @Min(0) double initialBalance,
    @Min(1) int expMonths
) {}
