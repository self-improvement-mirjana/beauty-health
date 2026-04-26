package com.mockbank.credentials.api.dto;

public record RevealResponse(String privateKeyPem, String hmacSecret) {}
