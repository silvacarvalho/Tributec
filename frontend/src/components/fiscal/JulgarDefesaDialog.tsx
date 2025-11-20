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
  Box,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { fiscalService } from '../../services/fiscalService'

interface JulgarDefesaDialogProps {
  open: boolean
  onClose: () => void
  autoId: string
  numeroAuto: string
  argumentacaoDefesa?: string
}

export function JulgarDefesaDialog({
  open,
  onClose,
  autoId,
  numeroAuto,
  argumentacaoDefesa
}: JulgarDefesaDialogProps) {
  const queryClient = useQueryClient()

  const [decisao, setDecisao] = useState<'DEFERIDO' | 'INDEFERIDO'>('INDEFERIDO')
  const [motivo, setMotivo] = useState('')
  const [dataDecisao, setDataDecisao] = useState(new Date().toISOString().split('T')[0])

  const julgarMutation = useMutation({
    mutationFn: () => fiscalService.julgarDefesa(autoId, decisao, motivo, dataDecisao),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autos-infracao'] })
      queryClient.invalidateQueries({ queryKey: ['auto-detalhes', autoId] })
      toast.success('Defesa julgada com sucesso!')
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao julgar defesa')
    }
  })

  const handleSubmit = () => {
    if (!motivo) {
      toast.error('Informe a motivação da decisão')
      return
    }

    if (motivo.length < 50) {
      toast.error('A motivação deve ter no mínimo 50 caracteres')
      return
    }

    julgarMutation.mutate()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Julgar Defesa - Auto de Infração {numeroAuto}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            {/* Argumentação apresentada */}
            {argumentacaoDefesa && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="subtitle2" gutterBottom>
                    Argumentação da Defesa:
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {argumentacaoDefesa.substring(0, 300)}
                    {argumentacaoDefesa.length > 300 && '...'}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Decisão */}
            <Grid item xs={12}>
              <FormLabel component="legend">
                Decisão <span style={{ color: 'red' }}>*</span>
              </FormLabel>
              <RadioGroup
                value={decisao}
                onChange={(e) => setDecisao(e.target.value as 'DEFERIDO' | 'INDEFERIDO')}
              >
                <FormControlLabel
                  value="DEFERIDO"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium" color="success.main">
                        DEFERIDO
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Aceitar a defesa e cancelar o auto de infração
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="INDEFERIDO"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium" color="error.main">
                        INDEFERIDO
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Rejeitar a defesa e manter o auto de infração
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </Grid>

            {/* Data da Decisão */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Data da Decisão"
                value={dataDecisao}
                onChange={(e) => setDataDecisao(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                inputProps={{
                  max: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>

            {/* Motivação */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motivação da Decisão"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                multiline
                rows={8}
                required
                helperText={`${motivo.length} caracteres (mínimo 50)`}
                placeholder="Fundamente a decisão com base nos argumentos apresentados e na legislação aplicável..."
              />
            </Grid>

            {/* Alerta de Consequências */}
            <Grid item xs={12}>
              <Alert severity={decisao === 'DEFERIDO' ? 'success' : 'warning'}>
                <Typography variant="body2">
                  <strong>Consequências da decisão:</strong>
                </Typography>
                {decisao === 'DEFERIDO' ? (
                  <Typography variant="caption">
                    • O auto de infração será CANCELADO
                    <br />
                    • A multa não será cobrada
                    <br />
                    • O autuado será notificado da decisão favorável
                    <br />• Esta ação é IRREVERSÍVEL
                  </Typography>
                ) : (
                  <Typography variant="caption">
                    • O auto de infração será MANTIDO
                    <br />
                    • A multa permanece exigível
                    <br />
                    • O autuado poderá recorrer da decisão
                    <br />• Após o prazo de recurso, o valor pode ser inscrito em dívida ativa
                  </Typography>
                )}
              </Alert>
            </Grid>

            {/* Orientações Legais */}
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Fundamentação Legal:</strong>
                </Typography>
                <Typography variant="caption">
                  • A decisão deve ser fundamentada e motivada (CF/88, Art. 93, IX)
                  <br />
                  • O autuado tem direito ao contraditório e ampla defesa
                  <br />• A autoridade julgadora deve analisar todos os argumentos apresentados
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
          color={decisao === 'DEFERIDO' ? 'success' : 'error'}
          onClick={handleSubmit}
          disabled={julgarMutation.isPending}
        >
          {julgarMutation.isPending ? (
            <CircularProgress size={24} />
          ) : decisao === 'DEFERIDO' ? (
            'Deferir Defesa'
          ) : (
            'Indeferir Defesa'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
