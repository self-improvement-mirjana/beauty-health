package com.beautyhealth.moderation.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.beautyhealth.auth.domain.AppUser;
import com.beautyhealth.auth.domain.Role;
import com.beautyhealth.auth.repo.AppUserRepository;
import com.beautyhealth.moderation.api.dto.AdminUserResponse;
import com.beautyhealth.order.repo.ShopOrderRepository;

@Service
@Transactional(readOnly = true)
public class ModerationUserSupportService {

    private final AppUserRepository appUserRepository;
    private final ShopOrderRepository shopOrderRepository;

    public ModerationUserSupportService(AppUserRepository appUserRepository, ShopOrderRepository shopOrderRepository) {
        this.appUserRepository = appUserRepository;
        this.shopOrderRepository = shopOrderRepository;
    }

    public AdminUserResponse getUserById(long id) {
        AppUser user = appUserRepository.findDetailedById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toResponse(user);
    }

    public AdminUserResponse getUserByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Query parameter email is required and must not be blank");
        }
        AppUser user = appUserRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toResponse(user);
    }

    private AdminUserResponse toResponse(AppUser user) {
        List<String> roles = user.getRoles().stream().map(Role::getName).sorted().toList();
        long orderCount = shopOrderRepository.countByUser_Id(user.getId());
        return new AdminUserResponse(user.getId(), user.getEmail(), user.getFullName(), roles, user.getCreatedAt(), orderCount);
    }
}
