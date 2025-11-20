import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material'
import {
  AccountBalance as AccountBalanceIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import { authService } from '@/services/authService'
import { toast } from 'react-toastify'
import { PasswordStrengthIndicator } from '@/components/common/PasswordStrengthIndicator'
import { isPasswordValid } from '@/utils/passwordValidator'

export function RedefinirSenhaPage() {
  const { token } = useParams<{ token: string }>()
  const [senhaNova, setSenhaNova] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validações
    if (!isPasswordValid(senhaNova)) {
      setError('A senha não atende aos requisitos mínimos de segurança')
      return
    }

    if (senhaNova !== confirmarSenha) {
      setError('As senhas não coincidem')
      return
    }

    if (!token) {
      setError('Token de recuperação inválido')
      return
    }

    setLoading(true)

    try {
      await authService.redefinirSenha({
        token,
        senha_nova: senhaNova,
        confirmar_senha: confirmarSenha,
      })
      setSuccess(true)
      toast.success('Senha redefinida com sucesso!')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Erro ao redefinir senha. O token pode estar expirado.'
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
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Senha Redefinida!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Sua senha foi redefinida com sucesso. Você será redirecionado para a página de
                login em alguns segundos.
              </Typography>
              <Button variant="contained" fullWidth onClick={() => navigate('/login')} sx={{ mt: 2 }}>
                Ir para Login
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
            Redefinir Senha
          </Typography>

          <Typography variant="body2" align="center" color="text.secondary" paragraph>
            Digite sua nova senha. Certifique-se de que seja forte e segura.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Nova Senha"
              type={showPassword ? 'text' : 'password'}
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              margin="normal"
              required
              autoFocus
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <PasswordStrengthIndicator password={senhaNova} />

            <TextField
              fullWidth
              label="Confirmar Nova Senha"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              margin="normal"
              required
              error={confirmarSenha.length > 0 && senhaNova !== confirmarSenha}
              helperText={
                confirmarSenha.length > 0 && senhaNova !== confirmarSenha
                  ? 'As senhas não coincidem'
                  : ''
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      aria-label="toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !isPasswordValid(senhaNova) || senhaNova !== confirmarSenha}
              sx={{ mt: 3 }}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
