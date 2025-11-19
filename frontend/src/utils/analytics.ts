/**
 * Sistema de Analytics
 * Suporta múltiplos provedores (Google Analytics, Plausible, etc)
 */

export interface AnalyticsEvent {
  category: string
  action: string
  label?: string
  value?: number
  data?: Record<string, any>
}

export interface PageViewEvent {
  path: string
  title?: string
  referrer?: string
}

export interface UserProperties {
  userId?: string
  userType?: string
  [key: string]: any
}

class Analytics {
  private enabled: boolean = false
  private providers: Set<AnalyticsProvider> = new Set()
  private queue: Array<() => void> = []

  /**
   * Inicializa o sistema de analytics
   */
  init(config?: { enabled?: boolean }): void {
    this.enabled = config?.enabled ?? !import.meta.env.DEV

    if (!this.enabled) {
      console.log('[Analytics] Desabilitado em desenvolvimento')
      return
    }

    // Processar eventos da fila
    this.queue.forEach((fn) => fn())
    this.queue = []

    console.log('[Analytics] Inicializado')
  }

  /**
   * Registra um provider de analytics
   */
  registerProvider(provider: AnalyticsProvider): void {
    this.providers.add(provider)
    console.log(`[Analytics] Provider registrado: ${provider.name}`)
  }

  /**
   * Remove um provider
   */
  unregisterProvider(provider: AnalyticsProvider): void {
    this.providers.delete(provider)
  }

  /**
   * Rastreia visualização de página
   */
  pageView(event: PageViewEvent): void {
    if (!this.enabled) return

    const track = () => {
      this.providers.forEach((provider) => {
        try {
          provider.trackPageView(event)
        } catch (error) {
          console.error(`[Analytics] Erro no provider ${provider.name}:`, error)
        }
      })
    }

    if (this.providers.size === 0) {
      this.queue.push(track)
    } else {
      track()
    }
  }

  /**
   * Rastreia evento customizado
   */
  event(event: AnalyticsEvent): void {
    if (!this.enabled) return

    const track = () => {
      this.providers.forEach((provider) => {
        try {
          provider.trackEvent(event)
        } catch (error) {
          console.error(`[Analytics] Erro no provider ${provider.name}:`, error)
        }
      })
    }

    if (this.providers.size === 0) {
      this.queue.push(track)
    } else {
      track()
    }
  }

  /**
   * Define propriedades do usuário
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.enabled) return

    this.providers.forEach((provider) => {
      try {
        provider.setUserProperties?.(properties)
      } catch (error) {
        console.error(`[Analytics] Erro no provider ${provider.name}:`, error)
      }
    })
  }

  /**
   * Identifica usuário
   */
  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.enabled) return

    this.providers.forEach((provider) => {
      try {
        provider.identify?.(userId, traits)
      } catch (error) {
        console.error(`[Analytics] Erro no provider ${provider.name}:`, error)
      }
    })
  }

  /**
   * Limpa identificação do usuário (logout)
   */
  reset(): void {
    if (!this.enabled) return

    this.providers.forEach((provider) => {
      try {
        provider.reset?.()
      } catch (error) {
        console.error(`[Analytics] Erro no provider ${provider.name}:`, error)
      }
    })
  }
}

/**
 * Interface para providers de analytics
 */
export interface AnalyticsProvider {
  name: string
  trackPageView(event: PageViewEvent): void
  trackEvent(event: AnalyticsEvent): void
  setUserProperties?(properties: UserProperties): void
  identify?(userId: string, traits?: Record<string, any>): void
  reset?(): void
}

/**
 * Provider do Google Analytics 4
 */
export class GoogleAnalyticsProvider implements AnalyticsProvider {
  name = 'Google Analytics'
  private measurementId: string

  constructor(measurementId: string) {
    this.measurementId = measurementId

    // Carregar script do GA4
    if (typeof window !== 'undefined' && !window.gtag) {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer || []
      window.gtag = function () {
        window.dataLayer.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', measurementId)
    }
  }

  trackPageView(event: PageViewEvent): void {
    if (window.gtag) {
      window.gtag('config', this.measurementId, {
        page_path: event.path,
        page_title: event.title,
      })
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.data,
      })
    }
  }

  setUserProperties(properties: UserProperties): void {
    if (window.gtag) {
      window.gtag('set', 'user_properties', properties)
    }
  }

  identify(userId: string): void {
    if (window.gtag) {
      window.gtag('config', this.measurementId, {
        user_id: userId,
      })
    }
  }
}

/**
 * Provider do Plausible Analytics (privacy-friendly)
 */
export class PlausibleProvider implements AnalyticsProvider {
  name = 'Plausible'
  private domain: string

  constructor(domain: string) {
    this.domain = domain

    // Carregar script do Plausible
    if (typeof window !== 'undefined' && !window.plausible) {
      const script = document.createElement('script')
      script.defer = true
      script.src = 'https://plausible.io/js/plausible.js'
      script.setAttribute('data-domain', domain)
      document.head.appendChild(script)
    }
  }

  trackPageView(event: PageViewEvent): void {
    if (window.plausible) {
      window.plausible('pageview', { u: event.path })
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (window.plausible) {
      window.plausible(event.action, {
        props: {
          category: event.category,
          label: event.label,
          value: event.value,
          ...event.data,
        },
      })
    }
  }
}

/**
 * Provider Console (para desenvolvimento)
 */
export class ConsoleProvider implements AnalyticsProvider {
  name = 'Console'

  trackPageView(event: PageViewEvent): void {
    console.log('[Analytics] Page View:', event)
  }

  trackEvent(event: AnalyticsEvent): void {
    console.log('[Analytics] Event:', event)
  }

  setUserProperties(properties: UserProperties): void {
    console.log('[Analytics] User Properties:', properties)
  }

  identify(userId: string, traits?: Record<string, any>): void {
    console.log('[Analytics] Identify:', userId, traits)
  }

  reset(): void {
    console.log('[Analytics] Reset')
  }
}

// Tipos globais
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
    plausible?: (event: string, options?: any) => void
  }
}

// Instância singleton
export const analytics = new Analytics()

// Helpers para eventos comuns
export const trackButtonClick = (label: string, data?: Record<string, any>) => {
  analytics.event({
    category: 'Engagement',
    action: 'button_click',
    label,
    data,
  })
}

export const trackFormSubmit = (formName: string, success: boolean) => {
  analytics.event({
    category: 'Form',
    action: success ? 'submit_success' : 'submit_error',
    label: formName,
  })
}

export const trackSearch = (query: string, resultsCount: number) => {
  analytics.event({
    category: 'Search',
    action: 'search_query',
    label: query,
    value: resultsCount,
  })
}

export const trackError = (errorMessage: string, errorType: string) => {
  analytics.event({
    category: 'Error',
    action: errorType,
    label: errorMessage,
  })
}
