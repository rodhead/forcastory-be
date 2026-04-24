package com.hks.repository.tenant;

import com.hks.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {

    boolean existsByTenantId(String tenantId);
}
