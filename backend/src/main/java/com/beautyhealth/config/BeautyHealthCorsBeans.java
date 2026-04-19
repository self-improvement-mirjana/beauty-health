package com.beautyhealth.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class BeautyHealthCorsBeans {

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource(CorsProperties corsProperties) {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        List<String> origins = corsProperties.getAllowedOrigins();
        if (origins == null || origins.isEmpty()) {
            return source;
        }
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        config.setAllowedHeaders(List.of("*"));
        /* B06: gost korpa vraća token u odgovoru — mora biti čitljiv iz JS (storefront na drugom originu). */
        config.setExposedHeaders(List.of("X-Guest-Cart-Token"));
        config.setMaxAge(3600L);
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
