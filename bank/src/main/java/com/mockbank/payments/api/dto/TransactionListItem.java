package com.mockbank.payments.api.dto;

import java.time.Instant;
import com.mockbank.common.money.MoneyResponse;

public record TransactionListItem(
    long id,
    String paymentRef,
    String merchantName,
    String externalOrderId,
    MoneyResponse amount,
    String intentStatus,
    String cardTransactionStatus,
    String declineReason,
    Instant processedAt
) {}
