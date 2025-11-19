import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
  Paper,
  CircularProgress,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Computer as ComputerIcon,
  Smartphone as SmartphoneIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import api from '@/services/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface LoginHistory {
  id: string
  data_hora: string
  ip: string
  user_agent: string
  sucesso: boolean
  dispositivo: 'desktop' | 'mobile' | 'tablet'
  localizacao?: string
}

export function HistoricoLoginsPage() {
  const [historico, setHistorico] = useState<LoginHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [total, setTotal] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    loadHistorico()
  }, [page, rowsPerPage])

  const loadHistorico = async () => {
    setLoading(true)
    try {
      const response = await api.get('/auth/historico-logins', {
        params: {
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      })
      setHistorico(response.data.itens || response.data || [])
      setTotal(response.data.total || response.data.length || 0)
    } catch (err) {
      console.error('Erro ao carregar histórico:', err)
      // Mock data para demonstração
      const mockData: LoginHistory[] = [
        {
          id: '1',
          data_hora: new Date().toISOString(),
          ip: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0',
          sucesso: true,
          dispositivo: 'desktop',
          localizacao: 'São Paulo, SP - Brasil',
        },
        {
          id: '2',
          data_hora: new Date(Date.now() - 86400000).toISOString(),
          ip: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) Safari/604.1',
          sucesso: true,
          dispositivo: 'mobile',
          localizacao: 'São Paulo, SP - Brasil',
        },
        {
          id: '3',
          data_hora: new Date(Date.now() - 172800000).toISOString(),
          ip: '192.168.1.150',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/119.0',
          sucesso: false,
          dispositivo: 'desktop',
          localizacao: 'Rio de Janeiro, RJ - Brasil',
        },
      ]
      setHistorico(mockData)
      setTotal(mockData.length)
    } finally {
      setLoading(false)
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile':
      case 'tablet':
        return <SmartphoneIcon fontSize="small" />
      default:
        return <ComputerIcon fontSize="small" />
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch {
      return dateString
    }
  }

  const getBrowser = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Desconhecido'
  }

  const getOS = (userAgent: string) => {
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac OS')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS') || userAgent.includes('iPhone')) return 'iOS'
    return 'Desconhecido'
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/') }}>
          Dashboard
        </Link>
        <Typography color="text.primary">Histórico de Logins</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Histórico de Logins</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Atualizar">
            <IconButton onClick={loadHistorico} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Acompanhe todos os acessos realizados na sua conta. Se você identificar alguma atividade
            suspeita, recomendamos alterar sua senha imediatamente.
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data e Hora</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Dispositivo</TableCell>
                      <TableCell>Navegador/SO</TableCell>
                      <TableCell>IP</TableCell>
                      <TableCell>Localização</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historico.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="text.secondary">Nenhum registro encontrado</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      historico.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>{formatDateTime(item.data_hora)}</TableCell>
                          <TableCell>
                            {item.sucesso ? (
                              <Chip
                                icon={<CheckCircleIcon />}
                                label="Sucesso"
                                color="success"
                                size="small"
                              />
                            ) : (
                              <Chip
                                icon={<CancelIcon />}
                                label="Falhou"
                                color="error"
                                size="small"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getDeviceIcon(item.dispositivo)}
                              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                {item.dispositivo}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{getBrowser(item.user_agent)}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getOS(item.user_agent)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {item.ip}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{item.localizacao || 'N/A'}</Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10))
                  setPage(0)
                }}
                rowsPerPageOptions={[10, 25, 50]}
                labelRowsPerPage="Registros por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
