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
  Typography,
  Box,
  Alert,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import type { ParcelamentoCreate, Pessoa } from '@/types'
import { pessoaService } from '@/services/pessoaService'
import { formatters } from '@/utils/formatters'

interface ParcelamentoFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ParcelamentoCreate) => Promise<void>
}

const valorUFM = 100 // Valor da UFM (pode ser configurável)

export function ParcelamentoFormDialog({
  open,
  onClose,
  onSubmit,
}: ParcelamentoFormDialogProps) {
  const [searchContribuinte, setSearchContribuinte] = useState('')
  const [valorTotal, setValorTotal] = useState(0)
  const [valorParcelado, setValorParcelado] = useState(0)
  const [valorParcela, setValorParcela] = useState(0)
  const [tipoContribuinte, setTipoContribuinte] = useState<'F' | 'J'>('F')

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ParcelamentoCreate>({
    defaultValues: {
      numero_parcelas: 12,
      valor_entrada: 0,
      dia_vencimento: 10,
      observacoes: '',
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
    enabled: open,
  })

  // Simular valor total dos débitos (em produção viria dos débitos selecionados)
  useEffect(() => {
    const contribuinteId = watch('contribuinte_id')
    if (contribuinteId) {
      // Simular valor total de débitos
      setValorTotal(5000) // Exemplo: R$ 5.000,00
    }
  }, [watch('contribuinte_id')])

  // Calcular valores
  useEffect(() => {
    const entrada = watch('valor_entrada') || 0
    const numeroParcelas = watch('numero_parcelas') || 1

    const parcelado = valorTotal - entrada
    setValorParcelado(parcelado)
    setValorParcela(parcelado / numeroParcelas)
  }, [watch('valor_entrada'), watch('numero_parcelas'), valorTotal])

  // Validar valor mínimo da parcela
  const valorMinimoParcela = tipoContribuinte === 'F' ? valorUFM * 5 : valorUFM * 20

  const handleFormSubmit = async (data: ParcelamentoCreate) => {
    // Validação do valor mínimo
    if (valorParcela < valorMinimoParcela) {
      alert(
        `Valor da parcela (${formatters.currency(valorParcela)}) é menor que o mínimo permitido (${formatters.currency(valorMinimoParcela)})`
      )
      return
    }

    // Em produção, os debitos_ids viriam de uma seleção de débitos
    const dataWithDebitos = {
      ...data,
      debitos_ids: ['debito-exemplo-1', 'debito-exemplo-2'], // Mock
    }

    await onSubmit(dataWithDebitos)
    reset()
    onClose()
  }

  const handleContribuinteChange = (pessoa: Pessoa | null) => {
    if (pessoa) {
      setTipoContribuinte(pessoa.tipo_pessoa)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>Novo Parcelamento</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
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
                    onChange={(_, value) => {
                      field.onChange(value?.id || '')
                      handleContribuinteChange(value)
                    }}
                    onInputChange={(_, value) => setSearchContribuinte(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Contribuinte"
                        error={!!errors.contribuinte_id}
                        helperText={errors.contribuinte_id?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {valorTotal > 0 && (
              <>
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Valor Total dos Débitos:</strong> {formatters.currency(valorTotal)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Tipo: {tipoContribuinte === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'} |
                      Valor Mínimo por Parcela: {formatters.currency(valorMinimoParcela)}
                    </Typography>
                  </Alert>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="valor_entrada"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Valor de Entrada (opcional)"
                        type="number"
                        fullWidth
                        inputProps={{ step: '0.01', min: '0', max: valorTotal }}
                        value={field.value || 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="numero_parcelas"
                    control={control}
                    rules={{
                      required: 'Número de parcelas é obrigatório',
                      min: { value: 2, message: 'Mínimo 2 parcelas' },
                      max: { value: 24, message: 'Máximo 24 parcelas' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Número de Parcelas"
                        type="number"
                        fullWidth
                        inputProps={{ min: '2', max: '24' }}
                        error={!!errors.numero_parcelas}
                        helperText={errors.numero_parcelas?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Valor Parcelado"
                    value={formatters.currency(valorParcelado)}
                    fullWidth
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Valor da Parcela"
                    value={formatters.currency(valorParcela)}
                    fullWidth
                    disabled
                    error={valorParcela < valorMinimoParcela && valorParcela > 0}
                    helperText={
                      valorParcela < valorMinimoParcela && valorParcela > 0
                        ? 'Valor abaixo do mínimo permitido'
                        : ''
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="dia_vencimento"
                    control={control}
                    rules={{
                      required: 'Dia de vencimento é obrigatório',
                      min: { value: 1, message: 'Dia deve ser entre 1 e 28' },
                      max: { value: 28, message: 'Dia deve ser entre 1 e 28' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Dia de Vencimento"
                        type="number"
                        fullWidth
                        inputProps={{ min: '1', max: '28' }}
                        error={!!errors.dia_vencimento}
                        helperText={errors.dia_vencimento?.message || 'Dia do mês para vencimento'}
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
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || valorTotal === 0 || valorParcela < valorMinimoParcela}
          >
            {isSubmitting ? 'Criando...' : 'Criar Parcelamento'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
