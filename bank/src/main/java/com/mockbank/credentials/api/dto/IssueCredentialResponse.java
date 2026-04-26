package com.mockbank.credentials.api.dto;

public record IssueCredentialResponse(
    long id,
    String serial,
    String type,
    String fingerprintSha256,
    String privateKeyPem,
    String hmacSecret,
    String publicKeyPem
) {}
