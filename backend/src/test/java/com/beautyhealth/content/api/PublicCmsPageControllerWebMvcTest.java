package com.beautyhealth.content.api;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import com.beautyhealth.common.error.ErrorCodes;
import com.beautyhealth.common.error.GlobalExceptionHandler;
import com.beautyhealth.content.api.dto.CmsPageResponse;
import com.beautyhealth.content.read.ContentReadService;

@WebMvcTest(controllers = PublicCmsPageController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class PublicCmsPageControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ContentReadService contentReadService;

    @Test
    void unknownSlugReturns404WithApiError() throws Exception {
        when(contentReadService.getPublishedPage(eq("nepostoji")))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Page not found"));

        mockMvc.perform(get("/api/v1/pages/nepostoji").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(ErrorCodes.NOT_FOUND));
    }

    @Test
    void knownSlugReturnsPageJson() throws Exception {
        when(contentReadService.getPublishedPage(eq("kontakt")))
                .thenReturn(new CmsPageResponse("kontakt", "Kontakt", "# x"));

        mockMvc.perform(get("/api/v1/pages/kontakt").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("kontakt"))
                .andExpect(jsonPath("$.title").value("Kontakt"));
    }
}
