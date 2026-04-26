package com.mockbank.merchants.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.mockbank.merchants.api.dto.CreateMerchantRequest;
import com.mockbank.merchants.api.dto.MerchantResponse;
import com.mockbank.merchants.api.dto.UpdateMerchantRequest;
import com.mockbank.merchants.service.MerchantService;

import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/admin/merchants", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class MerchantController {

    private final MerchantService merchantService;

    public MerchantController(MerchantService merchantService) {
        this.merchantService = merchantService;
    }

    @GetMapping
    public List<MerchantResponse> list() {
        return merchantService.listAll();
    }

    @GetMapping("/{id}")
    public MerchantResponse get(@PathVariable long id) {
        return merchantService.getById(id);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MerchantResponse> create(@Valid @RequestBody CreateMerchantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(merchantService.create(request));
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public MerchantResponse update(@PathVariable long id, @RequestBody UpdateMerchantRequest request) {
        return merchantService.update(id, request);
    }
}
