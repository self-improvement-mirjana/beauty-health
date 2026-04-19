package com.beautyhealth.config;

import java.util.List;

import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.tags.Tag;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfiguration {

    @Bean
    public OpenApiCustomizer beautyHealthOpenApiCustomizer() {
        return openApi -> {
            openApi.setInfo(new Info()
                    .title("beauty-health API")
                    .version("v1")
                    .description("REST API for storefront and moderator clients. "
                            + "All routes are under `/api/v1/...`. "
                            + "Errors use schema `ApiError` with fields `code`, `message`, `details`."));
            openApi.addTagsItem(new Tag().name("moderation").description("Moderatorske operacije (ROLE_MODERATOR, JWT)."));
            Components components = openApi.getComponents() != null ? openApi.getComponents() : new Components();
            openApi.setComponents(components);
            Schema<?> moneyResponse = new Schema<>()
                    .type("object")
                    .description("Canonical money JSON (see docs/API_MONEY.md).")
                    .addProperty("amount", new StringSchema()
                            .description("Decimal amount as string with two fractional digits.")
                            .example("3600.00"))
                    .addProperty("currency", new StringSchema()
                            .description("ISO 4217 code; v1 uses RSD only.")
                            .example("RSD")
                            ._enum(List.of("RSD")));
            components.addSchemas("ApiError", apiErrorSchema());
            components.addSchemas("MoneyResponse", moneyResponse);
            components.addSecuritySchemes("bearer-jwt", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Send `Authorization: Bearer <accessToken>` from `POST /api/v1/auth/login`."));
        };
    }

    private static Schema<?> apiErrorSchema() {
        return new Schema<>()
                .type("object")
                .addProperty("code", new StringSchema().example("VALIDATION_FAILED"))
                .addProperty("message", new StringSchema().example("Validation failed"))
                .addProperty("details", new Schema<>()
                        .type("array")
                        .items(new StringSchema().example("name: must not be blank")));
    }
}
