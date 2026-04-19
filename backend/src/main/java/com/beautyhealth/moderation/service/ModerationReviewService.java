package com.beautyhealth.moderation.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.beautyhealth.moderation.api.dto.AdminProductReviewResponse;
import com.beautyhealth.review.domain.ProductReview;
import com.beautyhealth.review.repo.ProductReviewRepository;

@Service
public class ModerationReviewService {

    private final ProductReviewRepository productReviewRepository;

    public ModerationReviewService(ProductReviewRepository productReviewRepository) {
        this.productReviewRepository = productReviewRepository;
    }

    @Transactional(readOnly = true)
    public Page<AdminProductReviewResponse> listReviews(String slugFilter, Boolean approvedFilter, Pageable pageable) {
        String slug = slugFilter != null && !slugFilter.isBlank() ? slugFilter.trim() : null;
        return productReviewRepository.findForModeration(slug, approvedFilter, pageable).map(ModerationReviewService::toAdmin);
    }

    @Transactional
    public AdminProductReviewResponse updateApproval(long reviewId, boolean approved) {
        ProductReview r = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
        r.setApproved(approved);
        return toAdmin(r);
    }

    private static AdminProductReviewResponse toAdmin(ProductReview r) {
        var p = r.getProduct();
        return new AdminProductReviewResponse(r.getId(), p.getSlug(), p.getName(), r.getAuthorName(), r.getAuthorEmail(), r.isPublicEmail(),
                r.getRating(), r.getBody(), r.isApproved(), r.getCreatedAt());
    }
}
