package com.beautyhealth.cart.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.beautyhealth.analytics.model.AnalyticsEventTypes;
import com.beautyhealth.analytics.service.AnalyticsEventFactory;
import com.beautyhealth.analytics.service.AnalyticsOutboxService;
import com.beautyhealth.auth.domain.AppUser;
import com.beautyhealth.auth.repo.AppUserRepository;
import com.beautyhealth.cart.api.dto.AddCartItemRequest;
import com.beautyhealth.cart.api.dto.CartItemResponse;
import com.beautyhealth.cart.api.dto.CartResponse;
import com.beautyhealth.cart.api.dto.CartSummaryResponse;
import com.beautyhealth.cart.api.dto.PatchCartItemRequest;
import com.beautyhealth.cart.domain.Cart;
import com.beautyhealth.cart.domain.CartItem;
import com.beautyhealth.cart.repo.CartItemRepository;
import com.beautyhealth.cart.repo.CartRepository;
import com.beautyhealth.catalog.domain.InventoryRow;
import com.beautyhealth.catalog.domain.ProductVariant;
import com.beautyhealth.catalog.repo.ProductOptionRepository;
import com.beautyhealth.catalog.repo.ProductVariantRepository;
import com.beautyhealth.common.money.MoneyResponse;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductOptionRepository productOptionRepository;
    private final AppUserRepository appUserRepository;
    private final AnalyticsOutboxService analyticsOutboxService;
    private final AnalyticsEventFactory analyticsEventFactory;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
            ProductVariantRepository productVariantRepository, ProductOptionRepository productOptionRepository,
            AppUserRepository appUserRepository, AnalyticsOutboxService analyticsOutboxService,
            AnalyticsEventFactory analyticsEventFactory) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productVariantRepository = productVariantRepository;
        this.productOptionRepository = productOptionRepository;
        this.appUserRepository = appUserRepository;
        this.analyticsOutboxService = analyticsOutboxService;
        this.analyticsEventFactory = analyticsEventFactory;
    }

    public record CartWriteResult(CartResponse response, String guestCartTokenForHeader) {
    }

    public record CartSummaryWriteResult(CartSummaryResponse summary, String guestCartTokenForHeader) {
    }

    private record VariantQty(long variantId, int quantity) {
    }

    /**
     * Returns cart state. For anonymous clients without {@code X-Guest-Cart-Token}, creates a new guest cart
     * (first interaction).
     */
    @Transactional
    public CartWriteResult getCart(AppUser user, String guestTokenHeader) {
        if (user != null) {
            Cart cart = cartRepository.findByUser_Id(user.getId()).orElseGet(() -> emptyUserCartPlaceholder(user));
            return new CartWriteResult(toResponse(cart), null);
        }
        String token = normalizeToken(guestTokenHeader);
        if (token == null) {
            Cart cart = createGuestCart();
            return new CartWriteResult(toResponse(cart), cart.getGuestCartToken());
        }
        Cart cart = cartRepository.findByGuestCartToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown guest cart"));
        return new CartWriteResult(toResponse(cart), cart.getGuestCartToken());
    }

    private Cart emptyUserCartPlaceholder(AppUser user) {
        return new Cart(appUserRepository.getReferenceById(user.getId()), null);
    }

    @Transactional
    public CartSummaryWriteResult getSummary(AppUser user, String guestTokenHeader) {
        CartWriteResult c = getCart(user, guestTokenHeader);
        CartResponse r = c.response();
        CartSummaryResponse s = new CartSummaryResponse(r.lineCount(), r.totalQuantity(), r.empty(), r.subtotal());
        return new CartSummaryWriteResult(s, c.guestCartTokenForHeader());
    }

    @Transactional
    public CartWriteResult addItem(AppUser user, String guestTokenHeader, AddCartItemRequest request) {
        Cart cart = resolveWritableCart(user, guestTokenHeader, true);
        addItemCore(cart, request.variantId(), request.quantity());
        emitCartEvent(user, cart, AnalyticsEventTypes.CART_ITEM_ADDED, request.variantId(), request.quantity());
        return finishWrite(user, cart);
    }

    @Transactional
    public CartWriteResult patchItem(AppUser user, String guestTokenHeader, long itemId, PatchCartItemRequest request) {
        Cart cart = resolveWritableCart(user, guestTokenHeader, false);
        CartItem item = cartItemRepository.findByIdAndCart_Id(itemId, cart.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));
        ProductVariant v = loadAndValidateVariant(item.getVariant().getId());
        assertStock(v, request.quantity());
        item.setQuantity(request.quantity());
        item.setUnitPriceSnapshot(effectiveUnitPrice(v));
        emitCartEvent(user, cart, AnalyticsEventTypes.CART_ITEM_UPDATED, item.getVariant().getId(), request.quantity());
        return finishWrite(user, cart);
    }

    @Transactional
    public CartWriteResult deleteItem(AppUser user, String guestTokenHeader, long itemId) {
        Cart cart = resolveWritableCart(user, guestTokenHeader, false);
        CartItem item = cartItemRepository.findByIdAndCart_Id(itemId, cart.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));
        long variantId = item.getVariant().getId();
        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        emitCartEvent(user, cart, AnalyticsEventTypes.CART_ITEM_REMOVED, variantId, item.getQuantity());
        return finishWrite(user, cart);
    }

    @Transactional
    public CartResponse mergeGuestIntoUser(AppUser user, String guestCartToken) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        String token = requireGuestToken(guestCartToken);
        Cart guest = cartRepository.findByGuestCartToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown guest cart"));
        Cart userCart = getOrCreateUserCart(user);
        List<VariantQty> payloads = new ArrayList<>();
        for (CartItem line : guest.getItems()) {
            payloads.add(new VariantQty(line.getVariant().getId(), line.getQuantity()));
        }
        cartRepository.delete(guest);
        for (VariantQty p : payloads) {
            addItemCore(userCart, p.variantId(), p.quantity());
        }
        return toResponse(userCart);
    }

    private CartWriteResult finishWrite(AppUser user, Cart cart) {
        if (user != null) {
            return new CartWriteResult(toResponse(cart), null);
        }
        return new CartWriteResult(toResponse(cart), cart.getGuestCartToken());
    }

    private Cart resolveWritableCart(AppUser user, String guestTokenHeader, boolean allowCreateGuestWithoutToken) {
        if (user != null) {
            return getOrCreateUserCart(user);
        }
        String token = normalizeToken(guestTokenHeader);
        if (token == null) {
            if (!allowCreateGuestWithoutToken) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing X-Guest-Cart-Token header");
            }
            return createGuestCart();
        }
        return cartRepository.findByGuestCartToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown guest cart"));
    }

    private Cart createGuestCart() {
        Cart cart = new Cart(null, UUID.randomUUID().toString());
        return cartRepository.save(cart);
    }

    private Cart getOrCreateUserCart(AppUser user) {
        return cartRepository.findByUser_Id(user.getId()).orElseGet(() -> {
            AppUser ref = appUserRepository.getReferenceById(user.getId());
            return cartRepository.save(new Cart(ref, null));
        });
    }

    private void addItemCore(Cart cart, long variantId, int addQty) {
        ProductVariant v = loadAndValidateVariant(variantId);
        Optional<CartItem> existing = cartItemRepository.findByCart_IdAndVariant_Id(cart.getId(), variantId);
        int nextQty = addQty + existing.map(CartItem::getQuantity).orElse(0);
        assertStock(v, nextQty);
        BigDecimal snap = effectiveUnitPrice(v);
        if (existing.isPresent()) {
            CartItem ci = existing.get();
            ci.setQuantity(nextQty);
            ci.setUnitPriceSnapshot(snap);
        } else {
            CartItem ci = new CartItem(cart, v, addQty, snap);
            cart.getItems().add(ci);
        }
    }

    private ProductVariant loadAndValidateVariant(long variantId) {
        ProductVariant v = productVariantRepository.findWithProductById(variantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
        if (!v.getProduct().isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product is not available");
        }
        long optionGroups = productOptionRepository.countByProduct_Id(v.getProduct().getId());
        if (optionGroups > 0 && v.getSelectedOptions().size() != optionGroups) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Variant has incomplete option selection");
        }
        return v;
    }

    private static BigDecimal effectiveUnitPrice(ProductVariant v) {
        if (v.getSalePrice() != null) {
            return v.getSalePrice();
        }
        return v.getRegularPrice();
    }

    private static int totalStock(ProductVariant v) {
        return v.getInventories().stream().mapToInt(InventoryRow::getQuantity).sum();
    }

    private static void assertStock(ProductVariant v, int desiredQty) {
        int stock = totalStock(v);
        if (stock <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Variant is out of stock");
        }
        if (desiredQty > stock) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Requested quantity exceeds available stock (" + stock + ")");
        }
    }

    private CartResponse toResponse(Cart cart) {
        if (cart.getId() == null) {
            return emptyCartResponse();
        }
        if (cartItemRepository.countByCart_Id(cart.getId()) == 0) {
            return new CartResponse(List.of(), 0, 0, true, MoneyResponse.rsd(BigDecimal.ZERO));
        }
        List<CartItem> lines = cartItemRepository.findForCartView(cart.getId());
        List<CartItemResponse> items = lines.stream().map(this::toItemResponse).toList();
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalQty = 0;
        for (CartItem line : lines) {
            BigDecimal lineAmount = line.getUnitPriceSnapshot().multiply(BigDecimal.valueOf(line.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(lineAmount);
            totalQty += line.getQuantity();
        }
        boolean empty = items.isEmpty();
        return new CartResponse(items, items.size(), totalQty, empty, MoneyResponse.rsd(subtotal));
    }

    private static CartResponse emptyCartResponse() {
        return new CartResponse(List.of(), 0, 0, true, MoneyResponse.rsd(BigDecimal.ZERO));
    }

    private CartItemResponse toItemResponse(CartItem line) {
        ProductVariant v = line.getVariant();
        String variantLabel = StringUtils.hasText(v.getName()) ? v.getName() : v.getSku();
        BigDecimal lineTotal = line.getUnitPriceSnapshot().multiply(BigDecimal.valueOf(line.getQuantity()))
                .setScale(2, RoundingMode.HALF_UP);
        return new CartItemResponse(line.getId(), v.getId(), v.getProduct().getSlug(), v.getProduct().getName(),
                variantLabel, v.getSku(), line.getQuantity(), MoneyResponse.rsd(line.getUnitPriceSnapshot()),
                MoneyResponse.rsd(lineTotal));
    }

    private static String normalizeToken(String raw) {
        if (raw == null) {
            return null;
        }
        String t = raw.trim();
        return t.isEmpty() ? null : t;
    }

    private static String requireGuestToken(String raw) {
        String t = normalizeToken(raw);
        if (t == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "guestCartToken is required");
        }
        return t;
    }

    private void emitCartEvent(AppUser user, Cart cart, String eventType, long variantId, int quantity) {
        if (cart.getId() == null) {
            return;
        }
        Map<String, Object> payload = Map.of("cartId", cart.getId(), "variantId", variantId, "quantity", quantity);
        analyticsOutboxService.enqueue(analyticsEventFactory.backendEvent(user, cart.getGuestCartToken(),
                AnalyticsEventFactory.correlationForCart(cart), eventType, payload));
    }
}
