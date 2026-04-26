package com.mockbank.credentials.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.mockbank.credentials.api.dto.IssueCredentialRequest;
import com.mockbank.credentials.api.dto.IssueCredentialResponse;
import com.mockbank.credentials.api.dto.RevealResponse;
import com.mockbank.credentials.service.CredentialService;

import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/admin/merchants/{merchantId}/credentials", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class CredentialController {

    private final CredentialService credentialService;

    public CredentialController(CredentialService credentialService) {
        this.credentialService = credentialService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<IssueCredentialResponse> issue(@PathVariable long merchantId, @Valid @RequestBody IssueCredentialRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(credentialService.issue(merchantId, request));
    }

    @PostMapping("/{credentialId}/reveal")
    public RevealResponse reveal(@PathVariable long merchantId, @PathVariable long credentialId) {
        return credentialService.reveal(merchantId, credentialId);
    }

    @PostMapping("/{credentialId}/revoke")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revoke(@PathVariable long merchantId, @PathVariable long credentialId) {
        credentialService.revoke(merchantId, credentialId);
    }
}
