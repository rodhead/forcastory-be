package com.hks.config.tenant;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.sql.DataSource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class TenantDataSourceProvider {

    public static final String SCHEMA_PREFIX = "forcastory_service_";
    private static final String MASTER_KEY = "master";

    private final Map<String, DataSource> dataSourceMap = new ConcurrentHashMap<>();

    @Value("${spring.datasource.url}")
    private String jdbcUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    /**
     * Returns the datasource for the given tenant, or the master datasource if tenantId is blank.
     * Datasources are created lazily and cached for the lifetime of the application.
     */
    public DataSource getDataSource(String tenantId) {
        if (StringUtils.isBlank(tenantId)) {
            return dataSourceMap.computeIfAbsent(MASTER_KEY, id -> buildDataSource(jdbcUrl, MASTER_KEY));
        }
        String schemaName = SCHEMA_PREFIX + tenantId;
        // Append currentSchema so every connection in the pool targets the tenant schema by default.
        return dataSourceMap.computeIfAbsent(
                tenantId, id -> buildDataSource(jdbcUrl + "?currentSchema=" + schemaName, tenantId));
    }

    /**
     * Creates the schema for a new tenant and runs Flyway tenant migrations against it.
     * Flyway creates the schema if it does not yet exist.
     */
    public void createNewSchema(String tenantId) {
        if (!tenantId.matches("^[a-zA-Z0-9_]+$")) {
            throw new IllegalArgumentException("Tenant ID contains invalid characters: " + tenantId);
        }
        String schemaName = SCHEMA_PREFIX + tenantId;
        log.info("Provisioning schema '{}' for tenant '{}'", schemaName, tenantId);

        Flyway.configure()
                .dataSource(getDataSource(null))
                .schemas(schemaName)
                .locations("classpath:db/migration/tenant")
                .load()
                .migrate();

        log.info("Schema '{}' provisioned successfully", schemaName);
    }

    private DataSource buildDataSource(String url, String poolName) {
        log.info("Creating HikariCP pool '{}'", poolName);
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setPoolName("HikariPool-" + poolName);
        return new HikariDataSource(config);
    }
}
