package com.hks.config.tenant;

import static com.hks.config.tenant.TenantInterceptor.DOMAIN_SUFFIXES;

import javax.sql.DataSource;
import org.apache.commons.lang3.StringUtils;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;
import org.springframework.lang.NonNull;

public class TenantDataSource extends AbstractRoutingDataSource {

  private final TenantDataSourceProvider tenantDataSourceProvider;

  public TenantDataSource(TenantDataSourceProvider tenantDataSourceProvider) {
    this.tenantDataSourceProvider = tenantDataSourceProvider;
  }

  @Override
  protected Object determineCurrentLookupKey() {
    return TenantContext.getCurrentTenant();
  }

  @NonNull
  @Override
  protected DataSource determineTargetDataSource() {
    String tenantId =
        DOMAIN_SUFFIXES.stream().reduce(TenantContext.getCurrentTenant(), StringUtils::removeEnd);
    return tenantDataSourceProvider.getDataSource(tenantId);
  }
}
