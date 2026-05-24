package com.beautyhealth.analytics.domain;

import java.time.Instant;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "analytics_events_raw")
public class AnalyticsEventRaw {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false, unique = true, length = 36)
    private String eventId;

    @Column(name = "event_type", nullable = false, length = 64)
    private String eventType;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "source", nullable = false, length = 16)
    private String source;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "payload_json", nullable = false)
    private String payloadJson;

    @Column(name = "ingested_at", nullable = false)
    private Instant ingestedAt;

    protected AnalyticsEventRaw() {
    }

    public AnalyticsEventRaw(String eventId, String eventType, Instant occurredAt, String source, String payloadJson) {
        this.eventId = eventId;
        this.eventType = eventType;
        this.occurredAt = occurredAt;
        this.source = source;
        this.payloadJson = payloadJson;
    }

    @PrePersist
    void onCreate() {
        if (ingestedAt == null) {
            ingestedAt = Instant.now();
        }
    }

    public String getEventId() {
        return eventId;
    }

    public String getEventType() {
        return eventType;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }
}
