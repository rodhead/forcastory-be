// src/i18n/I18nProvider.tsx
import { useEffect } from 'react'
import { IntlProvider } from 'react-intl'
import { useLocaleStore } from '@/features/locale/store/locale.store'
import enMessages from './locales/en.json'
import arMessages from './locales/ar.json'

const MESSAGES = {
  en: enMessages as Record<string, string>,
  ar: arMessages as Record<string, string>,
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocaleStore()

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <IntlProvider locale={locale} messages={MESSAGES[locale]} defaultLocale="en">
      {children}
    </IntlProvider>
  )
}
