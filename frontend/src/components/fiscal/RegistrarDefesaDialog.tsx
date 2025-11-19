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
  CircularProgress
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { fiscalService } from '../../services/fiscalService'
import type { DefesaAutoCreate } from '../../types/fiscal'

interface RegistrarDefesaDialogProps {
  open: boolean
  onClose: () => void
  autoId: string
  dataLimiteDefesa?: string
}

export function RegistrarDefesaDialog({
  open,
  onClose,
  autoId,
  dataLimiteDefesa
}: RegistrarDefesaDialogProps) {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<DefesaAutoCreate>({
    argumentacao: '',
    data_defesa: new Date().toISOString().split('T')[0]
  })

  const defesaMutation = useMutation({
    mutationFn: (dados: DefesaAutoCreate) => fiscalService.registrarDefesa(autoId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autos-infracao'] })
      queryClient.invalidateQueries({ queryKey: ['auto-detalhes', autoId] })
      toast.success('Defesa registrada com sucesso!')
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao registrar defesa')
    }
  })

  const handleChange = (field: keyof DefesaAutoCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.argumentacao || !formData.data_defesa) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (formData.argumentacao.length < 50) {
      toast.error('A argumentação deve ter no mínimo 50 caracteres')
      return
    }

    defesaMutation.mutate(formData)
  }

  const verificarPrazo = () => {
    if (!dataLimiteDefesa) return null

    const hoje = new Date()
    const limite = new Date(dataLimiteDefesa)
    const diffTime = limite.getTime() - hoje.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { status: 'error', mensagem: 'Prazo de defesa expirado!' }
    } else if (diffDays <= 5) {
      return { status: 'warning', mensagem: `Restam apenas ${diffDays} dias para o prazo final!` }
    } else {
      return { status: 'info', mensagem: `Prazo: ${diffDays} dias restantes` }
    }
  }

  const statusPrazo = verificarPrazo()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Registrar Defesa do Auto de Infração</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* Alerta de Prazo */}
            {statusPrazo && dataLimiteDefesa && (
              <Grid item xs={12}>
                <Alert severity={statusPrazo.status as any}>
                  <Typography variant="body2">
                    <strong>Data limite:</strong>{' '}
                    {new Date(dataLimiteDefesa).toLocaleDateString('pt-BR')}
                  </Typography>
                  <Typography variant="caption">{statusPrazo.mensagem}</Typography>
                </Alert>
              </Grid>
            )}

            {/* Data da Defesa */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Data de Apresentação da Defesa"
                value={formData.data_defesa}
                onChange={(e) => handleChange('data_defesa', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                inputProps={{
                  max: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>

            {/* Argumentação */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Argumentação da Defesa"
                value={formData.argumentacao}
                onChange={(e) => handleChange('argumentacao', e.target.value)}
                multiline
                rows={10}
                required
                helperText={`${formData.argumentacao.length} caracteres (mínimo 50)`}
                placeholder="Descreva detalhadamente os argumentos da defesa apresentados pelo autuado..."
              />
            </Grid>

            {/* Orientações */}
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Orientações:</strong>
                </Typography>
                <Typography variant="caption">
                  • Registre fielmente todos os argumentos apresentados pelo autuado
                  <br />
                  • Anexe cópias dos documentos apresentados (se houver)
                  <br />
                  • A defesa será analisada pela autoridade competente
                  <br />• O prazo para julgamento é de até 30 dias após o registro
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
          onClick={handleSubmit}
          disabled={defesaMutation.isPending}
        >
          {defesaMutation.isPending ? <CircularProgress size={24} /> : 'Registrar Defesa'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
