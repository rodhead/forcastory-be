package com.hks.controller;

import com.hks.config.tenant.TenantContext;
import com.hks.config.tenant.TenantDataSourceProvider;
import com.hks.entity.Tenant;
import com.hks.entity.TestRecord;
import com.hks.repository.tenant.TestRecordRepository;
import com.hks.tenant.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "Tenant Management", description = "Tenant provisioning and tenant-scoped data operations")
public class TenantController {

    private final TenantService tenantService;
    private final TestRecordRepository testRecordRepository;

    // ── Tenant provisioning ─────────────────────────────────────────────────

    @Operation(summary = "Provision a new tenant", description = "Creates a dedicated schema and runs migrations for the given tenant ID")
    @ApiResponse(responseCode = "201", description = "Tenant provisioned successfully")
    @ApiResponse(responseCode = "409", description = "Tenant already exists")
    @PostMapping("/v1/tenants")
    public ResponseEntity<TenantProvisionResponse> createTenant(
            @Valid @RequestBody TenantProvisionRequest request) {
        log.info("Provisioning tenant: {}", request.tenantId());
        tenantService.createTenant(request.tenantId());
        String schema = TenantDataSourceProvider.SCHEMA_PREFIX + request.tenantId();
        log.info("Tenant provisioned: tenantId={}, schema={}", request.tenantId(), schema);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new TenantProvisionResponse(request.tenantId(), schema));
    }

    @Operation(summary = "List all tenants")
    @ApiResponse(responseCode = "200", description = "Paginated list of tenants")
    @GetMapping("/v1/tenants")
    public Page<Tenant> listTenants(Pageable pageable) {
        log.info("Fetching all tenants: page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());
        Page<Tenant> result = tenantService.getAllTenants(pageable);
        log.info("Returning {} tenants (total={})", result.getNumberOfElements(), result.getTotalElements());
        return result;
    }

    // ── Tenant-scoped test endpoints ─────────────────────────────────────────

    @Operation(summary = "Create a test record in the current tenant's schema")
    @ApiResponse(responseCode = "201", description = "Record created")
    @PostMapping("/v1/test/records")
    public ResponseEntity<TestRecord> createRecord(@Valid @RequestBody TestRecordRequest request) {
        String tenantId = TenantContext.getCurrentTenant();
        log.info("Creating test record: tenant={}, name={}", tenantId, request.name());
        TestRecord record = new TestRecord();
        record.setName(request.name());
        TestRecord saved = testRecordRepository.save(record);
        log.info("Test record created: tenant={}, id={}", tenantId, saved.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @Operation(summary = "List test records for the current tenant")
    @ApiResponse(responseCode = "200", description = "Records from the tenant's schema")
    @GetMapping("/v1/test/records")
    public TestRecordsResponse listRecords() {
        String tenantId = TenantContext.getCurrentTenant();
        String schema = TenantDataSourceProvider.SCHEMA_PREFIX + tenantId;
        log.info("Fetching test records: tenant={}, schema={}", tenantId, schema);
        List<TestRecord> records = testRecordRepository.findAll();
        log.info("Returning {} records for tenant={}", records.size(), tenantId);
        return new TestRecordsResponse(tenantId, schema, records);
    }

    // ── DTOs ─────────────────────────────────────────────────────────────────

    public record TenantProvisionRequest(@NotBlank String tenantId) {}

    public record TenantProvisionResponse(String tenantId, String schema) {}

    public record TestRecordRequest(@NotBlank String name) {}

    public record TestRecordsResponse(String tenantId, String schema, List<TestRecord> records) {}
}
