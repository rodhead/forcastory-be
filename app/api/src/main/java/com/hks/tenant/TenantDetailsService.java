package com.hks.tenant;

import com.hks.config.tenant.TenantContext;
import com.hks.entity.TenantDetails;
import com.hks.repository.tenant.TenantDetailsRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantDetailsService {

    private final TenantDetailsRepository tenantDetailsRepository;

    @Transactional
    public void saveProperty(String tenantId, String propertyKey, String propertyValue) {
        log.info("Saving property: tenant={}, key={}", tenantId, propertyKey);
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalArgumentException("Tenant ID cannot be null or empty");
        }
        if (propertyKey == null || propertyKey.trim().isEmpty()) {
            throw new IllegalArgumentException("Property key cannot be null or empty");
        }

        Optional<TenantDetails> existing =
                tenantDetailsRepository.findByTenantIdAndPropertyKey(tenantId, propertyKey);

        if (existing.isPresent()) {
            log.debug("Updating existing property: tenant={}, key={}", tenantId, propertyKey);
            TenantDetails details = existing.get();
            details.setPropertyValue(propertyValue);
            tenantDetailsRepository.save(details);
        } else {
            log.debug("Creating new property: tenant={}, key={}", tenantId, propertyKey);
            TenantDetails details = new TenantDetails();
            details.setTenantId(tenantId);
            details.setPropertyKey(propertyKey);
            details.setPropertyValue(propertyValue);
            tenantDetailsRepository.save(details);
        }
        log.info("Property saved: tenant={}, key={}", tenantId, propertyKey);
    }

    @Transactional(readOnly = true)
    public Optional<String> getProperty(String tenantId, String propertyKey) {
        log.debug("Fetching property: tenant={}, key={}", tenantId, propertyKey);
        String originalTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant(tenantId);
            return tenantDetailsRepository
                    .findByTenantIdAndPropertyKey(tenantId, propertyKey)
                    .map(TenantDetails::getPropertyValue);
        } finally {
            if (originalTenant != null) {
                TenantContext.setCurrentTenant(originalTenant);
            } else {
                TenantContext.clear();
            }
        }
    }

    @Transactional(readOnly = true)
    public List<TenantDetails> getAllProperties(String tenantId) {
        log.info("Fetching all properties for tenant: {}", tenantId);
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalArgumentException("Tenant ID cannot be null or empty");
        }
        List<TenantDetails> properties = tenantDetailsRepository.findByTenantId(tenantId);
        log.info("Found {} properties for tenant: {}", properties.size(), tenantId);
        return properties;
    }
}
