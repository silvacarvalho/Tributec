/**
 * Error Boundary para capturar erros de renderização
 */
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Typography, Button, Paper } from '@mui/material'
import { Error as ErrorIcon } from '@mui/icons-material'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center',
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2,
              }}
            />
            <Typography variant="h5" gutterBottom>
              Algo deu errado
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Ocorreu um erro inesperado ao renderizar esta seção.
            </Typography>
            {import.meta.env.DEV && this.state.error && (
              <Typography
                variant="body2"
                color="error"
                sx={{
                  fontFamily: 'monospace',
                  backgroundColor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  textAlign: 'left',
                  overflow: 'auto',
                  mb: 2,
                }}
              >
                {this.state.error.message}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" onClick={this.handleReset}>
                Tentar novamente
              </Button>
              <Button variant="outlined" onClick={() => window.location.reload()}>
                Recarregar página
              </Button>
            </Box>
          </Paper>
        </Box>
      )
    }

    return this.props.children
  }
}
