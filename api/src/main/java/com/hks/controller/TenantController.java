package com.hks.controller;

import com.hks.config.tenant.TenantContext;
import com.hks.config.tenant.TenantDataSourceProvider;
import com.hks.entity.Tenant;
import com.hks.entity.TestRecord;
import com.hks.repository.tenant.TestRecordRepository;
import com.hks.tenant.TenantService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;
    private final TestRecordRepository testRecordRepository;

    // ── Tenant provisioning ─────────────────────────────────────────────────
    // These endpoints are excluded from X-Tenant-ID enforcement (see TenantInterceptor).

    @PostMapping("/v1/tenants")
    public ResponseEntity<TenantProvisionResponse> createTenant(
            @Valid @RequestBody TenantProvisionRequest request) {
        tenantService.createTenant(request.tenantId());
        String schema = TenantDataSourceProvider.SCHEMA_PREFIX + request.tenantId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new TenantProvisionResponse(request.tenantId(), schema));
    }

    @GetMapping("/v1/tenants")
    public Page<Tenant> listTenants(Pageable pageable) {
        return tenantService.getAllTenants(pageable);
    }

    // ── Tenant-scoped test endpoints ─────────────────────────────────────────
    // Require X-Tenant-ID header. Data is read/written to the tenant's own schema,
    // demonstrating that two tenants are fully isolated.

    @PostMapping("/v1/test/records")
    public ResponseEntity<TestRecord> createRecord(@Valid @RequestBody TestRecordRequest request) {
        TestRecord record = new TestRecord();
        record.setName(request.name());
        return ResponseEntity.status(HttpStatus.CREATED).body(testRecordRepository.save(record));
    }

    @GetMapping("/v1/test/records")
    public TestRecordsResponse listRecords() {
        String tenantId = TenantContext.getCurrentTenant();
        String schema = TenantDataSourceProvider.SCHEMA_PREFIX + tenantId;
        List<TestRecord> records = testRecordRepository.findAll();
        return new TestRecordsResponse(tenantId, schema, records);
    }

    // ── DTOs ─────────────────────────────────────────────────────────────────

    public record TenantProvisionRequest(@NotBlank String tenantId) {}

    public record TenantProvisionResponse(String tenantId, String schema) {}

    public record TestRecordRequest(@NotBlank String name) {}

    public record TestRecordsResponse(String tenantId, String schema, List<TestRecord> records) {}
}
