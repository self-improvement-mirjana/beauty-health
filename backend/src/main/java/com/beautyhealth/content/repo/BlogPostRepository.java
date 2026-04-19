package com.beautyhealth.content.repo;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.beautyhealth.content.domain.BlogPost;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    Optional<BlogPost> findBySlugAndPublishedIsTrue(String slug);

    Page<BlogPost> findByPublishedTrueAndPublishedAtIsNotNull(Pageable pageable);

    Optional<BlogPost> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
