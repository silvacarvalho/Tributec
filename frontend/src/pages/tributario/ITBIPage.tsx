/**
 * Página de Cálculo e Emissão de ITBI
 * ITBI - Imposto sobre Transmissão de Bens Imóveis
 */
import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Print as PrintIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '@/services/api';

interface ITBICalculoData {
  imovel_id: string;
  valor_declarado: number;
  valor_financiado_sfh: number;
  tipo_transmissao: string;
}

interface ITBICalculoResult {
  valor_declarado: number;
  valor_venal: number;
  valor_base_calculo: number;
  valor_financiado_sfh: number;
  valor_nao_financiado: number;
  aliquota_sfh: number;
  aliquota_normal: number;
  valor_itbi_sfh: number;
  valor_itbi_normal: number;
  valor_itbi_total: number;
  valor_isencao: number;
  valor_liquido: number;
}

interface ITBIGuiaData {
  imovel_id: string;
  transmitente_id: string;
  adquirente_id: string;
  tipo_transmissao: string;
  valor_declarado: number;
  valor_financiado_sfh: number;
}

const TIPOS_TRANSMISSAO = [
  { value: 'COMPRA_VENDA', label: 'Compra e Venda' },
  { value: 'DOACAO', label: 'Doação' },
  { value: 'PERMUTA', label: 'Permuta' },
  { value: 'ARREMATACAO', label: 'Arrematação' },
  { value: 'ADJUDICACAO', label: 'Adjudicação' },
  { value: 'USUCAPIAO', label: 'Usucapião' },
  { value: 'HERANCA', label: 'Herança' },
  { value: 'MEACAO', label: 'Meação' },
  { value: 'OUTROS', label: 'Outros' },
];

