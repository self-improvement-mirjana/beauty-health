package com.beautyhealth.moderation.api.dto;

import java.time.Instant;

public record AdminBlogPostResponse(long id, String slug, String title, boolean published, Instant publishedAt) {
}
