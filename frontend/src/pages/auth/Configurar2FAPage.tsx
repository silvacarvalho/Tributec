import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
  Switch,
  FormControlLabel,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Breadcrumbs,
  Link,
  Divider,
  Paper,
} from '@mui/material'
import {
  Security as SecurityIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import api from '@/services/api'

export function Configurar2FAPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')

  const navigate = useNavigate()

  // Carregar status do 2FA
  useEffect(() => {
    loadTwoFactorStatus()
  }, [])

  const loadTwoFactorStatus = async () => {
    try {
      const response = await api.get('/auth/2fa/status')
      setTwoFactorEnabled(response.data.enabled || false)
    } catch (err) {
      console.error('Erro ao carregar status 2FA:', err)
    }
  }

  const handleEnableStart = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/2fa/enable/start')
      setQrCode(response.data.qr_code)
      setSecret(response.data.secret)
      setStep(1)
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.response?.data?.message || 'Erro ao gerar QR Code'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEnableConfirm = async () => {
    if (verificationCode.length !== 6) {
      setError('O código deve ter 6 dígitos')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post('/auth/2fa/enable/confirm', {
        token: verificationCode,
      })
      setTwoFactorEnabled(true)
      setStep(2)
      toast.success('Autenticação de dois fatores ativada com sucesso!')
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Código inválido. Tente novamente.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    if (!confirm('Tem certeza que deseja desabilitar a autenticação de dois fatores?')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post('/auth/2fa/disable')
      setTwoFactorEnabled(false)
      setStep(0)
      setQrCode('')
      setSecret('')
      setVerificationCode('')
      toast.success('Autenticação de dois fatores desabilitada')
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Erro ao desabilitar 2FA'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const renderStep0 = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <SecurityIcon sx={{ fontSize: 48, color: 'primary.main' }} />
        <Box>
          <Typography variant="h6">Autenticação de Dois Fatores (2FA)</Typography>
          <Typography variant="body2" color="text.secondary">
            {twoFactorEnabled ? 'Atualmente ativada' : 'Atualmente desativada'}
          </Typography>
        </Box>
      </Box>

      <Typography variant="body1" paragraph>
        A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta. Além da
        senha, você precisará de um código temporário gerado no seu smartphone.
      </Typography>

      <Paper sx={{ p: 2, bgcolor: 'info.light', mb: 3 }}>
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          Como funciona:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li>Instale um aplicativo autenticador (Google Authenticator, Authy, etc.)</li>
          <li>Escaneie o QR Code que será gerado</li>
          <li>Use o código de 6 dígitos sempre que fizer login</li>
        </Typography>
      </Paper>

      {twoFactorEnabled ? (
        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={handleDisable}
          disabled={loading}
          size="large"
        >
          Desabilitar 2FA
        </Button>
      ) : (
        <Button
          variant="contained"
          fullWidth
          onClick={handleEnableStart}
          disabled={loading}
          size="large"
          startIcon={<SecurityIcon />}
        >
          Habilitar 2FA
        </Button>
      )}
    </Box>
  )

  const renderStep1 = () => (
    <Box>
      <Stepper activeStep={0} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Escanear QR Code</StepLabel>
        </Step>
        <Step>
          <StepLabel>Verificar Código</StepLabel>
        </Step>
        <Step>
          <StepLabel>Concluído</StepLabel>
        </Step>
      </Stepper>

      <Typography variant="h6" gutterBottom>
        1. Escaneie o QR Code
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Use seu aplicativo autenticador para escanear este código:
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
        {qrCode ? (
          <img src={qrCode} alt="QR Code 2FA" style={{ maxWidth: 256, maxHeight: 256 }} />
        ) : (
          <QrCodeIcon sx={{ fontSize: 256, color: 'action.disabled' }} />
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Ou digite manualmente este código:
      </Typography>
      <Paper sx={{ p: 2, bgcolor: 'grey.100', textAlign: 'center', mb: 3 }}>
        <Typography variant="h6" fontFamily="monospace">
          {secret}
        </Typography>
      </Paper>

      <Typography variant="h6" gutterBottom>
        2. Digite o código de verificação
      </Typography>
      <TextField
        fullWidth
        label="Código de 6 dígitos"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
        inputProps={{
          maxLength: 6,
          style: { fontSize: 24, textAlign: 'center', letterSpacing: 8 },
        }}
        sx={{ mb: 3 }}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" fullWidth onClick={() => setStep(0)}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={handleEnableConfirm}
          disabled={loading || verificationCode.length !== 6}
        >
          Verificar e Ativar
        </Button>
      </Box>
    </Box>
  )

  const renderStep2 = () => (
    <Box sx={{ textAlign: 'center' }}>
      <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        2FA Ativado com Sucesso!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Sua conta agora está protegida com autenticação de dois fatores. Na próxima vez que fizer
        login, você precisará fornecer o código do seu aplicativo autenticador.
      </Typography>
      <Button variant="contained" fullWidth onClick={() => navigate('/')} sx={{ mt: 2 }}>
        Voltar ao Dashboard
      </Button>
    </Box>
  )

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/') }}>
          Dashboard
        </Link>
        <Typography color="text.primary">Configurar 2FA</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Autenticação de Dois Fatores</Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </Box>

      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {step === 0 && renderStep0()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </CardContent>
      </Card>
    </Box>
  )
}
