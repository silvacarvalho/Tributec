import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Autocomplete,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Chip,
  Box,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import type { DomicilioTributarioDigital, DomicilioTributarioDigitalCreate } from '@/types/dtd'
import type { Pessoa } from '@/types'
import { pessoaService } from '@/services/pessoaService'

interface DTDFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: DomicilioTributarioDigitalCreate) => Promise<void>
  dtd?: DomicilioTributarioDigital
}

export function DTDFormDialog({ open, onClose, onSubmit, dtd }: DTDFormDialogProps) {
  const [searchContribuinte, setSearchContribuinte] = useState('')
  const [emailsAlternativos, setEmailsAlternativos] = useState<string[]>(dtd?.emails_alternativos || [])
  const [novoEmail, setNovoEmail] = useState('')

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DomicilioTributarioDigitalCreate>({
    defaultValues: {
      email_principal: dtd?.email_principal || '',
      emails_alternativos: dtd?.emails_alternativos || [],
      notificar_lancamentos: dtd?.notificar_lancamentos ?? true,
      notificar_vencimentos: dtd?.notificar_vencimentos ?? true,
      notificar_protestos: dtd?.notificar_protestos ?? true,
      notificar_avisos: dtd?.notificar_avisos ?? true,
    },
  })

  const { data: contribuintes } = useQuery({
    queryKey: ['pessoas', searchContribuinte],
    queryFn: () =>
      pessoaService.listar({
        pagina: 1,
        limite: 20,
        busca: searchContribuinte,
      }),
    enabled: open && !dtd,
  })

  useEffect(() => {
    if (open) {
      if (dtd) {
        setEmailsAlternativos(dtd.emails_alternativos || [])
        reset({
          email_principal: dtd.email_principal,
          emails_alternativos: dtd.emails_alternativos || [],
          notificar_lancamentos: dtd.notificar_lancamentos,
          notificar_vencimentos: dtd.notificar_vencimentos,
          notificar_protestos: dtd.notificar_protestos,
          notificar_avisos: dtd.notificar_avisos,
        })
      } else {
        setEmailsAlternativos([])
        setNovoEmail('')
      }
    }
  }, [open, dtd, reset])

  const handleFormSubmit = async (data: DomicilioTributarioDigitalCreate) => {
    await onSubmit({
      ...data,
      emails_alternativos: emailsAlternativos,
    })
    reset()
    setEmailsAlternativos([])
  }

  const handleAddEmail = () => {
    if (novoEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail)) {
      if (!emailsAlternativos.includes(novoEmail)) {
        setEmailsAlternativos([...emailsAlternativos, novoEmail])
        setNovoEmail('')
      }
    }
  }

  const handleRemoveEmail = (email: string) => {
    setEmailsAlternativos(emailsAlternativos.filter((e) => e !== email))
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>{dtd ? 'Editar DTD' : 'Novo DTD'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {!dtd && (
              <Grid item xs={12}>
                <Controller
                  name="contribuinte_id"
                  control={control}
                  rules={{ required: 'Contribuinte é obrigatório' }}
                  render={({ field }) => (
                    <Autocomplete
                      options={contribuintes?.itens || []}
                      getOptionLabel={(option: Pessoa) =>
                        `${option.nome_razao_social} - ${option.cpf || option.cnpj || ''}`
                      }
                      value={contribuintes?.itens.find((p) => p.id === field.value) || null}
                      onChange={(_, value) => field.onChange(value?.id || '')}
                      onInputChange={(_, value) => setSearchContribuinte(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Contribuinte *"
                          error={!!errors.contribuinte_id}
                          helperText={errors.contribuinte_id?.message}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {searchContribuinte ? <CircularProgress size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Controller
                name="email_principal"
                control={control}
                rules={{
                  required: 'Email principal é obrigatório',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email inválido',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Principal *"
                    fullWidth
                    type="email"
                    error={!!errors.email_principal}
                    helperText={errors.email_principal?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Adicionar Email Alternativo"
                fullWidth
                type="email"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddEmail()
                  }
                }}
                helperText="Pressione Enter para adicionar"
              />
              {emailsAlternativos.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {emailsAlternativos.map((email) => (
                    <Chip key={email} label={email} onDelete={() => handleRemoveEmail(email)} />
                  ))}
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="notificar_lancamentos"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Notificar Lançamentos"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="notificar_vencimentos"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Notificar Vencimentos"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="notificar_protestos"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Notificar Protestos"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="notificar_avisos"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Notificar Avisos"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : dtd ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
