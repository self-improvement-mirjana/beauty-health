package com.beautyhealth.order.api;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import com.beautyhealth.analytics.model.AnalyticsEventTypes;
import com.beautyhealth.analytics.service.AnalyticsEventFactory;
import com.beautyhealth.analytics.service.AnalyticsOutboxService;
import com.beautyhealth.order.domain.OrderStatus;
import com.beautyhealth.order.domain.PaymentRecordStatus;
import com.beautyhealth.order.domain.PaymentTransaction;
import com.beautyhealth.order.domain.ShopOrder;
import com.beautyhealth.order.repo.PaymentTransactionRepository;
import com.beautyhealth.order.repo.ShopOrderRepository;
import com.beautyhealth.order.service.BankClient;

import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping(value = "/api/v1/payments", produces = MediaType.APPLICATION_JSON_VALUE)
public class PaymentWebhookController {

    private static final Logger log = LoggerFactory.getLogger(PaymentWebhookController.class);
    private final PaymentTransactionRepository paymentRepo;
    private final ShopOrderRepository orderRepo;
    private final BankClient bankClient;
    private final ObjectMapper objectMapper;
    private final AnalyticsOutboxService analyticsOutboxService;
    private final AnalyticsEventFactory analyticsEventFactory;

    public PaymentWebhookController(PaymentTransactionRepository paymentRepo, ShopOrderRepository orderRepo,
            BankClient bankClient, ObjectMapper objectMapper, AnalyticsOutboxService analyticsOutboxService,
            AnalyticsEventFactory analyticsEventFactory) {
        this.paymentRepo = paymentRepo;
        this.orderRepo = orderRepo;
        this.bankClient = bankClient;
        this.objectMapper = objectMapper;
        this.analyticsOutboxService = analyticsOutboxService;
        this.analyticsEventFactory = analyticsEventFactory;
    }

    @PostMapping(value = "/webhook", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public Map<String, String> handleWebhook(
            @RequestHeader("X-Signature") String signature,
            @RequestHeader(value = "X-Signature-Alg", defaultValue = "RSA-SHA256") String signatureAlg,
            @RequestHeader("X-Timestamp") String timestamp,
            @RequestHeader("X-Nonce") String nonce,
            @RequestBody String rawBody) {
        if (!bankClient.verifyWebhookSignature(signature, signatureAlg, timestamp, nonce, rawBody)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid webhook signature");
        }

        try {
            var node = objectMapper.readTree(rawBody);
            String paymentRef = node.get("paymentRef").asText();
            String status = node.get("status").asText();

            PaymentTransaction payment = paymentRepo.findByPaymentRef(paymentRef)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));

            if (payment.getStatus() == PaymentRecordStatus.COMPLETED || payment.getStatus() == PaymentRecordStatus.FAILED) {
                return Map.of("status", "already_processed");
            }

            payment.setExternalStatus(status);

            ShopOrder order = payment.getOrder();
            if ("AUTHORIZED".equals(status)) {
                payment.setStatus(PaymentRecordStatus.COMPLETED);
                if (order.getStatus() == OrderStatus.NEW) {
                    order.setStatus(OrderStatus.CONFIRMED);
                }
                emitPaymentEvent(order, payment, AnalyticsEventTypes.PAYMENT_AUTHORIZED, status);
            } else if ("DECLINED".equals(status) || "FAILED".equals(status)) {
                payment.setStatus(PaymentRecordStatus.FAILED);
                if (order.getStatus() == OrderStatus.NEW) {
                    order.setStatus(OrderStatus.CANCELLED);
                }
                emitPaymentEvent(order, payment, AnalyticsEventTypes.PAYMENT_FAILED, status);
            } else if ("EXPIRED".equals(status)) {
                payment.setStatus(PaymentRecordStatus.FAILED);
                if (order.getStatus() == OrderStatus.NEW) {
                    order.setStatus(OrderStatus.CANCELLED);
                }
                emitPaymentEvent(order, payment, AnalyticsEventTypes.PAYMENT_EXPIRED, status);
            }

            log.info("Webhook processed: paymentRef={} status={} → orderStatus={}", paymentRef, status, order.getStatus());
            return Map.of("status", "ok");
        } catch (ResponseStatusException e) { throw e; }
        catch (Exception e) {
            log.error("Webhook processing failed", e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid webhook payload");
        }
    }

    private void emitPaymentEvent(ShopOrder order, PaymentTransaction payment, String eventType, String paymentStatus) {
        Map<String, Object> payload = Map.of(
                "orderId", order.getId(),
                "paymentMethod", payment.getProvider(),
                "paymentStatus", paymentStatus,
                "amount", order.getTotalAmount(),
                "currency", order.getCurrency());
        analyticsOutboxService.enqueue(analyticsEventFactory.systemEvent(String.valueOf(order.getId()), eventType, payload));
    }
}
