package com.beautyhealth.analytics.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.beautyhealth.analytics.model.AnalyticsEventEnvelope;
import com.beautyhealth.analytics.model.AnalyticsEventTypes;
import com.beautyhealth.auth.domain.AppUser;
import com.beautyhealth.cart.domain.Cart;

@Component
public class AnalyticsEventFactory {

    private static final String SCHEMA_VERSION = "v1";
    private static final DateTimeFormatter ISO_INSTANT = DateTimeFormatter.ISO_INSTANT;

    public AnalyticsEventEnvelope backendEvent(AppUser user, String guestCartToken, String correlationId,
            String eventType, Map<String, Object> payload) {
        ActorContext actor = resolveActor(user, guestCartToken);
        return new AnalyticsEventEnvelope(UUID.randomUUID().toString(), eventType, ISO_INSTANT.format(Instant.now()),
                "backend", actor.actorType(), actor.actorId(), actor.sessionId(), correlationId, SCHEMA_VERSION, payload);
    }

    public AnalyticsEventEnvelope systemEvent(String correlationId, String eventType, Map<String, Object> payload) {
        return new AnalyticsEventEnvelope(UUID.randomUUID().toString(), eventType, ISO_INSTANT.format(Instant.now()),
                "backend", "system", null, null, correlationId, SCHEMA_VERSION, payload);
    }

    public static String correlationForCart(Cart cart) {
        return cart.getId() != null ? String.valueOf(cart.getId()) : null;
    }

    public static String hashGuestToken(String guestCartToken) {
        if (guestCartToken == null || guestCartToken.isBlank()) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(guestCartToken.trim().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash, 0, 8);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    private static ActorContext resolveActor(AppUser user, String guestCartToken) {
        if (user != null) {
            return new ActorContext("user", String.valueOf(user.getId()), null);
        }
        String sessionHash = hashGuestToken(guestCartToken);
        return new ActorContext("guest", null, sessionHash);
    }

    private record ActorContext(String actorType, String actorId, String sessionId) {
    }

    public static final Set<String> ALLOWED_EVENT_TYPES = Set.of(
            AnalyticsEventTypes.CART_ITEM_ADDED,
            AnalyticsEventTypes.CART_ITEM_UPDATED,
            AnalyticsEventTypes.CART_ITEM_REMOVED,
            AnalyticsEventTypes.CHECKOUT_STARTED,
            AnalyticsEventTypes.ORDER_CREATED,
            AnalyticsEventTypes.PAYMENT_AUTHORIZED,
            AnalyticsEventTypes.PAYMENT_FAILED,
            AnalyticsEventTypes.PAYMENT_EXPIRED,
            AnalyticsEventTypes.PAGE_VIEW,
            AnalyticsEventTypes.PRODUCT_VIEW,
            AnalyticsEventTypes.ADD_TO_CART_CLICK,
            AnalyticsEventTypes.CHECKOUT_OPEN);
}
