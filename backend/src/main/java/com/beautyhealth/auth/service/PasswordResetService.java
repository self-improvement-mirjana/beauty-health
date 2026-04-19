package com.beautyhealth.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.beautyhealth.auth.api.dto.PasswordResetInitiatedResponse;
import com.beautyhealth.auth.domain.AppUser;
import com.beautyhealth.auth.domain.PasswordResetToken;
import com.beautyhealth.auth.repo.AppUserRepository;
import com.beautyhealth.auth.repo.PasswordResetTokenRepository;
import com.beautyhealth.config.PasswordResetProperties;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    private static final String GENERIC_FORGOT_MESSAGE =
            "If an account exists for this email, password reset instructions have been sent.";

    private final AppUserRepository appUserRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetProperties properties;
    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetService(AppUserRepository appUserRepository, PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder, PasswordResetProperties properties) {
        this.appUserRepository = appUserRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Transactional
    public PasswordResetInitiatedResponse requestReset(String rawEmail) {
        String email = rawEmail.trim().toLowerCase();
        AppUser user = appUserRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user != null) {
            Instant now = Instant.now();
            invalidatePendingTokens(user.getId(), now);
            String plainToken = newPlainToken();
            String hash = sha256Hex(plainToken);
            Instant expiresAt = now.plus(properties.getTokenValidityHours(), ChronoUnit.HOURS);
            passwordResetTokenRepository.save(new PasswordResetToken(user, hash, expiresAt));
            String link = properties.getStorefrontBaseUrl() + "/reset-password?token=" + plainToken;
            log.info("Password reset requested for {}; reset link (deliver via email in production): {}", email, link);
        }
        return new PasswordResetInitiatedResponse(GENERIC_FORGOT_MESSAGE);
    }

    @Transactional
    public void completeReset(String rawToken, String newPassword) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset link");
        }
        String hash = sha256Hex(rawToken.trim());
        PasswordResetToken row = passwordResetTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset link"));
        Instant now = Instant.now();
        if (!row.isActive(now)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset link");
        }
        Long userId = row.getUser().getId();
        invalidatePendingTokens(userId, now);
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset link"));
        user.applyPasswordHash(passwordEncoder.encode(newPassword));
        appUserRepository.save(user);
    }

    private void invalidatePendingTokens(Long userId, Instant when) {
        var pending = passwordResetTokenRepository.findByUser_IdAndUsedAtIsNull(userId);
        for (PasswordResetToken t : pending) {
            t.markUsed(when);
        }
        passwordResetTokenRepository.saveAll(pending);
    }

    private String newPlainToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
