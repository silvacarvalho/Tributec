import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Box,
  Alert,
  Autocomplete,
  CircularProgress
} from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fiscalService } from '../../services/fiscalService'
import { parametroService } from '../../services/parametroService'
import { ParameterInfoIcon } from '../common/ParameterInfoIcon'
import type { AutoInfracaoCreate } from '../../types/fiscal'

interface LavrarAutoDialogProps {
  open: boolean
  onClose: () => void
}

export function LavrarAutoDialog({ open, onClose }: LavrarAutoDialogProps) {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<Partial<AutoInfracaoCreate>>({
    codigo_infracao: '',
    autuado_id: '',
    fiscal_autuante_id: '',
    local_infracao: '',
    valor_base_calculo: undefined,
    observacoes: ''
  })

  const [infracaoSelecionada, setInfracaoSelecionada] = useState<any>(null)

  // Buscar catálogo de infrações
  const { data: catalogo } = useQuery({
    queryKey: ['catalogo-infracoes'],
    queryFn: () => fiscalService.listarCatalogoInfracoes({ ativo: true })
  })

  // Buscar UFM atual
  const { data: ufm } = useQuery({
    queryKey: ['ufm-atual'],
    queryFn: () => parametroService.obterUfmAtual()
  })

  // Mutation para lavrar auto
  const lavrarMutation = useMutation({
    mutationFn: (dados: AutoInfracaoCreate) => fiscalService.lavrarAuto(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autos-infracao'] })
      onClose()
      setFormData({
        codigo_infracao: '',
        autuado_id: '',
        fiscal_autuante_id: '',
        local_infracao: '',
        valor_base_calculo: undefined,
        observacoes: ''
      })
    }
  })

  // Atualiza infração selecionada quando código muda
  useEffect(() => {
    if (formData.codigo_infracao && catalogo?.items) {
      const infracao = catalogo.items.find(i => i.codigo === formData.codigo_infracao)
      setInfracaoSelecionada(infracao || null)
    } else {
      setInfracaoSelecionada(null)
    }
  }, [formData.codigo_infracao, catalogo])

  const handleChange = (field: keyof AutoInfracaoCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.codigo_infracao || !formData.autuado_id || !formData.fiscal_autuante_id) {
      return
    }

    lavrarMutation.mutate(formData as AutoInfracaoCreate)
  }

  const calcularMultaEstimada = () => {
    if (!infracaoSelecionada || !ufm) return null

    const ufmValor = ufm.valor_ufm

    if (infracaoSelecionada.tipo_multa === 'FIXA_UFM') {
      const valorUfm = infracaoSelecionada.valor_multa_ufm || 0
      return valorUfm * ufmValor
    }

    if (infracaoSelecionada.tipo_multa === 'PERCENTUAL' && formData.valor_base_calculo) {
      const percentual = infracaoSelecionada.percentual_multa || 0
      return (formData.valor_base_calculo * percentual) / 100
    }

    if (infracaoSelecionada.tipo_multa === 'MISTA') {
      const fixaUfm = (infracaoSelecionada.valor_multa_ufm || 0) * ufmValor
      const percentual = infracaoSelecionada.percentual_multa || 0
      const percentualValor = formData.valor_base_calculo
        ? (formData.valor_base_calculo * percentual) / 100
        : 0
      return fixaUfm + percentualValor
    }

    return null
  }

  const multaEstimada = calcularMultaEstimada()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Lavrar Auto de Infração</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* Infração */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Infração"
                value={formData.codigo_infracao}
                onChange={(e) => handleChange('codigo_infracao', e.target.value)}
                required
              >
                {catalogo?.items.map((infracao) => (
                  <MenuItem key={infracao.codigo} value={infracao.codigo}>
                    {infracao.codigo} - {infracao.descricao}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Detalhes da Infração Selecionada */}
            {infracaoSelecionada && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="subtitle2" gutterBottom>
                    {infracaoSelecionada.descricao}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Base legal: {infracaoSelecionada.base_legal || infracaoSelecionada.artigo_lei}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tipo: {infracaoSelecionada.tipo_multa} | Gravidade: {infracaoSelecionada.gravidade}
                  </Typography>
                  {infracaoSelecionada.tipo_multa === 'FIXA_UFM' && (
                    <Typography variant="body2" fontWeight="medium">
                      Multa: {infracaoSelecionada.valor_multa_ufm} UFM (R${' '}
                      {(infracaoSelecionada.valor_multa_ufm * (ufm?.valor_ufm || 0)).toFixed(2)})
                    </Typography>
                  )}
                  {infracaoSelecionada.tipo_multa === 'PERCENTUAL' && (
                    <Typography variant="body2" fontWeight="medium">
                      Multa: {infracaoSelecionada.percentual_multa}% sobre o valor
                    </Typography>
                  )}
                </Alert>
              </Grid>
            )}

            {/* Valor Base de Cálculo (se percentual) */}
            {infracaoSelecionada &&
              (infracaoSelecionada.tipo_multa === 'PERCENTUAL' ||
                infracaoSelecionada.tipo_multa === 'MISTA') && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Valor Base de Cálculo"
                    value={formData.valor_base_calculo || ''}
                    onChange={(e) =>
                      handleChange('valor_base_calculo', parseFloat(e.target.value))
                    }
                    required
                    InputProps={{
                      startAdornment: 'R$',
                      endAdornment: (
                        <ParameterInfoIcon
                          parameterKey="VALOR_BASE"
                          title="Valor Base de Cálculo"
                          description="Valor sobre o qual será aplicado o percentual da multa"
                          helpText="Por exemplo: valor omitido em declaração, valor não tributado, etc."
                        />
                      )
                    }}
                  />
                </Grid>
              )}

            {/* Multa Estimada */}
            {multaEstimada !== null && (
              <Grid item xs={12} md={6}>
                <Alert severity="success">
                  <Typography variant="subtitle2">Multa Estimada</Typography>
                  <Typography variant="h6">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(multaEstimada)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Cálculo automático baseado nos parâmetros do sistema
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Autuado ID */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ID do Autuado (UUID)"
                value={formData.autuado_id}
                onChange={(e) => handleChange('autuado_id', e.target.value)}
                required
                helperText="UUID da pessoa autuada"
              />
            </Grid>

            {/* Fiscal Autuante ID */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ID do Fiscal (UUID)"
                value={formData.fiscal_autuante_id}
                onChange={(e) => handleChange('fiscal_autuante_id', e.target.value)}
                required
                helperText="UUID do fiscal autuante"
              />
            </Grid>

            {/* Local da Infração */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Local da Infração"
                value={formData.local_infracao}
                onChange={(e) => handleChange('local_infracao', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>

            {/* Observações */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>

            {/* Informação sobre UFM */}
            {ufm && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  UFM atual ({ufm.ano}): R$ {ufm.valor_ufm.toFixed(2)}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !formData.codigo_infracao ||
            !formData.autuado_id ||
            !formData.fiscal_autuante_id ||
            lavrarMutation.isPending
          }
        >
          {lavrarMutation.isPending ? <CircularProgress size={24} /> : 'Lavrar Auto'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