export function ITBIPage() {
  const [imovelSelecionado, setImovelSelecionado] = useState<any>(null);
  const [transmitente, setTransmitente] = useState<any>(null);
  const [adquirente, setAdquirente] = useState<any>(null);
  const [valorDeclarado, setValorDeclarado] = useState<string>('');
  const [valorFinanciado, setValorFinanciado] = useState<string>('0');
  const [tipoTransmissao, setTipoTransmissao] = useState<string>('COMPRA_VENDA');
  const [calculoResultado, setCalculoResultado] = useState<ITBICalculoResult | null>(null);

  // Buscar imóveis para autocomplete
  const { data: imoveis, isLoading: isLoadingImoveis } = useQuery({
    queryKey: ['imoveis'],
    queryFn: async () => {
      const response = await api.get('/cadastro/imoveis', {
        params: { skip: 0, limit: 100 },
      });
      return response.data.dados || [];
    },
  });

  // Buscar pessoas para autocomplete
  const { data: pessoas, isLoading: isLoadingPessoas } = useQuery({
    queryKey: ['pessoas'],
    queryFn: async () => {
      const response = await api.get('/cadastro/pessoas', {
        params: { skip: 0, limit: 100 },
      });
      return response.data.dados || [];
    },
  });

  // Mutation para calcular ITBI
  const calcularMutation = useMutation({
    mutationFn: async (data: ITBICalculoData) => {
      const response = await api.post('/tributario/itbi/calcular', data);
      return response.data;
    },
    onSuccess: (data) => {
      setCalculoResultado(data);
      toast.success('ITBI calculado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao calcular ITBI');
    },
  });

  // Mutation para emitir guia
  const emitirGuiaMutation = useMutation({
    mutationFn: async (data: ITBIGuiaData) => {
      const response = await api.post('/tributario/itbi/emitir-guia', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Guia de ITBI emitida com sucesso!');
      // Reset form
      setImovelSelecionado(null);
      setTransmitente(null);
      setAdquirente(null);
      setValorDeclarado('');
      setValorFinanciado('0');
      setTipoTransmissao('COMPRA_VENDA');
      setCalculoResultado(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao emitir guia de ITBI');
    },
  });

  const handleCalcular = () => {
    if (!imovelSelecionado) {
      toast.error('Selecione um imóvel');
      return;
    }

    if (!valorDeclarado || parseFloat(valorDeclarado) <= 0) {
      toast.error('Informe o valor declarado da transação');
      return;
    }

    calcularMutation.mutate({
      imovel_id: imovelSelecionado.id,
      valor_declarado: parseFloat(valorDeclarado),
      valor_financiado_sfh: parseFloat(valorFinanciado) || 0,
      tipo_transmissao: tipoTransmissao,
    });
  };

  const handleEmitirGuia = () => {
    if (!imovelSelecionado || !transmitente || !adquirente) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!calculoResultado) {
      toast.error('Calcule o ITBI antes de emitir a guia');
      return;
    }

    emitirGuiaMutation.mutate({
      imovel_id: imovelSelecionado.id,
      transmitente_id: transmitente.id,
      adquirente_id: adquirente.id,
      tipo_transmissao: tipoTransmissao,
      valor_declarado: parseFloat(valorDeclarado),
      valor_financiado_sfh: parseFloat(valorFinanciado) || 0,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Cálculo e Emissão de ITBI
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Imposto sobre Transmissão de Bens Imóveis
      </Typography>

      <Grid container spacing={3}>
        {/* Formulário */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dados da Transmissão
              </Typography>

              <Grid container spacing={2}>
                {/* Imóvel */}
                <Grid item xs={12}>
                  <Autocomplete
                    value={imovelSelecionado}
                    onChange={(_, newValue) => setImovelSelecionado(newValue)}
                    options={imoveis || []}
                    getOptionLabel={(option) =>
                      `${option.inscricao_imobiliaria} - ${option.endereco || 'Sem endereço'}`
                    }
                    loading={isLoadingImoveis}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Imóvel *"
                        placeholder="Buscar por inscrição imobiliária"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingImoveis ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Tipo de Transmissão */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Transmissão *</InputLabel>
                    <Select
                      value={tipoTransmissao}
                      onChange={(e) => setTipoTransmissao(e.target.value)}
                      label="Tipo de Transmissão *"
                    >
                      {TIPOS_TRANSMISSAO.map((tipo) => (
                        <MenuItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Valor Declarado */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Valor Declarado *"
                    type="number"
                    value={valorDeclarado}
                    onChange={(e) => setValorDeclarado(e.target.value)}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                    }}
                  />
                </Grid>

                {/* Valor Financiado SFH */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Valor Financiado (SFH)"
                    type="number"
                    value={valorFinanciado}
                    onChange={(e) => setValorFinanciado(e.target.value)}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                    }}
                    helperText="Alíquota reduzida para SFH"
                  />
                </Grid>

                {/* Transmitente */}
                <Grid item xs={12}>
                  <Autocomplete
                    value={transmitente}
                    onChange={(_, newValue) => setTransmitente(newValue)}
                    options={pessoas || []}
                    getOptionLabel={(option) =>
                      `${option.nome_razao_social} - ${option.cpf || option.cnpj || ''}`
                    }
                    loading={isLoadingPessoas}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Transmitente (Vendedor/Doador) *"
                        placeholder="Buscar por nome ou documento"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingPessoas ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Adquirente */}
                <Grid item xs={12}>
                  <Autocomplete
                    value={adquirente}
                    onChange={(_, newValue) => setAdquirente(newValue)}
                    options={pessoas || []}
                    getOptionLabel={(option) =>
                      `${option.nome_razao_social} - ${option.cpf || option.cnpj || ''}`
                    }
                    loading={isLoadingPessoas}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Adquirente (Comprador) *"
                        placeholder="Buscar por nome ou documento"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingPessoas ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Botões */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<CalculateIcon />}
                      onClick={handleCalcular}
                      disabled={calcularMutation.isPending}
                    >
                      {calcularMutation.isPending ? 'Calculando...' : 'Calcular ITBI'}
                    </Button>

                    {calculoResultado && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<SaveIcon />}
                          onClick={handleEmitirGuia}
                          disabled={emitirGuiaMutation.isPending}
                        >
                          {emitirGuiaMutation.isPending ? 'Emitindo...' : 'Emitir Guia'}
                        </Button>

                        <Button
                          variant="outlined"
                          startIcon={<PrintIcon />}
                          onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                        >
                          Imprimir
                        </Button>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Resultado do Cálculo */}
        <Grid item xs={12} md={5}>
          {calculoResultado ? (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resultado do Cálculo
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Valor Declarado:</TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(calculoResultado.valor_declarado)}</strong>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Valor Venal:</TableCell>
                    <TableCell align="right">{formatCurrency(calculoResultado.valor_venal)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Base de Cálculo:</TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(calculoResultado.valor_base_calculo)}</strong>
                    </TableCell>
                  </TableRow>

                  {calculoResultado.valor_financiado_sfh > 0 && (
                    <>
                      <TableRow>
                        <TableCell colSpan={2}>
                          <Divider />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Valor Financiado (SFH):</TableCell>
                        <TableCell align="right">
                          {formatCurrency(calculoResultado.valor_financiado_sfh)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Alíquota SFH:</TableCell>
                        <TableCell align="right">{formatPercentage(calculoResultado.aliquota_sfh)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ITBI sobre SFH:</TableCell>
                        <TableCell align="right">{formatCurrency(calculoResultado.valor_itbi_sfh)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Valor Não Financiado:</TableCell>
                        <TableCell align="right">
                          {formatCurrency(calculoResultado.valor_nao_financiado)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Alíquota Normal:</TableCell>
                        <TableCell align="right">
                          {formatPercentage(calculoResultado.aliquota_normal)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ITBI sobre Não Financiado:</TableCell>
                        <TableCell align="right">
                          {formatCurrency(calculoResultado.valor_itbi_normal)}
                        </TableCell>
                      </TableRow>
                    </>
                  )}

                  {calculoResultado.valor_financiado_sfh === 0 && (
                    <>
                      <TableRow>
                        <TableCell>Alíquota:</TableCell>
                        <TableCell align="right">
                          {formatPercentage(calculoResultado.aliquota_normal)}
                        </TableCell>
                      </TableRow>
                    </>
                  )}

                  <TableRow>
                    <TableCell colSpan={2}>
                      <Divider />
                    </TableCell>
                  </TableRow>

                  {calculoResultado.valor_isencao > 0 && (
                    <TableRow>
                      <TableCell>Isenção:</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        -{formatCurrency(calculoResultado.valor_isencao)}
                      </TableCell>
                    </TableRow>
                  )}

                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle1">
                        <strong>VALOR TOTAL DO ITBI:</strong>
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="primary">
                        <strong>{formatCurrency(calculoResultado.valor_liquido)}</strong>
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          ) : (
            <Alert severity="info">
              Preencha os dados e clique em "Calcular ITBI" para visualizar o resultado.
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
