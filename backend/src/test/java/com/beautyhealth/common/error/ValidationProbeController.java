package com.beautyhealth.common.error;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping(value = "/api/v1/_probe", produces = MediaType.APPLICATION_JSON_VALUE)
class ValidationProbeController {

    record Body(@NotBlank String name) {
    }

    @PostMapping(value = "/validate", consumes = MediaType.APPLICATION_JSON_VALUE)
    void validate(@Valid @RequestBody Body body) {
        // Intentionally empty — used only to exercise validation + GlobalExceptionHandler in tests.
    }
}
