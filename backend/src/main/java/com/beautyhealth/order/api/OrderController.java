package com.beautyhealth.order.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.auth.domain.AppUser;
import com.beautyhealth.order.api.dto.BuyAgainItemResponse;
import com.beautyhealth.order.api.dto.CreateOrderRequest;
import com.beautyhealth.order.api.dto.CreateOrderResponse;
import com.beautyhealth.order.api.dto.OrderDetailResponse;
import com.beautyhealth.order.api.dto.UserOrderSummaryResponse;
import com.beautyhealth.order.service.OrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.server.ResponseStatusException;

@Tag(name = "Orders", description = "Narudžbine iz korpe (checkout MVP, pouzeće stub).")
@RestController
@RequestMapping(value = "/api/v1/orders", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
@SecurityRequirement(name = "bearer-jwt")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    private static AppUser requireUser(Object principal) {
        if (principal instanceof AppUser u) {
            return u;
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
    }

    @Operation(summary = "Kreiraj narudžbinu iz korpe korisnika")
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CreateOrderResponse> createOrder(@AuthenticationPrincipal Object principal,
            @Valid @RequestBody CreateOrderRequest request) {
        CreateOrderResponse body = orderService.createFromCart(requireUser(principal), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @Operation(summary = "Lista mojih narudžbina (paginacija)")
    @GetMapping
    public Page<UserOrderSummaryResponse> listMyOrders(@AuthenticationPrincipal Object principal,
            @PageableDefault(size = 20, sort = { "createdAt", "id" }, direction = Sort.Direction.DESC) Pageable pageable) {
        return orderService.listMyOrders(requireUser(principal), pageable);
    }

    @Operation(summary = "Ponovo kupi — proizvodi iz ranijih porudžbina (grupisano po varijanti)")
    @GetMapping("/buy-again")
    public List<BuyAgainItemResponse> buyAgain(@AuthenticationPrincipal Object principal,
            @RequestParam(name = "limit", defaultValue = "50") int limit) {
        return orderService.buyAgain(requireUser(principal), limit);
    }

    @Operation(summary = "Detalj narudžbine (vlasnik ili moderator)")
    @GetMapping("/{orderId}")
    public OrderDetailResponse getOrder(@AuthenticationPrincipal Object principal, @PathVariable long orderId) {
        return orderService.getOrder(requireUser(principal), orderId);
    }
}
