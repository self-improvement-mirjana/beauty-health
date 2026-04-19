package com.beautyhealth.moderation.api.dto;

public record AdminCmsPageDetailResponse(long id, String slug, String title, boolean published, String bodyMarkdown) {
}
