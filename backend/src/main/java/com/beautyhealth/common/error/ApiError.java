package com.beautyhealth.common.error;

import java.util.List;

/**
 * Standard JSON error body for all public REST handlers (see B02).
 *
 * @param code machine-oriented code (stable string, e.g. {@code VALIDATION_FAILED})
 * @param message human-readable summary
 * @param details optional field-level or contextual messages
 */
public record ApiError(String code, String message, List<String> details) {

    public ApiError(String code, String message) {
        this(code, message, List.of());
    }
}
