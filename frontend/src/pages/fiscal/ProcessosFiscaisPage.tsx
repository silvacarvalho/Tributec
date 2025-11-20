import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Breadcrumbs,
  Link,
  InputAdornment,
  Stepper,
  Step,
  StepLabel
} from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab'
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Gavel as GavelIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon,
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import api from '@/services/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ProcessoFiscal {
  id: string
  numero: string
  tipo: 'ADMINISTRATIVO' | 'JULGAMENTO' | 'RECURSO' | 'EXECUCAO'
  contribuinte_nome: string
  contribuinte_cpf_cnpj: string
  assunto: string
  valor?: number
  data_abertura: string
  data_prazo?: string
  status: 'ABERTO' | 'EM_ANALISE' | 'AGUARDANDO_DOCUMENTOS' | 'JULGADO' | 'ARQUIVADO'
  responsavel?: string
  timeline: {
    data: string
    acao: string
    usuario: string
    observacao?: string
  }[]
}

export function ProcessosFiscaisPage() {
  const [processos, setProcessos] = useState<ProcessoFiscal[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [total, setTotal] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedProcesso, setSelectedProcesso] = useState<ProcessoFiscal | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFilter, setTipoFilter] = useState('TODOS')
  const [statusFilter, setStatusFilter] = useState('TODOS')

  const navigate = useNavigate()

  useEffect(() => {
    loadProcessos()
  }, [page, rowsPerPage, tipoFilter, statusFilter])

  const loadProcessos = async () => {
    setLoading(true)
    try {
      const params: any = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
      }

      if (tipoFilter !== 'TODOS') params.tipo = tipoFilter
      if (statusFilter !== 'TODOS') params.status = statusFilter
      if (searchTerm) params.search = searchTerm

      const response = await api.get('/fiscal/processos', { params })
      setProcessos(response.data.itens || [])
      setTotal(response.data.total || 0)
    } catch (err) {
      console.error('Erro ao carregar processos:', err)
      // Mock data
      const mockData: ProcessoFiscal[] = [
        {
          id: '1',
          numero: 'PROC-2024-001',
          tipo: 'ADMINISTRATIVO',
          contribuinte_nome: 'João Silva',
          contribuinte_cpf_cnpj: '123.456.789-00',
          assunto: 'Impugnação de auto de infração',
          valor: 5000.0,
          data_abertura: new Date(Date.now() - 30 * 86400000).toISOString(),
          data_prazo: new Date(Date.now() + 30 * 86400000).toISOString(),
          status: 'EM_ANALISE',
          responsavel: 'Fiscal João Santos',
          timeline: [
            {
              data: new Date(Date.now() - 30 * 86400000).toISOString(),
              acao: 'Abertura do processo',
              usuario: 'Sistema',
            },
            {
              data: new Date(Date.now() - 25 * 86400000).toISOString(),
              acao: 'Documentos anexados',
              usuario: 'João Silva',
              observacao: 'Comprovantes de pagamento',
            },
            {
              data: new Date(Date.now() - 20 * 86400000).toISOString(),
              acao: 'Em análise',
              usuario: 'Fiscal João Santos',
            },
          ],
        },
        {
          id: '2',
          numero: 'PROC-2024-002',
          tipo: 'RECURSO',
          contribuinte_nome: 'Empresa XYZ Ltda',
          contribuinte_cpf_cnpj: '12.345.678/0001-90',
          assunto: 'Recurso contra multa por falta de alvará',
          valor: 10000.0,
          data_abertura: new Date(Date.now() - 15 * 86400000).toISOString(),
          data_prazo: new Date(Date.now() + 15 * 86400000).toISOString(),
          status: 'AGUARDANDO_DOCUMENTOS',
          responsavel: 'Fiscal Maria Santos',
          timeline: [
            {
              data: new Date(Date.now() - 15 * 86400000).toISOString(),
              acao: 'Abertura do processo',
              usuario: 'Sistema',
            },
            {
              data: new Date(Date.now() - 10 * 86400000).toISOString(),
              acao: 'Solicitação de documentos',
              usuario: 'Fiscal Maria Santos',
              observacao: 'Solicitado alvará original',
            },
          ],
        },
        {
          id: '3',
          numero: 'PROC-2024-003',
          tipo: 'JULGAMENTO',
          contribuinte_nome: 'Maria Santos',
          contribuinte_cpf_cnpj: '987.654.321-00',
          assunto: 'Julgamento de recurso fiscal',
          valor: 15000.0,
          data_abertura: new Date(Date.now() - 60 * 86400000).toISOString(),
          status: 'JULGADO',
          responsavel: 'Junta de Recursos',
          timeline: [
            {
              data: new Date(Date.now() - 60 * 86400000).toISOString(),
              acao: 'Abertura do processo',
              usuario: 'Sistema',
            },
            {
              data: new Date(Date.now() - 30 * 86400000).toISOString(),
              acao: 'Parecer técnico emitido',
              usuario: 'Fiscal Pedro Lima',
            },
            {
              data: new Date(Date.now() - 10 * 86400000).toISOString(),
              acao: 'Julgamento realizado',
              usuario: 'Junta de Recursos',
              observacao: 'Recurso parcialmente provido',
            },
          ],
        },
      ]
      setProcessos(mockData)
      setTotal(mockData.length)
    } finally {
      setLoading(false)
    }
  }

  const handleView = (processo: ProcessoFiscal) => {
    setSelectedProcesso(processo)
    setOpenDialog(true)
  }

  const getTipoColor = (tipo: ProcessoFiscal['tipo']) => {
    const colors = {
      ADMINISTRATIVO: 'info',
      JULGAMENTO: 'warning',
      RECURSO: 'primary',
      EXECUCAO: 'error',
    }
    return colors[tipo] as any
  }

  const getStatusColor = (status: ProcessoFiscal['status']) => {
    const colors = {
      ABERTO: 'info',
      EM_ANALISE: 'warning',
      AGUARDANDO_DOCUMENTOS: 'default',
      JULGADO: 'success',
      ARQUIVADO: 'default',
    }
    return colors[status] as any
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch {
      return dateString
    }
  }

  const processosFiltrados = processos.filter((p) =>
    searchTerm
      ? p.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contribuinte_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contribuinte_cpf_cnpj.includes(searchTerm)
      : true
  )

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/') }}>
          Dashboard
        </Link>
        <Link underline="hover" color="inherit" href="/fiscal/dashboard" onClick={(e) => { e.preventDefault(); navigate('/fiscal/dashboard') }}>
          Fiscal
        </Link>
        <Typography color="text.primary">Processos</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Processos Fiscais</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/fiscal/processos/novo')}>
            Novo Processo
          </Button>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar por número, contribuinte ou CPF/CNPJ"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Tipo"
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
              >
                <MenuItem value="TODOS">Todos</MenuItem>
                <MenuItem value="ADMINISTRATIVO">Administrativo</MenuItem>
                <MenuItem value="JULGAMENTO">Julgamento</MenuItem>
                <MenuItem value="RECURSO">Recurso</MenuItem>
                <MenuItem value="EXECUCAO">Execução</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="TODOS">Todos</MenuItem>
                <MenuItem value="ABERTO">Aberto</MenuItem>
                <MenuItem value="EM_ANALISE">Em Análise</MenuItem>
                <MenuItem value="AGUARDANDO_DOCUMENTOS">Aguardando Documentos</MenuItem>
                <MenuItem value="JULGADO">Julgado</MenuItem>
                <MenuItem value="ARQUIVADO">Arquivado</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Contribuinte</TableCell>
                  <TableCell>Assunto</TableCell>
                  <TableCell>Abertura</TableCell>
                  <TableCell>Prazo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : processosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Nenhum processo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  processosFiltrados
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((processo) => (
                      <TableRow key={processo.id} hover>
                        <TableCell>{processo.numero}</TableCell>
                        <TableCell>
                          <Chip label={processo.tipo} color={getTipoColor(processo.tipo)} size="small" />
                        </TableCell>
                        <TableCell>{processo.contribuinte_nome}</TableCell>
                        <TableCell>{processo.assunto}</TableCell>
                        <TableCell>{formatDate(processo.data_abertura)}</TableCell>
                        <TableCell>{processo.data_prazo ? formatDate(processo.data_prazo) : '-'}</TableCell>
                        <TableCell>
                          <Chip label={processo.status.replace('_', ' ')} color={getStatusColor(processo.status)} size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Visualizar">
                            <IconButton size="small" onClick={() => handleView(processo)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Documentos">
                            <IconButton size="small">
                              <DescriptionIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Registros por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </CardContent>
      </Card>

      {/* Dialog de visualização */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalhes do Processo</DialogTitle>
        <DialogContent>
          {selectedProcesso && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Número
                  </Typography>
                  <Typography variant="body1">{selectedProcesso.numero}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Tipo
                  </Typography>
                  <Typography variant="body1">
                    <Chip label={selectedProcesso.tipo} color={getTipoColor(selectedProcesso.tipo)} size="small" />
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Contribuinte
                  </Typography>
                  <Typography variant="body1">{selectedProcesso.contribuinte_nome}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    CPF/CNPJ
                  </Typography>
                  <Typography variant="body1">{selectedProcesso.contribuinte_cpf_cnpj}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Assunto
                  </Typography>
                  <Typography variant="body1">{selectedProcesso.assunto}</Typography>
                </Grid>
                {selectedProcesso.valor && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Valor
                    </Typography>
                    <Typography variant="body1">
                      R$ {selectedProcesso.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Responsável
                  </Typography>
                  <Typography variant="body1">{selectedProcesso.responsavel || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Data de Abertura
                  </Typography>
                  <Typography variant="body1">{formatDate(selectedProcesso.data_abertura)}</Typography>
                </Grid>
                {selectedProcesso.data_prazo && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Prazo
                    </Typography>
                    <Typography variant="body1">{formatDate(selectedProcesso.data_prazo)}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1">
                    <Chip label={selectedProcesso.status.replace('_', ' ')} color={getStatusColor(selectedProcesso.status)} size="small" />
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Histórico do Processo
              </Typography>
              <Timeline position="right">
                {selectedProcesso.timeline.map((item, idx) => (
                  <TimelineItem key={idx}>
                    <TimelineOppositeContent color="text.secondary">
                      {formatDateTime(item.data)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="primary">
                        <CheckIcon fontSize="small" />
                      </TimelineDot>
                      {idx < selectedProcesso.timeline.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight="bold">
                        {item.acao}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.usuario}
                      </Typography>
                      {item.observacao && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {item.observacao}
                        </Typography>
                      )}
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fechar</Button>
          <Button variant="contained" startIcon={<DescriptionIcon />}>
            Ver Documentos
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
