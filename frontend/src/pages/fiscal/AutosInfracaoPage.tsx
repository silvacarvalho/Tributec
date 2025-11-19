import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  Button,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Collapse,
  InputAdornment,
  Tooltip,
} from '@mui/material'
import {
  Add,
  Search,
  FilterList,
  FileDownload,
  ExpandMore,
  ExpandLess,
  TableChart,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { fiscalService } from '../../services/fiscalService'
import { LavrarAutoDialog } from '../../components/fiscal/LavrarAutoDialog'
import type { StatusAutoInfracao } from '../../types/fiscal'

const STATUS_COLORS: Record<StatusAutoInfracao, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  LAVRADO: 'default',
  NOTIFICADO: 'warning',
  PAGO: 'success',
  EM_DEFESA: 'info',
  EM_RECURSO: 'info',
  DEFERIDO: 'success',
  INDEFERIDO: 'error',
  CANCELADO: 'default',
  INSCRITO_DIVIDA: 'error',
}

type OrderBy = 'numero_auto' | 'data_lavratura' | 'autuado_nome' | 'valor_total' | 'status'
type Order = 'asc' | 'desc'

export function AutosInfracaoPage() {
  const navigate = useNavigate()
  const [dialogAberto, setDialogAberto] = useState(false)
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

  // Estados de paginação e ordenação
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [order, setOrder] = useState<Order>('desc')
  const [orderBy, setOrderBy] = useState<OrderBy>('data_lavratura')

  // Estados de filtros
  const [busca, setBusca] = useState('')
  const [filtros, setFiltros] = useState({
    status: '',
    data_inicio: '',
    data_fim: '',
    fiscal_autuante: '',
    codigo_infracao: '',
    valor_min: '',
    valor_max: '',
  })

  const { data: autos, isLoading } = useQuery({
    queryKey: ['autos-infracao', filtros, page, rowsPerPage, order, orderBy, busca],
    queryFn: () => fiscalService.listarAutos({
      ...filtros,
      busca,
      page: page + 1,
      limit: rowsPerPage,
      order_by: orderBy,
      order_direction: order,
    } as any),
  })

  const { data: estatisticas } = useQuery({
    queryKey: ['estatisticas-autos'],
    queryFn: () => fiscalService.obterEstatisticasPorStatus(),
  })

  const { data: valores } = useQuery({
    queryKey: ['valores-autos'],
    queryFn: () => fiscalService.obterEstatisticasValores(),
  })

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const formatarData = (data: string | null) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleLimparFiltros = () => {
    setBusca('')
    setFiltros({
      status: '',
      data_inicio: '',
      data_fim: '',
      fiscal_autuante: '',
      codigo_infracao: '',
      valor_min: '',
      valor_max: '',
    })
    setPage(0)
  }

  const handleExportarCSV = () => {
    if (!autos?.items) return

    const headers = ['Número', 'Data', 'Autuado', 'CPF/CNPJ', 'Infração', 'Valor', 'Status']
    const rows = autos.items.map((auto) => [
      auto.numero_auto,
      formatarData(auto.data_lavratura),
      auto.autuado_nome,
      auto.autuado_cpf_cnpj,
      `${auto.codigo_infracao} - ${auto.descricao_infracao}`,
      auto.valor_total.toFixed(2).replace('.', ','),
      auto.status,
    ])

    const csv = [headers, ...rows].map((row) => row.join(';')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `autos-infracao-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleExportarExcel = () => {
    if (!autos?.items) return

    // Criar HTML table para Excel
    const headers = ['Número', 'Data', 'Autuado', 'CPF/CNPJ', 'Infração', 'Valor', 'Status']
    const rows = autos.items.map((auto) => [
      auto.numero_auto,
      formatarData(auto.data_lavratura),
      auto.autuado_nome,
      auto.autuado_cpf_cnpj,
      `${auto.codigo_infracao} - ${auto.descricao_infracao}`,
      formatarMoeda(auto.valor_total),
      auto.status,
    ])

    const htmlTable = `
      <table>
        <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    `

    const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `autos-infracao-${new Date().toISOString().split('T')[0]}.xls`
    link.click()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Autos de Infração</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Exportar para CSV">
            <IconButton onClick={handleExportarCSV} disabled={!autos?.items.length}>
              <FileDownload />
            </IconButton>
          </Tooltip>
          <Tooltip title="Exportar para Excel">
            <IconButton onClick={handleExportarExcel} disabled={!autos?.items.length}>
              <TableChart />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogAberto(true)}>
            Lavrar Auto
          </Button>
        </Box>
      </Box>

      {/* Diálogo de Lavrar Auto */}
      <LavrarAutoDialog open={dialogAberto} onClose={() => setDialogAberto(false)} />

      {/* Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Lavrado
            </Typography>
            <Typography variant="h5">{formatarMoeda(valores?.total_lavrado || 0)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Pago
            </Typography>
            <Typography variant="h5" color="success.main">
              {formatarMoeda(valores?.total_pago || 0)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Pendente
            </Typography>
            <Typography variant="h5" color="warning.main">
              {formatarMoeda(valores?.total_pendente || 0)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total de Autos
            </Typography>
            <Typography variant="h5">{autos?.total || 0}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Busca e Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Buscar por número do auto, CPF/CNPJ ou nome do autuado..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={filtrosAbertos ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            >
              Filtros Avançados
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="text" onClick={handleLimparFiltros}>
              Limpar Filtros
            </Button>
          </Grid>
        </Grid>

        {/* Filtros Avançados (Colapsável) */}
        <Collapse in={filtrosAbertos} timeout="auto" unmountOnExit>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                size="small"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="LAVRADO">Lavrado</MenuItem>
                <MenuItem value="NOTIFICADO">Notificado</MenuItem>
                <MenuItem value="PAGO">Pago</MenuItem>
                <MenuItem value="EM_DEFESA">Em Defesa</MenuItem>
                <MenuItem value="DEFERIDO">Deferido</MenuItem>
                <MenuItem value="INDEFERIDO">Indeferido</MenuItem>
                <MenuItem value="CANCELADO">Cancelado</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Data Início"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Data Fim"
                value={filtros.data_fim}
                onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Código da Infração"
                value={filtros.codigo_infracao}
                onChange={(e) => setFiltros({ ...filtros, codigo_infracao: e.target.value })}
                size="small"
                placeholder="Ex: 001"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Fiscal Autuante"
                value={filtros.fiscal_autuante}
                onChange={(e) => setFiltros({ ...filtros, fiscal_autuante: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Valor Mínimo"
                value={filtros.valor_min}
                onChange={(e) => setFiltros({ ...filtros, valor_min: e.target.value })}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Valor Máximo"
                value={filtros.valor_max}
                onChange={(e) => setFiltros({ ...filtros, valor_max: e.target.value })}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'numero_auto'}
                  direction={orderBy === 'numero_auto' ? order : 'asc'}
                  onClick={() => handleRequestSort('numero_auto')}
                >
                  Número
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'data_lavratura'}
                  direction={orderBy === 'data_lavratura' ? order : 'asc'}
                  onClick={() => handleRequestSort('data_lavratura')}
                >
                  Data Lavratura
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'autuado_nome'}
                  direction={orderBy === 'autuado_nome' ? order : 'asc'}
                  onClick={() => handleRequestSort('autuado_nome')}
                >
                  Autuado
                </TableSortLabel>
              </TableCell>
              <TableCell>Infração</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'valor_total'}
                  direction={orderBy === 'valor_total' ? order : 'asc'}
                  onClick={() => handleRequestSort('valor_total')}
                >
                  Valor Total
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleRequestSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : !autos?.items.length ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nenhum auto encontrado
                </TableCell>
              </TableRow>
            ) : (
              autos.items.map((auto) => (
                <TableRow
                  key={auto.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/fiscal/autos-infracao/${auto.id}`)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {auto.numero_auto}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatarData(auto.data_lavratura)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{auto.autuado_nome}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {auto.autuado_cpf_cnpj}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{auto.codigo_infracao}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                      {auto.descricao_infracao.substring(0, 40)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatarMoeda(auto.valor_total)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={auto.status} color={STATUS_COLORS[auto.status]} size="small" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={autos?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>
    </Box>
  )
}
