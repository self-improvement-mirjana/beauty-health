package com.beautyhealth.auth.api.dto;

import java.util.List;

public record UserResponse(Long id, String email, String fullName, List<String> roles) {
}
