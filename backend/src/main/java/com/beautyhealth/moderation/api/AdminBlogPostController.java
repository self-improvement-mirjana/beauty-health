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

import com.beautyhealth.moderation.api.dto.AdminBlogPostDetailResponse;
import com.beautyhealth.moderation.api.dto.AdminBlogPostRequest;
import com.beautyhealth.moderation.api.dto.AdminBlogPostResponse;
import com.beautyhealth.moderation.service.ModerationContentWriteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/admin/blog-posts", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "moderation")
@SecurityRequirement(name = "bearer-jwt")
public class AdminBlogPostController {

    private final ModerationContentWriteService moderationContentWriteService;

    public AdminBlogPostController(ModerationContentWriteService moderationContentWriteService) {
        this.moderationContentWriteService = moderationContentWriteService;
    }

    @GetMapping
    @Operation(summary = "Lista blog članaka")
    public List<AdminBlogPostResponse> list() {
        return moderationContentWriteService.listBlogPosts();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalj blog članka (uključuje markdown telo i izvod)")
    public AdminBlogPostDetailResponse get(@PathVariable long id) {
        return moderationContentWriteService.getBlogPost(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Kreiranje blog članka")
    public AdminBlogPostResponse create(@RequestBody @Valid AdminBlogPostRequest request) {
        return moderationContentWriteService.createBlogPost(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Izmena blog članka")
    public AdminBlogPostResponse update(@PathVariable long id, @RequestBody @Valid AdminBlogPostRequest request) {
        return moderationContentWriteService.updateBlogPost(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Brisanje blog članka")
    public void delete(@PathVariable long id) {
        moderationContentWriteService.deleteBlogPost(id);
    }
}
