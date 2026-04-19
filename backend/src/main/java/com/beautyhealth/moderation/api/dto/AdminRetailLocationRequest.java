package com.beautyhealth.moderation.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminRetailLocationRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 500) String address,
        @NotBlank @Size(max = 64) String phone,
        @NotBlank @Size(max = 500) String hoursText,
        @NotNull @Min(0) Integer sortOrder,
        boolean active) {
}
