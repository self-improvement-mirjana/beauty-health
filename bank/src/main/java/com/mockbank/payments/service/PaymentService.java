package com.mockbank.payments.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.mockbank.common.money.MoneyResponse;
import com.mockbank.merchants.domain.Merchant;
import com.mockbank.payments.api.dto.CreatePaymentRequest;
import com.mockbank.payments.api.dto.CreatePaymentResponse;
import com.mockbank.payments.api.dto.PaymentStatusResponse;
import com.mockbank.payments.domain.PaymentIntent;
import com.mockbank.payments.repo.PaymentIntentRepository;

@Service
public class PaymentService {

    private final PaymentIntentRepository intentRepo;

    public PaymentService(PaymentIntentRepository intentRepo) {
        this.intentRepo = intentRepo;
    }

    @Transactional
    public CreatePaymentResponse createIntent(Merchant merchant, CreatePaymentRequest req) {
        String ref = UUID.randomUUID().toString();
        String currency = req.currency() != null ? req.currency() : "RSD";
        int expiresInSec = req.expiresInSec() != null ? req.expiresInSec() : 900;
        Instant expiresAt = Instant.now().plus(expiresInSec, ChronoUnit.SECONDS);

        String returnSuccess = req.returnUrlSuccess() != null ? req.returnUrlSuccess() : merchant.getReturnUrlSuccess();
        String returnFailure = req.returnUrlFailure() != null ? req.returnUrlFailure() : merchant.getReturnUrlFailure();

        PaymentIntent intent = new PaymentIntent(ref, merchant, req.externalOrderId(), req.amount(), currency,
                returnSuccess, returnFailure, expiresAt);
        intentRepo.save(intent);

        String redirectUrl = "http://localhost:5175/pay/" + ref;
        return new CreatePaymentResponse(ref, redirectUrl, expiresAt);
    }

    @Transactional(readOnly = true)
    public PaymentStatusResponse getStatus(String paymentRef) {
        PaymentIntent intent = intentRepo.findByPaymentRef(paymentRef)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        return new PaymentStatusResponse(intent.getPaymentRef(), intent.getExternalOrderId(),
                intent.getStatus(), MoneyResponse.rsd(intent.getAmount()), intent.getCreatedAt(), intent.getUpdatedAt());
    }

    @Transactional
    public void cancel(String paymentRef) {
        PaymentIntent intent = intentRepo.findByPaymentRef(paymentRef)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        if ("CREATED".equals(intent.getStatus())) {
            intent.setStatus("CANCELLED");
        }
    }
}
