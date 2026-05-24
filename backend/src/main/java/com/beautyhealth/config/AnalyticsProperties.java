package com.beautyhealth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.analytics")
public class AnalyticsProperties {

    private String topic = "bh.analytics.events.v1";
    private final Kafka kafka = new Kafka();
    private final Outbox outbox = new Outbox();
    private final Service service = new Service();

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public Kafka getKafka() {
        return kafka;
    }

    public Outbox getOutbox() {
        return outbox;
    }

    public Service getService() {
        return service;
    }

    public static class Kafka {
        private boolean enabled = true;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
    }

    public static class Outbox {
        private long pollIntervalMs = 5000;
        private int batchSize = 50;

        public long getPollIntervalMs() {
            return pollIntervalMs;
        }

        public void setPollIntervalMs(long pollIntervalMs) {
            this.pollIntervalMs = pollIntervalMs;
        }

        public int getBatchSize() {
            return batchSize;
        }

        public void setBatchSize(int batchSize) {
            this.batchSize = batchSize;
        }
    }

    public static class Service {
        private String baseUrl = "http://localhost:8081";
        private String apiKey = "";

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }
    }
}
