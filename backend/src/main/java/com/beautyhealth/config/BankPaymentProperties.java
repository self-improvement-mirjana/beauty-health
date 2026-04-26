package com.beautyhealth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.bank")
public class BankPaymentProperties {

    private String baseUrl = "http://localhost:8090";
    private String merchantSlug = "beauty-health";
    private String signingMode = "RSA";
    private String privateKeyPem = "";
    private String bankPublicKeyPem = "";

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
    public String getMerchantSlug() { return merchantSlug; }
    public void setMerchantSlug(String merchantSlug) { this.merchantSlug = merchantSlug; }
    public String getSigningMode() { return signingMode; }
    public void setSigningMode(String signingMode) { this.signingMode = signingMode; }
    public String getPrivateKeyPem() { return privateKeyPem; }
    public void setPrivateKeyPem(String privateKeyPem) { this.privateKeyPem = privateKeyPem; }
    public String getBankPublicKeyPem() { return bankPublicKeyPem; }
    public void setBankPublicKeyPem(String bankPublicKeyPem) { this.bankPublicKeyPem = bankPublicKeyPem; }
}
