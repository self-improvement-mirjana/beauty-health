package com.beautyhealth.moderation.api.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record AdminVariantInventoryBody(@NotNull @Valid List<AdminInventoryLineRequest> lines) {
}
