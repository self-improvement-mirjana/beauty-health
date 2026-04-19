package com.beautyhealth.catalog.api.dto;

import java.util.List;

public record ProductOptionResponse(String name, List<ProductOptionValueResponse> values) {
}
