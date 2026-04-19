package com.beautyhealth.review.api;

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
import org.springframework.test.web.servlet.MockMvc;

import com.beautyhealth.common.error.ErrorCodes;
import com.beautyhealth.common.error.GlobalExceptionHandler;
import com.beautyhealth.review.service.ProductReviewService;

@WebMvcTest(controllers = ProductReviewController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@Import(GlobalExceptionHandler.class)
class ProductReviewControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductReviewService productReviewService;

    @Test
    void postReviewInvalidRatingReturns422() throws Exception {
        mockMvc.perform(post("/api/v1/products/p/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"authorName\":\"X\",\"authorEmail\":\"x@y.com\",\"rating\":6,\"body\":\"Hi\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value(ErrorCodes.VALIDATION_FAILED));
    }
}
