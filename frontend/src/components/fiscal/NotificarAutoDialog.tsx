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
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fiscalService } from '../../services/fiscalService'

interface NotificarAutoDialogProps {
  open: boolean
  onClose: () => void
  autoId: string
  numeroAuto: string
}

const FORMAS_NOTIFICACAO = [
  'EDITAL',
  'AR',
  'PRESENCIAL',
  'EMAIL',
  'DTD',
]

export function NotificarAutoDialog({ open, onClose, autoId, numeroAuto }: NotificarAutoDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    forma_notificacao: '',
    data_notificacao: new Date().toISOString().split('T')[0],
    observacoes_notificacao: '',
  })

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => fiscalService.notificarAuto(autoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-infracao', autoId] })
      queryClient.invalidateQueries({ queryKey: ['autos-infracao'] })
      onClose()
      handleReset()
    },
  })

  const handleSubmit = () => {
    if (!formData.forma_notificacao) {
      return
    }
    mutation.mutate(formData)
  }

  const handleReset = () => {
    setFormData({
      forma_notificacao: '',
      data_notificacao: new Date().toISOString().split('T')[0],
      observacoes_notificacao: '',
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Notificar Auto de Infração {numeroAuto}</DialogTitle>
      <DialogContent>
        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao notificar auto. Tente novamente.
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Forma de Notificação"
              value={formData.forma_notificacao}
              onChange={(e) => setFormData({ ...formData, forma_notificacao: e.target.value })}
              required
            >
              {FORMAS_NOTIFICACAO.map((forma) => (
                <MenuItem key={forma} value={forma}>
                  {forma}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="date"
              label="Data da Notificação"
              value={formData.data_notificacao}
              onChange={(e) => setFormData({ ...formData, data_notificacao: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observações"
              value={formData.observacoes_notificacao}
              onChange={(e) => setFormData({ ...formData, observacoes_notificacao: e.target.value })}
              placeholder="Informações adicionais sobre a notificação..."
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
          disabled={mutation.isPending || !formData.forma_notificacao}
        >
          {mutation.isPending ? 'Notificando...' : 'Confirmar Notificação'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
