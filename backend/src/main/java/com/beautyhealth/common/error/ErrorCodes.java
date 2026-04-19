package com.beautyhealth.common.error;

/**
 * Stable {@link ApiError#code()} values shared across slices.
 */
public final class ErrorCodes {

    public static final String VALIDATION_FAILED = "VALIDATION_FAILED";
    public static final String BAD_REQUEST = "BAD_REQUEST";
    public static final String UNAUTHORIZED = "UNAUTHORIZED";
    public static final String FORBIDDEN = "FORBIDDEN";
    public static final String NOT_FOUND = "NOT_FOUND";
    public static final String CONFLICT = "CONFLICT";
    /** HTTP 429 — rate limiting (B12). */
    public static final String RATE_LIMITED = "RATE_LIMITED";
    public static final String INTERNAL_ERROR = "INTERNAL_ERROR";
    /** Generic / fallback when mapping from {@link org.springframework.web.server.ResponseStatusException}. */
    public static final String ERROR = "ERROR";

    private ErrorCodes() {
    }
}
