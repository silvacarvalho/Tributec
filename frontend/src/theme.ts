/**
 * Tema Material-UI com suporte a Dark Mode
 */
import { createTheme, ThemeOptions, PaletteMode } from '@mui/material/styles'
import { ptBR } from '@mui/material/locale'

// Cores primárias do sistema
const primaryColor = {
  main: '#1976d2',
  light: '#42a5f5',
  dark: '#1565c0',
  contrastText: '#fff',
}

const secondaryColor = {
  main: '#dc004e',
  light: '#ff5983',
  dark: '#9a0036',
  contrastText: '#fff',
}

// Configurações base compartilhadas
const baseThemeOptions: ThemeOptions = {
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
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.875rem',
        },
      },
    },
  },
}

/**
 * Cria tema baseado no modo (light/dark)
 */
export function createAppTheme(mode: PaletteMode = 'light') {
  return createTheme(
    {
      ...baseThemeOptions,
      palette: {
        mode,
        primary: primaryColor,
        secondary: secondaryColor,
        ...(mode === 'light'
          ? {
              // Modo claro
              background: {
                default: '#f5f5f5',
                paper: '#ffffff',
              },
              text: {
                primary: 'rgba(0, 0, 0, 0.87)',
                secondary: 'rgba(0, 0, 0, 0.6)',
              },
            }
          : {
              // Modo escuro
              background: {
                default: '#121212',
                paper: '#1e1e1e',
              },
              text: {
                primary: '#ffffff',
                secondary: 'rgba(255, 255, 255, 0.7)',
              },
            }),
      },
    },
    ptBR
  )
}

// Tema padrão (light)
export const theme = createAppTheme('light')
