package com.beautyhealth.cart.api.dto;

import jakarta.validation.constraints.NotBlank;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Spajanje gost korpe u nalog korisnika (poziva se nakon prijave).")
public record MergeCartRequest(
        @NotBlank @Schema(description = "Token gost korpe (isti kao X-Guest-Cart-Token)", example = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11") String guestCartToken) {
}
