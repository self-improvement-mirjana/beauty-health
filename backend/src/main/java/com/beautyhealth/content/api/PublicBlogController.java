package com.beautyhealth.content.api;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.content.api.dto.BlogPostDetailResponse;
import com.beautyhealth.content.api.dto.BlogPostSummaryResponse;
import com.beautyhealth.content.read.ContentReadService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping(value = "/api/v1/blog", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicBlogController {

    private final ContentReadService contentReadService;

    public PublicBlogController(ContentReadService contentReadService) {
        this.contentReadService = contentReadService;
    }

    @GetMapping
    @Operation(summary = "Lista objavljenih blog članaka (najnoviji prvi)")
    public Page<BlogPostSummaryResponse> listPosts(@PageableDefault(size = 20) Pageable pageable) {
        return contentReadService.listPublishedBlog(pageable);
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Detalj blog članka (markdown telo)")
    public BlogPostDetailResponse getPost(@PathVariable String slug) {
        return contentReadService.getPublishedBlogPost(slug);
    }
}
