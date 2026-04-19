package com.beautyhealth.content.api.dto;

import java.time.Instant;

public record BlogPostSummaryResponse(String slug, String title, String excerpt, Instant publishedAt) {
}
