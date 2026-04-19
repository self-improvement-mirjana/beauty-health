package com.beautyhealth.moderation.api.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminOrderStatusPatchRequest(@NotBlank String status) {
}
