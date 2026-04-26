package com.beautyhealth.order.api.dto;

public record PaymentStatusResponse(
    long orderId,
    String orderStatus,
    String paymentProvider,
    String paymentStatus,
    String externalStatus,
    String paymentRef
) {}
