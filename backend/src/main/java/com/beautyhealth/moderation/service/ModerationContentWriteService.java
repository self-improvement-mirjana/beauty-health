package com.beautyhealth.moderation.service;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.beautyhealth.common.error.ConflictException;
import com.beautyhealth.content.domain.BlogPost;
import com.beautyhealth.content.domain.CmsPage;
import com.beautyhealth.content.domain.RetailLocation;
import com.beautyhealth.content.repo.BlogPostRepository;
import com.beautyhealth.content.repo.CmsPageRepository;
import com.beautyhealth.content.repo.RetailLocationRepository;
import com.beautyhealth.moderation.api.dto.AdminBlogPostDetailResponse;
import com.beautyhealth.moderation.api.dto.AdminBlogPostRequest;
import com.beautyhealth.moderation.api.dto.AdminBlogPostResponse;
import com.beautyhealth.moderation.api.dto.AdminCmsPageDetailResponse;
import com.beautyhealth.moderation.api.dto.AdminCmsPageRequest;
import com.beautyhealth.moderation.api.dto.AdminCmsPageResponse;
import com.beautyhealth.moderation.api.dto.AdminRetailLocationRequest;
import com.beautyhealth.moderation.api.dto.AdminRetailLocationResponse;

@Service
@Transactional
public class ModerationContentWriteService {

    private final CmsPageRepository cmsPageRepository;
    private final RetailLocationRepository retailLocationRepository;
    private final BlogPostRepository blogPostRepository;

    public ModerationContentWriteService(CmsPageRepository cmsPageRepository,
            RetailLocationRepository retailLocationRepository, BlogPostRepository blogPostRepository) {
        this.cmsPageRepository = cmsPageRepository;
        this.retailLocationRepository = retailLocationRepository;
        this.blogPostRepository = blogPostRepository;
    }

    public List<AdminCmsPageResponse> listCmsPages() {
        return cmsPageRepository.findAll().stream()
                .map(p -> new AdminCmsPageResponse(p.getId(), p.getSlug(), p.getTitle(), p.isPublished()))
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminCmsPageDetailResponse getCmsPage(long id) {
        CmsPage p = cmsPageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CMS page not found"));
        return new AdminCmsPageDetailResponse(p.getId(), p.getSlug(), p.getTitle(), p.isPublished(), p.getBodyMarkdown());
    }

    public AdminCmsPageResponse createCmsPage(AdminCmsPageRequest request) {
        if (cmsPageRepository.existsBySlug(request.slug().trim())) {
            throw new ConflictException("CMS page slug already exists");
        }
        CmsPage p = new CmsPage();
        applyCms(p, request);
        cmsPageRepository.save(p);
        return new AdminCmsPageResponse(p.getId(), p.getSlug(), p.getTitle(), p.isPublished());
    }

    public AdminCmsPageResponse updateCmsPage(long id, AdminCmsPageRequest request) {
        CmsPage p = cmsPageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CMS page not found"));
        if (cmsPageRepository.existsBySlugAndIdNot(request.slug().trim(), id)) {
            throw new ConflictException("CMS page slug already exists");
        }
        applyCms(p, request);
        return new AdminCmsPageResponse(p.getId(), p.getSlug(), p.getTitle(), p.isPublished());
    }

    public void deleteCmsPage(long id) {
        CmsPage p = cmsPageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "CMS page not found"));
        cmsPageRepository.delete(p);
    }

    public List<AdminRetailLocationResponse> listRetailLocations() {
        return retailLocationRepository.findAllByOrderBySortOrderAscIdAsc().stream()
                .map(l -> new AdminRetailLocationResponse(l.getId(), l.getName(), l.getAddress(), l.getPhone(),
                        l.getHoursText(), l.getSortOrder(), l.isActive()))
                .toList();
    }

    public AdminRetailLocationResponse createRetailLocation(AdminRetailLocationRequest request) {
        RetailLocation l = new RetailLocation();
        applyRetail(l, request);
        retailLocationRepository.save(l);
        return toRetailResponse(l);
    }

    public AdminRetailLocationResponse updateRetailLocation(long id, AdminRetailLocationRequest request) {
        RetailLocation l = retailLocationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Retail location not found"));
        applyRetail(l, request);
        return toRetailResponse(l);
    }

    public void deleteRetailLocation(long id) {
        RetailLocation l = retailLocationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Retail location not found"));
        retailLocationRepository.delete(l);
    }

    public List<AdminBlogPostResponse> listBlogPosts() {
        return blogPostRepository.findAll().stream()
                .map(b -> new AdminBlogPostResponse(b.getId(), b.getSlug(), b.getTitle(), b.isPublished(), b.getPublishedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminBlogPostDetailResponse getBlogPost(long id) {
        BlogPost b = blogPostRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog post not found"));
        return new AdminBlogPostDetailResponse(b.getId(), b.getSlug(), b.getTitle(), b.getExcerpt(), b.getBodyMarkdown(),
                b.isPublished(), b.getPublishedAt());
    }

    public AdminBlogPostResponse createBlogPost(AdminBlogPostRequest request) {
        if (blogPostRepository.existsBySlug(request.slug().trim())) {
            throw new ConflictException("Blog slug already exists");
        }
        BlogPost b = new BlogPost();
        applyBlog(b, request);
        blogPostRepository.save(b);
        return toBlogResponse(b);
    }

    public AdminBlogPostResponse updateBlogPost(long id, AdminBlogPostRequest request) {
        BlogPost b = blogPostRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog post not found"));
        if (blogPostRepository.existsBySlugAndIdNot(request.slug().trim(), id)) {
            throw new ConflictException("Blog slug already exists");
        }
        applyBlog(b, request);
        return toBlogResponse(b);
    }

    public void deleteBlogPost(long id) {
        BlogPost b = blogPostRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog post not found"));
        blogPostRepository.delete(b);
    }

    private static void applyCms(CmsPage p, AdminCmsPageRequest request) {
        p.setSlug(request.slug().trim());
        p.setTitle(request.title().trim());
        p.setBodyMarkdown(request.bodyMarkdown());
        p.setPublished(request.published());
    }

    private static void applyRetail(RetailLocation l, AdminRetailLocationRequest request) {
        l.setName(request.name().trim());
        l.setAddress(request.address().trim());
        l.setPhone(request.phone().trim());
        l.setHoursText(request.hoursText().trim());
        l.setSortOrder(request.sortOrder());
        l.setActive(request.active());
    }

    private static AdminRetailLocationResponse toRetailResponse(RetailLocation l) {
        return new AdminRetailLocationResponse(l.getId(), l.getName(), l.getAddress(), l.getPhone(), l.getHoursText(),
                l.getSortOrder(), l.isActive());
    }

    private void applyBlog(BlogPost b, AdminBlogPostRequest request) {
        b.setSlug(request.slug().trim());
        b.setTitle(request.title().trim());
        b.setExcerpt(request.excerpt());
        b.setBodyMarkdown(request.bodyMarkdown());
        b.setPublished(request.published());
        if (request.published()) {
            b.setPublishedAt(request.publishedAt() != null ? request.publishedAt() : Instant.now());
        } else {
            b.setPublishedAt(null);
        }
    }

    private static AdminBlogPostResponse toBlogResponse(BlogPost b) {
        return new AdminBlogPostResponse(b.getId(), b.getSlug(), b.getTitle(), b.isPublished(), b.getPublishedAt());
    }
}
