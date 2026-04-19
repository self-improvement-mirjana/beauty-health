package com.beautyhealth.moderation.api.dto;

public record AdminCategoryResponse(long id, String name, String slug, Long parentCategoryId, int sortOrder, boolean active,
        String description) {
}
