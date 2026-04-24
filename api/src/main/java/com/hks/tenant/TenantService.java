package com.hks.tenant;

import com.hks.config.tenant.TenantDataSourceProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Slf4j
@RequiredArgsConstructor
@Component
public class TenantService {

  private final TenantDataSourceProvider tenantDataSourceProvider;
  private final TenantRepository tenantRepository;

  public void createTenant(String tenantId) {
    tenantDataSourceProvider.createNewSchema(tenantId);
    tenantRepository.save(Tenant.builder().tenantId(tenantId).build());
  }

  public Page<Tenant> getAllTenants(Pageable pageable) {
    return tenantRepository.findAll(pageable);
  }
}
