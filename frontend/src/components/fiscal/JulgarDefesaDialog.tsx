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
  Grid,
  Typography,
  Box,
  Alert,
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
  argumentacaoDefesa?: string
}

export function JulgarDefesaDialog({
  open,
  onClose,
  autoId,
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
      <DialogTitle>Julgar Defesa do Auto de Infração</DialogTitle>
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
