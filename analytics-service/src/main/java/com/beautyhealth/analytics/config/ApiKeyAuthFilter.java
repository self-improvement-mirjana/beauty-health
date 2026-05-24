package com.beautyhealth.analytics.config;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-API-Key";

    private final AnalyticsServiceProperties properties;

    public ApiKeyAuthFilter(AnalyticsServiceProperties properties) {
        this.properties = properties;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith("/api/v1/reports/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String provided = request.getHeader(HEADER);
        String expected = properties.getApiKey();
        if (expected == null || expected.isBlank() || !expected.equals(provided)) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Invalid or missing API key");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
