package com.beautyhealth.moderation.api.dto;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Recenzija za moderaciju (uključuje email autora — PII, interno).")
public record AdminProductReviewResponse(long id, String productSlug, String productTitle, String authorName, String authorEmail,
        boolean publicEmail, short rating, String body, boolean approved, Instant createdAt) {
}
