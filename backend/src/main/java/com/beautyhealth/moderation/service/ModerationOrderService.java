package com.beautyhealth.moderation.service;

import java.time.Instant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.beautyhealth.common.error.ConflictException;
import com.beautyhealth.common.money.MoneyResponse;
import com.beautyhealth.order.api.dto.AdminOrderDetailResponse;
import com.beautyhealth.order.api.dto.AdminOrderSummaryResponse;
import com.beautyhealth.order.domain.OrderStatus;
import com.beautyhealth.order.domain.OrderStatusTransitions;
import com.beautyhealth.order.domain.ShopOrder;
import com.beautyhealth.order.repo.ShopOrderRepository;
import com.beautyhealth.order.service.OrderService;

@Service
public class ModerationOrderService {

    private final ShopOrderRepository shopOrderRepository;
    private final OrderService orderService;

    public ModerationOrderService(ShopOrderRepository shopOrderRepository, OrderService orderService) {
        this.shopOrderRepository = shopOrderRepository;
        this.orderService = orderService;
    }

    @Transactional(readOnly = true)
    public Page<AdminOrderSummaryResponse> listOrders(OrderStatus status, Instant from, Instant to, Pageable pageable) {
        return shopOrderRepository.findAdminFiltered(status, from, to, pageable).map(this::toSummary);
    }

    @Transactional(readOnly = true)
    public AdminOrderDetailResponse getOrder(long orderId) {
        return orderService.getOrderForAdmin(orderId);
    }

    @Transactional
    public void updateOrderStatus(long orderId, OrderStatus newStatus) {
        ShopOrder order = shopOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (order.getStatus() == newStatus) {
            return;
        }
        if (!OrderStatusTransitions.isTransitionAllowed(order.getStatus(), newStatus)) {
            throw new ConflictException("Invalid status transition from " + order.getStatus() + " to " + newStatus);
        }
        order.setStatus(newStatus);
    }

    private AdminOrderSummaryResponse toSummary(ShopOrder o) {
        return new AdminOrderSummaryResponse(o.getId(), o.getStatus().name(), o.getCreatedAt(), o.getUser().getId(),
                o.getUser().getEmail(), MoneyResponse.rsd(o.getTotalAmount()));
    }
}
