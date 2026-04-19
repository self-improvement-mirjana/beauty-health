package com.beautyhealth.moderation.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.moderation.api.dto.AdminBrandRequest;
import com.beautyhealth.moderation.api.dto.AdminBrandResponse;
import com.beautyhealth.moderation.service.ModerationCatalogWriteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/admin/brands", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "moderation")
@SecurityRequirement(name = "bearer-jwt")
public class AdminBrandController {

    private final ModerationCatalogWriteService moderationCatalogWriteService;

    public AdminBrandController(ModerationCatalogWriteService moderationCatalogWriteService) {
        this.moderationCatalogWriteService = moderationCatalogWriteService;
    }

    @GetMapping
    @Operation(summary = "Lista brendova (moderacija)")
    public List<AdminBrandResponse> listBrands() {
        return moderationCatalogWriteService.listBrands();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Kreiranje brenda")
    public AdminBrandResponse create(@RequestBody @Valid AdminBrandRequest request) {
        return moderationCatalogWriteService.createBrand(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Izmena brenda")
    public AdminBrandResponse update(@PathVariable long id, @RequestBody @Valid AdminBrandRequest request) {
        return moderationCatalogWriteService.updateBrand(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Brisanje brenda (ako nema proizvoda)")
    public void delete(@PathVariable long id) {
        moderationCatalogWriteService.deleteBrand(id);
    }
}
