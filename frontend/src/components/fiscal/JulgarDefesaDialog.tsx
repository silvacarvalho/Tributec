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
  Divider,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fiscalService } from '../../services/fiscalService'

interface JulgarDefesaDialogProps {
  open: boolean
  onClose: () => void
  autoId: string
  numeroAuto: string
  dataDefesa?: string | null
}

export function JulgarDefesaDialog({ open, onClose, autoId, numeroAuto, dataDefesa }: JulgarDefesaDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    decisao_defesa: '',
    data_decisao_defesa: new Date().toISOString().split('T')[0],
    motivo_decisao: '',
  })

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => fiscalService.julgarDefesa(autoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-infracao', autoId] })
      queryClient.invalidateQueries({ queryKey: ['autos-infracao'] })
      onClose()
      handleReset()
    },
  })

  const handleSubmit = () => {
    if (!formData.decisao_defesa || !formData.motivo_decisao) {
      return
    }
    mutation.mutate(formData)
  }

  const handleReset = () => {
    setFormData({
      decisao_defesa: '',
      data_decisao_defesa: new Date().toISOString().split('T')[0],
      motivo_decisao: '',
    })
  }

  const formatarData = (data: string | null) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Julgar Defesa - Auto de Infração {numeroAuto}</DialogTitle>
      <DialogContent>
        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao julgar defesa. Tente novamente.
          </Alert>
        )}

        {dataDefesa && (
          <>
            <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
              Defesa apresentada em {formatarData(dataDefesa)}
            </Alert>
            <Divider sx={{ mb: 2 }} />
          </>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Decisão"
              value={formData.decisao_defesa}
              onChange={(e) => setFormData({ ...formData, decisao_defesa: e.target.value })}
              required
            >
              <MenuItem value="DEFERIDO">Deferido (Acolher Defesa)</MenuItem>
              <MenuItem value="INDEFERIDO">Indeferido (Rejeitar Defesa)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Data da Decisão"
              value={formData.data_decisao_defesa}
              onChange={(e) => setFormData({ ...formData, data_decisao_defesa: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Fundamentação da Decisão"
              value={formData.motivo_decisao}
              onChange={(e) => setFormData({ ...formData, motivo_decisao: e.target.value })}
              placeholder="Descreva os motivos que fundamentam a decisão..."
              required
              helperText="Fundamente legalmente a decisão, citando artigos e jurisprudência se aplicável"
            />
          </Grid>

          {formData.decisao_defesa === 'DEFERIDO' && (
            <Grid item xs={12}>
              <Alert severity="success">
                <Typography variant="body2" fontWeight="medium">
                  Ao deferir a defesa, o auto será cancelado automaticamente.
                </Typography>
              </Alert>
            </Grid>
          )}

          {formData.decisao_defesa === 'INDEFERIDO' && (
            <Grid item xs={12}>
              <Alert severity="warning">
                <Typography variant="body2" fontWeight="medium">
                  Ao indeferir a defesa, o contribuinte poderá efetuar o pagamento ou entrar com recurso.
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={mutation.isPending || !formData.decisao_defesa || !formData.motivo_decisao}
          color={formData.decisao_defesa === 'DEFERIDO' ? 'success' : 'primary'}
        >
          {mutation.isPending ? 'Salvando...' : 'Confirmar Julgamento'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
