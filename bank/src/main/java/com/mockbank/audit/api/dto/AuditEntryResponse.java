package com.mockbank.audit.api.dto;

import java.time.Instant;

public record AuditEntryResponse(
    long id,
    String actorType,
    String actorId,
    String action,
    String target,
    String metadataJson,
    Instant createdAt
) {}
