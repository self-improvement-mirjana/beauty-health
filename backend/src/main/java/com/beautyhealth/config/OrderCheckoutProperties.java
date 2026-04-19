package com.beautyhealth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.orders")
public class OrderCheckoutProperties {

    /**
     * Tekst isporuke koji se snima na narudžbinu (snapshot). Kasnije B09/CMS.
     */
    private String deliverySummaryText = "Rok isporuke: 3–5 radnih dana (stub).";

    public String getDeliverySummaryText() {
        return deliverySummaryText;
    }

    public void setDeliverySummaryText(String deliverySummaryText) {
        this.deliverySummaryText = deliverySummaryText;
    }
}
