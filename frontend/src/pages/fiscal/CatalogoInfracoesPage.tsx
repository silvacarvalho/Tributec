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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material'
import {
  Add,
  Edit,
  FilterList,
  Visibility,
  ToggleOff,
  ToggleOn,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fiscalService } from '../../services/fiscalService'
import type { CatalogoInfracao, CatalogoInfracaoCreate, CatalogoInfracaoUpdate } from '../../types/fiscal'

const GRAVIDADES = ['LEVE', 'MÉDIA', 'GRAVE', 'GRAVÍSSIMA']
const TIPOS_MULTA = ['FIXA_UFM', 'PERCENTUAL', 'MISTA']

export function CatalogoInfracoesPage() {
  const queryClient = useQueryClient()
  const [filtros, setFiltros] = useState({
    ativo: '',
    gravidade: '',
  })
  const [dialogAberto, setDialogAberto] = useState(false)
  const [dialogDetalhes, setDialogDetalhes] = useState(false)
  const [infracaoSelecionada, setInfracaoSelecionada] = useState<CatalogoInfracao | null>(null)
  const [modoEdicao, setModoEdicao] = useState(false)

  const [formData, setFormData] = useState<CatalogoInfracaoCreate>({
    codigo: '',
    descricao: '',
    base_legal: '',
    gravidade: 'MÉDIA',
    tipo_multa: 'FIXA_UFM',
    valor_ufm: 1,
    percentual: 0,
    prazo_defesa_dias: 30,
    percentual_reincidencia: 50,
    ativo: true,
    observacoes: '',
  })

  const { data: catalogo, isLoading } = useQuery({
    queryKey: ['catalogo-infracoes', filtros],
    queryFn: () => fiscalService.listarCatalogoInfracoes(filtros as any),
  })

  const criarMutation = useMutation({
    mutationFn: (dados: CatalogoInfracaoCreate) => fiscalService.criarCatalogoInfracao(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo-infracoes'] })
      setDialogAberto(false)
      handleResetForm()
    },
  })

  const atualizarMutation = useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: CatalogoInfracaoUpdate }) =>
      fiscalService.atualizarCatalogoInfracao(id, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo-infracoes'] })
      setDialogAberto(false)
      setModoEdicao(false)
      handleResetForm()
    },
  })

  const handleAbrirCriar = () => {
    setModoEdicao(false)
    handleResetForm()
    setDialogAberto(true)
  }

  const handleAbrirEditar = (infracao: CatalogoInfracao) => {
    setModoEdicao(true)
    setInfracaoSelecionada(infracao)
    setFormData({
      codigo: infracao.codigo,
      descricao: infracao.descricao,
      base_legal: infracao.base_legal || '',
      gravidade: infracao.gravidade,
      tipo_multa: infracao.tipo_multa,
      valor_ufm: infracao.valor_ufm || 0,
      percentual: infracao.percentual || 0,
      prazo_defesa_dias: infracao.prazo_defesa_dias,
      percentual_reincidencia: infracao.percentual_reincidencia || 0,
      ativo: infracao.ativo,
      observacoes: infracao.observacoes || '',
    })
    setDialogAberto(true)
  }

  const handleVisualizar = (infracao: CatalogoInfracao) => {
    setInfracaoSelecionada(infracao)
    setDialogDetalhes(true)
  }

  const handleSubmit = () => {
    if (!formData.codigo || !formData.descricao) return

    if (modoEdicao && infracaoSelecionada) {
      atualizarMutation.mutate({ id: infracaoSelecionada.id, dados: formData })
    } else {
      criarMutation.mutate(formData)
    }
  }

  const handleResetForm = () => {
    setFormData({
      codigo: '',
      descricao: '',
      base_legal: '',
      gravidade: 'MÉDIA',
      tipo_multa: 'FIXA_UFM',
      valor_ufm: 1,
      percentual: 0,
      prazo_defesa_dias: 30,
      percentual_reincidencia: 50,
      ativo: true,
      observacoes: '',
    })
    setInfracaoSelecionada(null)
  }

  const handleToggleAtivo = (infracao: CatalogoInfracao) => {
    atualizarMutation.mutate({
      id: infracao.id,
      dados: { ativo: !infracao.ativo },
    })
  }

  const getGravidadeColor = (gravidade: string) => {
    switch (gravidade) {
      case 'LEVE':
        return 'success'
      case 'MÉDIA':
        return 'info'
      case 'GRAVE':
        return 'warning'
      case 'GRAVÍSSIMA':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Catálogo de Infrações</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAbrirCriar}>
          Nova Infração
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FilterList color="action" />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={filtros.ativo}
              onChange={(e) => setFiltros({ ...filtros, ativo: e.target.value })}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="true">Ativos</MenuItem>
              <MenuItem value="false">Inativos</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Gravidade"
              value={filtros.gravidade}
              onChange={(e) => setFiltros({ ...filtros, gravidade: e.target.value })}
            >
              <MenuItem value="">Todas</MenuItem>
              {GRAVIDADES.map((grav) => (
                <MenuItem key={grav} value={grav}>
                  {grav}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Código</strong></TableCell>
              <TableCell><strong>Descrição</strong></TableCell>
              <TableCell><strong>Base Legal</strong></TableCell>
              <TableCell align="center"><strong>Gravidade</strong></TableCell>
              <TableCell align="center"><strong>Tipo Multa</strong></TableCell>
              <TableCell align="center"><strong>Valor</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : !catalogo?.items.length ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Nenhuma infração cadastrada
                </TableCell>
              </TableRow>
            ) : (
              catalogo.items.map((infracao) => (
                <TableRow key={infracao.id} hover>
                  <TableCell>{infracao.codigo}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {infracao.descricao}
                    </Typography>
                  </TableCell>
                  <TableCell>{infracao.base_legal || '-'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={infracao.gravidade}
                      color={getGravidadeColor(infracao.gravidade) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{infracao.tipo_multa}</TableCell>
                  <TableCell align="center">
                    {infracao.tipo_multa === 'FIXA_UFM' && `${infracao.valor_ufm} UFM`}
                    {infracao.tipo_multa === 'PERCENTUAL' && `${infracao.percentual}%`}
                    {infracao.tipo_multa === 'MISTA' && `${infracao.valor_ufm} UFM + ${infracao.percentual}%`}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={infracao.ativo ? 'Ativo' : 'Inativo'}
                      color={infracao.ativo ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleVisualizar(infracao)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleAbrirEditar(infracao)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleAtivo(infracao)}
                      color={infracao.ativo ? 'error' : 'success'}
                    >
                      {infracao.ativo ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Criar/Editar */}
      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="md" fullWidth>
        <DialogTitle>{modoEdicao ? 'Editar Infração' : 'Nova Infração'}</DialogTitle>
        <DialogContent>
          {(criarMutation.isError || atualizarMutation.isError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Erro ao salvar infração. Tente novamente.
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Código"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                required
                disabled={modoEdicao}
                helperText={modoEdicao ? 'Código não pode ser alterado' : ''}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Gravidade"
                value={formData.gravidade}
                onChange={(e) => setFormData({ ...formData, gravidade: e.target.value as any })}
                required
              >
                {GRAVIDADES.map((grav) => (
                  <MenuItem key={grav} value={grav}>
                    {grav}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Prazo Defesa (dias)"
                value={formData.prazo_defesa_dias}
                onChange={(e) => setFormData({ ...formData, prazo_defesa_dias: parseInt(e.target.value) })}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descrição"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Base Legal"
                value={formData.base_legal}
                onChange={(e) => setFormData({ ...formData, base_legal: e.target.value })}
                placeholder="Ex: Art. 123 da Lei Municipal 456/2020"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Configuração da Multa
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Tipo de Multa"
                value={formData.tipo_multa}
                onChange={(e) => setFormData({ ...formData, tipo_multa: e.target.value as any })}
                required
              >
                {TIPOS_MULTA.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {(formData.tipo_multa === 'FIXA_UFM' || formData.tipo_multa === 'MISTA') && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Valor em UFM"
                  value={formData.valor_ufm}
                  onChange={(e) => setFormData({ ...formData, valor_ufm: parseFloat(e.target.value) })}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            )}

            {(formData.tipo_multa === 'PERCENTUAL' || formData.tipo_multa === 'MISTA') && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Percentual (%)"
                  value={formData.percentual}
                  onChange={(e) => setFormData({ ...formData, percentual: parseFloat(e.target.value) })}
                  required
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                />
              </Grid>
            )}

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Acréscimo Reincidência (%)"
                value={formData.percentual_reincidencia}
                onChange={(e) => setFormData({ ...formData, percentual_reincidencia: parseFloat(e.target.value) })}
                inputProps={{ min: 0, max: 200, step: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Observações"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  />
                }
                label="Infração ativa"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !formData.codigo ||
              !formData.descricao ||
              criarMutation.isPending ||
              atualizarMutation.isPending
            }
          >
            {criarMutation.isPending || atualizarMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Detalhes */}
      <Dialog open={dialogDetalhes} onClose={() => setDialogDetalhes(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalhes da Infração</DialogTitle>
        <DialogContent>
          {infracaoSelecionada && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Código
                  </Typography>
                  <Typography variant="h6">{infracaoSelecionada.codigo}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Descrição
                  </Typography>
                  <Typography variant="body1">{infracaoSelecionada.descricao}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Base Legal
                  </Typography>
                  <Typography variant="body2">{infracaoSelecionada.base_legal || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Gravidade
                  </Typography>
                  <Box>
                    <Chip
                      label={infracaoSelecionada.gravidade}
                      color={getGravidadeColor(infracaoSelecionada.gravidade) as any}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Tipo de Multa
                  </Typography>
                  <Typography variant="body2">{infracaoSelecionada.tipo_multa}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Valor
                  </Typography>
                  <Typography variant="body2">
                    {infracaoSelecionada.tipo_multa === 'FIXA_UFM' && `${infracaoSelecionada.valor_ufm} UFM`}
                    {infracaoSelecionada.tipo_multa === 'PERCENTUAL' && `${infracaoSelecionada.percentual}%`}
                    {infracaoSelecionada.tipo_multa === 'MISTA' &&
                      `${infracaoSelecionada.valor_ufm} UFM + ${infracaoSelecionada.percentual}%`}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Prazo de Defesa
                  </Typography>
                  <Typography variant="body2">{infracaoSelecionada.prazo_defesa_dias} dias</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Acréscimo Reincidência
                  </Typography>
                  <Typography variant="body2">{infracaoSelecionada.percentual_reincidencia}%</Typography>
                </Grid>
                {infracaoSelecionada.observacoes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Observações
                    </Typography>
                    <Typography variant="body2">{infracaoSelecionada.observacoes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogDetalhes(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
