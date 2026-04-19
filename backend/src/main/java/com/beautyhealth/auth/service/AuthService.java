package com.beautyhealth.auth.service;

import java.util.Comparator;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.beautyhealth.auth.api.dto.AuthResponse;
import com.beautyhealth.auth.api.dto.ChangePasswordRequest;
import com.beautyhealth.auth.api.dto.LoginRequest;
import com.beautyhealth.auth.api.dto.RegisterRequest;
import com.beautyhealth.auth.api.dto.UpdateProfileRequest;
import com.beautyhealth.auth.api.dto.UserResponse;
import com.beautyhealth.auth.domain.AppUser;
import com.beautyhealth.auth.domain.Role;
import com.beautyhealth.auth.repo.AppUserRepository;
import com.beautyhealth.auth.repo.RoleRepository;
import com.beautyhealth.auth.security.JwtService;
import com.beautyhealth.common.error.ConflictException;

@Service
public class AuthService {

    private static final String ROLE_CUSTOMER = "CUSTOMER";

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AppUserRepository appUserRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email already registered");
        }
        Role customer = roleRepository.findByName(ROLE_CUSTOMER)
                .orElseThrow(() -> new IllegalStateException("Role CUSTOMER is missing; check Liquibase seed"));
        AppUser user = new AppUser(email, passwordEncoder.encode(request.password()), request.fullName().trim());
        user.addRole(customer);
        appUserRepository.save(user);
        return buildAuthResponse(appUserRepository.findDetailedById(user.getId()).orElse(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        AppUser user = appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        AppUser detailed = appUserRepository.findDetailedById(user.getId()).orElse(user);
        return buildAuthResponse(detailed);
    }

    @Transactional(readOnly = true)
    public UserResponse currentUser() {
        AppUser detailed = requireCurrentUserEntity();
        return toUserResponse(detailed);
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        AppUser user = requireCurrentUserEntity();
        user.setFullName(request.fullName().trim());
        appUserRepository.save(user);
        AppUser refreshed = appUserRepository.findDetailedById(user.getId()).orElse(user);
        return toUserResponse(refreshed);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        AppUser user = requireCurrentUserEntity();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Trenutna lozinka nije ispravna.");
        }
        user.applyPasswordHash(passwordEncoder.encode(request.newPassword()));
        appUserRepository.save(user);
    }

    private AppUser requireCurrentUserEntity() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof AppUser user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return appUserRepository.findDetailedById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private AuthResponse buildAuthResponse(AppUser user) {
        String token = jwtService.createAccessToken(user);
        return new AuthResponse(token, "Bearer", jwtService.getExpirationSeconds(), toUserResponse(user));
    }

    private static UserResponse toUserResponse(AppUser user) {
        var roles = user.getRoles().stream()
                .map(Role::getName)
                .sorted(Comparator.naturalOrder())
                .toList();
        return new UserResponse(user.getId(), user.getEmail(), user.getFullName(), roles);
    }
}
