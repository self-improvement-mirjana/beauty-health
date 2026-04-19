package com.beautyhealth.moderation;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

import com.beautyhealth.auth.security.RestAccessDeniedHandler;
import com.beautyhealth.auth.security.RestAuthenticationEntryPoint;
import com.fasterxml.jackson.databind.ObjectMapper;

@TestConfiguration
@EnableWebSecurity
public class ModerationWebMvcSecurityConfig {

    @Bean
    RestAuthenticationEntryPoint restAuthenticationEntryPoint(ObjectMapper objectMapper) {
        return new RestAuthenticationEntryPoint(objectMapper);
    }

    @Bean
    RestAccessDeniedHandler restAccessDeniedHandler(ObjectMapper objectMapper) {
        return new RestAccessDeniedHandler(objectMapper);
    }

    @Bean
    public SecurityFilterChain moderationWebMvcSecurityFilterChain(HttpSecurity http,
            RestAuthenticationEntryPoint authenticationEntryPoint, RestAccessDeniedHandler accessDeniedHandler)
            throws Exception {
        return http.csrf(AbstractHttpConfigurer::disable)
                .anonymous(AbstractHttpConfigurer::disable)
                .exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(reg -> reg.requestMatchers("/api/v1/admin/**").hasRole("MODERATOR").anyRequest().denyAll())
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .build();
    }
}
