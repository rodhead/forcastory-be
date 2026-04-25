// src/features/auth/store/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthStore } from '../types/auth.types'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setLoading: (v) => set({ isLoading: v }),
      clearAuth: () => set({ user: null, isAuthenticated: false, token: null }),
      logout: () => {
        set({ user: null, isAuthenticated: false, token: null })
        window.location.href = '/'
      },
    }),
    {
      name: 'hks-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, token: state.token }),
    }
  )
)
