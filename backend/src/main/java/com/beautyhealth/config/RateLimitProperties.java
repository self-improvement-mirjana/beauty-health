package com.beautyhealth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.rate-limit")
public class RateLimitProperties {

    /**
     * When false, rate limiting is skipped (useful for most integration tests).
     */
    private boolean enabled = true;

    /**
     * Max successful {@code POST /api/v1/auth/login} attempts per client IP per minute.
     */
    private int loginPerMinute = 10;

    /**
     * Max POST requests to {@code /api/v1/products/{slug}/reviews} per client IP per hour.
     */
    private int reviewPostsPerHour = 5;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getLoginPerMinute() {
        return loginPerMinute;
    }

    public void setLoginPerMinute(int loginPerMinute) {
        this.loginPerMinute = Math.max(1, loginPerMinute);
    }

    public int getReviewPostsPerHour() {
        return reviewPostsPerHour;
    }

    public void setReviewPostsPerHour(int reviewPostsPerHour) {
        this.reviewPostsPerHour = Math.max(1, reviewPostsPerHour);
    }
}
