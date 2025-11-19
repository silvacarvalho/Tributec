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
  Chip,
  Button,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  TablePagination,
  Collapse
} from '@mui/material'
import {
  Add,
  Search,
  Visibility,
  Assessment,
  FileDownload,
  ExpandMore,
  ExpandLess,
  Dashboard as DashboardIcon
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

export function AutosInfracaoPage() {
  const navigate = useNavigate()
  const [filtros, setFiltros] = useState({
    status: '',
    data_inicio: '',
    data_fim: '',
    numero_auto: '',
    autuado_nome: ''
  })
  const [dialogAberto, setDialogAberto] = useState(false)
  const [filtrosExpanded, setFiltrosExpanded] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { data: autos, isLoading } = useQuery({
    queryKey: ['autos-infracao', filtros],
    queryFn: () => fiscalService.listarAutos(filtros as any)
  })

  const { data: estatisticas } = useQuery({
    queryKey: ['estatisticas-autos'],
    queryFn: () => fiscalService.obterEstatisticasPorStatus()
  })

  const { data: valores } = useQuery({
    queryKey: ['valores-autos'],
    queryFn: () => fiscalService.obterEstatisticasValores()
  })

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarData = (data: string | null) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const handleVerDetalhes = (autoId: string) => {
    navigate(`/fiscal/autos/${autoId}`)
  }

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleExportarExcel = () => {
    // Simular exportação
    const csvContent = [
      ['Número', 'Data', 'Autuado', 'Infração', 'Valor', 'Status'].join(';'),
      ...(autos?.items || []).map((auto: any) =>
        [
          auto.numero_auto,
          formatarData(auto.data_lavratura),
          auto.autuado_nome,
          auto.codigo_infracao,
          auto.valor_total,
          auto.status
        ].join(';')
      )
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `autos-infracao-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const autosPaginados = autos?.items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) || []

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Autos de Infração</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/fiscal/dashboard')}
          >
            Dashboard
          </Button>
          <Button variant="outlined" startIcon={<Assessment />} onClick={() => navigate('/fiscal/catalogo')}>
            Catálogo
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={handleExportarExcel}
            disabled={!autos?.items || autos.items.length === 0}
          >
            Exportar
          </Button>
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
            <Typography variant="h5">
              {formatarMoeda(valores?.total_lavrado || 0)}
            </Typography>
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

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Filtros</Typography>
          <Button
            size="small"
            onClick={() => setFiltrosExpanded(!filtrosExpanded)}
            endIcon={filtrosExpanded ? <ExpandLess /> : <ExpandMore />}
          >
            {filtrosExpanded ? 'Ocultar' : 'Mostrar'} Avançado
          </Button>
        </Box>

        <Grid container spacing={2} alignItems="center">
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
            <Button fullWidth variant="outlined" startIcon={<Search />}>
              Pesquisar
            </Button>
          </Grid>
        </Grid>

        <Collapse in={filtrosExpanded}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número do Auto"
                value={filtros.numero_auto}
                onChange={(e) => setFiltros({ ...filtros, numero_auto: e.target.value })}
                size="small"
                placeholder="Ex: 2024/001"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Autuado"
                value={filtros.autuado_nome}
                onChange={(e) => setFiltros({ ...filtros, autuado_nome: e.target.value })}
                size="small"
                placeholder="Digite o nome"
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
              <TableCell>Número</TableCell>
              <TableCell>Data Lavratura</TableCell>
              <TableCell>Autuado</TableCell>
              <TableCell>Infração</TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : autos?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhum auto encontrado
                </TableCell>
              </TableRow>
            ) : (
              autosPaginados.map((auto: any) => (
                <TableRow key={auto.id} hover>
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
                    <Typography variant="caption" color="text.secondary" noWrap>
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
                  <TableCell align="center">
                    <Tooltip title="Ver Detalhes">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleVerDetalhes(auto.id)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={autos?.items.length || 0}
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
