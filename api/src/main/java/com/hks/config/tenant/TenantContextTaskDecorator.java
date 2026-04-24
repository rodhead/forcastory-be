/** Copyright (c) 2024 Coupa Software Inc. All rights reserved. */
package com.hks.config.tenant;

import org.springframework.core.task.TaskDecorator;

/**
 * Propagates {@link TenantContext} from the submitting thread to the thread that executes the task.
 *
 * <p>Used by executors that run work asynchronously (e.g. audit log updates) so that tenant-routed
 * data access ({@link TenantDataSource}) uses the correct tenant instead of null, avoiding writes
 * to the default tenant database or failures.
 */
public class TenantContextTaskDecorator implements TaskDecorator {

  @Override
  public Runnable decorate(Runnable task) {
    BaseService baseService = TenantContext.getCurrentBaseService();
    return () -> {
      try {
        if (baseService != null) {
          TenantContext.setCurrentTenant(baseService);
        }
        task.run();
      } finally {
        TenantContext.clear();
      }
    };
  }
}
