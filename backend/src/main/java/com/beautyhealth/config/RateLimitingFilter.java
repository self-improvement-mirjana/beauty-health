package com.beautyhealth.config;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import com.beautyhealth.common.error.ApiError;
import com.beautyhealth.common.error.ErrorCodes;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * In-memory rate limits (Bucket4j + Caffeine) for abuse-prone public writes (B12).
 */
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Pattern PRODUCT_REVIEW_POST = Pattern.compile("^/api/v1/products/[^/]+/reviews$");

    private final RateLimitProperties properties;
    private final ObjectMapper objectMapper;
    private final Cache<String, Bucket> loginBuckets;
    private final Cache<String, Bucket> reviewBuckets;

    public RateLimitingFilter(RateLimitProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.loginBuckets = Caffeine.newBuilder().maximumSize(50_000).expireAfterAccess(Duration.ofHours(4)).build();
        this.reviewBuckets = Caffeine.newBuilder().maximumSize(50_000).expireAfterAccess(Duration.ofHours(4)).build();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!properties.isEnabled()) {
            return true;
        }
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }
        return !HttpMethod.POST.matches(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();

        if ("/api/v1/auth/login".equals(path) || "/api/v1/auth/forgot-password".equals(path)
                || "/api/v1/auth/reset-password".equals(path)) {
            String ip = clientIp(request);
            Bucket bucket = loginBuckets.get(ip, k -> createLoginBucket());
            ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
            if (!probe.isConsumed()) {
                writeTooManyRequests(response, probe);
                return;
            }
        } else if (PRODUCT_REVIEW_POST.matcher(path).matches()) {
            String ip = clientIp(request);
            Bucket bucket = reviewBuckets.get(ip, k -> createReviewBucket());
            ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
            if (!probe.isConsumed()) {
                writeTooManyRequests(response, probe);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private void writeTooManyRequests(HttpServletResponse response, ConsumptionProbe probe) throws IOException {
        response.setStatus(429);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        long retryAfter = Math.max(1L, TimeUnit.NANOSECONDS.toSeconds(probe.getNanosToWaitForRefill()));
        response.setHeader(HttpHeaders.RETRY_AFTER, Long.toString(retryAfter));
        objectMapper.writeValue(response.getOutputStream(),
                new ApiError(ErrorCodes.RATE_LIMITED, "Too many requests", List.of()));
    }

    private Bucket createLoginBucket() {
        int n = properties.getLoginPerMinute();
        Bandwidth limit = Bandwidth.builder().capacity(n).refillGreedy(n, Duration.ofMinutes(1)).build();
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket createReviewBucket() {
        int n = properties.getReviewPostsPerHour();
        Bandwidth limit = Bandwidth.builder().capacity(n).refillGreedy(n, Duration.ofHours(1)).build();
        return Bucket.builder().addLimit(limit).build();
    }

    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String ip = request.getRemoteAddr();
        return ip == null ? "unknown" : ip;
    }
}
