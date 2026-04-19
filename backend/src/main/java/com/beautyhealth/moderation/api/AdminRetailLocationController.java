package com.beautyhealth.moderation.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.moderation.api.dto.AdminRetailLocationRequest;
import com.beautyhealth.moderation.api.dto.AdminRetailLocationResponse;
import com.beautyhealth.moderation.service.ModerationContentWriteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/admin/retail-locations", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "moderation")
@SecurityRequirement(name = "bearer-jwt")
public class AdminRetailLocationController {

    private final ModerationContentWriteService moderationContentWriteService;

    public AdminRetailLocationController(ModerationContentWriteService moderationContentWriteService) {
        this.moderationContentWriteService = moderationContentWriteService;
    }

    @GetMapping
    @Operation(summary = "Lista maloprodajnih lokacija (retail_location)")
    public List<AdminRetailLocationResponse> list() {
        return moderationContentWriteService.listRetailLocations();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Kreiranje maloprodajne lokacije")
    public AdminRetailLocationResponse create(@RequestBody @Valid AdminRetailLocationRequest request) {
        return moderationContentWriteService.createRetailLocation(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Izmena maloprodajne lokacije")
    public AdminRetailLocationResponse update(@PathVariable long id, @RequestBody @Valid AdminRetailLocationRequest request) {
        return moderationContentWriteService.updateRetailLocation(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Brisanje maloprodajne lokacije")
    public void delete(@PathVariable long id) {
        moderationContentWriteService.deleteRetailLocation(id);
    }
}
