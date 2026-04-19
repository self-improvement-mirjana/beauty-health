package com.beautyhealth.order.domain;

/** Stub za plaćanje (npr. pouzeće = PENDING dok nema gateway integracije). */
public enum PaymentRecordStatus {
    PENDING,
    COMPLETED,
    FAILED
}
