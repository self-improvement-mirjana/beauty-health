package com.beautyhealth.moderation.api.dto;

import java.time.Instant;

public record AdminBlogPostDetailResponse(long id, String slug, String title, String excerpt, String bodyMarkdown,
        boolean published, Instant publishedAt) {
}
