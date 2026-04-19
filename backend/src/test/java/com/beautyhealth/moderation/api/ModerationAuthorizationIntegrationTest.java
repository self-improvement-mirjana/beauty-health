package com.beautyhealth.moderation.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.beautyhealth.common.error.ErrorCodes;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ModerationAuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void customerCannotPostAdminBrand() throws Exception {
        String registerJson = """
                {"email":"cust-mod@example.com","password":"custMod1","fullName":"Customer"}""";
        MvcResult reg = mockMvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(registerJson))
                .andExpect(status().isCreated())
                .andReturn();
        String token = objectMapper.readTree(reg.getResponse().getContentAsString()).get("accessToken").asText();

        mockMvc.perform(post("/api/v1/admin/brands").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"X\",\"slug\":\"x-brand-slug-test\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(ErrorCodes.FORBIDDEN));
    }
}
