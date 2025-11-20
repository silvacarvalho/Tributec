import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Box,
  Alert,
  Autocomplete,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material'
import { Search, Warning } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { fiscalService } from '../../services/fiscalService'
import { parametroService } from '../../services/parametroService'
import { BuscaAutuadoField } from './BuscaAutuadoField'
import { BuscaFiscalField } from './BuscaFiscalField'
import type { AutoInfracaoCreate } from '../../types/fiscal'

interface LavrarAutoDialogProps {
  open: boolean
  onClose: () => void
}

interface Contribuinte {
  id: string
  nome: string
  cpf_cnpj: string
  tipo_pessoa: 'FISICA' | 'JURIDICA'
  email?: string
  telefone?: string
  endereco?: string
}

export function LavrarAutoDialog({ open, onClose }: LavrarAutoDialogProps) {
  const queryClient = useQueryClient()

  // Busca de contribuinte
  const [buscaCpfCnpj, setBuscaCpfCnpj] = useState('')
  const [contribuinte, setContribuinte] = useState<Contribuinte | null>(null)
  const [buscandoContribuinte, setBuscandoContribuinte] = useState(false)
  const [erroContribuinte, setErroContribuinte] = useState('')
  const [reincidente, setReincidente] = useState(false)

  const [formData, setFormData] = useState<Partial<AutoInfracaoCreate>>({
    codigo_infracao: '',
    autuado_id: '',
    fiscal_autuante_id: '',
    local_infracao: '',
    valor_base_calculo: undefined,
    observacoes: '',
    data_infracao: new Date().toISOString().split('T')[0],
    hora_infracao: new Date().toTimeString().slice(0, 5),
    fiscal_autuante: '',
    descricao_fatos: '',
  })

  const [infracaoSelecionada, setInfracaoSelecionada] = useState<any>(null)

  // Buscar catálogo de infrações
  const { data: catalogo } = useQuery({
    queryKey: ['catalogo-infracoes'],
    queryFn: () => fiscalService.listarCatalogoInfracoes({ ativo: true })
  })

  // Buscar UFM atual
  const { data: ufm } = useQuery({
    queryKey: ['ufm-atual'],
    queryFn: () => parametroService.obterUfmAtual()
  })

  // Mutation para lavrar auto
  const lavrarMutation = useMutation({
    mutationFn: (dados: AutoInfracaoCreate) => fiscalService.lavrarAuto(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autos-infracao'] })
      queryClient.invalidateQueries({ queryKey: ['estatisticas-autos'] })
      queryClient.invalidateQueries({ queryKey: ['valores-autos'] })
      onClose()
      handleReset()
      toast.success('Auto de infração lavrado com sucesso!')
      onClose()
      setFormData({
        codigo_infracao: '',
        autuado_id: '',
        fiscal_autuante_id: '',
        local_infracao: '',
        valor_base_calculo: undefined,
        observacoes: ''
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao lavrar auto de infração')
    }
  })

  // Atualiza infração selecionada quando código muda
  useEffect(() => {
    if (formData.codigo_infracao && catalogo?.items) {
      const infracao = catalogo.items.find(i => i.codigo === formData.codigo_infracao)
      setInfracaoSelecionada(infracao || null)
    } else {
      setInfracaoSelecionada(null)
    }
  }, [formData.codigo_infracao, catalogo])

  // Buscar contribuinte por CPF/CNPJ
  const buscarContribuinte = async () => {
    if (!buscaCpfCnpj) return

    setBuscandoContribuinte(true)
    setErroContribuinte('')
    setContribuinte(null)

    try {
      // TODO: Implementar service real de contribuintes
      // Por enquanto, simulando busca
      await new Promise(resolve => setTimeout(resolve, 500))

      // Mock de contribuinte encontrado
      const mockContribuinte: Contribuinte = {
        id: `contrib-${buscaCpfCnpj}`,
        nome: buscaCpfCnpj.length === 11 ? 'João da Silva Santos' : 'Empresa XYZ Ltda',
        cpf_cnpj: buscaCpfCnpj,
        tipo_pessoa: buscaCpfCnpj.length === 11 ? 'FISICA' : 'JURIDICA',
        email: 'contribuinte@email.com',
        telefone: '(11) 99999-9999',
        endereco: 'Rua Principal, 100 - Centro - CEP 12345-678',
      }

      setContribuinte(mockContribuinte)
      setFormData(prev => ({ ...prev, autuado_id: mockContribuinte.id }))

      // Verificar reincidência (mock)
      setReincidente(Math.random() > 0.7) // 30% de chance de reincidência

    } catch (error) {
      setErroContribuinte('Contribuinte não encontrado no cadastro')
    } finally {
      setBuscandoContribuinte(false)
    }
  }

  const handleChange = (field: keyof AutoInfracaoCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.codigo_infracao || !contribuinte || !formData.fiscal_autuante) {
      return
    }

    const dadosAuto = {
      ...formData,
      autuado_id: contribuinte.id,
      autuado_cpf_cnpj: contribuinte.cpf_cnpj,
      autuado_nome: contribuinte.nome,
      autuado_tipo_pessoa: contribuinte.tipo_pessoa,
      autuado_endereco: contribuinte.endereco,
      autuado_email: contribuinte.email,
      autuado_telefone: contribuinte.telefone,
      reincidente,
    } as AutoInfracaoCreate

    lavrarMutation.mutate(dadosAuto)
  }

  const handleReset = () => {
    setBuscaCpfCnpj('')
    setContribuinte(null)
    setErroContribuinte('')
    setReincidente(false)
    setInfracaoSelecionada(null)
    setFormData({
      codigo_infracao: '',
      autuado_id: '',
      fiscal_autuante_id: '',
      local_infracao: '',
      valor_base_calculo: undefined,
      observacoes: '',
      data_infracao: new Date().toISOString().split('T')[0],
      hora_infracao: new Date().toTimeString().slice(0, 5),
      fiscal_autuante: '',
      descricao_fatos: '',
    })
  }

  const calcularMultaEstimada = () => {
    if (!infracaoSelecionada || !ufm) return null

    const ufmValor = ufm.valor_ufm
    let valorBase = 0

    if (infracaoSelecionada.tipo_multa === 'FIXA_UFM') {
      valorBase = (infracaoSelecionada.valor_multa_ufm || 0) * ufmValor
    }

    if (infracaoSelecionada.tipo_multa === 'PERCENTUAL' && formData.valor_base_calculo) {
      const percentual = infracaoSelecionada.percentual_multa || 0
      valorBase = (formData.valor_base_calculo * percentual) / 100
    }

    if (infracaoSelecionada.tipo_multa === 'MISTA') {
      const fixaUfm = (infracaoSelecionada.valor_multa_ufm || 0) * ufmValor
      const percentual = infracaoSelecionada.percentual_multa || 0
      const percentualValor = formData.valor_base_calculo
        ? (formData.valor_base_calculo * percentual) / 100
        : 0
      valorBase = fixaUfm + percentualValor
    }

    // Aplicar acréscimo por reincidência
    if (reincidente && infracaoSelecionada.percentual_reincidencia) {
      valorBase = valorBase * (1 + infracaoSelecionada.percentual_reincidencia / 100)
    }

    return valorBase
  }

  const multaEstimada = calcularMultaEstimada()

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Lavrar Auto de Infração</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2.5}>
            {/* SEÇÃO 1: IDENTIFICAÇÃO DO AUTUADO */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                1. Identificação do Autuado
              </Typography>
              <Divider sx={{ mt: 0.5, mb: 1 }} />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="CPF ou CNPJ do Contribuinte"
                value={buscaCpfCnpj}
                onChange={(e) => setBuscaCpfCnpj(e.target.value.replace(/\D/g, ''))}
                placeholder="Digite apenas números"
                error={!!erroContribuinte}
                helperText={erroContribuinte || 'Digite 11 dígitos (CPF) ou 14 dígitos (CNPJ)'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={buscarContribuinte} disabled={buscandoContribuinte}>
                        {buscandoContribuinte ? <CircularProgress size={24} /> : <Search />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                onKeyPress={(e) => e.key === 'Enter' && buscarContribuinte()}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={buscarContribuinte}
                disabled={buscandoContribuinte || !buscaCpfCnpj}
                sx={{ height: 56 }}
              >
                {buscandoContribuinte ? 'Buscando...' : 'Buscar'}
              </Button>
            </Grid>

            {contribuinte && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ bgcolor: 'success.50', borderColor: 'success.main' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="success.main" gutterBottom>
                      ✓ Contribuinte Encontrado
                    </Typography>
                    <Typography variant="h6">{contribuinte.nome}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {contribuinte.tipo_pessoa === 'FISICA' ? 'CPF' : 'CNPJ'}: {contribuinte.cpf_cnpj}
                    </Typography>
                    {contribuinte.endereco && (
                      <Typography variant="body2" color="text.secondary">
                        {contribuinte.endereco}
                      </Typography>
                    )}
                    {reincidente && (
                      <Alert severity="warning" icon={<Warning />} sx={{ mt: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          CONTRIBUINTE REINCIDENTE
                        </Typography>
                        <Typography variant="caption">
                          Acréscimo automático será aplicado conforme legislação
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* SEÇÃO 2: INFRAÇÃO */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                2. Infração Cometida
              </Typography>
              <Divider sx={{ mt: 0.5, mb: 1 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Selecione a Infração"
                value={formData.codigo_infracao}
                onChange={(e) => handleChange('codigo_infracao', e.target.value)}
                required
                disabled={!contribuinte}
                helperText={!contribuinte ? 'Busque um contribuinte primeiro' : ''}
              >
                {catalogo?.items.map((infracao) => (
                  <MenuItem key={infracao.codigo} value={infracao.codigo}>
                    {infracao.codigo} - {infracao.descricao}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Detalhes da Infração Selecionada */}
            {infracaoSelecionada && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="subtitle2" gutterBottom>
                    {infracaoSelecionada.descricao}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Base legal: {infracaoSelecionada.base_legal || infracaoSelecionada.artigo_lei}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tipo: {infracaoSelecionada.tipo_multa} | Gravidade: {infracaoSelecionada.gravidade}
                  </Typography>
                  {infracaoSelecionada.tipo_multa === 'FIXA_UFM' && (
                    <Typography variant="body2" fontWeight="medium">
                      Multa: {infracaoSelecionada.valor_multa_ufm} UFM (R${' '}
                      {(infracaoSelecionada.valor_multa_ufm * (ufm?.valor_ufm || 0)).toFixed(2)})
                    </Typography>
                  )}
                  {infracaoSelecionada.tipo_multa === 'PERCENTUAL' && (
                    <Typography variant="body2" fontWeight="medium">
                      Multa: {infracaoSelecionada.percentual_multa}% sobre o valor
                    </Typography>
                  )}
                </Alert>
              </Grid>
            )}

            {/* SEÇÃO 3: DADOS DA OCORRÊNCIA */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                3. Dados da Ocorrência
              </Typography>
              <Divider sx={{ mt: 0.5, mb: 1 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Data da Infração"
                value={formData.data_infracao}
                onChange={(e) => handleChange('data_infracao', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: new Date().toISOString().split('T')[0] }}
                required
                disabled={!infracaoSelecionada}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="time"
                label="Hora da Infração"
                value={formData.hora_infracao}
                onChange={(e) => handleChange('hora_infracao', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                disabled={!infracaoSelecionada}
              />
            </Grid>

            {/* Autuado (Busca com Autocomplete) */}
            <Grid item xs={12} md={6}>
              <BuscaAutuadoField
                value={formData.autuado_id || ''}
                onChange={(pessoaId) => handleChange('autuado_id', pessoaId)}
                required
              />
            </Grid>

            {/* Fiscal Autuante (Busca com Autocomplete) */}
            <Grid item xs={12} md={6}>
              <BuscaFiscalField
                value={formData.fiscal_autuante_id || ''}
                onChange={(fiscalId) => handleChange('fiscal_autuante_id', fiscalId)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Local da Infração"
                value={formData.local_infracao}
                onChange={(e) => handleChange('local_infracao', e.target.value)}
                placeholder="Ex: Rua Principal, 100 - Centro"
                required
                disabled={!infracaoSelecionada}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fiscal Autuante"
                value={formData.fiscal_autuante}
                onChange={(e) => handleChange('fiscal_autuante', e.target.value)}
                placeholder="Nome completo do fiscal responsável"
                required
                disabled={!infracaoSelecionada}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Descrição Detalhada dos Fatos"
                value={formData.descricao_fatos}
                onChange={(e) => handleChange('descricao_fatos', e.target.value)}
                placeholder="Descreva objetivamente os fatos que motivaram a lavratura do auto..."
                helperText="Seja claro e detalhado na descrição"
                disabled={!infracaoSelecionada}
              />
            </Grid>

            {/* Valor Base de Cálculo (se percentual) */}
            {infracaoSelecionada &&
              (infracaoSelecionada.tipo_multa === 'PERCENTUAL' ||
                infracaoSelecionada.tipo_multa === 'MISTA') && (
                <>
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      4. Valor Base de Cálculo
                    </Typography>
                    <Divider sx={{ mt: 0.5, mb: 1 }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Valor Base de Cálculo"
                      value={formData.valor_base_calculo || ''}
                      onChange={(e) =>
                        handleChange('valor_base_calculo', parseFloat(e.target.value))
                      }
                      required
                      InputProps={{
                        startAdornment: 'R$',
                        endAdornment: (
                          <ParameterInfoIcon
                            parameterKey="VALOR_BASE"
                            title="Valor Base de Cálculo"
                            description="Valor sobre o qual será aplicado o percentual da multa"
                            helpText="Por exemplo: valor omitido em declaração, valor não tributado, etc."
                          />
                        )
                      }}
                    />
                  </Grid>
                </>
              )}

            {/* SEÇÃO 4/5: CÁLCULO DA MULTA */}
            {multaEstimada !== null && (
              <>
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    {infracaoSelecionada?.tipo_multa === 'PERCENTUAL' ||
                     infracaoSelecionada?.tipo_multa === 'MISTA' ? '5' : '4'}. Cálculo da Multa
                  </Typography>
                  <Divider sx={{ mt: 0.5, mb: 1 }} />
                </Grid>

                {ufm && (
                  <Grid item xs={12}>
                    <Alert severity="info" variant="outlined">
                      <Typography variant="caption" color="text.secondary">
                        UFM vigente ({ufm.ano}): {formatarMoeda(ufm.valor_ufm)}
                      </Typography>
                    </Alert>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ bgcolor: 'primary.50', borderColor: 'primary.main' }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Valor Estimado da Multa
                      </Typography>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {formatarMoeda(multaEstimada)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Cálculo automático baseado nos parâmetros do sistema
                        {reincidente && ' (inclui acréscimo de reincidência)'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            {/* Observações Adicionais */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Observações Adicionais (Opcional)"
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                multiline
                rows={2}
                placeholder="Informações complementares..."
                disabled={!infracaoSelecionada}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={lavrarMutation.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !contribuinte ||
            !formData.codigo_infracao ||
            !formData.fiscal_autuante ||
            !formData.local_infracao ||
            lavrarMutation.isPending
          }
          startIcon={lavrarMutation.isPending && <CircularProgress size={20} color="inherit" />}
        >
          {lavrarMutation.isPending ? 'Lavrando Auto...' : 'Lavrar Auto de Infração'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
