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
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { fiscalService } from '../../services/fiscalService'
import type { CatalogoInfracao, CatalogoInfracaoCreate } from '../../types/fiscal'

interface CatalogoInfracaoDialogProps {
  open: boolean
  onClose: () => void
  infracao?: CatalogoInfracao | null
  readOnly?: boolean
}

export function CatalogoInfracaoDialog({
  open,
  onClose,
  infracao,
  readOnly = false
}: CatalogoInfracaoDialogProps) {
  const queryClient = useQueryClient()
  const isEdicao = !!infracao

  const [formData, setFormData] = useState<Partial<CatalogoInfracaoCreate>>({
    codigo: '',
    descricao: '',
    base_legal: '',
    artigo_lei: '',
    inciso: '',
    paragrafo: '',
    tipo_multa: 'FIXA_UFM',
    valor_multa_ufm: undefined,
    percentual_multa: undefined,
    gravidade: 'MEDIA',
    permite_parcelamento: true,
    aplicavel_reincidencia: true,
    percentual_acrescimo_reincidencia: 50,
    prazo_defesa_dias: 30,
    ativo: true,
    observacoes: ''
  })

  useEffect(() => {
    if (infracao) {
      setFormData({
        codigo: infracao.codigo,
        descricao: infracao.descricao,
        base_legal: infracao.base_legal || '',
        artigo_lei: infracao.artigo_lei || '',
        inciso: infracao.inciso || '',
        paragrafo: infracao.paragrafo || '',
        tipo_multa: infracao.tipo_multa,
        valor_multa_ufm: infracao.valor_multa_ufm,
        percentual_multa: infracao.percentual_multa,
        gravidade: infracao.gravidade,
        permite_parcelamento: infracao.permite_parcelamento,
        aplicavel_reincidencia: infracao.aplicavel_reincidencia,
        percentual_acrescimo_reincidencia: infracao.percentual_acrescimo_reincidencia,
        prazo_defesa_dias: infracao.prazo_defesa_dias,
        ativo: infracao.ativo,
        observacoes: infracao.observacoes || ''
      })
    } else {
      setFormData({
        codigo: '',
        descricao: '',
        base_legal: '',
        artigo_lei: '',
        inciso: '',
        paragrafo: '',
        tipo_multa: 'FIXA_UFM',
        valor_multa_ufm: undefined,
        percentual_multa: undefined,
        gravidade: 'MEDIA',
        permite_parcelamento: true,
        aplicavel_reincidencia: true,
        percentual_acrescimo_reincidencia: 50,
        prazo_defesa_dias: 30,
        ativo: true,
        observacoes: ''
      })
    }
  }, [infracao, open])

  const criarMutation = useMutation({
    mutationFn: (dados: CatalogoInfracaoCreate) => fiscalService.criarCatalogoInfracao(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo-infracoes'] })
      toast.success('Infração criada com sucesso!')
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao criar infração')
    }
  })

  const atualizarMutation = useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: any }) =>
      fiscalService.atualizarCatalogoInfracao(id, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo-infracoes'] })
      toast.success('Infração atualizada com sucesso!')
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar infração')
    }
  })

  const handleChange = (field: keyof CatalogoInfracaoCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.codigo || !formData.descricao || !formData.tipo_multa) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (formData.tipo_multa === 'FIXA_UFM' && !formData.valor_multa_ufm) {
      toast.error('Informe o valor da multa em UFM')
      return
    }

    if (formData.tipo_multa === 'PERCENTUAL' && !formData.percentual_multa) {
      toast.error('Informe o percentual da multa')
      return
    }

    if (isEdicao && infracao) {
      atualizarMutation.mutate({
        id: infracao.id,
        dados: formData
      })
    } else {
      criarMutation.mutate(formData as CatalogoInfracaoCreate)
    }
  }

  const isPending = criarMutation.isPending || atualizarMutation.isPending

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {readOnly ? 'Visualizar' : isEdicao ? 'Editar' : 'Nova'} Infração
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* Código */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Código"
                value={formData.codigo}
                onChange={(e) => handleChange('codigo', e.target.value)}
                required
                disabled={readOnly}
                helperText="Ex: ART-101"
              />
            </Grid>

            {/* Gravidade */}
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Gravidade"
                value={formData.gravidade}
                onChange={(e) => handleChange('gravidade', e.target.value)}
                required
                disabled={readOnly}
              >
                <MenuItem value="LEVE">Leve</MenuItem>
                <MenuItem value="MEDIA">Média</MenuItem>
                <MenuItem value="GRAVE">Grave</MenuItem>
                <MenuItem value="GRAVISSIMA">Gravíssima</MenuItem>
              </TextField>
            </Grid>

            {/* Ativo */}
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.ativo}
                    onChange={(e) => handleChange('ativo', e.target.checked)}
                    disabled={readOnly}
                  />
                }
                label="Ativa"
              />
            </Grid>

            {/* Descrição */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição da Infração"
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                multiline
                rows={3}
                required
                disabled={readOnly}
              />
            </Grid>

            {/* Base Legal */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Base Legal"
                value={formData.base_legal}
                onChange={(e) => handleChange('base_legal', e.target.value)}
                disabled={readOnly}
                helperText="Ex: Lei Municipal 1234/2020"
              />
            </Grid>

            {/* Artigo */}
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Artigo"
                value={formData.artigo_lei}
                onChange={(e) => handleChange('artigo_lei', e.target.value)}
                disabled={readOnly}
              />
            </Grid>

            {/* Inciso */}
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Inciso"
                value={formData.inciso}
                onChange={(e) => handleChange('inciso', e.target.value)}
                disabled={readOnly}
              />
            </Grid>

            {/* Parágrafo */}
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Parágrafo"
                value={formData.paragrafo}
                onChange={(e) => handleChange('paragrafo', e.target.value)}
                disabled={readOnly}
              />
            </Grid>

            {/* Tipo de Multa */}
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Tipo de Multa"
                value={formData.tipo_multa}
                onChange={(e) => handleChange('tipo_multa', e.target.value)}
                required
                disabled={readOnly}
              >
                <MenuItem value="FIXA_UFM">Fixa em UFM</MenuItem>
                <MenuItem value="PERCENTUAL">Percentual</MenuItem>
                <MenuItem value="MISTA">Mista (UFM + Percentual)</MenuItem>
              </TextField>
            </Grid>

            {/* Valor UFM */}
            {(formData.tipo_multa === 'FIXA_UFM' || formData.tipo_multa === 'MISTA') && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Valor em UFM"
                  value={formData.valor_multa_ufm || ''}
                  onChange={(e) => handleChange('valor_multa_ufm', parseFloat(e.target.value))}
                  required
                  disabled={readOnly}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            )}

            {/* Percentual */}
            {(formData.tipo_multa === 'PERCENTUAL' || formData.tipo_multa === 'MISTA') && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Percentual (%)"
                  value={formData.percentual_multa || ''}
                  onChange={(e) => handleChange('percentual_multa', parseFloat(e.target.value))}
                  required
                  disabled={readOnly}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                />
              </Grid>
            )}

            {/* Prazo de Defesa */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Prazo de Defesa (dias)"
                value={formData.prazo_defesa_dias}
                onChange={(e) => handleChange('prazo_defesa_dias', parseInt(e.target.value))}
                disabled={readOnly}
                inputProps={{ min: 1 }}
              />
            </Grid>

            {/* Permite Parcelamento */}
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.permite_parcelamento}
                    onChange={(e) => handleChange('permite_parcelamento', e.target.checked)}
                    disabled={readOnly}
                  />
                }
                label="Permite Parcelamento"
              />
            </Grid>

            {/* Reincidência */}
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.aplicavel_reincidencia}
                    onChange={(e) => handleChange('aplicavel_reincidencia', e.target.checked)}
                    disabled={readOnly}
                  />
                }
                label="Aplica Reincidência"
              />
            </Grid>

            {/* Percentual de Acréscimo por Reincidência */}
            {formData.aplicavel_reincidencia && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Acréscimo Reincidência (%)"
                  value={formData.percentual_acrescimo_reincidencia}
                  onChange={(e) =>
                    handleChange('percentual_acrescimo_reincidencia', parseFloat(e.target.value))
                  }
                  disabled={readOnly}
                  inputProps={{ min: 0, max: 200, step: 1 }}
                />
              </Grid>
            )}

            {/* Observações */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                multiline
                rows={2}
                disabled={readOnly}
              />
            </Grid>

            {/* Alerta de Informação */}
            {formData.tipo_multa === 'FIXA_UFM' && formData.valor_multa_ufm && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Esta infração terá multa fixa de {formData.valor_multa_ufm} UFM, independente
                    do valor envolvido.
                  </Typography>
                </Alert>
              </Grid>
            )}

            {formData.tipo_multa === 'PERCENTUAL' && formData.percentual_multa && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    A multa será calculada como {formData.percentual_multa}% sobre o valor base
                    informado no auto de infração.
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {readOnly ? 'Fechar' : 'Cancelar'}
        </Button>
        {!readOnly && (
          <Button variant="contained" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <CircularProgress size={24} /> : isEdicao ? 'Atualizar' : 'Criar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
