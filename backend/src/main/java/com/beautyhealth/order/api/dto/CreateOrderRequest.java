package com.beautyhealth.order.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Minimalni checkout (sekcija 7.3 TBD — proširenje polja kasnije). Adresa je snapshot na narudžbini.
 */
@Schema(description = "Minimalni podaci za kreiranje narudžbine iz korpe (MVP, pouzeće stub).")
public record CreateOrderRequest(
        @NotBlank @Size(max = 255) @Schema(example = "Ana Anić") String recipientName,
        @NotBlank @Size(max = 64) @Schema(example = "+38160111222") String recipientPhone,
        @NotBlank @Size(max = 255) @Schema(example = "Bulevar oslobođenja 1") String addressLine1,
        @Size(max = 255) @Schema(example = "Stan 4") String addressLine2,
        @NotBlank @Size(max = 128) @Schema(example = "Beograd") String city,
        @NotBlank @Size(max = 32) @Schema(example = "11000") String postalCode,
        @NotBlank @Size(min = 2, max = 2) @Schema(description = "ISO 3166-1 alpha-2", example = "RS") String countryCode) {
}
