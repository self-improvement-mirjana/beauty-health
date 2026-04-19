package com.beautyhealth.content.api;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.content.api.dto.RetailLocationResponse;
import com.beautyhealth.content.read.ContentReadService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping(value = "/api/v1/locations", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicRetailLocationController {

    private final ContentReadService contentReadService;

    public PublicRetailLocationController(ContentReadService contentReadService) {
        this.contentReadService = contentReadService;
    }

    @GetMapping
    @Operation(summary = "Lista aktivnih maloprodajnih lokacija (spec. odjeljak 8)")
    public List<RetailLocationResponse> listLocations() {
        return contentReadService.listRetailLocations();
    }
}
