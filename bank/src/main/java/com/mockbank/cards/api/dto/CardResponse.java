package com.mockbank.cards.api.dto;

import java.time.Instant;
import com.mockbank.common.money.MoneyResponse;

public record CardResponse(
    long id,
    String panLast4,
    String holderName,
    int expMonth,
    int expYear,
    MoneyResponse balance,
    String status,
    Instant createdAt
) {}
