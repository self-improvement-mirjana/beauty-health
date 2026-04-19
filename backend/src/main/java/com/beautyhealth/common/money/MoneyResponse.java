package com.beautyhealth.common.money;

import java.math.BigDecimal;
import java.math.RoundingMode;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Canonical money shape in JSON API responses: decimal amount as string plus ISO currency code.
 */
@Schema(description = "Monetary value: amount encoded as decimal string; currency is ISO 4217 code (v1 uses RSD only).")
public record MoneyResponse(
        @Schema(description = "Amount with exactly two fractional digits (plain string, no grouping).", example = "3600.00")
        String amount,
        @Schema(description = "ISO 4217 currency code.", example = "RSD", allowableValues = { "RSD" })
        String currency) {

    public static MoneyResponse rsd(BigDecimal value) {
        BigDecimal scaled = value.setScale(2, RoundingMode.HALF_UP);
        return new MoneyResponse(scaled.toPlainString(), "RSD");
    }
}
