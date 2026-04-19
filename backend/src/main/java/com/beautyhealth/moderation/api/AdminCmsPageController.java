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

import com.beautyhealth.moderation.api.dto.AdminCmsPageDetailResponse;
import com.beautyhealth.moderation.api.dto.AdminCmsPageRequest;
import com.beautyhealth.moderation.api.dto.AdminCmsPageResponse;
import com.beautyhealth.moderation.service.ModerationContentWriteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/admin/cms-pages", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "moderation")
@SecurityRequirement(name = "bearer-jwt")
public class AdminCmsPageController {

    private final ModerationContentWriteService moderationContentWriteService;

    public AdminCmsPageController(ModerationContentWriteService moderationContentWriteService) {
        this.moderationContentWriteService = moderationContentWriteService;
    }

    @GetMapping
    @Operation(summary = "Lista CMS stranica")
    public List<AdminCmsPageResponse> list() {
        return moderationContentWriteService.listCmsPages();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalj CMS stranice (uključuje markdown telo)")
    public AdminCmsPageDetailResponse get(@PathVariable long id) {
        return moderationContentWriteService.getCmsPage(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Kreiranje CMS stranice")
    public AdminCmsPageResponse create(@RequestBody @Valid AdminCmsPageRequest request) {
        return moderationContentWriteService.createCmsPage(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Izmena CMS stranice")
    public AdminCmsPageResponse update(@PathVariable long id, @RequestBody @Valid AdminCmsPageRequest request) {
        return moderationContentWriteService.updateCmsPage(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Brisanje CMS stranice")
    public void delete(@PathVariable long id) {
        moderationContentWriteService.deleteCmsPage(id);
    }
}
