package com.mockbank.audit.api;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import com.mockbank.audit.api.dto.AuditEntryResponse;
import com.mockbank.audit.domain.AuditLog;
import com.mockbank.audit.service.AuditService;

@RestController
@RequestMapping(value = "/api/v1/admin/audit", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public List<AuditEntryResponse> list(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        return auditService.list(page, size).map(this::toResponse).getContent();
    }

    private AuditEntryResponse toResponse(AuditLog a) {
        return new AuditEntryResponse(a.getId(), a.getActorType(), a.getActorId(), a.getAction(), a.getTarget(), a.getMetadataJson(), a.getCreatedAt());
    }
}
