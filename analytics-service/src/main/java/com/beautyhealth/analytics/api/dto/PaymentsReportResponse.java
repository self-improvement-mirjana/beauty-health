package com.beautyhealth.analytics.api.dto;

import java.math.BigDecimal;

public record PaymentsReportResponse(long successCount, long failureCount, BigDecimal successRatePercent) {
}
