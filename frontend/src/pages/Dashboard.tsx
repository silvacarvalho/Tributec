import { Box, Typography, Grid, Card, CardContent, CardHeader } from '@mui/material'
import { People, Home, AttachMoney, Receipt } from '@mui/icons-material'

export function Dashboard() {
  const stats = [
    { title: 'Pessoas Cadastradas', value: '1.234', icon: <People fontSize="large" />, color: '#1976d2' },
    { title: 'Imóveis', value: '5.678', icon: <Home fontSize="large" />, color: '#2e7d32' },
    { title: 'IPTU Lançado', value: 'R$ 1.234.567,89', icon: <AttachMoney fontSize="large" />, color: '#ed6c02' },
    { title: 'Arrecadação', value: 'R$ 987.654,32', icon: <Receipt fontSize="large" />, color: '#dc004e' },
  ]

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardHeader
                avatar={
                  <Box
                    sx={{
                      backgroundColor: stat.color,
                      color: 'white',
                      borderRadius: 2,
                      p: 1.5,
                      display: 'flex',
                    }}
                  >
                    {stat.icon}
                  </Box>
                }
                title={stat.title}
                titleTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              />
              <CardContent>
                <Typography variant="h5" component="div">
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Bem-vindo ao Tributec
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sistema de Gestão Tributária Municipal - Plataforma completa para digitalização e automação
          de todos os processos tributários, fiscais e de arrecadação do município.
        </Typography>
      </Box>
    </Box>
  )
}
