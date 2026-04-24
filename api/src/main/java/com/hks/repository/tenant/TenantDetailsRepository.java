package com.hks.repository.tenant;

import com.hks.entity.TenantDetails;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TenantDetailsRepository extends JpaRepository<TenantDetails, Long> {

    Optional<TenantDetails> findByTenantIdAndPropertyKey(String tenantId, String propertyKey);

    List<TenantDetails> findByTenantId(String tenantId);
}
