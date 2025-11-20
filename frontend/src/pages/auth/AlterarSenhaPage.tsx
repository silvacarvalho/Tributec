import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Breadcrumbs,
  Link,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { authService } from '@/services/authService'
import { toast } from 'react-toastify'
import { PasswordStrengthIndicator } from '@/components/common/PasswordStrengthIndicator'
import { isPasswordValid } from '@/utils/passwordValidator'

export function AlterarSenhaPage() {
  const [senhaAtual, setSenhaAtual] = useState('')
  const [senhaNova, setSenhaNova] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validações
    if (!isPasswordValid(senhaNova)) {
      setError('A nova senha não atende aos requisitos mínimos de segurança')
      return
    }

    if (senhaNova !== confirmarSenha) {
      setError('As senhas não coincidem')
      return
    }

    if (senhaAtual === senhaNova) {
      setError('A nova senha deve ser diferente da senha atual')
      return
    }

    setLoading(true)

    try {
      await authService.alterarSenha({
        senha_atual: senhaAtual,
        senha_nova: senhaNova,
        confirmar_senha: confirmarSenha,
      })
      toast.success('Senha alterada com sucesso!')
      // Limpar campos
      setSenhaAtual('')
      setSenhaNova('')
      setConfirmarSenha('')
      setTimeout(() => navigate('/'), 2000)
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Erro ao alterar senha. Verifique se a senha atual está correta.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/') }}>
          Dashboard
        </Link>
        <Typography color="text.primary">Alterar Senha</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Alterar Senha</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
      </Box>

      <Card sx={{ maxWidth: 600 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="body1" color="text.secondary" paragraph>
            Para sua segurança, recomendamos alterar sua senha periodicamente. Certifique-se de
            criar uma senha forte e única.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Senha Atual"
              type={showCurrentPassword ? 'text' : 'password'}
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              margin="normal"
              required
              autoFocus
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                      aria-label="toggle current password visibility"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Nova Senha"
              type={showNewPassword ? 'text' : 'password'}
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                      aria-label="toggle new password visibility"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
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

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={
                  loading ||
                  !senhaAtual ||
                  !isPasswordValid(senhaNova) ||
                  senhaNova !== confirmarSenha
                }
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
