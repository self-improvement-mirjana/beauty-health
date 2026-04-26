package com.mockbank.hosted.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record PayCardRequest(
    @NotBlank String pan,
    @Positive int expMonth,
    @Positive int expYear,
    @NotBlank String cvv,
    @NotBlank String holderName
) {}
