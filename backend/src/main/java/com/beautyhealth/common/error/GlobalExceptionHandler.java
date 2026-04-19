package com.beautyhealth.common.error;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(GlobalExceptionHandler::formatFieldError)
                .toList();
        ApiError body = new ApiError(ErrorCodes.VALIDATION_FAILED, "Validation failed", details);
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException ex) {
        List<String> details = ex.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .toList();
        ApiError body = new ApiError(ErrorCodes.VALIDATION_FAILED, "Validation failed", details);
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex) {
        ApiError body = new ApiError(ErrorCodes.BAD_REQUEST, ex.getMessage() != null ? ex.getMessage() : "Bad request",
                List.of());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String msg = "Invalid value for parameter '" + ex.getName() + "'";
        ApiError body = new ApiError(ErrorCodes.BAD_REQUEST, msg, List.of());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex) {
        ApiError body = new ApiError(ErrorCodes.BAD_REQUEST, "Malformed JSON request body", List.of());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatus(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        String message = ex.getReason() != null ? ex.getReason() : status.getReasonPhrase();
        String code = switch (status) {
            case NOT_FOUND -> ErrorCodes.NOT_FOUND;
            case CONFLICT -> ErrorCodes.CONFLICT;
            case BAD_REQUEST -> ErrorCodes.BAD_REQUEST;
            case UNAUTHORIZED -> ErrorCodes.UNAUTHORIZED;
            case FORBIDDEN -> ErrorCodes.FORBIDDEN;
            case UNPROCESSABLE_ENTITY -> ErrorCodes.VALIDATION_FAILED;
            default -> ErrorCodes.ERROR;
        };
        ApiError body = new ApiError(code, message, List.of());
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> handleConflict(ConflictException ex) {
        String message = ex.getMessage() != null ? ex.getMessage() : "Conflict";
        log.warn("Conflict: {}", message);
        ApiError body = new ApiError(ErrorCodes.CONFLICT, message, List.of());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex) {
        ApiError body = new ApiError(ErrorCodes.CONFLICT, "Data integrity violation", List.of());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> handleEntityNotFound(EntityNotFoundException ex) {
        String message = ex.getMessage() != null ? ex.getMessage() : "Not found";
        ApiError body = new ApiError(ErrorCodes.NOT_FOUND, message, List.of());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler({ NoHandlerFoundException.class, NoResourceFoundException.class })
    public ResponseEntity<ApiError> handleNoHandler(Exception ex) {
        ApiError body = new ApiError(ErrorCodes.NOT_FOUND, "Resource not found", List.of());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiError> handleDataAccess(DataAccessException ex) {
        Throwable root = ex.getMostSpecificCause();
        String detail = root.getMessage() != null ? root.getMessage() : ex.getMessage();
        log.warn("Data access error: {}", detail);
        ApiError body = new ApiError(
                ErrorCodes.INTERNAL_ERROR,
                "Greška pri pristupu podacima (baza).",
                detail != null && !detail.isBlank() ? List.of(detail) : List.of());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex) {
        ApiError body = new ApiError(ErrorCodes.INTERNAL_ERROR, "An unexpected error occurred", List.of());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private static String formatFieldError(FieldError e) {
        return e.getField() + ": " + e.getDefaultMessage();
    }
}
