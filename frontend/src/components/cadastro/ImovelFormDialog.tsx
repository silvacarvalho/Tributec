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
  Box,
  Typography,
  Autocomplete,
  CircularProgress,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import type { Imovel, ImovelCreate, TipoImovel, SetorFiscal, Pessoa } from '@/types/cadastro'
import { imovelService } from '@/services/imovelService'
import { pessoaService } from '@/services/pessoaService'
import { CepInput } from './CepInput'
import type { CepResponse } from '@/services/cepService'

interface ImovelFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ImovelCreate) => Promise<void>
  imovel?: Imovel
}

export function ImovelFormDialog({ open, onClose, onSubmit, imovel }: ImovelFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [pessoasSearch, setPessoasSearch] = useState('')
  const isEdit = !!imovel

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ImovelCreate>({
    defaultValues: {
      tipo_imovel_id: '',
      setor_fiscal_id: '',
      proprietario_id: '',
      quadra: '',
      lote: '',
      endereco: {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
      },
      area_terreno: undefined,
      area_construida: undefined,
      frente: undefined,
      fundos: undefined,
      lado_direito: undefined,
      lado_esquerdo: undefined,
      testada_principal: undefined,
      observacoes: '',
    },
  })

  const { data: tiposImovel } = useQuery({
    queryKey: ['tipos-imovel'],
    queryFn: () => imovelService.listarTiposImovel(),
  })

  const { data: setoresFiscais } = useQuery({
    queryKey: ['setores-fiscais'],
    queryFn: () => imovelService.listarSetoresFiscais(),
  })

  const { data: pessoasData, isLoading: loadingPessoas } = useQuery({
    queryKey: ['pessoas-autocomplete', pessoasSearch],
    queryFn: () =>
      pessoaService.listar({
        busca: pessoasSearch || undefined,
        limite: 20,
      }),
    enabled: open,
  })

  // Handler para preenchimento automático do endereço
  const handleEnderecoBuscado = (endereco: CepResponse) => {
    setValue('endereco.logradouro', endereco.logradouro)
    setValue('endereco.bairro', endereco.bairro)
    setValue('endereco.cidade', endereco.cidade)
    setValue('endereco.estado', endereco.estado)
  }

  useEffect(() => {
    if (imovel) {
      reset({
        tipo_imovel_id: imovel.tipo_imovel.id,
        setor_fiscal_id: imovel.setor_fiscal.id,
        proprietario_id: imovel.proprietario?.id || '',
        quadra: imovel.quadra || '',
        lote: imovel.lote || '',
        endereco: {
          logradouro: imovel.endereco.logradouro,
          numero: imovel.endereco.numero || '',
          complemento: imovel.endereco.complemento || '',
          bairro: imovel.endereco.bairro,
          cidade: imovel.endereco.cidade,
          estado: imovel.endereco.estado,
          cep: imovel.endereco.cep,
        },
        area_terreno: imovel.area_terreno,
        area_construida: imovel.area_construida,
        frente: imovel.frente,
        fundos: imovel.fundos,
        lado_direito: imovel.lado_direito,
        lado_esquerdo: imovel.lado_esquerdo,
        testada_principal: imovel.testada_principal,
        observacoes: imovel.observacoes || '',
      })
    } else {
      reset({
        tipo_imovel_id: '',
        setor_fiscal_id: '',
        proprietario_id: '',
        quadra: '',
        lote: '',
        endereco: {
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: '',
        },
        area_terreno: undefined,
        area_construida: undefined,
        frente: undefined,
        fundos: undefined,
        lado_direito: undefined,
        lado_esquerdo: undefined,
        testada_principal: undefined,
        observacoes: '',
      })
    }
  }, [imovel, reset, open])

  const handleFormSubmit = async (data: ImovelCreate) => {
    setLoading(true)
    try {
      await onSubmit(data)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>{isEdit ? 'Editar Imóvel' : 'Novo Imóvel'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="tipo_imovel_id"
                  control={control}
                  rules={{ required: 'Tipo de imóvel é obrigatório' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.tipo_imovel_id}>
                      <InputLabel>Tipo de Imóvel</InputLabel>
                      <Select {...field} label="Tipo de Imóvel">
                        {tiposImovel?.map((tipo) => (
                          <MenuItem key={tipo.id} value={tipo.id}>
                            {tipo.descricao}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="setor_fiscal_id"
                  control={control}
                  rules={{ required: 'Setor fiscal é obrigatório' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.setor_fiscal_id}>
                      <InputLabel>Setor Fiscal</InputLabel>
                      <Select {...field} label="Setor Fiscal">
                        {setoresFiscais?.map((setor) => (
                          <MenuItem key={setor.id} value={setor.id}>
                            {setor.codigo} - {setor.nome}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="proprietario_id"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Autocomplete
                      options={pessoasData?.itens || []}
                      getOptionLabel={(option) => option.nome_razao_social}
                      loading={loadingPessoas}
                      value={pessoasData?.itens.find((p) => p.id === value) || null}
                      onChange={(_event, newValue) => {
                        onChange(newValue?.id || '')
                      }}
                      onInputChange={(_event, newInputValue) => {
                        setPessoasSearch(newInputValue)
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Proprietário"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loadingPessoas ? <CircularProgress size={20} /> : null}
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

              <Grid item xs={12} sm={6}>
                <Controller
                  name="quadra"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="Quadra" />}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="lote"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="Lote" />}
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
                  render={({ field: { value, onChange } }) => (
                    <CepInput
                      value={value}
                      onChange={onChange}
                      onEnderecoBuscado={handleEnderecoBuscado}
                      label="CEP"
                      fullWidth
                      buscarAutomatico
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={9}>
                <Controller
                  name="endereco.logradouro"
                  control={control}
                  rules={{ required: 'Logradouro é obrigatório' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Logradouro"
                      error={!!errors.endereco?.logradouro}
                      helperText={errors.endereco?.logradouro?.message}
                    />
                  )}
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
                  rules={{ required: 'Bairro é obrigatório' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Bairro"
                      error={!!errors.endereco?.bairro}
                      helperText={errors.endereco?.bairro?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <Controller
                  name="endereco.cidade"
                  control={control}
                  rules={{ required: 'Cidade é obrigatória' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Cidade"
                      error={!!errors.endereco?.cidade}
                      helperText={errors.endereco?.cidade?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="endereco.estado"
                  control={control}
                  rules={{ required: 'Estado é obrigatório' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="UF"
                      inputProps={{ maxLength: 2 }}
                      error={!!errors.endereco?.estado}
                      helperText={errors.endereco?.estado?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Medidas
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="area_terreno"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Área do Terreno (m²)" type="number" inputProps={{ step: '0.01' }} />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="area_construida"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Área Construída (m²)" type="number" inputProps={{ step: '0.01' }} />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="testada_principal"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Testada Principal (m)" type="number" inputProps={{ step: '0.01' }} />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="frente"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="Frente (m)" type="number" inputProps={{ step: '0.01' }} />}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="fundos"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label="Fundos (m)" type="number" inputProps={{ step: '0.01' }} />}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="lado_direito"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Lado Direito (m)" type="number" inputProps={{ step: '0.01' }} />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="lado_esquerdo"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Lado Esquerdo (m)" type="number" inputProps={{ step: '0.01' }} />
                  )}
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
