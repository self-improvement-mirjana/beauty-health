package com.beautyhealth.content.read;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.beautyhealth.content.api.dto.BlogPostDetailResponse;
import com.beautyhealth.content.api.dto.BlogPostSummaryResponse;
import com.beautyhealth.content.api.dto.CmsPageResponse;
import com.beautyhealth.content.api.dto.RetailLocationResponse;
import com.beautyhealth.content.domain.BlogPost;
import com.beautyhealth.content.domain.CmsPage;
import com.beautyhealth.content.repo.BlogPostRepository;
import com.beautyhealth.content.repo.CmsPageRepository;
import com.beautyhealth.content.repo.RetailLocationRepository;

@Service
@Transactional(readOnly = true)
public class ContentReadService {

    private final CmsPageRepository cmsPageRepository;
    private final RetailLocationRepository retailLocationRepository;
    private final BlogPostRepository blogPostRepository;

    public ContentReadService(CmsPageRepository cmsPageRepository, RetailLocationRepository retailLocationRepository,
            BlogPostRepository blogPostRepository) {
        this.cmsPageRepository = cmsPageRepository;
        this.retailLocationRepository = retailLocationRepository;
        this.blogPostRepository = blogPostRepository;
    }

    public CmsPageResponse getPublishedPage(String slug) {
        CmsPage page = cmsPageRepository.findBySlugAndPublishedIsTrue(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Page not found"));
        return new CmsPageResponse(page.getSlug(), page.getTitle(), page.getBodyMarkdown());
    }

    public List<RetailLocationResponse> listRetailLocations() {
        return retailLocationRepository.findByActiveTrueOrderBySortOrderAscIdAsc().stream()
                .map(l -> new RetailLocationResponse(l.getName(), l.getAddress(), l.getPhone(), l.getHoursText()))
                .toList();
    }

    public Page<BlogPostSummaryResponse> listPublishedBlog(Pageable pageable) {
        Pageable sorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "publishedAt"));
        return blogPostRepository.findByPublishedTrueAndPublishedAtIsNotNull(sorted).map(this::toSummary);
    }

    public BlogPostDetailResponse getPublishedBlogPost(String slug) {
        BlogPost post = blogPostRepository.findBySlugAndPublishedIsTrue(slug)
                .filter(p -> p.getPublishedAt() != null)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog post not found"));
        return new BlogPostDetailResponse(post.getSlug(), post.getTitle(), post.getExcerpt(), post.getBodyMarkdown(),
                post.getPublishedAt());
    }

    private BlogPostSummaryResponse toSummary(BlogPost post) {
        return new BlogPostSummaryResponse(post.getSlug(), post.getTitle(), post.getExcerpt(), post.getPublishedAt());
    }
}
