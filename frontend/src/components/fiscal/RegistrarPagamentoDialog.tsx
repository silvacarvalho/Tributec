import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Alert,
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
  valorTotal?: number
  numeroAuto?: string
}

export function RegistrarPagamentoDialog({
  open,
  onClose,
  autoId,
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
