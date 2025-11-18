import { createContext, useContext, useState, useMemo, ReactNode } from 'react'
import { ThemeProvider as MUIThemeProvider, createTheme, PaletteMode } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'

interface ThemeContextType {
  mode: PaletteMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
})

export const useThemeMode = () => useContext(ThemeContext)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const saved = localStorage.getItem('theme-mode')
    return (saved as PaletteMode) || 'light'
  })

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme-mode', newMode)
      return newMode
    })
  }

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#1976d2' : '#90caf9',
            light: mode === 'light' ? '#42a5f5' : '#a6d4fa',
            dark: mode === 'light' ? '#1565c0' : '#648dae',
          },
          secondary: {
            main: mode === 'light' ? '#dc004e' : '#f48fb1',
            light: mode === 'light' ? '#e33371' : '#f6a5c0',
            dark: mode === 'light' ? '#9a0036' : '#aa647b',
          },
          success: {
            main: mode === 'light' ? '#2e7d32' : '#66bb6a',
          },
          warning: {
            main: mode === 'light' ? '#ed6c02' : '#ffa726',
          },
          error: {
            main: mode === 'light' ? '#d32f2f' : '#f44336',
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
          h1: {
            fontSize: '2.5rem',
            fontWeight: 500,
          },
          h2: {
            fontSize: '2rem',
            fontWeight: 500,
          },
          h3: {
            fontSize: '1.75rem',
            fontWeight: 500,
          },
          h4: {
            fontSize: '1.5rem',
            fontWeight: 500,
          },
          h5: {
            fontSize: '1.25rem',
            fontWeight: 500,
          },
          h6: {
            fontSize: '1rem',
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 500,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                boxShadow: mode === 'light'
                  ? '0 2px 8px rgba(0,0,0,0.1)'
                  : '0 2px 8px rgba(0,0,0,0.4)',
              },
            },
          },
        },
      }),
    [mode]
  )

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  )
}
