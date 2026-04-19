package com.beautyhealth.review.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Nova recenzija (email se čuva interno i ne vraća se na javnom GET-u).")
public record CreateReviewRequest(
        @NotBlank @Size(max = 120) @Schema(example = "Marija") String authorName,
        @NotBlank @Email @Size(max = 255) @Schema(example = "marija@example.com") String authorEmail,
        @NotNull @Min(1) @Max(5) @Schema(description = "Ocena 1–5", example = "5") Integer rating,
        @NotBlank @Size(max = 4000) @Schema(example = "Odličan proizvod.") String body,
        @Schema(description = "Saglasnost da se email sme objaviti (javni GET i dalje ne vraća email u v1).", example = "false")
        Boolean publicEmail) {
}
