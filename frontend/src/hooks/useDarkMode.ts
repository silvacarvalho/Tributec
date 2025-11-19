/**
 * Hook para gerenciar Dark Mode
 */
import { useLocalStorage } from './useLocalStorage'
import { useEffect } from 'react'

export type ColorMode = 'light' | 'dark' | 'system'

export function useDarkMode() {
  const [colorMode, setColorMode] = useLocalStorage<ColorMode>('color-mode', 'system')

  // Detecta preferência do sistema
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  // Calcula o tema efetivo
  const effectiveTheme = colorMode === 'system' ? getSystemTheme() : colorMode

  // Atualiza a classe no HTML
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(effectiveTheme)

    // Atualiza meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        effectiveTheme === 'dark' ? '#121212' : '#1976d2'
      )
    }
  }, [effectiveTheme])

  // Listener para mudanças na preferência do sistema
  useEffect(() => {
    if (colorMode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(getSystemTheme())
    }

    // Listener moderno
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    // Fallback para navegadores antigos
    if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [colorMode])

  return {
    colorMode,
    setColorMode,
    effectiveTheme,
    isDark: effectiveTheme === 'dark',
    isLight: effectiveTheme === 'light',
    toggle: () => {
      setColorMode(effectiveTheme === 'dark' ? 'light' : 'dark')
    },
  }
}
