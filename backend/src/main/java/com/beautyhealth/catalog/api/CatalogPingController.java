package com.beautyhealth.catalog.api;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.common.money.MoneyResponse;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping(value = "/api/v1/catalog", produces = MediaType.APPLICATION_JSON_VALUE)
public class CatalogPingController {

    @GetMapping("/ping")
    public Map<String, Object> ping() {
        return Map.of("slice", "catalog", "ok", true);
    }

    @GetMapping("/money-format-example")
    @Operation(summary = "Primer formata novca u JSON-u (vidi docs/API_MONEY.md)")
    public MoneyResponse moneyFormatExample() {
        return new MoneyResponse("3600.00", "RSD");
    }
}
