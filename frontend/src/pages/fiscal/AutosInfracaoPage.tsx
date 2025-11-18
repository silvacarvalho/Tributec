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
  Grid
} from '@mui/material'
import { Add, Search } from '@mui/icons-material'
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
    data_fim: ''
  })
  const [dialogAberto, setDialogAberto] = useState(false)

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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Autos de Infração</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogAberto(true)}>
          Lavrar Auto
        </Button>
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
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : autos?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nenhum auto encontrado
                </TableCell>
              </TableRow>
            ) : (
              autos?.items.map((auto) => (
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
