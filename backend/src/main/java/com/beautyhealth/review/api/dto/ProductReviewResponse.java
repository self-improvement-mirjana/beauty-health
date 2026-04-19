package com.beautyhealth.review.api.dto;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import io.swagger.v3.oas.annotations.media.Schema;

/** Javni odgovor — bez email adrese (B08). */
@JsonPropertyOrder({ "id", "authorName", "rating", "body", "createdAt" })
@Schema(description = "Recenzija za PDP (bez email polja).")
public record ProductReviewResponse(
        long id,
        String authorName,
        int rating,
        String body,
        Instant createdAt) {
}
