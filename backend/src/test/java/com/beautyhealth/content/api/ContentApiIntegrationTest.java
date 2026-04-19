package com.beautyhealth.content.api;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.beautyhealth.common.error.ErrorCodes;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ContentApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void cmsPageBySeedSlug() throws Exception {
        mockMvc.perform(get("/api/v1/pages/kontakt"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("kontakt"))
                .andExpect(jsonPath("$.bodyMarkdown").value(containsString("podrska@beauty-health.example")));
    }

    @Test
    void cmsPageUnknownSlugReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/pages/nepostoji-nikad"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(ErrorCodes.NOT_FOUND));
    }

    @Test
    void retailLocationsNonEmpty() throws Exception {
        mockMvc.perform(get("/api/v1/locations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").exists())
                .andExpect(jsonPath("$[0].hoursText").exists());
    }

    @Test
    void blogListingAndDetail() throws Exception {
        mockMvc.perform(get("/api/v1/blog").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.content[0].slug").exists());

        mockMvc.perform(get("/api/v1/blog/novi-katalog-prolece-2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("novi-katalog-prolece-2026"))
                .andExpect(jsonPath("$.bodyMarkdown").exists());
    }

    @Test
    void blogUnknownSlugReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/blog/nepostojeci-clanak"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(ErrorCodes.NOT_FOUND));
    }
}
