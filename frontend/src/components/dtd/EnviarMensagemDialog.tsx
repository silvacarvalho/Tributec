import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  Box,
  Typography,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { DomicilioTributarioDigital, DTDMensagemCreateByContribuinte, TipoMensagemDTD, PrioridadeMensagemDTD } from '@/types/dtd'
import { dtdService } from '@/services/dtdService'

interface EnviarMensagemDialogProps {
  open: boolean
  onClose: () => void
  dtd: DomicilioTributarioDigital
}

const TIPOS_MENSAGEM: Array<{ value: TipoMensagemDTD; label: string }> = [
  { value: 'NOTIFICACAO', label: 'Notificação' },
  { value: 'ALERTA', label: 'Alerta' },
  { value: 'LANCAMENTO', label: 'Lançamento' },
  { value: 'VENCIMENTO', label: 'Vencimento' },
  { value: 'COBRANCA', label: 'Cobrança' },
  { value: 'PROTESTO', label: 'Protesto' },
]

const PRIORIDADES: Array<{ value: PrioridadeMensagemDTD; label: string }> = [
  { value: 'ALTA', label: 'Alta' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'BAIXA', label: 'Baixa' },
]

export function EnviarMensagemDialog({ open, onClose, dtd }: EnviarMensagemDialogProps) {
  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DTDMensagemCreateByContribuinte>({
    defaultValues: {
      contribuinte_id: dtd.contribuinte_id,
      assunto: '',
      conteudo: '',
      tipo_mensagem: 'NOTIFICACAO',
      prioridade: 'NORMAL',
    },
  })

  const enviarMutation = useMutation({
    mutationFn: (data: DTDMensagemCreateByContribuinte) =>
      dtdService.criarMensagemPorContribuinte(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dtd-mensagens'] })
      toast.success('Mensagem enviada com sucesso!')
      onClose()
      reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao enviar mensagem')
    },
  })

  const handleFormSubmit = async (data: DTDMensagemCreateByContribuinte) => {
    await enviarMutation.mutateAsync(data)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>Enviar Mensagem para DTD</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2">
              <strong>Destinatário:</strong> {dtd.contribuinte_nome}
              <br />
              <strong>Email:</strong> {dtd.email_principal}
            </Typography>
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="tipo_mensagem"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Tipo de Mensagem *" fullWidth>
                    {TIPOS_MENSAGEM.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="prioridade"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Prioridade *" fullWidth>
                    {PRIORIDADES.map((prioridade) => (
                      <MenuItem key={prioridade.value} value={prioridade.value}>
                        {prioridade.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="assunto"
                control={control}
                rules={{
                  required: 'Assunto é obrigatório',
                  maxLength: { value: 200, message: 'Assunto muito longo (máx. 200 caracteres)' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Assunto *"
                    fullWidth
                    error={!!errors.assunto}
                    helperText={errors.assunto?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="conteudo"
                control={control}
                rules={{ required: 'Conteúdo é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Conteúdo *"
                    fullWidth
                    multiline
                    rows={8}
                    error={!!errors.conteudo}
                    helperText={errors.conteudo?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
