package com.beautyhealth.cart.api;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.auth.domain.AppUser;
import com.beautyhealth.cart.api.dto.AddCartItemRequest;
import com.beautyhealth.cart.api.dto.CartResponse;
import com.beautyhealth.cart.api.dto.CartSummaryResponse;
import com.beautyhealth.cart.api.dto.MergeCartRequest;
import com.beautyhealth.cart.api.dto.PatchCartItemRequest;
import com.beautyhealth.cart.service.CartService;
import com.beautyhealth.cart.service.CartService.CartSummaryWriteResult;
import com.beautyhealth.cart.service.CartService.CartWriteResult;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Cart", description = "Korpa (gost preko X-Guest-Cart-Token, ulogovan korisnik preko JWT).")
@RestController
@RequestMapping(value = "/api/v1/cart", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class CartController {

    /** Gost korpa: klijent šalje na svakom zahtevu nakon prvog odgovora servera. */
    public static final String GUEST_CART_TOKEN_HEADER = "X-Guest-Cart-Token";

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    private static AppUser resolveUser(Object principal) {
        if (principal instanceof AppUser u) {
            return u;
        }
        return null;
    }

    private static void addGuestTokenHeader(ResponseEntity.BodyBuilder builder, String token) {
        if (token != null) {
            builder.header(GUEST_CART_TOKEN_HEADER, token);
        }
    }

    @Operation(summary = "Health slice cart")
    @GetMapping("/ping")
    public Map<String, Object> ping() {
        return Map.of("slice", "cart", "ok", true);
    }

    @Operation(summary = "Korpa sa stavkama")
    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal Object principal,
            @Parameter(description = "Token gost korpe (posle prvog odgovora obavezno slati nazad).")
            @RequestHeader(value = GUEST_CART_TOKEN_HEADER, required = false) String guestCartToken) {
        CartWriteResult r = cartService.getCart(resolveUser(principal), guestCartToken);
        ResponseEntity.BodyBuilder b = ResponseEntity.ok();
        addGuestTokenHeader(b, r.guestCartTokenForHeader());
        return b.body(r.response());
    }

    @Operation(summary = "Sažetak korpe (badge)")
    @GetMapping("/summary")
    public ResponseEntity<CartSummaryResponse> getSummary(@AuthenticationPrincipal Object principal,
            @RequestHeader(value = GUEST_CART_TOKEN_HEADER, required = false) String guestCartToken) {
        CartSummaryWriteResult r = cartService.getSummary(resolveUser(principal), guestCartToken);
        ResponseEntity.BodyBuilder b = ResponseEntity.ok();
        addGuestTokenHeader(b, r.guestCartTokenForHeader());
        return b.body(r.summary());
    }

    @Operation(summary = "Dodaj stavku (isti variantId uvećava količinu)")
    @PostMapping(value = "/items", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CartResponse> addItem(@AuthenticationPrincipal Object principal,
            @RequestHeader(value = GUEST_CART_TOKEN_HEADER, required = false) String guestCartToken,
            @Valid @RequestBody AddCartItemRequest request) {
        CartWriteResult r = cartService.addItem(resolveUser(principal), guestCartToken, request);
        ResponseEntity.BodyBuilder b = ResponseEntity.ok();
        addGuestTokenHeader(b, r.guestCartTokenForHeader());
        return b.body(r.response());
    }

    @Operation(summary = "Ažuriraj količinu stavke")
    @PatchMapping(value = "/items/{itemId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CartResponse> patchItem(@AuthenticationPrincipal Object principal,
            @RequestHeader(value = GUEST_CART_TOKEN_HEADER, required = false) String guestCartToken,
            @PathVariable long itemId, @Valid @RequestBody PatchCartItemRequest request) {
        CartWriteResult r = cartService.patchItem(resolveUser(principal), guestCartToken, itemId, request);
        ResponseEntity.BodyBuilder b = ResponseEntity.ok();
        addGuestTokenHeader(b, r.guestCartTokenForHeader());
        return b.body(r.response());
    }

    @Operation(summary = "Ukloni stavku")
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> deleteItem(@AuthenticationPrincipal Object principal,
            @RequestHeader(value = GUEST_CART_TOKEN_HEADER, required = false) String guestCartToken,
            @PathVariable long itemId) {
        CartWriteResult r = cartService.deleteItem(resolveUser(principal), guestCartToken, itemId);
        ResponseEntity.BodyBuilder b = ResponseEntity.ok();
        addGuestTokenHeader(b, r.guestCartTokenForHeader());
        return b.body(r.response());
    }

    @Operation(summary = "Spoji gost korpu u korpu naloga (JWT obavezan)")
    @PostMapping(value = "/merge", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CartResponse> merge(@AuthenticationPrincipal Object principal,
            @Valid @RequestBody MergeCartRequest request) {
        CartResponse body = cartService.mergeGuestIntoUser(resolveUser(principal), request.guestCartToken());
        return ResponseEntity.ok(body);
    }
}
