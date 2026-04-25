// src/config/env.ts
// Single source of truth for all environment variables.
// Components/services never read import.meta.env directly.

export const ENV = {
  stage:          import.meta.env.VITE_STAGE ?? 'dev',
  apiPort:        import.meta.env.VITE_API_PORT ?? '8080',
  apiTimeout:     Number(import.meta.env.VITE_API_TIMEOUT ?? 30000),
  appName:        import.meta.env.VITE_APP_NAME ?? 'Forecastory',
  appVersion:     import.meta.env.VITE_APP_VERSION ?? '2.1.0',
  devToolsEnabled:import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
  loggingEnabled: import.meta.env.VITE_ENABLE_LOGGING === 'true',
  logLevel:       import.meta.env.VITE_LOG_LEVEL ?? 'info',

  // ─── MOCK DATA FLAG ──────────────────────────────────────────────────────
  useMock:        import.meta.env.VITE_USE_MOCK === 'true',

  // ─── AUTH0 / SSO ─────────────────────────────────────────────────────────
  auth0Domain:    import.meta.env.VITE_AUTH0_DOMAIN ?? '',
  auth0ClientId:  import.meta.env.VITE_AUTH0_CLIENT_ID ?? '',
} as const

export const API_BASE_URL =
  ENV.stage === 'dev'
    ? `http://localhost:${ENV.apiPort}/api`
    : '/api'
