package com.mockbank.payments.service;

import java.time.Instant;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.mockbank.payments.domain.PaymentIntent;
import com.mockbank.payments.repo.PaymentIntentRepository;

@Component
public class PaymentExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(PaymentExpiryScheduler.class);
    private final PaymentIntentRepository intentRepo;

    public PaymentExpiryScheduler(PaymentIntentRepository intentRepo) {
        this.intentRepo = intentRepo;
    }

    @Scheduled(fixedDelay = 30000)
    @Transactional
    public void expireStaleIntents() {
        List<PaymentIntent> expired = intentRepo.findExpired(Instant.now());
        for (PaymentIntent intent : expired) {
            intent.setStatus("EXPIRED");
            log.info("Expired payment intent {}", intent.getPaymentRef());
        }
    }
}
