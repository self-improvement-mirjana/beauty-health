package com.beautyhealth.cart.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import io.swagger.v3.oas.annotations.media.Schema;

public record PatchCartItemRequest(
        @NotNull @Min(1) @Schema(description = "Nova količina", example = "2") Integer quantity) {
}
