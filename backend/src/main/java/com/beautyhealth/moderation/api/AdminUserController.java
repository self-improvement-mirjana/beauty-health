package com.beautyhealth.moderation.api;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.moderation.api.dto.AdminUserResponse;
import com.beautyhealth.moderation.service.ModerationUserSupportService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping(value = "/api/v1/admin/users", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "moderation")
@SecurityRequirement(name = "bearer-jwt")
public class AdminUserController {

    private final ModerationUserSupportService moderationUserSupportService;

    public AdminUserController(ModerationUserSupportService moderationUserSupportService) {
        this.moderationUserSupportService = moderationUserSupportService;
    }

    @GetMapping(params = "email")
    @Operation(summary = "Pronađi korisnika po email adresi (interna podrška)")
    public AdminUserResponse getByEmail(@RequestParam String email) {
        return moderationUserSupportService.getUserByEmail(email);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Pronađi korisnika po ID (interna podrška)")
    public AdminUserResponse getById(@PathVariable long id) {
        return moderationUserSupportService.getUserById(id);
    }
}
