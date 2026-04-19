package com.beautyhealth.content.api;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.content.api.dto.CmsPageResponse;
import com.beautyhealth.content.read.ContentReadService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping(value = "/api/v1/pages", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicCmsPageController {

    private final ContentReadService contentReadService;

    public PublicCmsPageController(ContentReadService contentReadService) {
        this.contentReadService = contentReadService;
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Javna informativna stranica (markdown telo)")
    public CmsPageResponse getPage(@PathVariable String slug) {
        return contentReadService.getPublishedPage(slug);
    }
}
