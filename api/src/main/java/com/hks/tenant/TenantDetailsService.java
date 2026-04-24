package com.hks.tenant;

import com.hks.config.tenant.TenantContext;
import com.hks.entity.TenantDetails;
import com.hks.repository.tenant.TenantDetailsRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TenantDetailsService {

    private final TenantDetailsRepository tenantDetailsRepository;

    @Transactional
    public void saveProperty(String tenantId, String propertyKey, String propertyValue) {
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalArgumentException("Tenant ID cannot be null or empty");
        }
        if (propertyKey == null || propertyKey.trim().isEmpty()) {
            throw new IllegalArgumentException("Property key cannot be null or empty");
        }

        Optional<TenantDetails> existing =
                tenantDetailsRepository.findByTenantIdAndPropertyKey(tenantId, propertyKey);

        if (existing.isPresent()) {
            TenantDetails details = existing.get();
            details.setPropertyValue(propertyValue);
            tenantDetailsRepository.save(details);
        } else {
            TenantDetails details = new TenantDetails();
            details.setTenantId(tenantId);
            details.setPropertyKey(propertyKey);
            details.setPropertyValue(propertyValue);
            tenantDetailsRepository.save(details);
        }
    }

    @Transactional(readOnly = true)
    public Optional<String> getProperty(String tenantId, String propertyKey) {
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
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalArgumentException("Tenant ID cannot be null or empty");
        }
        return tenantDetailsRepository.findByTenantId(tenantId);
    }
}
