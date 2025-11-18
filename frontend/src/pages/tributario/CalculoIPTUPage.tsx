import { Box, Typography, Card } from '@mui/material'

export function CalculoIPTUPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Cálculo de IPTU
      </Typography>

      <Card sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          Calculadora de IPTU será implementada aqui
        </Typography>
      </Card>
    </Box>
  )
}
