import { useState } from 'react'
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
  Tooltip
} from '@mui/material'
import { Add, Edit, Search, Visibility } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { fiscalService } from '../../services/fiscalService'
import { CatalogoInfracaoDialog } from '../../components/fiscal/CatalogoInfracaoDialog'
import type { CatalogoInfracao } from '../../types/fiscal'

const GRAVIDADE_COLORS: Record<string, 'default' | 'warning' | 'error'> = {
  LEVE: 'default',
  MEDIA: 'warning',
  GRAVE: 'error',
  GRAVISSIMA: 'error',
}

export function CatalogoInfracoesPage() {
  const [filtros, setFiltros] = useState({
    ativo: 'true',
    gravidade: ''
  })
  const [dialogAberto, setDialogAberto] = useState(false)
  const [infracaoSelecionada, setInfracaoSelecionada] = useState<CatalogoInfracao | null>(null)
  const [modoVisualizacao, setModoVisualizacao] = useState(false)

  const { data: catalogo, isLoading } = useQuery({
    queryKey: ['catalogo-infracoes', filtros],
    queryFn: () => fiscalService.listarCatalogoInfracoes({
      ativo: filtros.ativo === 'true' ? true : filtros.ativo === 'false' ? false : undefined,
      gravidade: filtros.gravidade || undefined
    })
  })

  const handleNovo = () => {
    setInfracaoSelecionada(null)
    setModoVisualizacao(false)
    setDialogAberto(true)
  }

  const handleEditar = (infracao: CatalogoInfracao) => {
    setInfracaoSelecionada(infracao)
    setModoVisualizacao(false)
    setDialogAberto(true)
  }

  const handleVisualizar = (infracao: CatalogoInfracao) => {
    setInfracaoSelecionada(infracao)
    setModoVisualizacao(true)
    setDialogAberto(true)
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Catálogo de Infrações</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleNovo}>
          Nova Infração
        </Button>
      </Box>

      {/* Diálogo de CRUD */}
      <CatalogoInfracaoDialog
        open={dialogAberto}
        onClose={() => {
          setDialogAberto(false)
          setInfracaoSelecionada(null)
          setModoVisualizacao(false)
        }}
        infracao={infracaoSelecionada}
        readOnly={modoVisualizacao}
      />

      {/* Estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total de Infrações
            </Typography>
            <Typography variant="h5">{catalogo?.total || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Ativas
            </Typography>
            <Typography variant="h5" color="success.main">
              {catalogo?.items.filter(i => i.ativo).length || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Inativas
            </Typography>
            <Typography variant="h5" color="error.main">
              {catalogo?.items.filter(i => !i.ativo).length || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Gravíssimas
            </Typography>
            <Typography variant="h5" color="error.main">
              {catalogo?.items.filter(i => i.gravidade === 'GRAVISSIMA').length || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Status"
              value={filtros.ativo}
              onChange={(e) => setFiltros({ ...filtros, ativo: e.target.value })}
              size="small"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="true">Ativas</MenuItem>
              <MenuItem value="false">Inativas</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Gravidade"
              value={filtros.gravidade}
              onChange={(e) => setFiltros({ ...filtros, gravidade: e.target.value })}
              size="small"
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="LEVE">Leve</MenuItem>
              <MenuItem value="MEDIA">Média</MenuItem>
              <MenuItem value="GRAVE">Grave</MenuItem>
              <MenuItem value="GRAVISSIMA">Gravíssima</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
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
              <TableCell>Código</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Base Legal</TableCell>
              <TableCell>Gravidade</TableCell>
              <TableCell>Tipo Multa</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : catalogo?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Nenhuma infração encontrada
                </TableCell>
              </TableRow>
            ) : (
              catalogo?.items.map((infracao) => (
                <TableRow key={infracao.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {infracao.codigo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {infracao.descricao}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {infracao.base_legal || infracao.artigo_lei || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={infracao.gravidade}
                      color={GRAVIDADE_COLORS[infracao.gravidade]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {infracao.tipo_multa}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {infracao.tipo_multa === 'FIXA_UFM' && (
                      <Typography variant="body2">
                        {infracao.valor_multa_ufm} UFM
                      </Typography>
                    )}
                    {infracao.tipo_multa === 'PERCENTUAL' && (
                      <Typography variant="body2">
                        {infracao.percentual_multa}%
                      </Typography>
                    )}
                    {infracao.tipo_multa === 'MISTA' && (
                      <Typography variant="body2">
                        {infracao.valor_multa_ufm} UFM + {infracao.percentual_multa}%
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={infracao.ativo ? 'Ativa' : 'Inativa'}
                      color={infracao.ativo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Visualizar">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleVisualizar(infracao)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditar(infracao)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
