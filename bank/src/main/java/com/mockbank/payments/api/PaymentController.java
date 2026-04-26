package com.mockbank.payments.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mockbank.merchants.domain.Merchant;
import com.mockbank.payments.api.dto.CreatePaymentRequest;
import com.mockbank.payments.api.dto.CreatePaymentResponse;
import com.mockbank.payments.api.dto.PaymentStatusResponse;
import com.mockbank.payments.service.PaymentService;
import com.mockbank.payments.service.SignatureVerificationService;
import com.mockbank.signing.SignaturePayloadBuilder;

import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/payments", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class PaymentController {

    private final PaymentService paymentService;
    private final SignatureVerificationService signatureService;
    private final ObjectMapper objectMapper;

    public PaymentController(PaymentService paymentService, SignatureVerificationService signatureService, ObjectMapper objectMapper) {
        this.paymentService = paymentService;
        this.signatureService = signatureService;
        this.objectMapper = objectMapper;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CreatePaymentResponse> create(
            @RequestHeader("X-Merchant-Id") String merchantSlug,
            @RequestHeader("X-Signature") String signature,
            @RequestHeader(value = "X-Signature-Alg", defaultValue = "RSA-SHA256") String signatureAlg,
            @RequestHeader(value = "X-Signature-Serial", required = false) String serial,
            @RequestHeader("X-Timestamp") String timestamp,
            @RequestHeader("X-Nonce") String nonce,
            @Valid @RequestBody CreatePaymentRequest request) {
        try {
            String bodyJson = objectMapper.writeValueAsString(request);
            String payload = SignaturePayloadBuilder.build("POST", "/api/v1/payments", timestamp, nonce, bodyJson);
            Merchant merchant = signatureService.verifyAndGetMerchant(merchantSlug, signature, signatureAlg, serial, timestamp, nonce, payload);
            return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createIntent(merchant, request));
        } catch (Exception e) {
            if (e instanceof org.springframework.web.server.ResponseStatusException rse) throw rse;
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping("/{paymentRef}")
    public PaymentStatusResponse status(
            @RequestHeader("X-Merchant-Id") String merchantSlug,
            @RequestHeader("X-Signature") String signature,
            @RequestHeader(value = "X-Signature-Alg", defaultValue = "RSA-SHA256") String signatureAlg,
            @RequestHeader(value = "X-Signature-Serial", required = false) String serial,
            @RequestHeader("X-Timestamp") String timestamp,
            @RequestHeader("X-Nonce") String nonce,
            @PathVariable String paymentRef) {
        String payload = SignaturePayloadBuilder.build("GET", "/api/v1/payments/" + paymentRef, timestamp, nonce, "");
        signatureService.verifyAndGetMerchant(merchantSlug, signature, signatureAlg, serial, timestamp, nonce, payload);
        return paymentService.getStatus(paymentRef);
    }

    @PostMapping("/{paymentRef}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(
            @RequestHeader("X-Merchant-Id") String merchantSlug,
            @RequestHeader("X-Signature") String signature,
            @RequestHeader(value = "X-Signature-Alg", defaultValue = "RSA-SHA256") String signatureAlg,
            @RequestHeader(value = "X-Signature-Serial", required = false) String serial,
            @RequestHeader("X-Timestamp") String timestamp,
            @RequestHeader("X-Nonce") String nonce,
            @PathVariable String paymentRef) {
        String payload = SignaturePayloadBuilder.build("POST", "/api/v1/payments/" + paymentRef + "/cancel", timestamp, nonce, "");
        signatureService.verifyAndGetMerchant(merchantSlug, signature, signatureAlg, serial, timestamp, nonce, payload);
        paymentService.cancel(paymentRef);
    }
}
