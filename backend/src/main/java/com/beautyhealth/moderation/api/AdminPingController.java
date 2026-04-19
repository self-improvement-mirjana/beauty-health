package com.beautyhealth.moderation.api;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping(value = "/api/v1/admin", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "moderation")
@SecurityRequirement(name = "bearer-jwt")
public class AdminPingController {

    @GetMapping("/ping")
    @Operation(summary = "Zaštićena moderatorska provera (ROLE_MODERATOR)")
    public Map<String, Object> ping() {
        return Map.of("slice", "admin", "ok", true);
    }
}
