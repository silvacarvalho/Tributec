/**
 * Context e Provider para gerenciar tema (Dark Mode)
 */
import { createContext, useContext, useMemo, ReactNode } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createAppTheme } from '@/theme'
import { useDarkMode, ColorMode } from '@/hooks/useDarkMode'

interface ThemeContextValue {
  colorMode: ColorMode
  setColorMode: (mode: ColorMode) => void
  effectiveTheme: 'light' | 'dark'
  isDark: boolean
  isLight: boolean
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const darkMode = useDarkMode()

  // Cria o tema baseado no modo atual
  const theme = useMemo(
    () => createAppTheme(darkMode.effectiveTheme),
    [darkMode.effectiveTheme]
  )

  return (
    <ThemeContext.Provider value={darkMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
