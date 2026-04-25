// src/features/auth/types/auth.types.ts
import type { Role } from '@/types/common'

export interface LoginCredentials {
  email: string
  password: string
  rememberMe: boolean
}

export interface AuthUser {
  id: string
  email: string
  name: string
  picture?: string
  role: Role
  organisation: string
  initials: string
}

export interface AuthStore {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  setUser: (user: AuthUser) => void
  setLoading: (v: boolean) => void
  clearAuth: () => void
  logout: () => void
}
