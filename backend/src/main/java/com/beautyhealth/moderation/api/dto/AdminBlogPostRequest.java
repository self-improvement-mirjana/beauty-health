package com.beautyhealth.moderation.api.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminBlogPostRequest(
        @NotBlank @Size(max = 255) @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*", message = "slug must be URL-safe lowercase") String slug,
        @NotBlank @Size(max = 255) String title,
        @Size(max = 500) String excerpt,
        @NotBlank String bodyMarkdown,
        boolean published,
        Instant publishedAt) {
}
