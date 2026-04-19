package com.beautyhealth.auth.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.beautyhealth.common.error.ErrorCodes;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void meWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCodes.UNAUTHORIZED));
    }

    @Test
    void registerLoginAndMe() throws Exception {
        String registerJson = """
                {"email":"buyer-int@example.com","password":"buyerPw1","fullName":"Buyer Int"}""";
        MvcResult reg = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andReturn();
        String token = objectMapper.readTree(reg.getResponse().getContentAsString()).get("accessToken").asText();

        mockMvc.perform(get("/api/v1/auth/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("buyer-int@example.com"))
                .andExpect(jsonPath("$.roles[0]").value("CUSTOMER"));
    }

    @Test
    void adminPingWithoutAuthReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/ping"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCodes.UNAUTHORIZED));
    }

    @Test
    void adminPingAsCustomerReturns403() throws Exception {
        String registerJson = """
                {"email":"cust-admin@example.com","password":"custAdm1","fullName":"Cust"}""";
        MvcResult reg = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode body = objectMapper.readTree(reg.getResponse().getContentAsString());
        String token = body.get("accessToken").asText();

        mockMvc.perform(get("/api/v1/admin/ping").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(ErrorCodes.FORBIDDEN));
    }

    @Test
    void patchMeWithoutTokenReturns401() throws Exception {
        mockMvc.perform(patch("/api/v1/auth/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"X\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCodes.UNAUTHORIZED));
    }

    @Test
    void registerUpdateProfileAndChangePassword() throws Exception {
        String registerJson = """
                {"email":"profile-flow@example.com","password":"initialP1","fullName":"Staro Ime"}""";
        MvcResult reg = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().isCreated())
                .andReturn();
        String token = objectMapper.readTree(reg.getResponse().getContentAsString()).get("accessToken").asText();

        mockMvc.perform(patch("/api/v1/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Novo Ime\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Novo Ime"));

        mockMvc.perform(post("/api/v1/auth/me/change-password")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"initialP1\",\"newPassword\":\"updatedP1\"}"))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"profile-flow@example.com\",\"password\":\"updatedP1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
    }

    @Test
    void loginWithBadPasswordReturns401() throws Exception {
        String registerJson = """
                {"email":"bad-login@example.com","password":"goodPass1","fullName":"X"}""";
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"bad-login@example.com\",\"password\":\"wrongPass1\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(ErrorCodes.UNAUTHORIZED));
    }
}
