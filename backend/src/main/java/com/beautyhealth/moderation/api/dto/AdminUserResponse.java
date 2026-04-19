package com.beautyhealth.moderation.api.dto;

import java.time.Instant;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Korisnik za internu podršku (bez password hash-a i tokena).")
public record AdminUserResponse(long id, String email, String fullName, List<String> roles, Instant createdAt, long orderCount) {
}
