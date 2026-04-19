package com.beautyhealth.moderation.api;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.moderation.api.dto.AdminProductReviewResponse;
import com.beautyhealth.moderation.api.dto.AdminReviewApprovalPatchRequest;
import com.beautyhealth.moderation.service.ModerationReviewService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/admin/reviews", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "moderation")
@SecurityRequirement(name = "bearer-jwt")
public class AdminReviewController {

    private final ModerationReviewService moderationReviewService;

    public AdminReviewController(ModerationReviewService moderationReviewService) {
        this.moderationReviewService = moderationReviewService;
    }

    @GetMapping
    @Operation(summary = "Lista recenzija (filter slug proizvoda, filter odobreno; paginacija)")
    public Page<AdminProductReviewResponse> list(@RequestParam(required = false) String slug,
            @RequestParam(required = false) Boolean approved,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return moderationReviewService.listReviews(slug, approved, pageable);
    }

    @PatchMapping("/{id}/approval")
    @Operation(summary = "Odobri ili sakrij recenziju (utiče na javni GET liste za PDP)")
    public AdminProductReviewResponse patchApproval(@PathVariable long id, @RequestBody @Valid AdminReviewApprovalPatchRequest request) {
        return moderationReviewService.updateApproval(id, request.approved());
    }
}
