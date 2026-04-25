// src/features/locale/store/locale.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'en' | 'ar'

interface LocaleStore {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'hks-locale' }
  )
)
