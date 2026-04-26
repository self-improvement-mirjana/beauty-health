package com.mockbank.audit.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mockbank.audit.domain.AuditLog;
import com.mockbank.audit.repo.AuditLogRepository;

@Service
public class AuditService {

    private final AuditLogRepository auditRepo;

    public AuditService(AuditLogRepository auditRepo) {
        this.auditRepo = auditRepo;
    }

    @Transactional
    public void log(String actorType, String actorId, String action, String target, String metadataJson) {
        auditRepo.save(new AuditLog(actorType, actorId, action, target, metadataJson));
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> list(int page, int size) {
        return auditRepo.findAllByOrderByCreatedAtDesc(PageRequest.of(page, Math.min(size, 100)));
    }
}
