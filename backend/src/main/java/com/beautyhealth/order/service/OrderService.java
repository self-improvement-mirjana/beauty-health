package com.beautyhealth.order.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.beautyhealth.auth.domain.AppUser;
import com.beautyhealth.auth.domain.Role;
import com.beautyhealth.auth.repo.AppUserRepository;
import com.beautyhealth.cart.domain.CartItem;
import com.beautyhealth.cart.repo.CartItemRepository;
import com.beautyhealth.cart.repo.CartRepository;
import com.beautyhealth.catalog.domain.InventoryRow;
import com.beautyhealth.catalog.repo.InventoryRowRepository;
import com.beautyhealth.catalog.repo.ProductVariantRepository;
import com.beautyhealth.config.OrderCheckoutProperties;
import com.beautyhealth.common.money.MoneyResponse;
import com.beautyhealth.order.api.dto.AdminOrderDetailResponse;
import com.beautyhealth.order.api.dto.BuyAgainItemResponse;
import com.beautyhealth.order.api.dto.CreateOrderRequest;
import com.beautyhealth.order.api.dto.CreateOrderResponse;
import com.beautyhealth.order.api.dto.OrderDetailResponse;
import com.beautyhealth.order.api.dto.OrderLineResponse;
import com.beautyhealth.order.api.dto.UserOrderSummaryResponse;
import com.beautyhealth.order.domain.OrderLine;
import com.beautyhealth.order.domain.PaymentRecordStatus;
import com.beautyhealth.order.domain.PaymentTransaction;
import com.beautyhealth.order.domain.Shipment;
import com.beautyhealth.order.domain.ShopOrder;
import com.beautyhealth.order.repo.OrderLineRepository;
import com.beautyhealth.order.repo.PaymentTransactionRepository;
import com.beautyhealth.order.repo.ShipmentRepository;
import com.beautyhealth.order.repo.ShopOrderRepository;

import jakarta.persistence.EntityManager;

@Service
public class OrderService {

    public static final String PAYMENT_PROVIDER_COD = "COD";

    private final ShopOrderRepository shopOrderRepository;
    private final OrderLineRepository orderLineRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final ShipmentRepository shipmentRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final InventoryRowRepository inventoryRowRepository;
    private final ProductVariantRepository productVariantRepository;
    private final AppUserRepository appUserRepository;
    private final OrderCheckoutProperties orderCheckoutProperties;
    private final EntityManager entityManager;

    public OrderService(ShopOrderRepository shopOrderRepository, OrderLineRepository orderLineRepository,
            PaymentTransactionRepository paymentTransactionRepository, ShipmentRepository shipmentRepository, CartRepository cartRepository,
            CartItemRepository cartItemRepository, InventoryRowRepository inventoryRowRepository,
            ProductVariantRepository productVariantRepository, AppUserRepository appUserRepository,
            OrderCheckoutProperties orderCheckoutProperties, EntityManager entityManager) {
        this.shopOrderRepository = shopOrderRepository;
        this.orderLineRepository = orderLineRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.shipmentRepository = shipmentRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.inventoryRowRepository = inventoryRowRepository;
        this.productVariantRepository = productVariantRepository;
        this.appUserRepository = appUserRepository;
        this.orderCheckoutProperties = orderCheckoutProperties;
        this.entityManager = entityManager;
    }

    @Transactional
    public CreateOrderResponse createFromCart(AppUser user, CreateOrderRequest request) {
        var cart = cartRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart not found"));
        List<CartItem> lines = cartItemRepository.findForCartView(cart.getId());
        if (lines.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        List<Long> variantIds = lines.stream().map(ci -> ci.getVariant().getId()).sorted().distinct().toList();
        Map<Long, List<InventoryRow>> lockedByVariant = new LinkedHashMap<>();
        for (Long variantId : variantIds) {
            lockedByVariant.put(variantId, inventoryRowRepository.lockRowsByVariantId(variantId));
        }

        for (CartItem ci : lines) {
            int need = ci.getQuantity();
            int sum = lockedByVariant.get(ci.getVariant().getId()).stream().mapToInt(InventoryRow::getQuantity).sum();
            if (sum < need) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Insufficient stock for variant " + ci.getVariant().getId());
            }
        }

        for (CartItem ci : lines) {
            deductFromRows(lockedByVariant.get(ci.getVariant().getId()), ci.getQuantity());
        }

        BigDecimal total = computeTotal(lines);
        String deliveryText = orderCheckoutProperties.getDeliverySummaryText();
        if (deliveryText.length() > 2000) {
            deliveryText = deliveryText.substring(0, 2000);
        }

        AppUser userRef = appUserRepository.getReferenceById(user.getId());
        ShopOrder order = new ShopOrder(userRef, total, "RSD", request.recipientName().trim(), request.recipientPhone().trim(),
                request.addressLine1().trim(), StringUtils.hasText(request.addressLine2()) ? request.addressLine2().trim() : null,
                request.city().trim(), request.postalCode().trim(), request.countryCode().trim().toUpperCase(), deliveryText);

        for (CartItem ci : lines) {
            new OrderLine(order, productVariantRepository.getReferenceById(ci.getVariant().getId()), ci.getQuantity(),
                    ci.getUnitPriceSnapshot());
        }

        shopOrderRepository.save(order);
        paymentTransactionRepository.save(
                new PaymentTransaction(order, PAYMENT_PROVIDER_COD, PaymentRecordStatus.PENDING, total, "RSD"));
        shipmentRepository.save(new Shipment(order));

        long orderId = order.getId();
        String orderStatus = order.getStatus().name();
        String deliveryTextSnapshot = order.getDeliverySummaryText();

        // Native delete avoids Hibernate re-persisting cart lines still referenced in the persistence context.
        entityManager.createNativeQuery("DELETE FROM cart_item WHERE cart_id = ?").setParameter(1, cart.getId()).executeUpdate();
        entityManager.flush();

        return new CreateOrderResponse(orderId, orderStatus, MoneyResponse.rsd(total), deliveryTextSnapshot);
    }

