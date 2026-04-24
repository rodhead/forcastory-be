CREATE TABLE IF NOT EXISTS test_records (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenant_details (
    id             BIGSERIAL    PRIMARY KEY,
    tenant_id      VARCHAR(255) NOT NULL,
    property_key   VARCHAR(255) NOT NULL,
    property_value TEXT,
    UNIQUE (tenant_id, property_key)
);
