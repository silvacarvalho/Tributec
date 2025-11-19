/**
 * Sistema de internacionalização (i18n)
 */
import { ptBR, Translations } from './pt-BR'
import { enUS } from './en-US'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export type Locale = 'pt-BR' | 'en-US'

const translations: Record<Locale, Translations> = {
  'pt-BR': ptBR,
  'en-US': enUS,
}

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  translations: Translations
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n deve ser usado dentro de I18nProvider')
  }
  return context
}

interface I18nProviderProps {
  children: ReactNode
  defaultLocale?: Locale
}

export function I18nProvider({ children, defaultLocale = 'pt-BR' }: I18nProviderProps) {
  const [locale, setLocale] = useLocalStorage<Locale>('locale', defaultLocale)

  // Função para traduzir uma chave
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.')
      let value: any = translations[locale]

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          console.warn(`Translation key not found: ${key}`)
          return key
        }
      }

      if (typeof value !== 'string') {
        console.warn(`Translation value is not a string: ${key}`)
        return key
      }

      // Substituir parâmetros
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
          return params[paramKey]?.toString() || match
        })
      }

      return value
    },
    [locale]
  )

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        translations: translations[locale],
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

// Hook simplificado para usar apenas a função t
export function useTranslation() {
  const { t } = useI18n()
  return { t }
}

// Detecta locale do navegador
export function detectBrowserLocale(): Locale {
  const browserLang = navigator.language || (navigator as any).userLanguage

  if (browserLang.startsWith('pt')) {
    return 'pt-BR'
  }
  if (browserLang.startsWith('en')) {
    return 'en-US'
  }

  return 'pt-BR' // Padrão
}

// Formata números baseado no locale
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(value)
}

// Formata moeda baseado no locale
export function formatCurrency(value: number, locale: Locale): string {
  const currency = locale === 'pt-BR' ? 'BRL' : 'USD'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}

// Formata data baseado no locale
export function formatDate(date: Date | string, locale: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale).format(d)
}

// Formata data e hora baseado no locale
export function formatDateTime(date: Date | string, locale: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d)
}
