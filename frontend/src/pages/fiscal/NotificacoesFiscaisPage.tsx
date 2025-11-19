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
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Send as SendIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import api from '@/services/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Notificacao {
  id: string
  numero: string
  tipo: 'INTIMACAO' | 'NOTIFICACAO' | 'AUTO_INFRACAO' | 'COBRANCA'
  contribuinte_nome: string
  contribuinte_cpf_cnpj: string
  descricao: string
  data_emissao: string
  data_vencimento: string
  status: 'PENDENTE' | 'ENVIADA' | 'RECEBIDA' | 'CONTESTADA' | 'CANCELADA'
  valor?: number
}

export function NotificacoesFiscaisPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [total, setTotal] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedNotificacao, setSelectedNotificacao] = useState<Notificacao | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFilter, setTipoFilter] = useState('TODOS')
  const [statusFilter, setStatusFilter] = useState('TODOS')

  const navigate = useNavigate()

  useEffect(() => {
    loadNotificacoes()
  }, [page, rowsPerPage, tipoFilter, statusFilter])

  const loadNotificacoes = async () => {
    setLoading(true)
    try {
      const params: any = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
      }

      if (tipoFilter !== 'TODOS') params.tipo = tipoFilter
      if (statusFilter !== 'TODOS') params.status = statusFilter
      if (searchTerm) params.search = searchTerm

      const response = await api.get('/fiscal/notificacoes', { params })
      setNotificacoes(response.data.itens || [])
      setTotal(response.data.total || 0)
    } catch (err) {
      console.error('Erro ao carregar notificações:', err)
      // Mock data
      const mockData: Notificacao[] = [
        {
          id: '1',
          numero: 'NOT-2024-001',
          tipo: 'NOTIFICACAO',
          contribuinte_nome: 'João Silva',
          contribuinte_cpf_cnpj: '123.456.789-00',
          descricao: 'Notificação de irregularidade fiscal',
          data_emissao: new Date().toISOString(),
          data_vencimento: new Date(Date.now() + 15 * 86400000).toISOString(),
          status: 'ENVIADA',
        },
        {
          id: '2',
          numero: 'INT-2024-002',
          tipo: 'INTIMACAO',
          contribuinte_nome: 'Empresa XYZ Ltda',
          contribuinte_cpf_cnpj: '12.345.678/0001-90',
          descricao: 'Intimação para apresentação de documentos',
          data_emissao: new Date(Date.now() - 5 * 86400000).toISOString(),
          data_vencimento: new Date(Date.now() + 10 * 86400000).toISOString(),
          status: 'RECEBIDA',
        },
        {
          id: '3',
          numero: 'AUT-2024-003',
          tipo: 'AUTO_INFRACAO',
          contribuinte_nome: 'Maria Santos',
          contribuinte_cpf_cnpj: '987.654.321-00',
          descricao: 'Auto de infração por falta de alvará',
          data_emissao: new Date(Date.now() - 10 * 86400000).toISOString(),
          data_vencimento: new Date(Date.now() + 20 * 86400000).toISOString(),
          status: 'CONTESTADA',
          valor: 5000.0,
        },
      ]
      setNotificacoes(mockData)
      setTotal(mockData.length)
    } finally {
      setLoading(false)
    }
  }

  const handleView = (notificacao: Notificacao) => {
    setSelectedNotificacao(notificacao)
    setOpenDialog(true)
  }

  const handlePrint = (id: string) => {
    toast.info('Gerando PDF da notificação...')
  }

  const handleSend = async (id: string) => {
    try {
      await api.post(`/fiscal/notificacoes/${id}/enviar`)
      toast.success('Notificação enviada com sucesso!')
      loadNotificacoes()
    } catch (err) {
      toast.error('Erro ao enviar notificação')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente cancelar esta notificação?')) {
      try {
        await api.delete(`/fiscal/notificacoes/${id}`)
        toast.success('Notificação cancelada')
        loadNotificacoes()
      } catch (err) {
        toast.error('Erro ao cancelar notificação')
      }
    }
  }

  const getTipoColor = (tipo: Notificacao['tipo']) => {
    const colors = {
      INTIMACAO: 'warning',
      NOTIFICACAO: 'info',
      AUTO_INFRACAO: 'error',
      COBRANCA: 'primary',
    }
    return colors[tipo] as any
  }

  const getStatusColor = (status: Notificacao['status']) => {
    const colors = {
      PENDENTE: 'default',
      ENVIADA: 'info',
      RECEBIDA: 'success',
      CONTESTADA: 'warning',
      CANCELADA: 'error',
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

  const notificacoesFiltradas = notificacoes.filter((n) =>
    searchTerm
      ? n.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.contribuinte_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.contribuinte_cpf_cnpj.includes(searchTerm)
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
        <Typography color="text.primary">Notificações</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Notificações Fiscais</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/fiscal/notificacoes/nova')}>
            Nova Notificação
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
                <MenuItem value="INTIMACAO">Intimação</MenuItem>
                <MenuItem value="NOTIFICACAO">Notificação</MenuItem>
                <MenuItem value="AUTO_INFRACAO">Auto de Infração</MenuItem>
                <MenuItem value="COBRANCA">Cobrança</MenuItem>
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
                <MenuItem value="PENDENTE">Pendente</MenuItem>
                <MenuItem value="ENVIADA">Enviada</MenuItem>
                <MenuItem value="RECEBIDA">Recebida</MenuItem>
                <MenuItem value="CONTESTADA">Contestada</MenuItem>
                <MenuItem value="CANCELADA">Cancelada</MenuItem>
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
                  <TableCell>CPF/CNPJ</TableCell>
                  <TableCell>Emissão</TableCell>
                  <TableCell>Vencimento</TableCell>
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
                ) : notificacoesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Nenhuma notificação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  notificacoesFiltradas
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((notificacao) => (
                      <TableRow key={notificacao.id} hover>
                        <TableCell>{notificacao.numero}</TableCell>
                        <TableCell>
                          <Chip label={notificacao.tipo.replace('_', ' ')} color={getTipoColor(notificacao.tipo)} size="small" />
                        </TableCell>
                        <TableCell>{notificacao.contribuinte_nome}</TableCell>
                        <TableCell>{notificacao.contribuinte_cpf_cnpj}</TableCell>
                        <TableCell>{formatDate(notificacao.data_emissao)}</TableCell>
                        <TableCell>{formatDate(notificacao.data_vencimento)}</TableCell>
                        <TableCell>
                          <Chip label={notificacao.status} color={getStatusColor(notificacao.status)} size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Visualizar">
                            <IconButton size="small" onClick={() => handleView(notificacao)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Imprimir">
                            <IconButton size="small" onClick={() => handlePrint(notificacao.id)}>
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {notificacao.status === 'PENDENTE' && (
                            <Tooltip title="Enviar">
                              <IconButton size="small" onClick={() => handleSend(notificacao.id)}>
                                <SendIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {notificacao.status !== 'CANCELADA' && (
                            <Tooltip title="Cancelar">
                              <IconButton size="small" onClick={() => handleDelete(notificacao.id)}>
                                <DeleteIcon fontSize="small" color="error" />
                              </IconButton>
                            </Tooltip>
                          )}
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
        <DialogTitle>Detalhes da Notificação</DialogTitle>
        <DialogContent>
          {selectedNotificacao && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Número
                  </Typography>
                  <Typography variant="body1">{selectedNotificacao.numero}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Tipo
                  </Typography>
                  <Typography variant="body1">
                    <Chip label={selectedNotificacao.tipo.replace('_', ' ')} color={getTipoColor(selectedNotificacao.tipo)} size="small" />
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Contribuinte
                  </Typography>
                  <Typography variant="body1">{selectedNotificacao.contribuinte_nome}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    CPF/CNPJ
                  </Typography>
                  <Typography variant="body1">{selectedNotificacao.contribuinte_cpf_cnpj}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Descrição
                  </Typography>
                  <Typography variant="body1">{selectedNotificacao.descricao}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Data de Emissão
                  </Typography>
                  <Typography variant="body1">{formatDate(selectedNotificacao.data_emissao)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Data de Vencimento
                  </Typography>
                  <Typography variant="body1">{formatDate(selectedNotificacao.data_vencimento)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1">
                    <Chip label={selectedNotificacao.status} color={getStatusColor(selectedNotificacao.status)} size="small" />
                  </Typography>
                </Grid>
                {selectedNotificacao.valor && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Valor
                    </Typography>
                    <Typography variant="body1">
                      R$ {selectedNotificacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fechar</Button>
          {selectedNotificacao && (
            <Button variant="contained" startIcon={<PrintIcon />} onClick={() => handlePrint(selectedNotificacao.id)}>
              Imprimir
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}
