package com.hks.config.tenant;

import com.hks.util.StringUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.net.URI;
import java.net.URISyntaxException;
import java.text.ParseException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

public class TenantInterceptor  implements HandlerInterceptor{

    private final ApplicationContext applicationContext;

    @Value("true")
    private boolean devModeEnabled;

    private static final List<String> EXCLUDED_PATHS =
            List.of("/v1/tenants", "/v1/health", "/health", "/swagger-ui", "/api-docs");

    public static final List<String> DOMAIN_SUFFIXES =
            List.of(".coupadev.com", ".coupahost.com", ".coupacloud.com", ".coupadev.net");

    private static final String LOCALE_HEADER = "locale";
    private static final String TENANT_HEADER = "X-Tenant-ID";

    @Override
    public boolean preHandle(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull Object handler) {
        String requestURI = request.getRequestURI();
        String languageHeader = request.getHeader(LOCALE_HEADER);
        String tenantId = request.getHeader(TENANT_HEADER);

        setLocale(languageHeader);
        boolean isExcluded = EXCLUDED_PATHS.stream().anyMatch(requestURI::startsWith);
        boolean isOauthProxy = SecurityPathMatchers.OAUTH_EXCLUSION_MATCHER.matches(request);
        boolean isDMSPropertiesRequest = SecurityPathMatchers.DMS_PROPERTIES_MATCHER.matches(request);

        if (!isExcluded) {
            validateTenantId(tenantId);
            TenantContext.setCurrentTenant(tenantId);
        }

        if (!isExcluded
                && SecurityPathMatchers.DMS_PATH_MATCHER.matches(request)
                && !isOauthProxy
                && !isDMSPropertiesRequest) {
            BaseService baseService = authenticateAndBuildBaseService(request, tenantId, languageHeader);
            if (baseService != null) {
                TenantContext.setCurrentTenant(baseService);
                setLocale(baseService.getLocale());
            }
        }
        return true;
    }

    private static void validateTenantId(String tenantId) {
        if (StringUtils.isBlankOrEmpty(tenantId)) {
            throw new InvalidTenantIdException("Missing " + TENANT_HEADER + " header");
        }
        if (DOMAIN_SUFFIXES.stream().noneMatch(tenantId::endsWith)
                && !tenantId.matches("^[a-zA-Z0-9_]+$")) {
            throw new InvalidTenantIdException(
                    "Invalid X-Tenant-ID header. Must be a valid domain or alphanumeric with underscores, X-Tenant-ID="
                            + tenantId);
        }
    }

    private BaseService authenticateAndBuildBaseService(
            HttpServletRequest request, String tenantId, String language) {

        if (devModeEnabled) {
            return new BaseService(tenantId, 1L, 1L, "Dev Mode User", language, "", "");
        } else {
            String serverName = request.getServerName();
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

            if (!SecurityPathMatchers.DMS_PATH_MATCHER.matches(request)) {
                return null;
            }

            if (StringUtils.isBlankOrEmpty(authHeader) || !authHeader.startsWith("Bearer ")) {
                throw new InvalidAccessTokenException("Missing or malformed Authorization header");
            }
            String accessToken = authHeader.substring(7);

            try {
                Map<String, Object> claims = validateAndExtractClaims(accessToken, request);
                Long coreUserId = (Long) claims.get("userId");
                String displayName = (String) claims.get("displayName");

                UserContext userContext = applicationContext.getBean(UserContext.class);
                User user = userContext.getOrCreateUser(coreUserId, displayName);
                Long userId = (user != null) ? user.getId() : 1L;

                return new BaseService(
                        tenantId, userId, coreUserId, displayName, language, accessToken, serverName);

            } catch (InvalidAccessTokenException e) {
                log.error("Authentication failed: {}", e.getMessage());
                throw e;
            } catch (Exception e) {
                log.error("Failed to validate and extract claims for BOM request", e);
                throw new InvalidAccessTokenException("Invalid Authorization header");
            }
        }
    }

    private void setLocale(String locale) {
        if (!StringUtils.isBlankOrEmpty(locale)) {
            LocaleContextHolder.setLocale(Locale.forLanguageTag(locale));
        } else {
            LocaleContextHolder.setLocale(Locale.getDefault());
        }
    }

    private void validateIssuer(String issuer, String serverName) throws InvalidAccessTokenException {
        if (issuer == null) {
            throw new InvalidAccessTokenException("AccessToken is missing issuer claim");
        }
        try {
            URI issuerUri = new URI(issuer);
            String host = issuerUri.getHost();
            if (host == null || !host.equals(serverName)) {
                throw new InvalidAccessTokenException("AccessToken has invalid issuer");
            }
        } catch (URISyntaxException e) {
            throw new InvalidAccessTokenException("Invalid issuer format in token");
        }
    }

    private Map<String, Object> validateAndExtractClaims(
            String accessToken, HttpServletRequest request) throws InvalidAccessTokenException {

        try {
            SignedJWT signedJWT = SignedJWT.parse(accessToken);
            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
            Object userIdClaim = claims.getClaim("user_id");
            String subject = claims.getSubject();
            String id = userIdClaim != null ? userIdClaim.toString() : null;
            if (id == null) {
                throw new InvalidAccessTokenException("User ID claim is missing after validation");
            }

            validateSubject(subject, id);
            validateExpirationTime(claims);
            validateAudience(claims);

            // This call can throw InvalidAccessTokenException or URISyntaxException
            validateIssuer(claims.getIssuer(), request.getServerName());

            Map<String, Object> extracted = new HashMap<>();
            extracted.put("userId", Long.valueOf(id));
            extracted.put("displayName", subject);

            return extracted;

        } catch (InvalidAccessTokenException e) {
            throw e;
        } catch (ParseException e) {
            throw new InvalidAccessTokenException("Token is not a valid JWT format", e);
        } catch (NumberFormatException e) {
            throw new InvalidAccessTokenException("Claim 'user_id' is not a valid number format", e);
        } catch (Exception e) {
            throw new InvalidAccessTokenException(
                    "An unexpected error occurred during token processing", e);
        }
    }

    private static void validateAudience(JWTClaimsSet claims) {
        if (claims.getAudience() == null || !claims.getAudience().contains("core")) {
            throw new InvalidAccessTokenException("AccessToken has invalid audience");
        }
    }

    private static void validateExpirationTime(JWTClaimsSet claims) {
        if (claims.getExpirationTime() == null || claims.getExpirationTime().before(new Date())) {
            throw new InvalidAccessTokenException("AccessToken is expired");
        }
    }

    private static void validateSubject(String subject, String id) {
        if (StringUtils.isBlankOrEmpty(subject) || StringUtils.isBlankOrEmpty(id)) {
            throw new InvalidAccessTokenException("Token is missing required 'sub' or 'user_id' claim");
        }
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
}

