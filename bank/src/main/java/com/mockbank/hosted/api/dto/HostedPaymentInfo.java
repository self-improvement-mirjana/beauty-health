package com.mockbank.hosted.api.dto;

import java.time.Instant;
import com.mockbank.common.money.MoneyResponse;

public record HostedPaymentInfo(
    String merchantName,
    MoneyResponse amount,
    String externalOrderId,
    Instant expiresAt,
    String status
) {}
