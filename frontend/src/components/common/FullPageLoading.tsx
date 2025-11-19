/**
 * Componente de loading para página inteira
 */
import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material'

interface FullPageLoadingProps {
  message?: string
  progress?: number
}

export function FullPageLoading({ message = 'Carregando...', progress }: FullPageLoadingProps) {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        zIndex: 9999,
      }}
    >
      <CircularProgress size={60} />
      {message && (
        <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
          {message}
        </Typography>
      )}
      {typeof progress === 'number' && (
        <Box sx={{ width: '300px', mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {Math.round(progress)}%
          </Typography>
        </Box>
      )}
    </Box>
  )
}
