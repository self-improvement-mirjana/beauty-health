package com.beautyhealth.auth.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import com.beautyhealth.auth.api.dto.AuthResponse;
import com.beautyhealth.auth.api.dto.PasswordResetInitiatedResponse;
import com.beautyhealth.auth.api.dto.UserResponse;
import com.beautyhealth.auth.service.AuthService;
import com.beautyhealth.auth.service.PasswordResetService;
import com.beautyhealth.common.error.ErrorCodes;
import com.beautyhealth.common.error.GlobalExceptionHandler;

@WebMvcTest(controllers = AuthController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AuthControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private PasswordResetService passwordResetService;

    @Test
    void loginValidationReturns422() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"not-an-email\",\"password\":\"x\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value(ErrorCodes.VALIDATION_FAILED));
    }

    @Test
    void loginSuccessReturnsToken() throws Exception {
        when(authService.login(any())).thenReturn(
                new AuthResponse("jwt-token", "Bearer", 3600, new UserResponse(1L, "a@b.test", "A", java.util.List.of("CUSTOMER"))));
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"a@b.test\",\"password\":\"secret12\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.user.email").value("a@b.test"));
    }

    @Test
    void forgotPasswordValidationReturns422() throws Exception {
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"bad\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value(ErrorCodes.VALIDATION_FAILED));
    }

    @Test
    void forgotPasswordReturnsMessage() throws Exception {
        when(passwordResetService.requestReset(any())).thenReturn(new PasswordResetInitiatedResponse("ok"));
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"a@b.test\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("ok"));
    }

    @Test
    void resetPasswordReturns204() throws Exception {
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"t\",\"newPassword\":\"Secret12\"}"))
                .andExpect(status().isNoContent());
    }

    @Test
    void patchMeValidationReturns422() throws Exception {
        mockMvc.perform(patch("/api/v1/auth/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value(ErrorCodes.VALIDATION_FAILED));
    }

    @Test
    void patchMeReturnsUpdatedUser() throws Exception {
        when(authService.updateProfile(any())).thenReturn(
                new UserResponse(1L, "a@b.test", "Nova Osoba", List.of("CUSTOMER")));
        mockMvc.perform(patch("/api/v1/auth/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Nova Osoba\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Nova Osoba"));
    }

    @Test
    void changePasswordValidationReturns422() throws Exception {
        mockMvc.perform(post("/api/v1/auth/me/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"x\",\"newPassword\":\"short\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value(ErrorCodes.VALIDATION_FAILED));
    }

    @Test
    void changePasswordReturns204() throws Exception {
        mockMvc.perform(post("/api/v1/auth/me/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"oldSecret1\",\"newPassword\":\"newSecret1\"}"))
                .andExpect(status().isNoContent());
    }
}
