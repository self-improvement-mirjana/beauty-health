package com.beautyhealth.content.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.beautyhealth.content.domain.CmsPage;

public interface CmsPageRepository extends JpaRepository<CmsPage, Long> {

    Optional<CmsPage> findBySlugAndPublishedIsTrue(String slug);

    Optional<CmsPage> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
