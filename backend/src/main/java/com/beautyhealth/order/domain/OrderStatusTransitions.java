package com.beautyhealth.order.domain;

/**
 * Minimal workflow for moderator status updates (B11).
 */
public final class OrderStatusTransitions {

    private OrderStatusTransitions() {
    }

    /**
     * {@code true} if transition is allowed or if {@code from == to} (idempotent no-op).
     */
    public static boolean isTransitionAllowed(OrderStatus from, OrderStatus to) {
        if (from == to) {
            return true;
        }
        if (from == OrderStatus.CANCELLED || from == OrderStatus.COMPLETED) {
            return false;
        }
        if (to == OrderStatus.CANCELLED) {
            return from == OrderStatus.NEW || from == OrderStatus.CONFIRMED;
        }
        return switch (from) {
            case NEW -> to == OrderStatus.CONFIRMED;
            case CONFIRMED -> to == OrderStatus.SHIPPED;
            case SHIPPED -> to == OrderStatus.COMPLETED;
            default -> false;
        };
    }
}
