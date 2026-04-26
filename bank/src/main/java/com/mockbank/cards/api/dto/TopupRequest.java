package com.mockbank.cards.api.dto;

import jakarta.validation.constraints.Positive;

public record TopupRequest(@Positive double amount) {}
