package com.mockbank.hosted.api;

import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.mockbank.hosted.api.dto.HostedPaymentInfo;
import com.mockbank.hosted.api.dto.PayCardRequest;
import com.mockbank.hosted.api.dto.PayCardResponse;
import com.mockbank.hosted.service.HostedPaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/hosted", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class HostedPaymentController {

    private final HostedPaymentService hostedPaymentService;

    public HostedPaymentController(HostedPaymentService hostedPaymentService) {
        this.hostedPaymentService = hostedPaymentService;
    }

    @GetMapping("/{paymentRef}")
    public HostedPaymentInfo getInfo(@PathVariable String paymentRef) {
        return hostedPaymentService.getInfo(paymentRef);
    }

    @PostMapping(value = "/{paymentRef}/pay", consumes = MediaType.APPLICATION_JSON_VALUE)
    public PayCardResponse pay(@PathVariable String paymentRef, @Valid @RequestBody PayCardRequest request) {
        return hostedPaymentService.pay(paymentRef, request);
    }
}
