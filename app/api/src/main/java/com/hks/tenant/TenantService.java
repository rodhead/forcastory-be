package com.hks.tenant;

import com.hks.config.tenant.TenantDataSourceProvider;
import com.hks.entity.Tenant;
import com.hks.exception.RecordAlreadyExistsException;
import com.hks.repository.tenant.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class TenantService {

    private final TenantDataSourceProvider tenantDataSourceProvider;
    private final TenantRepository tenantRepository;

    public void createTenant(String tenantId) {
        log.info("Creating tenant: {}", tenantId);
        if (tenantRepository.existsByTenantId(tenantId)) {
            log.warn("Tenant already exists: {}", tenantId);
            throw new RecordAlreadyExistsException("Tenant already exists: " + tenantId);
        }
        tenantDataSourceProvider.createNewSchema(tenantId);
        tenantRepository.save(Tenant.builder().tenantId(tenantId).build());
        log.info("Tenant '{}' created successfully", tenantId);
    }

    public Page<Tenant> getAllTenants(Pageable pageable) {
        log.debug("Fetching all tenants: page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());
        return tenantRepository.findAll(pageable);
    }
}
