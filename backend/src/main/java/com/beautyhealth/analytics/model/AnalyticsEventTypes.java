package com.beautyhealth.analytics.model;

public final class AnalyticsEventTypes {

    public static final String CART_ITEM_ADDED = "cart_item_added";
    public static final String CART_ITEM_UPDATED = "cart_item_updated";
    public static final String CART_ITEM_REMOVED = "cart_item_removed";
    public static final String CHECKOUT_STARTED = "checkout_started";
    public static final String ORDER_CREATED = "order_created";
    public static final String PAYMENT_AUTHORIZED = "payment_authorized";
    public static final String PAYMENT_FAILED = "payment_failed";
    public static final String PAYMENT_EXPIRED = "payment_expired";

    public static final String PAGE_VIEW = "page_view";
    public static final String PRODUCT_VIEW = "product_view";
    public static final String ADD_TO_CART_CLICK = "add_to_cart_click";
    public static final String CHECKOUT_OPEN = "checkout_open";

    private AnalyticsEventTypes() {
    }
}
