import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
  Typography,
  Box,
  Divider,
  CircularProgress,
  InputAdornment
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { fiscalService } from '../../services/fiscalService'
import type { PagamentoAutoCreate } from '../../types/fiscal'

interface RegistrarPagamentoDialogProps {
  open: boolean
  onClose: () => void
  autoId: string
  numeroAuto: string
  valorTotal: number
}

const FORMAS_PAGAMENTO = [
  'DINHEIRO',
  'PIX',
  'TRANSFERENCIA',
  'BOLETO',
  'CARTAO_CREDITO',
  'CARTAO_DEBITO',
  'CHEQUE',
]

  valorTotal?: number
  numeroAuto?: string
}

export function RegistrarPagamentoDialog({
  open,
  onClose,
  autoId,
  numeroAuto,
  valorTotal,
}: RegistrarPagamentoDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    data_pagamento: new Date().toISOString().split('T')[0],
    valor_pago: valorTotal.toString(),
    forma_pagamento: '',
    numero_comprovante: '',
    observacoes_pagamento: '',
  })

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => fiscalService.registrarPagamento(autoId, {
      ...data,
      valor_pago: parseFloat(data.valor_pago),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-infracao', autoId] })
      queryClient.invalidateQueries({ queryKey: ['autos-infracao'] })
      queryClient.invalidateQueries({ queryKey: ['estatisticas-autos'] })
      queryClient.invalidateQueries({ queryKey: ['valores-autos'] })
      onClose()
      handleReset()
    },
  })

  const handleSubmit = () => {
    if (!formData.forma_pagamento || !formData.valor_pago) {
      return
    }
    mutation.mutate(formData)
  }

  const handleReset = () => {
    setFormData({
      data_pagamento: new Date().toISOString().split('T')[0],
      valor_pago: valorTotal.toString(),
      forma_pagamento: '',
      numero_comprovante: '',
      observacoes_pagamento: '',
    })
  valorTotal = 0,
  numeroAuto
}: RegistrarPagamentoDialogProps) {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<PagamentoAutoCreate>({
    valor_pago: valorTotal,
    data_pagamento: new Date().toISOString().split('T')[0]
  })

  const pagamentoMutation = useMutation({
    mutationFn: (dados: PagamentoAutoCreate) => fiscalService.registrarPagamento(autoId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autos-infracao'] })
      queryClient.invalidateQueries({ queryKey: ['auto-detalhes', autoId] })
      toast.success('Pagamento registrado com sucesso!')
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao registrar pagamento')
    }
  })

  const handleChange = (field: keyof PagamentoAutoCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.valor_pago || formData.valor_pago <= 0) {
      toast.error('Informe um valor válido')
      return
    }

    if (!formData.data_pagamento) {
      toast.error('Informe a data do pagamento')
      return
    }

    pagamentoMutation.mutate(formData)
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const valorPagoFloat = parseFloat(formData.valor_pago) || 0
  const temDesconto = valorPagoFloat < valorTotal
  const temAcrescimo = valorPagoFloat > valorTotal

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar Pagamento - Auto {numeroAuto}</DialogTitle>
      <DialogContent>
        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao registrar pagamento. Tente novamente.
          </Alert>
        )}

        <Box sx={{ mt: 1, mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Valor Total do Auto
          </Typography>
          <Typography variant="h5" color="primary" fontWeight="bold">
            {formatarMoeda(valorTotal)}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Data do Pagamento"
              value={formData.data_pagamento}
              onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Valor Pago"
              value={formData.valor_pago}
              onChange={(e) => setFormData({ ...formData, valor_pago: e.target.value })}
              inputProps={{ step: '0.01', min: '0' }}
              required
            />
          </Grid>

          {temDesconto && (
            <Grid item xs={12}>
              <Alert severity="info">
                Desconto de {formatarMoeda(valorTotal - valorPagoFloat)}
              </Alert>
            </Grid>
          )}

          {temAcrescimo && (
            <Grid item xs={12}>
              <Alert severity="warning">
                Acréscimo de {formatarMoeda(valorPagoFloat - valorTotal)} (juros/multa de mora)
              </Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Forma de Pagamento"
              value={formData.forma_pagamento}
              onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
              required
            >
              {FORMAS_PAGAMENTO.map((forma) => (
                <MenuItem key={forma} value={forma}>
                  {forma.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Número do Comprovante"
              value={formData.numero_comprovante}
              onChange={(e) => setFormData({ ...formData, numero_comprovante: e.target.value })}
              placeholder="Ex: número do boleto, transação PIX, etc."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observações"
              value={formData.observacoes_pagamento}
              onChange={(e) => setFormData({ ...formData, observacoes_pagamento: e.target.value })}
              placeholder="Informações adicionais sobre o pagamento..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="success"
          disabled={mutation.isPending || !formData.forma_pagamento || !formData.valor_pago}
        >
          {mutation.isPending ? 'Registrando...' : 'Confirmar Pagamento'}
      currency: 'BRL'
    }).format(valor)
  }

  const calcularDiferenca = () => {
    return formData.valor_pago - valorTotal
  }

  const diferenca = calcularDiferenca()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar Pagamento do Auto de Infração</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* Informação do Auto */}
            {numeroAuto && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Auto de Infração:</strong> {numeroAuto}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Valor Total:</strong> {formatarMoeda(valorTotal)}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Valor Pago */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Valor Pago"
                value={formData.valor_pago}
                onChange={(e) => handleChange('valor_pago', parseFloat(e.target.value))}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>
                }}
                inputProps={{
                  min: 0,
                  step: 0.01
                }}
                helperText="Informe o valor efetivamente pago"
              />
            </Grid>

            {/* Data do Pagamento */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Data do Pagamento"
                value={formData.data_pagamento}
                onChange={(e) => handleChange('data_pagamento', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                inputProps={{
                  max: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>

            {/* Alerta de Diferença */}
            {diferenca !== 0 && formData.valor_pago > 0 && (
              <Grid item xs={12}>
                <Alert severity={diferenca < 0 ? 'error' : 'warning'}>
                  <Typography variant="body2">
                    {diferenca < 0 ? (
                      <>
                        <strong>Pagamento insuficiente!</strong>
                        <br />
                        Faltam {formatarMoeda(Math.abs(diferenca))} para quitar o auto.
                      </>
                    ) : (
                      <>
                        <strong>Valor pago maior que o devido!</strong>
                        <br />
                        Diferença de {formatarMoeda(diferenca)} a mais.
                      </>
                    )}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Confirmação de Pagamento Integral */}
            {diferenca === 0 && formData.valor_pago > 0 && (
              <Grid item xs={12}>
                <Alert severity="success">
                  <Typography variant="body2">
                    <strong>Pagamento integral confirmado!</strong>
                    <br />O auto de infração será quitado.
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Orientações */}
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Informações importantes:</strong>
                </Typography>
                <Typography variant="caption">
                  • Certifique-se de que o valor e data estão corretos
                  <br />
                  • Após o registro, o auto será marcado como PAGO
                  <br />
                  • Guarde o comprovante de pagamento
                  <br />• Esta operação não pode ser desfeita automaticamente
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          color={diferenca >= 0 ? 'success' : 'warning'}
          onClick={handleSubmit}
          disabled={pagamentoMutation.isPending || !formData.valor_pago || formData.valor_pago <= 0}
        >
          {pagamentoMutation.isPending ? <CircularProgress size={24} /> : 'Registrar Pagamento'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
