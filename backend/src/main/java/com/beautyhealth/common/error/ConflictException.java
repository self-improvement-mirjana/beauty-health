package com.beautyhealth.common.error;

/**
 * Thrown when an operation conflicts with current state (HTTP 409). Example: insufficient stock.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
