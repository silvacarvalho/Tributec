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
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import type { Estabelecimento, EstabelecimentoCreate, Pessoa, Logradouro } from '@/types'
import { pessoaService } from '@/services/pessoaService'
import { logradouroService } from '@/services/logradouroService'

interface EstabelecimentoFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: EstabelecimentoCreate) => Promise<void>
  estabelecimento?: Estabelecimento
}

export function EstabelecimentoFormDialog({
  open,
  onClose,
  onSubmit,
  estabelecimento,
}: EstabelecimentoFormDialogProps) {
  const [searchPessoa, setSearchPessoa] = useState('')
  const [searchLogradouro, setSearchLogradouro] = useState('')

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EstabelecimentoCreate>()

  const { data: pessoas } = useQuery({
    queryKey: ['pessoas', searchPessoa],
    queryFn: () =>
      pessoaService.listar({
        pagina: 1,
        limite: 20,
        busca: searchPessoa,
        tipo_pessoa: 'J',
      }),
    enabled: open,
  })

  const { data: logradouros } = useQuery({
    queryKey: ['logradouros', searchLogradouro],
    queryFn: () =>
      logradouroService.listar({
        pagina: 1,
        limite: 20,
        busca: searchLogradouro,
      }),
    enabled: open,
  })

  useEffect(() => {
    if (estabelecimento) {
      reset({
        proprietario_id: estabelecimento.proprietario_id,
        inscricao_municipal: estabelecimento.inscricao_municipal,
        nome_fantasia: estabelecimento.nome_fantasia,
        atividade_principal: estabelecimento.atividade_principal,
        atividades_secundarias: estabelecimento.atividades_secundarias,
        cnae: estabelecimento.cnae,
        area_estabelecimento: estabelecimento.area_estabelecimento,
        numero_funcionarios: estabelecimento.numero_funcionarios,
        data_abertura: estabelecimento.data_abertura,
        logradouro_id: estabelecimento.logradouro_id,
        numero: estabelecimento.numero,
        complemento: estabelecimento.complemento,
        observacoes: estabelecimento.observacoes,
      })
    }
  }, [estabelecimento, reset])

  const handleFormSubmit = async (data: EstabelecimentoCreate) => {
    await onSubmit(data)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {estabelecimento ? 'Editar Estabelecimento' : 'Novo Estabelecimento'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Controller
                name="proprietario_id"
                control={control}
                rules={{ required: 'Proprietário é obrigatório' }}
                render={({ field }) => (
                  <Autocomplete
                    options={pessoas?.itens || []}
                    getOptionLabel={(option: Pessoa) => option.nome_razao_social}
                    value={pessoas?.itens.find((p) => p.id === field.value) || null}
                    onChange={(_, value) => field.onChange(value?.id || '')}
                    onInputChange={(_, value) => setSearchPessoa(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Proprietário (Pessoa Jurídica)"
                        error={!!errors.proprietario_id}
                        helperText={errors.proprietario_id?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="inscricao_municipal"
                control={control}
                rules={{ required: 'Inscrição Municipal é obrigatória' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Inscrição Municipal"
                    fullWidth
                    error={!!errors.inscricao_municipal}
                    helperText={errors.inscricao_municipal?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="nome_fantasia"
                control={control}
                rules={{ required: 'Nome Fantasia é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome Fantasia"
                    fullWidth
                    error={!!errors.nome_fantasia}
                    helperText={errors.nome_fantasia?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Controller
                name="atividade_principal"
                control={control}
                rules={{ required: 'Atividade Principal é obrigatória' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Atividade Principal"
                    fullWidth
                    error={!!errors.atividade_principal}
                    helperText={errors.atividade_principal?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="cnae"
                control={control}
                rules={{ required: 'CNAE é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="CNAE"
                    fullWidth
                    error={!!errors.cnae}
                    helperText={errors.cnae?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="area_estabelecimento"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Área (m²)"
                    type="number"
                    fullWidth
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="numero_funcionarios"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nº Funcionários"
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
                name="logradouro_id"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={logradouros?.itens || []}
                    getOptionLabel={(option: Logradouro) =>
                      `${option.tipo_logradouro} ${option.nome}, ${option.bairro}`
                    }
                    value={logradouros?.itens.find((l) => l.id === field.value) || null}
                    onChange={(_, value) => field.onChange(value?.id || null)}
                    onInputChange={(_, value) => setSearchLogradouro(value)}
                    renderInput={(params) => (
                      <TextField {...params} label="Logradouro" />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="numero"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Número" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Controller
                name="complemento"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Complemento" fullWidth />
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
