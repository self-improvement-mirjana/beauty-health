package com.beautyhealth.moderation.api.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminUpdateProductRequest(
        @NotNull Long brandId,
        @NotBlank @Size(max = 500) String name,
        @NotBlank @Size(max = 255) @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*", message = "slug must be URL-safe lowercase") String slug,
        @Size(max = 4000) String description,
        @Size(max = 500) String shortDescription,
        boolean featured,
        boolean active,
        List<Long> categoryIds) {
}
