package com.mockbank.clients.api.dto;

import java.time.Instant;
import java.util.List;
import com.mockbank.cards.api.dto.CardResponse;

public record ClientResponse(
    long id,
    String fullName,
    String email,
    String taxId,
    String status,
    Instant createdAt,
    List<CardResponse> cards
) {}
