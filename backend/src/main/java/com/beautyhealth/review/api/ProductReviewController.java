package com.beautyhealth.review.api;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.auth.domain.AppUser;
import com.beautyhealth.review.api.dto.CreateReviewRequest;
import com.beautyhealth.review.api.dto.ProductReviewResponse;
import com.beautyhealth.review.service.ProductReviewService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Product reviews", description = "Recenzije proizvoda (B08).")
@RestController
@RequestMapping(value = "/api/v1/products", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class ProductReviewController {

    private final ProductReviewService productReviewService;

    public ProductReviewController(ProductReviewService productReviewService) {
        this.productReviewService = productReviewService;
    }

    @Operation(summary = "Lista odobrenih recenzija za PDP (najnovije prve)")
    @GetMapping("/{slug}/reviews")
    public Page<ProductReviewResponse> listReviews(@PathVariable String slug,
            @PageableDefault(size = 20) Pageable pageable) {
        return productReviewService.listApprovedForProductSlug(slug, pageable);
    }

    @Operation(summary = "Dodaj recenziju (gost ili JWT; email se ne vraća na GET)")
    @PostMapping(value = "/{slug}/reviews", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ProductReviewResponse createReview(@PathVariable String slug, @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal Object principal) {
        AppUser user = principal instanceof AppUser u ? u : null;
        return productReviewService.createReview(slug, request, user);
    }
}
