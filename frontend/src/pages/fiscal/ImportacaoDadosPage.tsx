import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Breadcrumbs,
  Link,
  Grid,
  MenuItem,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import api from '@/services/api'

interface ImportResult {
  total: number
  success: number
  errors: number
  warnings: number
  details: {
    linha: number
    status: 'success' | 'error' | 'warning'
    mensagem: string
  }[]
}

export function ImportacaoDadosPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [tipoImportacao, setTipoImportacao] = useState('pgv')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any[]>([])
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const steps = ['Selecionar Tipo', 'Upload do Arquivo', 'Validação', 'Importação']

  const tiposImportacao = [
    { value: 'pgv', label: 'PGV - Planta Genérica de Valores', format: 'CSV' },
    { value: 'tpc', label: 'TPC - Tabela de Preços de Construção', format: 'CSV' },
    { value: 'logradouros', label: 'Logradouros', format: 'CSV/Excel' },
    { value: 'imoveis', label: 'Imóveis', format: 'CSV/Excel' },
    { value: 'estabelecimentos', label: 'Estabelecimentos', format: 'CSV/Excel' },
    { value: 'contribuintes', label: 'Contribuintes', format: 'CSV/Excel' },
    { value: 'infrações', label: 'Catálogo de Infrações', format: 'CSV/XML' },
  ]

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Validar tipo de arquivo
      const extension = selectedFile.name.split('.').pop()?.toLowerCase()
      const allowedExtensions = ['csv', 'xlsx', 'xls', 'xml']

      if (!allowedExtensions.includes(extension || '')) {
        setError('Formato de arquivo não suportado. Use CSV, Excel ou XML.')
        return
      }

      setFile(selectedFile)
      setError('')
      // Simular preview
      generatePreview(selectedFile)
    }
  }

  const generatePreview = async (file: File) => {
    setLoading(true)
    try {
      // Aqui você faria a leitura real do arquivo
      // Por ora, vou simular com dados mock
      const mockData = [
        { coluna1: 'Valor1', coluna2: 'Valor2', coluna3: 'Valor3' },
        { coluna1: 'Valor4', coluna2: 'Valor5', coluna3: 'Valor6' },
        { coluna1: 'Valor7', coluna2: 'Valor8', coluna3: 'Valor9' },
      ]
      setPreview(mockData)
      setActiveStep(2)
    } catch (err) {
      setError('Erro ao ler arquivo')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tipo', tipoImportacao)

      const response = await api.post(`/fiscal/importacao/${tipoImportacao}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setResult(response.data)
      setActiveStep(3)
      toast.success(`Importação concluída: ${response.data.success} registros importados`)
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao importar arquivo'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    // Aqui você baixaria o template real
    toast.info('Download do template iniciado')
  }

  const resetImport = () => {
    setActiveStep(0)
    setFile(null)
    setPreview([])
    setResult(null)
    setError('')
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Selecione o tipo de importação
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Escolha o tipo de dados que deseja importar para o sistema.
            </Typography>

            <TextField
              fullWidth
              select
              label="Tipo de Importação"
              value={tipoImportacao}
              onChange={(e) => setTipoImportacao(e.target.value)}
              sx={{ mb: 3 }}
            >
              {tiposImportacao.map((tipo) => (
                <MenuItem key={tipo.value} value={tipo.value}>
                  <Box>
                    <Typography variant="body1">{tipo.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Formato: {tipo.format}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadTemplate}
                fullWidth
              >
                Baixar Modelo
              </Button>
              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
                fullWidth
              >
                Continuar
              </Button>
            </Box>
          </Box>
        )

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload do Arquivo
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Selecione o arquivo para importação. Formatos aceitos: CSV, Excel, XML.
            </Typography>

            <Paper
              sx={{
                p: 4,
                border: '2px dashed',
                borderColor: 'divider',
                textAlign: 'center',
                bgcolor: 'background.default',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".csv,.xlsx,.xls,.xml"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {file ? file.name : 'Clique para selecionar arquivo'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ou arraste e solte aqui
              </Typography>
              {file && (
                <Chip
                  label={`${(file.size / 1024).toFixed(2)} KB`}
                  color="primary"
                  sx={{ mt: 2 }}
                />
              )}
            </Paper>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={() => setActiveStep(0)} fullWidth>
                Voltar
              </Button>
              <Button
                variant="contained"
                onClick={() => file && generatePreview(file)}
                disabled={!file}
                fullWidth
              >
                Validar Arquivo
              </Button>
            </Box>
          </Box>
        )

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Validação e Preview
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Verifique os dados antes de importar. Primeiras 3 linhas:
            </Typography>

            {preview.length > 0 && (
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(preview[0]).map((key) => (
                        <TableCell key={key}>{key}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.map((row, idx) => (
                      <TableRow key={idx}>
                        {Object.values(row).map((value: any, idx2) => (
                          <TableCell key={idx2}>{value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>{preview.length}</strong> linhas detectadas no arquivo.
                Certifique-se de que os dados estão corretos antes de prosseguir.
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => setActiveStep(1)} fullWidth>
                Voltar
              </Button>
              <Button
                variant="contained"
                onClick={handleImport}
                disabled={loading}
                fullWidth
              >
                {loading ? 'Importando...' : 'Importar Dados'}
              </Button>
            </Box>
          </Box>
        )

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Resultado da Importação
            </Typography>

            {result && (
              <>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {result.total}
                      </Typography>
                      <Typography variant="caption">Total</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {result.success}
                      </Typography>
                      <Typography variant="caption">Sucesso</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main">
                        {result.errors}
                      </Typography>
                      <Typography variant="caption">Erros</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {result.warnings}
                      </Typography>
                      <Typography variant="caption">Avisos</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {result.details && result.details.length > 0 && (
                  <List>
                    {result.details.slice(0, 10).map((detail, idx) => (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          {detail.status === 'success' && <CheckIcon color="success" />}
                          {detail.status === 'error' && <ErrorIcon color="error" />}
                          {detail.status === 'warning' && <WarningIcon color="warning" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={`Linha ${detail.linha}: ${detail.mensagem}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button variant="outlined" onClick={resetImport} fullWidth>
                    Nova Importação
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/fiscal/dashboard')}
                    fullWidth
                  >
                    Ir para Dashboard
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/') }}>
          Dashboard
        </Link>
        <Link underline="hover" color="inherit" href="/fiscal/dashboard" onClick={(e) => { e.preventDefault(); navigate('/fiscal/dashboard') }}>
          Fiscal
        </Link>
        <Typography color="text.primary">Importação de Dados</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Importação de Dados Fiscais</Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {renderStepContent()}
        </CardContent>
      </Card>
    </Box>
  )
}
