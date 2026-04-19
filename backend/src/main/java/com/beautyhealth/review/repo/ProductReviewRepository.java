package com.beautyhealth.review.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.beautyhealth.review.domain.ProductReview;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    long countByProduct_IdAndApprovedTrue(long productId);

    @Query("select avg(r.rating) from ProductReview r where r.product.id = :productId and r.approved = true")
    Double averageRatingApprovedByProductId(@Param("productId") long productId);

    Page<ProductReview> findByProduct_SlugAndProduct_ActiveTrueAndApprovedTrueOrderByCreatedAtDesc(String slug, Pageable pageable);

    @Query("""
            select r from ProductReview r
            join r.product p
            where (:slug is null or p.slug = :slug)
            and (:approved is null or r.approved = :approved)
            """)
    Page<ProductReview> findForModeration(@Param("slug") String slug, @Param("approved") Boolean approved, Pageable pageable);
}
