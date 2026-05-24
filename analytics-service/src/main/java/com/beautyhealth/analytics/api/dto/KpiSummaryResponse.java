package com.beautyhealth.analytics.api.dto;

import java.math.BigDecimal;

public record KpiSummaryResponse(long orderCount, BigDecimal revenueTotal) {
}
