package com.mockbank.merchants.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.mockbank.credentials.api.dto.CredentialResponse;
import com.mockbank.credentials.domain.MerchantCredential;
import com.mockbank.credentials.repo.MerchantCredentialRepository;
import com.mockbank.merchants.api.dto.CreateMerchantRequest;
import com.mockbank.merchants.api.dto.MerchantResponse;
import com.mockbank.merchants.api.dto.UpdateMerchantRequest;
import com.mockbank.merchants.domain.Merchant;
import com.mockbank.merchants.repo.MerchantRepository;

@Service
public class MerchantService {

    private final MerchantRepository merchantRepo;
    private final MerchantCredentialRepository credentialRepo;

    public MerchantService(MerchantRepository merchantRepo, MerchantCredentialRepository credentialRepo) {
        this.merchantRepo = merchantRepo;
        this.credentialRepo = credentialRepo;
    }

    @Transactional(readOnly = true)
    public List<MerchantResponse> listAll() {
        return merchantRepo.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MerchantResponse getById(long id) {
        return toResponse(merchantRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchant not found")));
    }

    @Transactional
    public MerchantResponse create(CreateMerchantRequest req) {
        if (merchantRepo.findBySlug(req.slug()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already exists");
        }
        String mode = StringUtils.hasText(req.signingMode()) ? req.signingMode() : "RSA";
        Merchant m = new Merchant(req.name(), req.slug(), req.returnUrlSuccess(), req.returnUrlFailure(), req.webhookUrl(), mode);
        merchantRepo.save(m);
        return toResponse(m);
    }

    @Transactional
    public MerchantResponse update(long id, UpdateMerchantRequest req) {
        Merchant m = merchantRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchant not found"));
        if (StringUtils.hasText(req.name())) m.setName(req.name());
        if (StringUtils.hasText(req.slug())) m.setSlug(req.slug());
        if (req.returnUrlSuccess() != null) m.setReturnUrlSuccess(req.returnUrlSuccess());
        if (req.returnUrlFailure() != null) m.setReturnUrlFailure(req.returnUrlFailure());
        if (req.webhookUrl() != null) m.setWebhookUrl(req.webhookUrl());
        if (StringUtils.hasText(req.signingMode())) m.setSigningMode(req.signingMode());
        if (StringUtils.hasText(req.status())) m.setStatus(req.status());
        return toResponse(m);
    }

    private MerchantResponse toResponse(Merchant m) {
        List<CredentialResponse> creds = credentialRepo.findByMerchant_Id(m.getId()).stream()
                .map(this::toCredentialResponse).toList();
        return new MerchantResponse(m.getId(), m.getName(), m.getSlug(), m.getReturnUrlSuccess(),
                m.getReturnUrlFailure(), m.getWebhookUrl(), m.getSigningMode(), m.getStatus(), m.getCreatedAt(), creds);
    }

    private CredentialResponse toCredentialResponse(MerchantCredential c) {
        return new CredentialResponse(c.getId(), c.getType(), c.getSerial(), c.getFingerprintSha256(),
                c.getValidFrom(), c.getValidTo(), c.getRevokedAt());
    }
}
