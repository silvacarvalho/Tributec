import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Autocomplete,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert,
} from '@mui/material'
import { Calculate as CalculateIcon } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { imovelService } from '@/services/imovelService'
import { tributarioService } from '@/services/tributarioService'
import type { IPTUCalculoRequest, IPTUCalculoResponse } from '@/types/tributario'

export function CalculoIPTUPage() {
  const [resultado, setResultado] = useState<IPTUCalculoResponse | null>(null)
  const [imoveisSearch, setImoveisSearch] = useState('')

  const currentYear = new Date().getFullYear()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IPTUCalculoRequest>({
    defaultValues: {
      imovel_id: '',
      ano_exercicio: currentYear,
      aplicar_descontos: true,
    },
  })

  const { data: imoveisData, isLoading: loadingImoveis } = useQuery({
    queryKey: ['imoveis-autocomplete', imoveisSearch],
    queryFn: () =>
      imovelService.listar({
        busca: imoveisSearch || undefined,
        limite: 20,
        ativo: true,
      }),
  })

  const calcularMutation = useMutation({
    mutationFn: (data: IPTUCalculoRequest) => tributarioService.calcularIPTU(data),
    onSuccess: (data) => {
      setResultado(data)
      toast.success('IPTU calculado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao calcular IPTU')
    },
  })

  const onSubmit = async (data: IPTUCalculoRequest) => {
    await calcularMutation.mutateAsync(data)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Cálculo de IPTU
      </Typography>

      <Card sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="imovel_id"
                control={control}
                rules={{ required: 'Imóvel é obrigatório' }}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={imoveisData?.itens || []}
                    getOptionLabel={(option) =>
                      `${option.inscricao_imobiliaria} - ${option.endereco.logradouro}, ${option.endereco.numero || 'S/N'}`
                    }
                    loading={loadingImoveis}
                    value={imoveisData?.itens.find((i) => i.id === value) || null}
                    onChange={(_event, newValue) => {
                      onChange(newValue?.id || '')
                    }}
                    onInputChange={(_event, newInputValue) => {
                      setImoveisSearch(newInputValue)
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Imóvel"
                        error={!!errors.imovel_id}
                        helperText={errors.imovel_id?.message}
                        required
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingImoveis ? <CircularProgress size={20} /> : null}
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
                name="ano_exercicio"
                control={control}
                rules={{
                  required: 'Ano de exercício é obrigatório',
                  min: { value: 2000, message: 'Ano deve ser maior ou igual a 2000' },
                  max: { value: 2100, message: 'Ano deve ser menor ou igual a 2100' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Ano de Exercício"
                    type="number"
                    error={!!errors.ano_exercicio}
                    helperText={errors.ano_exercicio?.message}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="aplicar_descontos"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Aplicar descontos disponíveis"
                    sx={{ mt: 1 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<CalculateIcon />}
                disabled={calcularMutation.isPending}
                fullWidth
              >
                {calcularMutation.isPending ? 'Calculando...' : 'Calcular IPTU'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>

      {resultado && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Resultado do Cálculo
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Inscrição Imobiliária
                </Typography>
                <Typography variant="h6">{resultado.inscricao_imobiliaria}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ano de Exercício
                </Typography>
                <Typography variant="h6">{resultado.ano_exercicio}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="subtitle2">Valor Venal do Terreno</Typography>
                <Typography variant="h6">{formatCurrency(resultado.valor_venal_terreno)}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="subtitle2">Valor Venal da Edificação</Typography>
                <Typography variant="h6">{formatCurrency(resultado.valor_venal_edificacao)}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Typography variant="subtitle2">Valor Venal Total</Typography>
                <Typography variant="h6">{formatCurrency(resultado.valor_venal_total)}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Alíquota Aplicada
                </Typography>
                <Typography variant="h6">{(resultado.aliquota * 100).toFixed(2)}%</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  IPTU sem Desconto
                </Typography>
                <Typography variant="h6">{formatCurrency(resultado.valor_iptu_sem_desconto)}</Typography>
              </Paper>
            </Grid>

            {resultado.desconto_aplicado > 0 && (
              <>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="subtitle2">Desconto Pagamento Único</Typography>
                    <Typography variant="h6">{(resultado.desconto_pagamento_unico * 100).toFixed(0)}%</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="subtitle2">Valor do Desconto</Typography>
                    <Typography variant="h6">{formatCurrency(resultado.desconto_aplicado)}</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'success.main', color: 'success.contrastText' }}>
                    <Typography variant="subtitle2">IPTU com Desconto (Pagamento Único)</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {formatCurrency(resultado.valor_iptu_com_desconto)}
                    </Typography>
                  </Paper>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                <Typography variant="subtitle2">Valor Total a Pagar</Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(resultado.valor_total)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {resultado.parcelas && resultado.parcelas.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Parcelas Disponíveis
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Parcela</TableCell>
                      <TableCell>Vencimento</TableCell>
                      <TableCell align="right">Valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resultado.parcelas.map((parcela) => (
                      <TableRow key={parcela.numero}>
                        <TableCell>{parcela.numero}/{resultado.parcelas.length}</TableCell>
                        <TableCell>{formatDate(parcela.vencimento)}</TableCell>
                        <TableCell align="right">{formatCurrency(parcela.valor)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {resultado.observacoes && (
            <Alert severity="info" sx={{ mt: 3 }}>
              {resultado.observacoes}
            </Alert>
          )}
        </Card>
      )}
    </Box>
  )
}
