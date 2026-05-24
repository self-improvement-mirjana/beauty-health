package com.beautyhealth.moderation.api.dto;

import java.math.BigDecimal;

public record AdminKpiSummaryResponse(long orderCount, BigDecimal revenueTotal) {
}
