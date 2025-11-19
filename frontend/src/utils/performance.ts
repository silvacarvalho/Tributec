/**
 * Utilitários para otimização de performance
 */

/**
 * Lazy load de componentes React
 * Uso: const MyComponent = lazyLoad(() => import('./MyComponent'))
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(importFunc)

  return (props: React.ComponentProps<T>) => (
    <React.Suspense fallback={fallback || <div>Carregando...</div>}>
      <LazyComponent {...props} />
    </React.Suspense>
  )
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  let lastResult: ReturnType<T>

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
      lastResult = func(...args)
    }
    return lastResult
  }
}

/**
 * Medidor de performance para componentes
 */
export function measurePerformance(componentName: string) {
  return {
    start: () => {
      if (import.meta.env.DEV) {
        performance.mark(`${componentName}-start`)
      }
    },
    end: () => {
      if (import.meta.env.DEV) {
        performance.mark(`${componentName}-end`)
        performance.measure(
          `${componentName}`,
          `${componentName}-start`,
          `${componentName}-end`
        )
        const measure = performance.getEntriesByName(componentName)[0]
        console.log(`⏱️ ${componentName}: ${measure.duration.toFixed(2)}ms`)
        performance.clearMarks(`${componentName}-start`)
        performance.clearMarks(`${componentName}-end`)
        performance.clearMeasures(componentName)
      }
    },
  }
}

/**
 * Otimiza arrays grandes para renderização
 * Uso: const visibleItems = virtualize(items, page, itemsPerPage)
 */
export function virtualize<T>(items: T[], page: number, itemsPerPage: number): T[] {
  const start = (page - 1) * itemsPerPage
  const end = start + itemsPerPage
  return items.slice(start, end)
}

/**
 * Memoização customizada para cálculos caros
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)!
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * Carrega imagem de forma otimizada
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * Carrega múltiplas imagens em paralelo
 */
export async function preloadImages(srcs: string[]): Promise<void> {
  await Promise.all(srcs.map(preloadImage))
}

/**
 * Verifica se o dispositivo está em modo de economia de dados
 */
export function isDataSaverEnabled(): boolean {
  return (
    'connection' in navigator &&
    (navigator as any).connection?.saveData === true
  )
}

/**
 * Verifica se a conexão é lenta
 */
export function isSlowConnection(): boolean {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    return (
      connection?.effectiveType === 'slow-2g' ||
      connection?.effectiveType === '2g'
    )
  }
  return false
}

/**
 * Obtém informações de performance da página
 */
export function getPagePerformance() {
  if (!('performance' in window)) return null

  const perfData = window.performance.timing
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
  const connectTime = perfData.responseEnd - perfData.requestStart
  const renderTime = perfData.domComplete - perfData.domLoading

  return {
    pageLoadTime,
    connectTime,
    renderTime,
  }
}

import React from 'react'
