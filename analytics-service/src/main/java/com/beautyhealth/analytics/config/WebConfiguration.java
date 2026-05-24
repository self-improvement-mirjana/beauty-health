package com.beautyhealth.analytics.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebConfiguration {

    @Bean
    FilterRegistrationBean<ApiKeyAuthFilter> apiKeyFilter(ApiKeyAuthFilter filter) {
        FilterRegistrationBean<ApiKeyAuthFilter> bean = new FilterRegistrationBean<>(filter);
        bean.setOrder(1);
        return bean;
    }
}
