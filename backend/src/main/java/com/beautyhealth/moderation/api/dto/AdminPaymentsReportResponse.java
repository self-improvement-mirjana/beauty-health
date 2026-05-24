package com.beautyhealth.moderation.api.dto;

import java.math.BigDecimal;

public record AdminPaymentsReportResponse(long successCount, long failureCount, BigDecimal successRatePercent) {
}
