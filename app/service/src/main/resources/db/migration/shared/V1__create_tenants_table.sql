CREATE TABLE IF NOT EXISTS tenants (
    id        BIGSERIAL    PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_tenant_id ON tenants (tenant_id);
