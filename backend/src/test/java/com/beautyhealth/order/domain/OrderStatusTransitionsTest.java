package com.beautyhealth.order.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class OrderStatusTransitionsTest {

    @Test
    void happyPathChain() {
        assertThat(OrderStatusTransitions.isTransitionAllowed(OrderStatus.NEW, OrderStatus.CONFIRMED)).isTrue();
        assertThat(OrderStatusTransitions.isTransitionAllowed(OrderStatus.CONFIRMED, OrderStatus.SHIPPED)).isTrue();
        assertThat(OrderStatusTransitions.isTransitionAllowed(OrderStatus.SHIPPED, OrderStatus.COMPLETED)).isTrue();
    }

    @Test
    void cancelFromNewOrConfirmedOnly() {
        assertThat(OrderStatusTransitions.isTransitionAllowed(OrderStatus.NEW, OrderStatus.CANCELLED)).isTrue();
        assertThat(OrderStatusTransitions.isTransitionAllowed(OrderStatus.CONFIRMED, OrderStatus.CANCELLED)).isTrue();
        assertThat(OrderStatusTransitions.isTransitionAllowed(OrderStatus.SHIPPED, OrderStatus.CANCELLED)).isFalse();
    }

    @Test
    void invalidSkips() {
        assertThat(OrderStatusTransitions.isTransitionAllowed(OrderStatus.NEW, OrderStatus.SHIPPED)).isFalse();
        assertThat(OrderStatusTransitions.isTransitionAllowed(OrderStatus.NEW, OrderStatus.COMPLETED)).isFalse();
        assertThat(OrderStatusTransitions.isTransitionAllowed(OrderStatus.COMPLETED, OrderStatus.CONFIRMED)).isFalse();
        assertThat(OrderStatusTransitions.isTransitionAllowed(OrderStatus.CANCELLED, OrderStatus.NEW)).isFalse();
    }

    @Test
    void sameStatusAllowed() {
        assertThat(OrderStatusTransitions.isTransitionAllowed(OrderStatus.NEW, OrderStatus.NEW)).isTrue();
    }
}
