package com.hks.config.tenant;

import java.util.concurrent.ConcurrentHashMap;
import javax.sql.DataSource;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@RequiredArgsConstructor
@Configuration
public class DataSourceConfig implements WebMvcConfigurer {

  private final TenantDataSourceProvider tenantDataSourceProvider;
  private final TenantInterceptor tenantInterceptor;

  @Bean
  @Primary
  public DataSource dataSource() {
    AbstractRoutingDataSource dataSource = new TenantDataSource(tenantDataSourceProvider);
    dataSource.setTargetDataSources(new ConcurrentHashMap<>());
    return dataSource;
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(tenantInterceptor);
  }
}
