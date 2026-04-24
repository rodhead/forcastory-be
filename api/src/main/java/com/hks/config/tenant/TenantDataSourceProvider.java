package com.hks.config.tenant;

import com.coupa.logging.annotations.LogContext;
import com.coupa.util.ElasticsearchIndexUtil;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.sql.DataSource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class TenantDataSourceProvider {

    private final Map<String, DataSource> dataSourceMap = new ConcurrentHashMap<>();
    private final HikariConfig hikariConfig;
    private final ECClient ecClient;

    @Value("${spring.elasticsearch.enabled:false}")
    private boolean elasticsearchEnabled;

    private static final String DEFAULT_TENANT_ID = "default";

    @Autowired
    public TenantDataSourceProvider(HikariConfig hikariConfig, ECClient ecClient) {

        this.hikariConfig = hikariConfig;
        this.ecClient = ecClient;
    }

    public DataSource getDataSource(String tenantId) {
        if (StringUtils.isBlank(tenantId)) {
            return dataSourceMap.computeIfAbsent(DEFAULT_TENANT_ID, id -> createDefaultDataSource());
        }
        return dataSourceMap.computeIfAbsent(tenantId, id -> createDataSource(tenantId));
    }

    private DataSource createDefaultDataSource() {

        log.info("Creating default data source");
        HikariConfig config = new HikariConfig();
        hikariConfig.copyStateTo(config);
        return new HikariDataSource(config);
    }

    public DataSource createDataSource(String tenantId) {
        try {
            log.info("Creating data source for tenant: {}", tenantId);
            HikariConfig config = new HikariConfig();
            hikariConfig.copyStateTo(config);
            config.setJdbcUrl(
                    hikariConfig
                            .getJdbcUrl()
                            .replace(DEFAULT_TENANT_ID, tenantId)
                            .replace("?createDatabaseIfNotExist=true", ""));
            HikariDataSource dataSource = new HikariDataSource(config);

            Flyway.configure()
                    .dataSource(dataSource)
                    .locations("classpath:db/migration/shared")
                    .load()
                    .migrate();

            return dataSource;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create data source for tenant: " + tenantId, e);
        }
    }

    public void createNewSchema(String tenantId) {

        log.info("Creating new database for tenant: {}", tenantId);
        HikariConfig config = new HikariConfig();
        hikariConfig.copyStateTo(config);
        config.setJdbcUrl(hikariConfig.getJdbcUrl().replace(DEFAULT_TENANT_ID, tenantId));

        HikariDataSource dataSource = new HikariDataSource(config);
        Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration/shared")
                .load()
                .migrate();
        dataSource.close();
        try {
            createIndexForTenant(tenantId);
        } catch (Exception e) {
            log.error("Failed to create elasticsearch index for tenant: {} ", tenantId, e);
        }
    }

    public void createIndexForTenant(String tenantId) {
        if (elasticsearchEnabled) {
            ElasticsearchIndexUtil.createIndicesForTenant(ecClient.getElasticsearchClient(), tenantId);
        } else {
            log.info("Elasticsearch index creation skipped as spring.elasticsearch.enabled is false");
        }
    }
}
