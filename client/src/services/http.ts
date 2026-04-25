// src/services/http.ts
import axios from 'axios'
import { API_BASE_URL, ENV } from '@/config/env'

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: ENV.apiTimeout,
  headers: { 'Content-Type': 'application/json' },
})

// ── request interceptor: attach auth token ────────────────────────────────
http.interceptors.request.use((config) => {
  const raw = localStorage.getItem('hks-auth')
  if (raw) {
    try {
      const { state } = JSON.parse(raw)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    } catch { /* ignore */ }
  }
  return config
})

// ── response interceptor: normalise errors ───────────────────────────────
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (ENV.loggingEnabled) {
      console.error('[http]', err.response?.status, err.config?.url, err.message)
    }
    // 401 → clear auth and redirect
    if (err.response?.status === 401) {
      localStorage.removeItem('hks-auth')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)
