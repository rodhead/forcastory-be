package com.hks.config.tenant;

import com.hks.exception.InvalidTenantIdException;
import com.hks.util.StringUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Locale;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
public class TenantInterceptor implements HandlerInterceptor {

    @Value("${app.dev-mode.enabled:false}")
    private boolean devModeEnabled;

    private static final List<String> EXCLUDED_PATHS =
            List.of("/v1/tenants", "/v1/health", "/health", "/swagger-ui", "/api-docs", "/v3/api-docs");

    public static final List<String> DOMAIN_SUFFIXES =
            List.of(".coupadev.com", ".coupahost.com", ".coupacloud.com", ".coupadev.net");

    private static final String LOCALE_HEADER = "locale";
    private static final String TENANT_HEADER = "X-tenantId";

    @Override
    public boolean preHandle(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull Object handler) {

        String requestURI = request.getRequestURI();
        String localeHeader = request.getHeader(LOCALE_HEADER);
        String tenantId = request.getHeader(TENANT_HEADER);

        setLocale(localeHeader);

        boolean isExcluded = EXCLUDED_PATHS.stream().anyMatch(requestURI::startsWith);
        if (isExcluded) {
            return true;
        }

        validateTenantId(tenantId);

        BaseService baseService = devModeEnabled
                ? new BaseService(tenantId, 1L, 1L, "Dev User", localeHeader, "", request.getServerName())
                : new BaseService(tenantId);

        TenantContext.setCurrentTenant(baseService);
        return true;
    }

    @Override
    public void afterCompletion(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull Object handler,
            Exception ex) {
        TenantContext.clear();
        LocaleContextHolder.resetLocaleContext();
    }

    private static void validateTenantId(String tenantId) {
        if (StringUtils.isBlankOrEmpty(tenantId)) {
            throw new InvalidTenantIdException("Missing " + TENANT_HEADER + " header");
        }
        if (DOMAIN_SUFFIXES.stream().noneMatch(tenantId::endsWith)
                && !tenantId.matches("^[a-zA-Z0-9_]+$")) {
            throw new InvalidTenantIdException(
                    "Invalid X-Tenant-ID: must be alphanumeric with underscores or a known domain suffix. Got: "
                            + tenantId);
        }
    }

    private void setLocale(String locale) {
        if (!StringUtils.isBlankOrEmpty(locale)) {
            LocaleContextHolder.setLocale(Locale.forLanguageTag(locale));
        } else {
            LocaleContextHolder.setLocale(Locale.getDefault());
        }
    }
}
