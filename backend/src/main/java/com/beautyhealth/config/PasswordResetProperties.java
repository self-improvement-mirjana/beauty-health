package com.beautyhealth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.password-reset")
public class PasswordResetProperties {

    /**
     * Storefront origin (no trailing slash). Used to build reset links logged for operators / future e-mail.
     */
    private String storefrontBaseUrl = "http://localhost:5173";

    /**
     * How long a reset token remains valid after {@code POST /auth/forgot-password}.
     */
    private int tokenValidityHours = 2;

    public String getStorefrontBaseUrl() {
        return storefrontBaseUrl;
    }

    public void setStorefrontBaseUrl(String storefrontBaseUrl) {
        this.storefrontBaseUrl = storefrontBaseUrl == null ? "" : storefrontBaseUrl.replaceAll("/+$", "");
    }

    public int getTokenValidityHours() {
        return tokenValidityHours;
    }

    public void setTokenValidityHours(int tokenValidityHours) {
        this.tokenValidityHours = Math.max(1, tokenValidityHours);
    }
}
