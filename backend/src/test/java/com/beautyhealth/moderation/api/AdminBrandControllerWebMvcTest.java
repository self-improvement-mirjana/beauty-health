package com.beautyhealth.moderation.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.beautyhealth.common.error.ErrorCodes;
import com.beautyhealth.common.error.GlobalExceptionHandler;
import com.beautyhealth.moderation.ModerationWebMvcSecurityConfig;
import com.beautyhealth.moderation.api.dto.AdminBrandRequest;
import com.beautyhealth.moderation.api.dto.AdminBrandResponse;
import com.beautyhealth.moderation.service.ModerationCatalogWriteService;

@WebMvcTest(controllers = AdminBrandController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@Import({ModerationWebMvcSecurityConfig.class, GlobalExceptionHandler.class})
class AdminBrandControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ModerationCatalogWriteService moderationCatalogWriteService;

    @Test
    @WithMockUser(roles = "MODERATOR")
    void createBrandAsModeratorReturns201() throws Exception {
        when(moderationCatalogWriteService.createBrand(any(AdminBrandRequest.class)))
                .thenReturn(new AdminBrandResponse(99L, "Nova", "nova-marka"));

        mockMvc.perform(post("/api/v1/admin/brands").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Nova\",\"slug\":\"nova-marka\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("nova-marka"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void createBrandAsCustomerReturns403() throws Exception {
        mockMvc.perform(post("/api/v1/admin/brands").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"X\",\"slug\":\"x-marka\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(ErrorCodes.FORBIDDEN));
    }

    @Test
    void createBrandWithoutAuthReturns401() throws Exception {
        mockMvc.perform(post("/api/v1/admin/brands").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"X\",\"slug\":\"x-marka\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCodes.UNAUTHORIZED));
    }
}
