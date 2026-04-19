package com.beautyhealth.moderation.api.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminVariantCreateRequest(
        @NotBlank @Size(max = 128) String sku,
        @Size(max = 255) String name,
        @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal regularPrice,
        @DecimalMin(value = "0.0", inclusive = true) BigDecimal salePrice,
        boolean defaultVariant,
        @NotNull @Valid List<AdminInventoryLineRequest> inventory) {
}
