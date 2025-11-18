import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import type { Pessoa, PessoaCreate, PessoaUpdate, TipoPessoa } from '@/types/cadastro'

interface PessoaFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: PessoaCreate | PessoaUpdate) => Promise<void>
  pessoa?: Pessoa
}

export function PessoaFormDialog({ open, onClose, onSubmit, pessoa }: PessoaFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!pessoa

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PessoaCreate>({
    defaultValues: {
      tipo_pessoa: 'F',
      nome_razao_social: '',
      nome_fantasia: '',
      cpf: '',
      cnpj: '',
      rg: '',
      data_nascimento: '',
      email: '',
      telefone: '',
      celular: '',
      observacoes: '',
      endereco: {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
      },
    },
  })

  const tipoPessoa = watch('tipo_pessoa')

  useEffect(() => {
    if (pessoa) {
      reset({
        tipo_pessoa: pessoa.tipo_pessoa,
        nome_razao_social: pessoa.nome_razao_social,
        nome_fantasia: pessoa.nome_fantasia || '',
        cpf: pessoa.cpf || '',
        cnpj: pessoa.cnpj || '',
        rg: pessoa.rg || '',
        data_nascimento: pessoa.data_nascimento || '',
        email: pessoa.email || '',
        telefone: pessoa.telefone || '',
        celular: pessoa.celular || '',
        observacoes: pessoa.observacoes || '',
        endereco: pessoa.endereco || {
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: '',
        },
      })
    } else {
      reset({
        tipo_pessoa: 'F',
        nome_razao_social: '',
        nome_fantasia: '',
        cpf: '',
        cnpj: '',
        rg: '',
        data_nascimento: '',
        email: '',
        telefone: '',
        celular: '',
        observacoes: '',
        endereco: {
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: '',
        },
      })
    }
  }, [pessoa, reset, open])

  const handleFormSubmit = async (data: PessoaCreate) => {
    setLoading(true)
    try {
      await onSubmit(data)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar pessoa:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>{isEdit ? 'Editar Pessoa' : 'Nova Pessoa'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="tipo_pessoa"
                  control={control}
                  rules={{ required: 'Tipo é obrigatório' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.tipo_pessoa}>
                      <InputLabel>Tipo de Pessoa</InputLabel>
                      <Select {...field} label="Tipo de Pessoa">
                        <MenuItem value="F">Física</MenuItem>
                        <MenuItem value="J">Jurídica</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <Controller
                  name="nome_razao_social"
                  control={control}
                  rules={{ required: 'Nome/Razão Social é obrigatório' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={tipoPessoa === 'F' ? 'Nome Completo' : 'Razão Social'}
                      error={!!errors.nome_razao_social}
                      helperText={errors.nome_razao_social?.message}
                    />
                  )}
                />
              </Grid>

              {tipoPessoa === 'J' && (
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="nome_fantasia"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} fullWidth label="Nome Fantasia" />
                    )}
                  />
                </Grid>
              )}

              {tipoPessoa === 'F' ? (
                <>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="cpf"
                      control={control}
                      rules={{ required: 'CPF é obrigatório' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="CPF"
                          error={!!errors.cpf}
                          helperText={errors.cpf?.message}
                          placeholder="000.000.000-00"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="rg"
                      control={control}
                      render={({ field }) => <TextField {...field} fullWidth label="RG" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="data_nascimento"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} fullWidth label="Data de Nascimento" type="date" InputLabelProps={{ shrink: true }} />
                      )}
                    />
                  </Grid>
                </>
              ) : (
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="cnpj"
                    control={control}
                    rules={{ required: 'CNPJ é obrigatório' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="CNPJ"
                        error={!!errors.cnpj}
                        helperText={errors.cnpj?.message}
                        placeholder="00.000.000/0000-00"
                      />
                    )}
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="Email" type="email" />}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="telefone"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="Telefone" placeholder="(00) 0000-0000" />}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="celular"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="Celular" placeholder="(00) 00000-0000" />}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Endereço
                </Typography>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="endereco.cep"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="CEP" placeholder="00000-000" />}
                />
              </Grid>

              <Grid item xs={12} sm={9}>
                <Controller
                  name="endereco.logradouro"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="Logradouro" />}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="endereco.numero"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="Número" />}
                />
              </Grid>

              <Grid item xs={12} sm={5}>
                <Controller
                  name="endereco.complemento"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="Complemento" />}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="endereco.bairro"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="Bairro" />}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="endereco.cidade"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="Cidade" />}
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                <Controller
                  name="endereco.estado"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="UF" inputProps={{ maxLength: 2 }} />}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="observacoes"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="Observações" multiline rows={3} />}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