    @Transactional(readOnly = true)
    public Page<UserOrderSummaryResponse> listMyOrders(AppUser user, Pageable pageable) {
        return shopOrderRepository.findPageForUser(user.getId(), pageable)
                .map(o -> new UserOrderSummaryResponse(o.getId(), o.getStatus().name(), MoneyResponse.rsd(o.getTotalAmount()),
                        o.getCreatedAt(), o.getLines().size()));
    }

    @Transactional(readOnly = true)
    public List<BuyAgainItemResponse> buyAgain(AppUser user, int limit) {
        int capped = Math.min(Math.max(limit, 1), 100);
        return orderLineRepository.findBuyAgainItems(user.getId(), PageRequest.of(0, capped));
    }

    @Transactional(readOnly = true)
    public OrderDetailResponse getOrder(AppUser user, long orderId) {
        if (shopOrderRepository.findByIdAndUser_Id(orderId, user.getId()).isPresent()) {
            ShopOrder order = shopOrderRepository.findWithLinesById(orderId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
            return toDetail(order);
        }
        if (isModerator(user)) {
            ShopOrder order = shopOrderRepository.findWithLinesById(orderId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
            return toDetail(order);
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
    }

    /**
     * Detalj narudžbine za moderaciju (B11) — uključuje identitet kupca bez osetljivih polja.
     */
    @Transactional(readOnly = true)
    public AdminOrderDetailResponse getOrderForAdmin(long orderId) {
        ShopOrder order = shopOrderRepository.findWithLinesById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        var user = order.getUser();
        return new AdminOrderDetailResponse(user.getId(), user.getEmail(), toDetail(order));
    }

    private OrderDetailResponse toDetail(ShopOrder order) {
        List<OrderLineResponse> lineDtos = order.getLines().stream().map(this::toLineDto).toList();
        PaymentTransaction payment = paymentTransactionRepository.findByOrder_Id(order.getId()).orElse(null);
        String payProvider = payment != null ? payment.getProvider() : PAYMENT_PROVIDER_COD;
        String payStatus = payment != null ? payment.getStatus().name() : PaymentRecordStatus.PENDING.name();
        return new OrderDetailResponse(order.getId(), order.getCreatedAt(), order.getStatus().name(),
                MoneyResponse.rsd(order.getTotalAmount()), order.getDeliverySummaryText(), order.getRecipientName(),
                order.getRecipientPhone(), order.getAddressLine1(), order.getAddressLine2(), order.getCity(),
                order.getPostalCode(), order.getCountryCode(), payProvider, payStatus, lineDtos);
    }

    private OrderLineResponse toLineDto(OrderLine line) {
        BigDecimal lineTotal = line.getUnitPrice().multiply(BigDecimal.valueOf(line.getQuantity())).setScale(2, RoundingMode.HALF_UP);
        var v = line.getVariant();
        return new OrderLineResponse(line.getId(), v.getId(), v.getProduct().getSlug(), v.getProduct().getName(), line.getQuantity(),
                MoneyResponse.rsd(line.getUnitPrice()), MoneyResponse.rsd(lineTotal));
    }

    private static boolean isModerator(AppUser user) {
        return user.getRoles().stream().map(Role::getName).anyMatch("MODERATOR"::equals);
    }

    private static BigDecimal computeTotal(List<CartItem> lines) {
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem ci : lines) {
            BigDecimal lineAmount = ci.getUnitPriceSnapshot().multiply(BigDecimal.valueOf(ci.getQuantity())).setScale(2,
                    RoundingMode.HALF_UP);
            total = total.add(lineAmount);
        }
        return total;
    }

    private static void deductFromRows(List<InventoryRow> rows, int quantity) {
        int remaining = quantity;
        for (InventoryRow row : rows) {
            if (remaining == 0) {
                break;
            }
            int take = Math.min(row.getQuantity(), remaining);
            row.setQuantity(row.getQuantity() - take);
            remaining -= take;
        }
    }
}
