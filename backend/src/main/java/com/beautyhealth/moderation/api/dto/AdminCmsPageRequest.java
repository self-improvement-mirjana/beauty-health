package com.beautyhealth.moderation.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminCmsPageRequest(
        @NotBlank @Size(max = 128) @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*", message = "slug must be URL-safe lowercase") String slug,
        @NotBlank @Size(max = 255) String title,
        @NotBlank String bodyMarkdown,
        boolean published) {
}
