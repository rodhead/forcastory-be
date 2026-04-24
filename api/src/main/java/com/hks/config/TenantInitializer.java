package com.hks.config;

import com.hks.tenant.TenantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TenantInitializer implements ApplicationRunner {

    private final TenantService tenantService;

    @Value("${app.default-tenant-id:default}")
    private String defaultTenantId;

    @Override
    public void run(ApplicationArguments args) {
        try {
            tenantService.createTenant(defaultTenantId);
            log.info("Default tenant '{}' provisioned", defaultTenantId);
        } catch (Exception e) {
            // Already exists — nothing to do
            log.info("Default tenant '{}' already exists, skipping", defaultTenantId);
        }
    }
}
