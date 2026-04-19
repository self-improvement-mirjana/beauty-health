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

import com.beautyhealth.moderation.api.dto.AdminCategoryRequest;
import com.beautyhealth.moderation.api.dto.AdminCategoryResponse;
import com.beautyhealth.moderation.service.ModerationCatalogWriteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/admin/categories", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "moderation")
@SecurityRequirement(name = "bearer-jwt")
public class AdminCategoryController {

    private final ModerationCatalogWriteService moderationCatalogWriteService;

    public AdminCategoryController(ModerationCatalogWriteService moderationCatalogWriteService) {
        this.moderationCatalogWriteService = moderationCatalogWriteService;
    }

    @GetMapping
    @Operation(summary = "Lista kategorija (moderacija)")
    public List<AdminCategoryResponse> list() {
        return moderationCatalogWriteService.listCategories();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Kreiranje kategorije")
    public AdminCategoryResponse create(@RequestBody @Valid AdminCategoryRequest request) {
        return moderationCatalogWriteService.createCategory(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Izmena kategorije")
    public AdminCategoryResponse update(@PathVariable long id, @RequestBody @Valid AdminCategoryRequest request) {
        return moderationCatalogWriteService.updateCategory(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Brisanje kategorije (ako nije vezana za proizvode)")
    public void delete(@PathVariable long id) {
        moderationCatalogWriteService.deleteCategory(id);
    }
}
