// src/features/layout/store/layout.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme, User } from '@/types/common'

interface SpoofSession {
  user: User
  originalUser: User
}

interface LayoutStore {
  // sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  expandedNav: string | null
  setExpandedNav: (id: string | null) => void
  createProjectOpen: boolean
  setCreateProjectOpen: (open: boolean) => void
  projectsTab: string
  setProjectsTab: (tab: string) => void

  // theme
  theme: Theme
  toggleTheme: () => void

  // active project
  activeProjectId: string
  setActiveProjectId: (id: string) => void

  // spoof
  spoofSession: SpoofSession | null
  startSpoof: (target: User, original: User) => void
  endSpoof: () => void

  // toast queue (managed externally via hook, stored here for cross-component access)
  toasts: Toast[]
  addToast: (t: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warn' | 'info'
  title: string
  message?: string
}

let toastCounter = 0

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      expandedNav: 'forecasting',
      setExpandedNav: (id) => set({ expandedNav: id }),
      createProjectOpen: false,
      setCreateProjectOpen: (open) => set({ createProjectOpen: open }),
      projectsTab: 'overview',
      setProjectsTab: (tab) => set({ projectsTab: tab }),

      theme: 'light',
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'light' ? 'dark' : 'light'
          document.documentElement.setAttribute('data-theme', next)
          return { theme: next }
        }),

      activeProjectId: 'p1',
      setActiveProjectId: (id) => set({ activeProjectId: id }),

      spoofSession: null,
      startSpoof: (target, original) =>
        set({ spoofSession: { user: target, originalUser: original } }),
      endSpoof: () => set({ spoofSession: null }),

      toasts: [],
      addToast: (t) =>
        set((s) => ({
          toasts: [...s.toasts, { ...t, id: String(++toastCounter) }],
        })),
      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'hks-layout',
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        theme: s.theme,
        activeProjectId: s.activeProjectId,
      }),
    }
  )
)
