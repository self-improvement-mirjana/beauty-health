package com.beautyhealth.moderation.api;

import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.beautyhealth.moderation.api.dto.AdminOrderStatusPatchRequest;
import com.beautyhealth.moderation.service.ModerationOrderService;
import com.beautyhealth.order.api.dto.AdminOrderDetailResponse;
import com.beautyhealth.order.api.dto.AdminOrderSummaryResponse;
import com.beautyhealth.order.domain.OrderStatus;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/admin/orders", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "moderation")
@SecurityRequirement(name = "bearer-jwt")
public class AdminOrderController {

    private final ModerationOrderService moderationOrderService;

    public AdminOrderController(ModerationOrderService moderationOrderService) {
        this.moderationOrderService = moderationOrderService;
    }

    @GetMapping
    @Operation(summary = "Lista narudžbina (filter status, opseg datuma created_at; paginacija)")
    public Page<AdminOrderSummaryResponse> listOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @PageableDefault(size = 20, sort = { "createdAt", "id" }, direction = Sort.Direction.DESC) Pageable pageable) {
        OrderStatus statusFilter = null;
        if (status != null && !status.isBlank()) {
            try {
                statusFilter = OrderStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown order status: " + status);
            }
        }
        return moderationOrderService.listOrders(statusFilter, from, to, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalj narudžbine sa stavkama, adresom i identitetom kupca")
    public AdminOrderDetailResponse getOrder(@PathVariable long id) {
        return moderationOrderService.getOrder(id);
    }

    @PatchMapping("/{id}/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Izmena statusa narudžbine (dozvoljeni prelazi: NEW→CONFIRMED→SHIPPED→COMPLETED; CANCELLED iz NEW ili CONFIRMED)")
    public void patchStatus(@PathVariable long id, @RequestBody @Valid AdminOrderStatusPatchRequest request) {
        OrderStatus next;
        try {
            next = OrderStatus.valueOf(request.status().trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown order status: " + request.status());
        }
        moderationOrderService.updateOrderStatus(id, next);
    }
}
