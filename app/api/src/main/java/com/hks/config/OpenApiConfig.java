package com.hks.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Forcastory API")
                        .description("Multi-tenant forecasting service")
                        .version("1.0.0")
                        .contact(new Contact().name("HKS")));
    }

    /** Injects the X-tenantId header parameter into every non-excluded operation. */
    @Bean
    public OperationCustomizer tenantHeaderCustomizer() {
        return (operation, handlerMethod) -> {
            boolean isTenantEndpoint = handlerMethod.getBeanType().getName().contains("TenantController")
                    && operation.getOperationId() != null
                    && (operation.getOperationId().contains("createTenant")
                            || operation.getOperationId().contains("listTenants"));
            if (!isTenantEndpoint) {
                operation.addParametersItem(
                        new HeaderParameter()
                                .name("X-tenantId")
                                .description("Tenant identifier")
                                .required(true));
            }
            return operation;
        };
    }
}
