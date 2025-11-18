import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material'
import { AccountBalance as AccountBalanceIcon } from '@mui/icons-material'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import { toast } from 'react-toastify'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { email, senha })
      const { access_token, refresh_token } = response.data

      // Mock user data (em produção, viria do backend)
      const user = {
        id: '1',
        email,
        nome: email.split('@')[0],
        perfis: ['ADMIN'],
      }

      login(user, access_token, refresh_token)
      toast.success('Login realizado com sucesso!')
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao fazer login')
      toast.error('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card sx={{ minWidth: 400, maxWidth: 500 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <AccountBalanceIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
            <Typography variant="h4" component="h1">
              Tributec
            </Typography>
          </Box>

          <Typography variant="h6" align="center" color="text.secondary" gutterBottom>
            Sistema de Gestão Tributária Municipal
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoFocus
            />

            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              margin="normal"
              required
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <Typography variant="caption" display="block" align="center" sx={{ mt: 2 }} color="text.secondary">
              Credenciais de teste: admin@tributec.com / admin123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
