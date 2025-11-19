import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  Typography,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fiscalService } from '../../services/fiscalService'

interface CancelarAutoDialogProps {
  open: boolean
  onClose: () => void
  autoId: string
  numeroAuto: string
}

export function CancelarAutoDialog({ open, onClose, autoId, numeroAuto }: CancelarAutoDialogProps) {
  const queryClient = useQueryClient()
  const [motivo, setMotivo] = useState('')

  const mutation = useMutation({
    mutationFn: (motivo_cancelamento: string) =>
      fiscalService.cancelarAuto(autoId, { motivo_cancelamento }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-infracao', autoId] })
      queryClient.invalidateQueries({ queryKey: ['autos-infracao'] })
      queryClient.invalidateQueries({ queryKey: ['estatisticas-autos'] })
      queryClient.invalidateQueries({ queryKey: ['valores-autos'] })
      onClose()
      setMotivo('')
    },
  })

  const handleSubmit = () => {
    if (!motivo.trim()) {
      return
    }
    mutation.mutate(motivo)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cancelar Auto de Infração {numeroAuto}</DialogTitle>
      <DialogContent>
        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao cancelar auto. Tente novamente.
          </Alert>
        )}

        <Alert severity="warning" sx={{ mt: 1, mb: 3 }}>
          <Typography variant="body2" fontWeight="medium">
            Esta ação não pode ser desfeita!
          </Typography>
          <Typography variant="body2">
            O auto de infração será cancelado e não poderá mais ser alterado.
          </Typography>
        </Alert>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={5}
              label="Motivo do Cancelamento"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva detalhadamente o motivo do cancelamento do auto..."
              required
              helperText="O motivo do cancelamento é obrigatório e ficará registrado no histórico"
            />
          </Grid>

          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="caption">
                <strong>Exemplos de motivos válidos:</strong>
                <br />
                • Erro na lavratura (endereço incorreto, autuado errado, etc.)
                <br />
                • Decisão judicial
                <br />
                • Auto lavrado em duplicidade
                <br />• Vício formal no processo
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Voltar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={mutation.isPending || !motivo.trim()}
        >
          {mutation.isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
