package com.mockbank.payments.api;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mockbank.common.money.MoneyResponse;
import com.mockbank.payments.api.dto.TransactionListItem;
import com.mockbank.payments.domain.CardTransaction;
import com.mockbank.payments.domain.PaymentIntent;
import com.mockbank.payments.repo.CardTransactionRepository;
import com.mockbank.payments.repo.PaymentIntentRepository;

@RestController
@RequestMapping(value = "/api/v1/admin", produces = MediaType.APPLICATION_JSON_VALUE)
public class DashboardController {

    private final PaymentIntentRepository intentRepo;
    private final CardTransactionRepository txRepo;

    public DashboardController(PaymentIntentRepository intentRepo, CardTransactionRepository txRepo) {
        this.intentRepo = intentRepo;
        this.txRepo = txRepo;
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        long total = intentRepo.countAll();
        long approved = txRepo.countByStatus("APPROVED");
        long declined = txRepo.countByStatus("DECLINED");
        BigDecimal sum = intentRepo.sumAuthorized();
        List<PaymentIntent> recent = intentRepo.findRecentWithMerchant(10);
        List<TransactionListItem> items = recent.stream().map(p -> {
            CardTransaction ct = txRepo.findByIntent_Id(p.getId()).orElse(null);
            return new TransactionListItem(p.getId(), p.getPaymentRef(), p.getMerchant().getName(),
                    p.getExternalOrderId(), MoneyResponse.rsd(p.getAmount()), p.getStatus(),
                    ct != null ? ct.getStatus() : null, ct != null ? ct.getDeclineReason() : null,
                    p.getCreatedAt());
        }).toList();
        return new DashboardResponse(total, approved, declined, MoneyResponse.rsd(sum), items);
    }

    @GetMapping("/transactions")
    public List<TransactionListItem> transactions(
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long merchantId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String status) {
        List<PaymentIntent> intents = intentRepo.findFiltered(merchantId, status);
        return intents.stream().map(p -> {
            CardTransaction ct = txRepo.findByIntent_Id(p.getId()).orElse(null);
            return new TransactionListItem(p.getId(), p.getPaymentRef(), p.getMerchant().getName(),
                    p.getExternalOrderId(), MoneyResponse.rsd(p.getAmount()), p.getStatus(),
                    ct != null ? ct.getStatus() : null, ct != null ? ct.getDeclineReason() : null,
                    p.getCreatedAt());
        }).toList();
    }

    record DashboardResponse(long totalTransactions, long approvedCount, long declinedCount,
            MoneyResponse totalAmountRsd, List<TransactionListItem> recentIntents) {}
}
