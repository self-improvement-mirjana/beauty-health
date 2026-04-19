package com.beautyhealth.review.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.beautyhealth.auth.domain.AppUser;
import com.beautyhealth.catalog.domain.Product;
import com.beautyhealth.catalog.repo.ProductRepository;
import com.beautyhealth.review.api.dto.CreateReviewRequest;
import com.beautyhealth.review.api.dto.ProductReviewResponse;
import com.beautyhealth.review.domain.ProductReview;
import com.beautyhealth.review.repo.ProductReviewRepository;

@Service
public class ProductReviewService {

    private final ProductRepository productRepository;
    private final ProductReviewRepository productReviewRepository;

    public ProductReviewService(ProductRepository productRepository, ProductReviewRepository productReviewRepository) {
        this.productRepository = productRepository;
        this.productReviewRepository = productReviewRepository;
    }

    @Transactional(readOnly = true)
    public Page<ProductReviewResponse> listApprovedForProductSlug(String slug, Pageable pageable) {
        productRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return productReviewRepository
                .findByProduct_SlugAndProduct_ActiveTrueAndApprovedTrueOrderByCreatedAtDesc(slug, pageable)
                .map(ProductReviewService::toResponse);
    }

    @Transactional
    public ProductReviewResponse createReview(String slug, CreateReviewRequest request, AppUser authenticatedUser) {
        Product product = productRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        boolean publicEmail = request.publicEmail() != null && request.publicEmail();
        ProductReview entity = new ProductReview(product, authenticatedUser, request.rating().shortValue(), request.body().trim(),
                request.authorName().trim(), request.authorEmail().trim().toLowerCase(), publicEmail);
        entity.setApproved(false);
        productReviewRepository.save(entity);
        return toResponse(entity);
    }

    private static ProductReviewResponse toResponse(ProductReview r) {
        return new ProductReviewResponse(r.getId(), r.getAuthorName(), r.getRating(), r.getBody(), r.getCreatedAt());
    }
}
