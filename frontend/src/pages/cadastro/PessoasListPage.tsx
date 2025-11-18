import { Box, Typography, Button, Card } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

export function PessoasListPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Pessoas
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Nova Pessoa
        </Button>
      </Box>

      <Card sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          Lista de pessoas será implementada aqui
        </Typography>
      </Card>
    </Box>
  )
}
