package com.beautyhealth.moderation.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AdminInventoryLineRequest(@NotNull Long storeLocationId, @NotNull @Min(0) Integer quantity) {
}
