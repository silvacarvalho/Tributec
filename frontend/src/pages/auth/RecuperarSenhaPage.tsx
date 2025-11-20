import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  AccountBalance as AccountBalanceIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
} from '@mui/icons-material'
import { authService } from '@/services/authService'
import { toast } from 'react-toastify'

export function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.recuperarSenha({ email })
      setSuccess(true)
      toast.success('Email de recuperação enviado com sucesso!')
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Erro ao solicitar recuperação de senha'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
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
            <Box sx={{ textAlign: 'center' }}>
              <EmailIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Email Enviado!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Enviamos um email para <strong>{email}</strong> com instruções para redefinir sua
                senha.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Verifique sua caixa de entrada e sua pasta de spam. O link expira em 1 hora.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/login')}
                sx={{ mt: 2 }}
              >
                Voltar para Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    )
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

          <Typography variant="h6" align="center" gutterBottom>
            Recuperar Senha
          </Typography>

          <Typography variant="body2" align="center" color="text.secondary" paragraph>
            Digite seu email e enviaremos instruções para redefinir sua senha.
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
              placeholder="seu@email.com"
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
              startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
            >
              {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
            </Button>

            <Button
              fullWidth
              component={Link}
              to="/login"
              variant="text"
              startIcon={<ArrowBackIcon />}
              sx={{ mt: 2 }}
            >
              Voltar para Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
