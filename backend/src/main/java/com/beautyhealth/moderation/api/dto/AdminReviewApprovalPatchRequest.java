package com.beautyhealth.moderation.api.dto;

import jakarta.validation.constraints.NotNull;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminReviewApprovalPatchRequest(
        @NotNull @Schema(description = "true = vidljivo na PDP; false = sakriveno", example = "true") Boolean approved) {
}
