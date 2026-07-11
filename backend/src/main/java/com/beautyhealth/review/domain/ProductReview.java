package com.beautyhealth.review.domain;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import com.beautyhealth.auth.domain.AppUser;
import com.beautyhealth.catalog.domain.Product;

@Entity
@Table(name = "review")
public class ProductReview { 

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long product_id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @Column(nullable = false)
    private short rating;

    @Column(nullable = false, length = 4000)
    private String body;

    @Column(name = "author_name", nullable = false)
    private String authorName;


    @Column(name = "author_email", nullable = false, length = 255)
    private String authorEmail;

    @Column(name = "is_public_email", nullable = false)
    private boolean publicEmail = false;

    @Column(name = "is_approved", nullable = false)
    private boolean approved = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected ProductReview() {
    }

    public ProductReview(Product product, AppUser user, short rating, String body, String authorName, String authorEmail,
            boolean publicEmail) {
        this.product = product;
        this.user = user;
        this.rating = rating;
        this.body = body;
        this.authorName = authorName;
        this.authorEmail = authorEmail;
        this.publicEmail = publicEmail;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Product getProduct() {
        return product;
    }

    public AppUser getUser() {
        return user;
    }

    public short getRating() {
        return rating;
    }

    public String getBody() {
        return body;
    }

    public String getAuthorName() {
        return authorName;
    }

    public String getAuthorEmail() {
        return authorEmail;
    }

    public boolean isPublicEmail() {
        return publicEmail;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
} // VARCHAR(255)
