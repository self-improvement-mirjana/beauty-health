package com.beautyhealth.analytics.api.dto;

import java.util.List;

public record AnalyticsIngestResponse(int acceptedCount, int rejectedCount, List<String> rejectedEventIds) {
}
