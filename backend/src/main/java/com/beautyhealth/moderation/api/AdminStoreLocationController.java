package com.beautyhealth.moderation.api;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.moderation.api.dto.AdminStoreLocationResponse;
import com.beautyhealth.moderation.service.ModerationCatalogWriteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping(value = "/api/v1/admin/store-locations", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "moderation")
@SecurityRequirement(name = "bearer-jwt")
public class AdminStoreLocationController {

    private final ModerationCatalogWriteService moderationCatalogWriteService;

    public AdminStoreLocationController(ModerationCatalogWriteService moderationCatalogWriteService) {
        this.moderationCatalogWriteService = moderationCatalogWriteService;
    }

    @GetMapping
    @Operation(summary = "Lista magacina (store_location) za unos zaliha")
    public List<AdminStoreLocationResponse> list() {
        return moderationCatalogWriteService.listStoreLocations();
    }
}
