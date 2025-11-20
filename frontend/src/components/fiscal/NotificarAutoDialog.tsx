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
  CircularProgress
} from '@mui/material'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { fiscalService } from '../../services/fiscalService'
import { parametroService } from '../../services/parametroService'
import type { NotificacaoAutoCreate } from '../../types/fiscal'

interface NotificarAutoDialogProps {
  open: boolean
  onClose: () => void
  autoId: string
  numeroAuto: string
}

export function NotificarAutoDialog({ open, onClose, autoId }: NotificarAutoDialogProps) {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<NotificacaoAutoCreate>({
    forma_notificacao: 'PESSOAL',
    data_notificacao: new Date().toISOString().split('T')[0]
  })

  // Buscar prazo de defesa nos parâmetros
  const { data: parametros } = useQuery({
    queryKey: ['parametros-fiscal'],
    queryFn: () => parametroService.listar()
  })

  const notificarMutation = useMutation({
    mutationFn: (dados: NotificacaoAutoCreate) => fiscalService.notificarAuto(autoId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autos-infracao'] })
      queryClient.invalidateQueries({ queryKey: ['auto-detalhes', autoId] })
      toast.success('Auto notificado com sucesso!')
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao notificar auto')
    }
  })

  const handleChange = (field: keyof NotificacaoAutoCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.forma_notificacao || !formData.data_notificacao) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    notificarMutation.mutate(formData)
  }

  const calcularDataLimiteDefesa = () => {
    if (!formData.data_notificacao) return null

    const prazoDefesaDias =
      parametros?.items.find((p: any) => p.chave === 'FISCAL.PRAZOS.DEFESA_AUTO_DIAS')?.valor ||
      30

    const dataNotificacao = new Date(formData.data_notificacao)
    const dataLimite = new Date(dataNotificacao)
    dataLimite.setDate(dataLimite.getDate() + parseInt(prazoDefesaDias))

    return dataLimite.toLocaleDateString('pt-BR')
  }

  const dataLimiteDefesa = calcularDataLimiteDefesa()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Notificar Auto de Infração</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* Forma de Notificação */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Forma de Notificação"
                value={formData.forma_notificacao}
                onChange={(e) => handleChange('forma_notificacao', e.target.value)}
                required
              >
                <MenuItem value="PESSOAL">Pessoal</MenuItem>
                <MenuItem value="CORREIOS">Correios (AR)</MenuItem>
                <MenuItem value="EDITAL">Edital</MenuItem>
                <MenuItem value="EMAIL">E-mail</MenuItem>
                <MenuItem value="WHATSAPP">WhatsApp</MenuItem>
              </TextField>
            </Grid>

            {/* Data de Notificação */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Data da Notificação"
                value={formData.data_notificacao}
                onChange={(e) => handleChange('data_notificacao', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                inputProps={{
                  max: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>

            {/* Informação sobre Data Limite */}
            {dataLimiteDefesa && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Data limite para apresentação de defesa:</strong>
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {dataLimiteDefesa}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Prazo legal: 30 dias após a notificação
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Informações Adicionais */}
            <Grid item xs={12}>
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Importante:</strong>
                </Typography>
                <Typography variant="caption">
                  • A notificação deve ser comprovada conforme a forma escolhida
                  <br />
                  • O autuado terá direito a apresentar defesa dentro do prazo legal
                  <br />• Após a notificação, o auto não poderá ser cancelado diretamente
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
          disabled={notificarMutation.isPending}
        >
          {notificarMutation.isPending ? <CircularProgress size={24} /> : 'Notificar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
