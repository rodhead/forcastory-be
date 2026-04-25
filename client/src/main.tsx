// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Auth0Provider } from '@auth0/auth0-react'
import { router } from '@/router/routes'
import { ENV } from '@/config/env'
import { I18nProvider } from '@/i18n/I18nProvider'
import '@/styles/tailwind.css'

// ── QueryClient ─────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: ENV.useMock ? 0 : 2,            // no retries in mock mode
      refetchOnWindowFocus: !ENV.useMock,    // no refetch noise in mock mode
      staleTime: 1000 * 60 * 5,             // 5-min default stale time
    },
  },
})

// ── theme init from persisted store ─────────────────────────────────────────
// Must run synchronously before render to avoid flash of wrong theme
;(function initTheme() {
  try {
    const raw = localStorage.getItem('hks-layout')
    if (!raw) return
    const { state } = JSON.parse(raw)
    const theme = state?.theme ?? 'light'
    document.documentElement.setAttribute('data-theme', theme)
    // also ensure body background is correct immediately
    document.documentElement.style.colorScheme = theme
  } catch { /* ignore */ }
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={ENV.auth0Domain}
      clientId={ENV.auth0ClientId}
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        </QueryClientProvider>
      </I18nProvider>
    </Auth0Provider>
  </StrictMode>
)
