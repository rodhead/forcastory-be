// src/features/layout/store/toast.hook.ts
import { useLayoutStore } from './layout.store'

export function useToast() {
  const addToast = useLayoutStore((s) => s.addToast)

  return {
    success: (title: string, message?: string) =>
      addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      addToast({ type: 'error', title, message }),
    warn: (title: string, message?: string) =>
      addToast({ type: 'warn', title, message }),
    info: (title: string, message?: string) =>
      addToast({ type: 'info', title, message }),
  }
}
