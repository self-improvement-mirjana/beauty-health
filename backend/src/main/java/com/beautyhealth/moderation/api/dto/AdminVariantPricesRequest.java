package com.beautyhealth.moderation.api.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record AdminVariantPricesRequest(@NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal regularPrice,
        @DecimalMin(value = "0.0", inclusive = true) BigDecimal salePrice) {
}
