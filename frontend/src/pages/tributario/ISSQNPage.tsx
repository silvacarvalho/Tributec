/**
 * Página de Cálculo e Declaração de ISSQN
 * ISSQN - Imposto sobre Serviços de Qualquer Natureza
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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Print as PrintIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { tributarioService } from '@/services/tributarioService';
import { estabelecimentoService } from '@/services/estabelecimentoService';

interface ISSQNCalculoData {
  estabelecimento_id: string;
  mes_competencia: number;
  ano_competencia: number;
  receita_bruta_total: number;
  deducoes_materiais: number;
  outras_deducoes: number;
  valor_retido_terceiros: number;
}

interface ISSQNCalculoResult {
  receita_bruta_total: number;
  deducoes_materiais: number;
  outras_deducoes: number;
  base_calculo: number;
  aliquota: number;
  valor_issqn: number;
  valor_retido_terceiros: number;
  valor_a_recolher: number;
}

interface ISSQNDeclaracaoData {
  estabelecimento_id: string;
  mes_competencia: number;
  ano_competencia: number;
  regime_tributacao: string;
  receita_bruta_total: number;
  deducoes_materiais: number;
  outras_deducoes: number;
  valor_retido_terceiros: number;
  valor_fixo_ufm?: number;
  quantidade_profissionais?: number;
}

const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

const REGIMES_TRIBUTACAO = [
  { value: 'VARIAVEL', label: 'Variável (% sobre receita)' },
  { value: 'FIXO', label: 'Fixo (valor em UFM)' },
  { value: 'ESTIMATIVA', label: 'Estimativa' },
  { value: 'SOCIEDADE_PROFISSIONAIS', label: 'Sociedade de Profissionais' },
];

export function ISSQNPage() {
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  const [estabelecimentoSelecionado, setEstabelecimentoSelecionado] = useState<any>(null);
  const [mesCompetencia, setMesCompetencia] = useState<number>(mesAtual > 1 ? mesAtual - 1 : 12);
  const [anoCompetencia, setAnoCompetencia] = useState<number>(
    mesAtual > 1 ? anoAtual : anoAtual - 1
  );
  const [regimeTributacao, setRegimeTributacao] = useState<string>('VARIAVEL');
  const [receitaBruta, setReceitaBruta] = useState<string>('');
  const [deducoesMateriais, setDeducoesMateriais] = useState<string>('0');
  const [outrasDeducoes, setOutrasDeducoes] = useState<string>('0');
  const [valorRetido, setValorRetido] = useState<string>('0');
  const [valorFixoUFM, setValorFixoUFM] = useState<string>('');
  const [quantidadeProfissionais, setQuantidadeProfissionais] = useState<string>('');
  const [calculoResultado, setCalculoResultado] = useState<ISSQNCalculoResult | null>(null);

  // Buscar estabelecimentos para autocomplete
  const { data: estabelecimentosData, isLoading: isLoadingEstabelecimentos } = useQuery({
    queryKey: ['estabelecimentos'],
    queryFn: () => estabelecimentoService.listar({ pagina: 1, limite: 100 }),
  });

  const estabelecimentos = estabelecimentosData?.itens || [];

  // Mutation para calcular ISSQN
  const calcularMutation = useMutation({
    mutationFn: (data: ISSQNCalculoData) => tributarioService.calcularISSQN(data),
    onSuccess: (data) => {
      setCalculoResultado(data);
      toast.success('ISSQN calculado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao calcular ISSQN');
    },
  });

  // Mutation para declarar ISSQN
  const declararMutation = useMutation({
    mutationFn: (data: ISSQNDeclaracaoData) => tributarioService.declararISSQN(data),
    onSuccess: () => {
      toast.success('Declaração de ISSQN enviada com sucesso!');
      // Reset form
      setEstabelecimentoSelecionado(null);
      setMesCompetencia(mesAtual > 1 ? mesAtual - 1 : 12);
      setAnoCompetencia(mesAtual > 1 ? anoAtual : anoAtual - 1);
      setRegimeTributacao('VARIAVEL');
      setReceitaBruta('');
      setDeducoesMateriais('0');
      setOutrasDeducoes('0');
      setValorRetido('0');
      setValorFixoUFM('');
      setQuantidadeProfissionais('');
      setCalculoResultado(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao declarar ISSQN');
    },
  });

  const handleCalcular = () => {
    if (!estabelecimentoSelecionado) {
      toast.error('Selecione um estabelecimento');
      return;
    }

    if (regimeTributacao === 'VARIAVEL' && (!receitaBruta || parseFloat(receitaBruta) < 0)) {
      toast.error('Informe a receita bruta');
      return;
    }

    calcularMutation.mutate({
      estabelecimento_id: estabelecimentoSelecionado.id,
      mes_competencia: mesCompetencia,
      ano_competencia: anoCompetencia,
      receita_bruta_total: parseFloat(receitaBruta) || 0,
      deducoes_materiais: parseFloat(deducoesMateriais) || 0,
      outras_deducoes: parseFloat(outrasDeducoes) || 0,
      valor_retido_terceiros: parseFloat(valorRetido) || 0,
    });
  };

  const handleDeclarar = () => {
    if (!estabelecimentoSelecionado) {
      toast.error('Selecione um estabelecimento');
      return;
    }

    if (!calculoResultado) {
      toast.error('Calcule o ISSQN antes de enviar a declaração');
      return;
    }

    const declaracaoData: ISSQNDeclaracaoData = {
      estabelecimento_id: estabelecimentoSelecionado.id,
      mes_competencia: mesCompetencia,
      ano_competencia: anoCompetencia,
      regime_tributacao: regimeTributacao,
      receita_bruta_total: parseFloat(receitaBruta) || 0,
      deducoes_materiais: parseFloat(deducoesMateriais) || 0,
      outras_deducoes: parseFloat(outrasDeducoes) || 0,
      valor_retido_terceiros: parseFloat(valorRetido) || 0,
    };

    if (regimeTributacao === 'FIXO' && valorFixoUFM) {
      declaracaoData.valor_fixo_ufm = parseFloat(valorFixoUFM);
    }

    if (regimeTributacao === 'SOCIEDADE_PROFISSIONAIS' && quantidadeProfissionais) {
      declaracaoData.quantidade_profissionais = parseInt(quantidadeProfissionais);
    }

    declararMutation.mutate(declaracaoData);
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

  const gerarAnosDisponiveis = () => {
    const anos = [];
    for (let i = anoAtual; i >= anoAtual - 5; i--) {
      anos.push(i);
    }
    return anos;
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Declaração de ISSQN
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Imposto sobre Serviços de Qualquer Natureza
      </Typography>

      <Grid container spacing={3}>
        {/* Formulário */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dados da Declaração
              </Typography>

              <Grid container spacing={2}>
                {/* Estabelecimento */}
                <Grid item xs={12}>
                  <Autocomplete
                    value={estabelecimentoSelecionado}
                    onChange={(_, newValue) => setEstabelecimentoSelecionado(newValue)}
                    options={estabelecimentos || []}
                    getOptionLabel={(option) =>
                      `${option.inscricao_municipal} - ${option.nome_fantasia || 'Sem nome fantasia'}`
                    }
                    loading={isLoadingEstabelecimentos}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Estabelecimento (CCM) *"
                        placeholder="Buscar por inscrição municipal"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingEstabelecimentos ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Competência */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Mês de Competência *</InputLabel>
                    <Select
                      value={mesCompetencia}
                      onChange={(e) => setMesCompetencia(Number(e.target.value))}
                      label="Mês de Competência *"
                    >
                      {MESES.map((mes) => (
                        <MenuItem key={mes.value} value={mes.value}>
                          {mes.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Ano de Competência *</InputLabel>
                    <Select
                      value={anoCompetencia}
                      onChange={(e) => setAnoCompetencia(Number(e.target.value))}
                      label="Ano de Competência *"
                    >
                      {gerarAnosDisponiveis().map((ano) => (
                        <MenuItem key={ano} value={ano}>
                          {ano}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Regime de Tributação */}
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Regime de Tributação *</FormLabel>
                    <RadioGroup
                      value={regimeTributacao}
                      onChange={(e) => setRegimeTributacao(e.target.value)}
                    >
                      {REGIMES_TRIBUTACAO.map((regime) => (
                        <FormControlLabel
                          key={regime.value}
                          value={regime.value}
                          control={<Radio />}
                          label={regime.label}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                {/* Campos específicos para regime variável */}
                {regimeTributacao === 'VARIAVEL' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Receita Bruta Total *"
                        type="number"
                        value={receitaBruta}
                        onChange={(e) => setReceitaBruta(e.target.value)}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Deduções de Materiais"
                        type="number"
                        value={deducoesMateriais}
                        onChange={(e) => setDeducoesMateriais(e.target.value)}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Outras Deduções"
                        type="number"
                        value={outrasDeducoes}
                        onChange={(e) => setOutrasDeducoes(e.target.value)}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Valor Retido por Terceiros"
                        type="number"
                        value={valorRetido}
                        onChange={(e) => setValorRetido(e.target.value)}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                        }}
                        helperText="Imposto já retido na fonte"
                      />
                    </Grid>
                  </>
                )}

                {/* Campos específicos para regime fixo */}
                {regimeTributacao === 'FIXO' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Valor Fixo (UFM) *"
                      type="number"
                      value={valorFixoUFM}
                      onChange={(e) => setValorFixoUFM(e.target.value)}
                      helperText="Quantidade de UFMs"
                    />
                  </Grid>
                )}

                {/* Campos específicos para sociedade de profissionais */}
                {regimeTributacao === 'SOCIEDADE_PROFISSIONAIS' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Quantidade de Profissionais *"
                      type="number"
                      value={quantidadeProfissionais}
                      onChange={(e) => setQuantidadeProfissionais(e.target.value)}
                      helperText="Número de profissionais habilitados"
                    />
                  </Grid>
                )}

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
                      {calcularMutation.isPending ? 'Calculando...' : 'Calcular ISSQN'}
                    </Button>

                    {calculoResultado && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<SaveIcon />}
                          onClick={handleDeclarar}
                          disabled={declararMutation.isPending}
                        >
                          {declararMutation.isPending ? 'Declarando...' : 'Enviar Declaração'}
                        </Button>

                        <Button
                          variant="outlined"
                          startIcon={<PrintIcon />}
                          onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                        >
                          Imprimir DAM
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
                    <TableCell>Receita Bruta Total:</TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(calculoResultado.receita_bruta_total)}</strong>
                    </TableCell>
                  </TableRow>

                  {calculoResultado.deducoes_materiais > 0 && (
                    <TableRow>
                      <TableCell>(-) Deduções de Materiais:</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        -{formatCurrency(calculoResultado.deducoes_materiais)}
                      </TableCell>
                    </TableRow>
                  )}

                  {calculoResultado.outras_deducoes > 0 && (
                    <TableRow>
                      <TableCell>(-) Outras Deduções:</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        -{formatCurrency(calculoResultado.outras_deducoes)}
                      </TableCell>
                    </TableRow>
                  )}

                  <TableRow>
                    <TableCell colSpan={2}>
                      <Divider />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Base de Cálculo:</TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(calculoResultado.base_calculo)}</strong>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Alíquota:</TableCell>
                    <TableCell align="right">{formatPercentage(calculoResultado.aliquota)}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={2}>
                      <Divider />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Valor do ISSQN:</TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(calculoResultado.valor_issqn)}</strong>
                    </TableCell>
                  </TableRow>

                  {calculoResultado.valor_retido_terceiros > 0 && (
                    <TableRow>
                      <TableCell>(-) Retido na Fonte:</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        -{formatCurrency(calculoResultado.valor_retido_terceiros)}
                      </TableCell>
                    </TableRow>
                  )}

                  <TableRow>
                    <TableCell colSpan={2}>
                      <Divider />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle1">
                        <strong>VALOR A RECOLHER:</strong>
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="primary">
                        <strong>{formatCurrency(calculoResultado.valor_a_recolher)}</strong>
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {calculoResultado.valor_a_recolher <= 0 && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Nenhum valor a recolher neste período.
                </Alert>
              )}
            </Paper>
          ) : (
            <Alert severity="info">
              Preencha os dados e clique em "Calcular ISSQN" para visualizar o resultado.
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
