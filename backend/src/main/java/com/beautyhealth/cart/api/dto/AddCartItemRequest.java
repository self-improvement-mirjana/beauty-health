package com.beautyhealth.cart.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dodavanje stavke u korpu (idempotentno: isti variantId uvećava količinu).")
public record AddCartItemRequest(
        @NotNull @Schema(description = "ID varijante proizvoda", example = "1") Long variantId,
        @NotNull @Min(1) @Schema(description = "Količina", example = "1") Integer quantity) {
}
