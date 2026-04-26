package com.mockbank.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "bank")
public class BankProperties {

    private String masterKey;
    private CorsProps cors = new CorsProps();
    private JwtProps jwt = new JwtProps();
    private WebhookProps webhook = new WebhookProps();
    private SigningProps signing = new SigningProps();

    public String getMasterKey() { return masterKey; }
    public void setMasterKey(String masterKey) { this.masterKey = masterKey; }
    public CorsProps getCors() { return cors; }
    public void setCors(CorsProps cors) { this.cors = cors; }
    public JwtProps getJwt() { return jwt; }
    public void setJwt(JwtProps jwt) { this.jwt = jwt; }
    public WebhookProps getWebhook() { return webhook; }
    public void setWebhook(WebhookProps webhook) { this.webhook = webhook; }
    public SigningProps getSigning() { return signing; }
    public void setSigning(SigningProps signing) { this.signing = signing; }

    public static class CorsProps {
        private List<String> allowedOrigins = List.of();
        public List<String> getAllowedOrigins() { return allowedOrigins; }
        public void setAllowedOrigins(List<String> allowedOrigins) { this.allowedOrigins = allowedOrigins; }
    }

    public static class JwtProps {
        private String secret;
        private int expirationMinutes = 120;
        public String getSecret() { return secret; }
        public void setSecret(String secret) { this.secret = secret; }
        public int getExpirationMinutes() { return expirationMinutes; }
        public void setExpirationMinutes(int expirationMinutes) { this.expirationMinutes = expirationMinutes; }
    }

    public static class WebhookProps {
        private int maxRetries = 3;
        private long initialDelayMs = 1000;
        public int getMaxRetries() { return maxRetries; }
        public void setMaxRetries(int maxRetries) { this.maxRetries = maxRetries; }
        public long getInitialDelayMs() { return initialDelayMs; }
        public void setInitialDelayMs(long initialDelayMs) { this.initialDelayMs = initialDelayMs; }
    }

    public static class SigningProps {
        private int timestampToleranceSeconds = 300;
        private int nonceCacheSize = 10000;
        private int nonceCacheTtlMinutes = 10;
        public int getTimestampToleranceSeconds() { return timestampToleranceSeconds; }
        public void setTimestampToleranceSeconds(int s) { this.timestampToleranceSeconds = s; }
        public int getNonceCacheSize() { return nonceCacheSize; }
        public void setNonceCacheSize(int s) { this.nonceCacheSize = s; }
        public int getNonceCacheTtlMinutes() { return nonceCacheTtlMinutes; }
        public void setNonceCacheTtlMinutes(int m) { this.nonceCacheTtlMinutes = m; }
    }
}
