import { useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import type { Logradouro, LogradouroCreate, TipoLogradouro } from '@/types'

interface LogradouroFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: LogradouroCreate) => Promise<void>
  logradouro?: Logradouro
}

const tiposLogradouro: { value: TipoLogradouro; label: string }[] = [
  { value: 'RUA', label: 'Rua' },
  { value: 'AVENIDA', label: 'Avenida' },
  { value: 'TRAVESSA', label: 'Travessa' },
  { value: 'ALAMEDA', label: 'Alameda' },
  { value: 'RODOVIA', label: 'Rodovia' },
  { value: 'ESTRADA', label: 'Estrada' },
  { value: 'PRACA', label: 'Praça' },
  { value: 'LARGO', label: 'Largo' },
  { value: 'VIELA', label: 'Viela' },
  { value: 'OUTRO', label: 'Outro' },
]

export function LogradouroFormDialog({
  open,
  onClose,
  onSubmit,
  logradouro,
}: LogradouroFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LogradouroCreate>({
    defaultValues: {
      tipo_logradouro: 'RUA',
      nome: '',
      bairro: '',
      cep: '',
      setor_fiscal: undefined,
      observacoes: '',
    },
  })

  useEffect(() => {
    if (logradouro) {
      reset({
        tipo_logradouro: logradouro.tipo_logradouro,
        nome: logradouro.nome,
        bairro: logradouro.bairro,
        cep: logradouro.cep || '',
        setor_fiscal: logradouro.setor_fiscal,
        observacoes: logradouro.observacoes || '',
      })
    } else {
      reset({
        tipo_logradouro: 'RUA',
        nome: '',
        bairro: '',
        cep: '',
        setor_fiscal: undefined,
        observacoes: '',
      })
    }
  }, [logradouro, reset])

  const handleFormSubmit = async (data: LogradouroCreate) => {
    await onSubmit(data)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {logradouro ? 'Editar Logradouro' : 'Novo Logradouro'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Controller
                name="tipo_logradouro"
                control={control}
                rules={{ required: 'Tipo é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Tipo"
                    fullWidth
                    error={!!errors.tipo_logradouro}
                    helperText={errors.tipo_logradouro?.message}
                  >
                    {tiposLogradouro.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Controller
                name="nome"
                control={control}
                rules={{ required: 'Nome é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome"
                    fullWidth
                    error={!!errors.nome}
                    helperText={errors.nome?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="bairro"
                control={control}
                rules={{ required: 'Bairro é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bairro"
                    fullWidth
                    error={!!errors.bairro}
                    helperText={errors.bairro?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name="cep"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="CEP" fullWidth placeholder="00000-000" />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name="setor_fiscal"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Setor Fiscal"
                    type="number"
                    fullWidth
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="observacoes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Observações"
                    fullWidth
                    multiline
                    rows={3}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
