package com.beautyhealth.order.domain;

public enum OrderStatus {
    /** Nova narudžbina (checkout). */
    NEW,
    /** Potvrđena / priprema za slanje. */
    CONFIRMED,
    /** Poslata (u tranzitu). */
    SHIPPED,
    /** Završena. */
    COMPLETED,
    /** Otkazana. */
    CANCELLED
}
