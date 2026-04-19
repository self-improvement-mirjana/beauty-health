package com.beautyhealth.auth.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.beautyhealth.auth.api.dto.AuthResponse;
import com.beautyhealth.auth.api.dto.ChangePasswordRequest;
import com.beautyhealth.auth.api.dto.ForgotPasswordRequest;
import com.beautyhealth.auth.api.dto.LoginRequest;
import com.beautyhealth.auth.api.dto.PasswordResetInitiatedResponse;
import com.beautyhealth.auth.api.dto.RegisterRequest;
import com.beautyhealth.auth.api.dto.ResetPasswordRequest;
import com.beautyhealth.auth.api.dto.UpdateProfileRequest;
import com.beautyhealth.auth.api.dto.UserResponse;
import com.beautyhealth.auth.service.AuthService;
import com.beautyhealth.auth.service.PasswordResetService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/auth", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Registracija kupca (uloga CUSTOMER)")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Prijava; vraća JWT access token (Bearer)")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping(value = "/forgot-password", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Zaboravljena lozinka — generiše token (link se trenutno loguje; u produkciji slati e-poštom)")
    public PasswordResetInitiatedResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return passwordResetService.requestReset(request.email());
    }

    @PostMapping(value = "/reset-password", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Postavljanje nove lozinke pomoću tokena iz linka")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.completeReset(request.token(), request.newPassword());
    }

    @PostMapping("/logout")
    @Operation(summary = "Odjava (JWT: klijent odbaci token; server ne drži sesiju)")
    @SecurityRequirement(name = "bearer-jwt")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout() {
        // Stateless JWT — no server-side session to invalidate in v1.
    }

    @GetMapping("/me")
    @Operation(summary = "Trenutni korisnik")
    @SecurityRequirement(name = "bearer-jwt")
    public UserResponse me() {
        return authService.currentUser();
    }

    @PatchMapping(value = "/me", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Ažuriranje imena i prezimena na nalogu")
    @SecurityRequirement(name = "bearer-jwt")
    public UserResponse updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        return authService.updateProfile(request);
    }

    @PostMapping(value = "/me/change-password", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Promena lozinke (trenutna + nova)")
    @SecurityRequirement(name = "bearer-jwt")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
    }
}
