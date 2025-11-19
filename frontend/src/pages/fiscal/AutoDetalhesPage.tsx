import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { fiscalService } from '../../services/fiscalService'
import { AutoTimeline } from '../../components/fiscal/AutoTimeline'
import { AutoActions } from '../../components/fiscal/AutoActions'
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

export function AutoDetalhesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [dialogCancelar, setDialogCancelar] = useState(false)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')

  const { data: auto, isLoading } = useQuery({
    queryKey: ['auto-detalhes', id],
    queryFn: () => fiscalService.obterAutoPorId(id!),
    enabled: !!id
  })

  const cancelarMutation = useMutation({
    mutationFn: (motivo: string) => fiscalService.cancelarAuto(id!, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autos-infracao'] })
      queryClient.invalidateQueries({ queryKey: ['auto-detalhes', id] })
      toast.success('Auto cancelado com sucesso!')
      setDialogCancelar(false)
      setMotivoCancelamento('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao cancelar auto')
    }
  })

  const handleCancelar = () => {
    if (!motivoCancelamento || motivoCancelamento.length < 20) {
      toast.error('Informe um motivo válido (mínimo 20 caracteres)')
      return
    }

    cancelarMutation.mutate(motivoCancelamento)
  }

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

  const formatarCpfCnpj = (documento: string) => {
    const numeros = documento.replace(/\D/g, '')
    if (numeros.length === 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else if (numeros.length === 14) {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    return documento
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (!auto) {
    return (
      <Box>
        <Alert severity="error">Auto de infração não encontrado</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/fiscal/autos')}>
          Voltar
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/fiscal/autos')} sx={{ mr: 2 }}>
          Voltar
        </Button>
        <Typography variant="h4">Auto de Infração {auto.numero_auto}</Typography>
        <Chip
          label={auto.status}
          color={STATUS_COLORS[auto.status]}
          sx={{ ml: 2 }}
        />
      </Box>

      {/* Ações */}
      <Box sx={{ mb: 3 }}>
        <AutoActions auto={auto} onCancelar={() => setDialogCancelar(true)} />
      </Box>

      <Grid container spacing={3}>
        {/* Informações do Auto */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informações do Auto
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Número do Auto
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {auto.numero_auto}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Data de Lavratura
                </Typography>
                <Typography variant="body1">{formatarData(auto.data_lavratura)}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Local da Infração
                </Typography>
                <Typography variant="body1">{auto.local_infracao || '-'}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Código da Infração
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {auto.codigo_infracao}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Gravidade
                </Typography>
                <Typography variant="body1">{auto.gravidade || '-'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Descrição da Infração
                </Typography>
                <Typography variant="body2">{auto.descricao_infracao}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Valor da Multa
                </Typography>
                <Typography variant="h6" color="error.main">
                  {formatarMoeda(auto.valor_multa)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Valor Total
                </Typography>
                <Typography variant="h6" color="error.main">
                  {formatarMoeda(auto.valor_total)}
                </Typography>
              </Grid>

              {auto.reincidente && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    <Typography variant="body2">
                      <strong>Reincidência detectada!</strong>
                      <br />
                      Acréscimo aplicado: {auto.percentual_acrescimo_reincidencia}%
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Informações do Autuado */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dados do Autuado
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Nome / Razão Social
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {auto.autuado_nome}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  CPF / CNPJ
                </Typography>
                <Typography variant="body1">
                  {formatarCpfCnpj(auto.autuado_cpf_cnpj)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Fiscal Autuante
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {auto.fiscal_nome || '-'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Observações */}
          {auto.observacoes && (
            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Observações
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {auto.observacoes}
              </Typography>
            </Paper>
          )}
        </Grid>

        {/* Timeline */}
        <Grid item xs={12}>
          <AutoTimeline auto={auto} />
        </Grid>

        {/* Defesa (se houver) */}
        {auto.argumentacao_defesa && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Argumentação da Defesa
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {auto.argumentacao_defesa}
              </Typography>
              {auto.data_defesa && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Apresentada em: {formatarData(auto.data_defesa)}
                </Typography>
              )}
            </Paper>
          </Grid>
        )}

        {/* Decisão (se houver) */}
        {auto.motivo_decisao && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Decisão da Defesa
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Alert severity={auto.status === 'DEFERIDO' ? 'success' : 'error'} sx={{ mb: 2 }}>
                <Typography variant="h6">
                  {auto.status === 'DEFERIDO' ? 'DEFERIDO' : 'INDEFERIDO'}
                </Typography>
              </Alert>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {auto.motivo_decisao}
              </Typography>
              {auto.data_decisao_defesa && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Julgado em: {formatarData(auto.data_decisao_defesa)}
                </Typography>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Diálogo de Cancelamento */}
      <Dialog open={dialogCancelar} onClose={() => setDialogCancelar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancelar Auto de Infração</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Atenção!</strong>
                <br />
                Esta ação é irreversível. O auto será permanentemente cancelado.
              </Typography>
            </Alert>

            <TextField
              fullWidth
              label="Motivo do Cancelamento"
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
              multiline
              rows={4}
              required
              helperText={`${motivoCancelamento.length} caracteres (mínimo 20)`}
              placeholder="Descreva o motivo do cancelamento do auto de infração..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogCancelar(false)}>Voltar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelar}
            disabled={cancelarMutation.isPending || motivoCancelamento.length < 20}
          >
            {cancelarMutation.isPending ? <CircularProgress size={24} /> : 'Confirmar Cancelamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
