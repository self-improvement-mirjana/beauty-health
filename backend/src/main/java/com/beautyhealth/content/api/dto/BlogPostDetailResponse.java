package com.beautyhealth.content.api.dto;

import java.time.Instant;

public record BlogPostDetailResponse(String slug, String title, String excerpt, String bodyMarkdown,
        Instant publishedAt) {
}
