package com.beautyhealth.catalog.api.dto;

import java.util.List;

public record CategoryTreeNodeResponse(Long id, String name, String slug, List<CategoryTreeNodeResponse> children) {
}
