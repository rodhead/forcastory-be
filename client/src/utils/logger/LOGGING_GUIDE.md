# Logging Implementation Guide

## Overview

This project implements enterprise-grade logging following Apache Log4j performance best practices.

## Key Features

### 1. **Lazy Evaluation (Log4j Performance Best Practice)**

````typescript
# Logging Implementation Guide

## Overview
This project implements enterprise-grade logging following Apache Log4j performance best practices with graceful error handling.

## Key Features

### 1. **Lazy Evaluation (Log4j Performance Best Practice)**
```typescript
//  Good: Expensive operation only runs if DEBUG is enabled
logger.debug(() => `Complex data: ${JSON.stringify(largeObject)}`);

// Bad: String concatenation happens even if DEBUG is disabled
logger.debug(`Complex data: ${JSON.stringify(largeObject)}`);
````

### 2. **Structured Logging**

```typescript
logger.info("User action completed", {
  userId: "123",
  action: "update",
  duration: 150,
});
```

### 3. **Performance Timing**

```typescript
logger.time("database-query");
// ... perform operation
logger.timeEnd("database-query", { recordCount: 100 });
```

### 4. **Error Logging with Context**

```typescript
logger.error("Failed to process request", error, {
  userId: "123",
  requestId: "abc-def",
});
```

## Logger Instances

- `logger` - Default logger
- `apiLogger` - API/HTTP operations
- `serviceLogger` - Service layer operations
- `componentLogger` - Component lifecycle

## Environment Configuration

```bash
# Enable logging in production
VITE_ENABLE_LOGGING=true

# Set log level (ERROR, WARN, INFO, DEBUG)
VITE_LOG_LEVEL=INFO
```

## API Client Logging

The API client automatically logs:

- Request initiation (DEBUG)
- Request completion with timing (INFO)
- Retry attempts (WARN)
- Timeouts (WARN)
- Errors with full context (ERROR)
- File upload/download operations (DEBUG/INFO)

### Request Tracking

Each request gets a unique `requestId` for correlation across logs.

## Best Practices

1. **Use lazy evaluation for expensive operations**

   ```typescript
   logger.debug(() => `Data: ${expensiveSerialize(data)}`);
   ```

2. **Include context in production logs**

   ```typescript
   logger.error("Operation failed", error, { userId, orderId });
   ```

3. **Use appropriate log levels**
    - ERROR: Runtime errors requiring attention
    - WARN: Recoverable issues (retries, fallbacks)
    - INFO: Key business operations
    - DEBUG: Detailed diagnostic information

4. **Create scoped loggers**

   ```typescript
   const userLogger = logger.scope("UserService");
   userLogger.info("User created", { userId });
   ```

5. **Time performance-critical operations**
   ```typescript
   logger.time("critical-operation");
   await performOperation();
   logger.timeEnd("critical-operation");
   ```
