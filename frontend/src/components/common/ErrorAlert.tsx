import { Alert, AlertTitle, Box } from '@mui/material'

interface ErrorAlertProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorAlert({ title = 'Erro', message, onRetry }: ErrorAlertProps) {
  return (
    <Box sx={{ p: 2 }}>
      <Alert severity="error" onClose={onRetry ? onRetry : undefined}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  )
}
