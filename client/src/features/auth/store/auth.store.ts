import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthStore } from '../types/auth.types'

export const useAuthStore = create<AuthStore>()(
    // persist middleware saves to localStorage automatically
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            setUser: (user) => set({ user, isAuthenticated: true }),
            setLoading: (v) => set({ isLoading: v }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        { name: 'hks-auth' }   // localStorage key
    )
)