package com.hks.config.tenant;

public final class TenantContext {
  private static final ThreadLocal<BaseService> CURRENT_TENANT = new ThreadLocal<>();

  private TenantContext() {}

  public static String getCurrentTenant() {
    if (CURRENT_TENANT.get() != null) {
      return CURRENT_TENANT.get().getTenantId();
    }
    return null;
  }

  public static void setCurrentTenant(String tenant) {
    CURRENT_TENANT.set(new BaseService(tenant));
  }

  public static void setCurrentTenant(BaseService baseService) {
    if (baseService != null) {
      CURRENT_TENANT.set(baseService);
    }
  }

  public static Long getUserId() {
    BaseService baseService = getCurrentBaseService();
    if (baseService == null) {
      return 0L;
    }
    Long userId = baseService.getUserId();
    return userId != null ? userId : 0L;
  }

  public static BaseService getCurrentBaseService() {
    return CURRENT_TENANT.get();
  }

  public static void clear() {
    CURRENT_TENANT.remove();
  }
}
