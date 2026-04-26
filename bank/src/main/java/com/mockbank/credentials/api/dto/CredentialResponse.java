package com.mockbank.credentials.api.dto;

import java.time.Instant;

public record CredentialResponse(
    long id,
    String type,
    String serial,
    String fingerprintSha256,
    Instant validFrom,
    Instant validTo,
    Instant revokedAt
) {}
