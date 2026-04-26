package com.mockbank.audit.domain;

import java.time.Instant;

import jakarta.persistence.*;

@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_type", nullable = false, length = 32)
    private String actorType;

    @Column(name = "actor_id", nullable = false, length = 128)
    private String actorId;

    @Column(nullable = false, length = 128)
    private String action;

    @Column(length = 255)
    private String target;

    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected AuditLog() {}

    public AuditLog(String actorType, String actorId, String action, String target, String metadataJson) {
        this.actorType = actorType;
        this.actorId = actorId;
        this.action = action;
        this.target = target;
        this.metadataJson = metadataJson;
    }

    @PrePersist void onCreate() { createdAt = Instant.now(); }

    public Long getId() { return id; }
    public String getActorType() { return actorType; }
    public String getActorId() { return actorId; }
    public String getAction() { return action; }
    public String getTarget() { return target; }
    public String getMetadataJson() { return metadataJson; }
    public Instant getCreatedAt() { return createdAt; }
}
