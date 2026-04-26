package com.mockbank.hosted.service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.YearMonth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.mockbank.cards.domain.VirtualCard;
import com.mockbank.cards.repo.VirtualCardRepository;
import com.mockbank.common.money.MoneyResponse;
import com.mockbank.hosted.api.dto.HostedPaymentInfo;
import com.mockbank.hosted.api.dto.PayCardRequest;
import com.mockbank.hosted.api.dto.PayCardResponse;
import com.mockbank.payments.domain.CardTransaction;
import com.mockbank.payments.domain.PaymentIntent;
import com.mockbank.payments.repo.CardTransactionRepository;
import com.mockbank.payments.repo.PaymentIntentRepository;
import com.mockbank.webhook.WebhookSender;

@Service
public class HostedPaymentService {

    private static final Logger log = LoggerFactory.getLogger(HostedPaymentService.class);
    private final PaymentIntentRepository intentRepo;
    private final CardTransactionRepository txRepo;
    private final VirtualCardRepository cardRepo;
    private final PasswordEncoder passwordEncoder;
    private final WebhookSender webhookSender;

    public HostedPaymentService(PaymentIntentRepository intentRepo, CardTransactionRepository txRepo,
            VirtualCardRepository cardRepo, PasswordEncoder passwordEncoder, WebhookSender webhookSender) {
        this.intentRepo = intentRepo;
        this.txRepo = txRepo;
        this.cardRepo = cardRepo;
        this.passwordEncoder = passwordEncoder;
        this.webhookSender = webhookSender;
    }

    @Transactional(readOnly = true)
    public HostedPaymentInfo getInfo(String paymentRef) {
        PaymentIntent intent = intentRepo.findByPaymentRef(paymentRef)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        return new HostedPaymentInfo(intent.getMerchant().getName(), MoneyResponse.rsd(intent.getAmount()),
                intent.getExternalOrderId(), intent.getExpiresAt(), intent.getStatus());
    }

    @Transactional
    public PayCardResponse pay(String paymentRef, PayCardRequest req) {
        PaymentIntent intent = intentRepo.findByPaymentRef(paymentRef)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));

        if (!"CREATED".equals(intent.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Payment already processed: " + intent.getStatus());
        }

        if (intent.getExpiresAt() != null && Instant.now().isAfter(intent.getExpiresAt())) {
            intent.setStatus("EXPIRED");
            throw new ResponseStatusException(HttpStatus.GONE, "Payment expired");
        }

        VirtualCard card = cardRepo.findByPanForUpdate(req.pan())
                .orElse(null);

        if (card == null) {
            return decline(intent, null, "Card not found");
        }

        if (!"ACTIVE".equals(card.getStatus())) {
            return decline(intent, card, "Card frozen or expired");
        }

        YearMonth cardExp = YearMonth.of(card.getExpYear(), card.getExpMonth());
        if (cardExp.isBefore(YearMonth.now())) {
            return decline(intent, card, "Card expired");
        }

        if (card.getExpMonth() != req.expMonth() || card.getExpYear() != req.expYear()) {
            return decline(intent, card, "Expiry mismatch");
        }

        if (!passwordEncoder.matches(req.cvv(), card.getCvvHash())) {
            return decline(intent, card, "Invalid CVV");
        }

        BigDecimal amount = intent.getAmount();
        if (card.getBalance().compareTo(amount) < 0) {
            return decline(intent, card, "Insufficient funds");
        }

        card.setBalance(card.getBalance().subtract(amount));
        intent.setStatus("AUTHORIZED");

        txRepo.save(new CardTransaction(intent, card, "APPROVED", amount, intent.getCurrency(), null));

        webhookSender.sendAsync(intent);

        String returnUrl = intent.getReturnUrlSuccess() != null ? intent.getReturnUrlSuccess() : "http://localhost:5173/payment/return";
        returnUrl = appendParams(returnUrl, intent.getPaymentRef(), intent.getExternalOrderId(), "AUTHORIZED");

        return new PayCardResponse("AUTHORIZED", returnUrl);
    }

    private PayCardResponse decline(PaymentIntent intent, VirtualCard card, String reason) {
        intent.setStatus("DECLINED");
        txRepo.save(new CardTransaction(intent, card, "DECLINED", intent.getAmount(), intent.getCurrency(), reason));
        log.warn("Payment {} declined: {}", intent.getPaymentRef(), reason);

        webhookSender.sendAsync(intent);

        String returnUrl = intent.getReturnUrlFailure() != null ? intent.getReturnUrlFailure() : "http://localhost:5173/payment/return";
        returnUrl = appendParams(returnUrl, intent.getPaymentRef(), intent.getExternalOrderId(), "DECLINED");

        return new PayCardResponse("DECLINED", returnUrl);
    }

    private static String appendParams(String url, String ref, String orderId, String status) {
        String sep = url.contains("?") ? "&" : "?";
        return url + sep
                + "ref=" + URLEncoder.encode(ref, StandardCharsets.UTF_8)
                + "&orderId=" + URLEncoder.encode(orderId, StandardCharsets.UTF_8)
                + "&status=" + URLEncoder.encode(status, StandardCharsets.UTF_8);
    }
}
