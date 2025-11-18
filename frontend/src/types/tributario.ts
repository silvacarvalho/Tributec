// Types for Tributário module - Completo baseado no backend

// =====================================================
// IPTU - Imposto Predial e Territorial Urbano
// =====================================================

export type StatusLancamento = 'LANCADO' | 'PAGO' | 'CANCELADO' | 'VENCIDO'

export interface IPTUCalculoRequest {
  imovel_id: string
  ano_exercicio: number
  numero_parcelas?: number
  pagamento_unico?: boolean
  iptu_digital?: boolean
}

export interface IPTUCalculoResponse {
  valor_venal_terreno: number
  valor_venal_edificacao: number
  valor_venal_total: number
  fator_correcao_terreno: number
  fator_correcao_edificacao: number
  fatores_aplicados?: Record<string, any>
  aliquota_aplicada: number
  tipo_uso_calculo: string
  valor_iptu: number
  desconto_pagamento_unico: number
  desconto_iptu_digital: number
  desconto_anos_anteriores: number
  percentual_desconto_anos: number
  valor_liquido: number
  numero_parcelas: number
  valor_parcela: number
}

export interface IPTULancamentoCreate {
  imovel_id: string
  ano_exercicio: number
  numero_parcelas?: number
  pagamento_unico?: boolean
  iptu_digital?: boolean
}

export interface IPTULancamento {
  id: string
  imovel_id: string
  ano_exercicio: number
  numero_lancamento: string
  data_lancamento: string
  valor_venal_terreno: number
  valor_venal_edificacao: number
  valor_venal_total: number
  aliquota_aplicada: number
  tipo_uso_calculo: string
  valor_iptu: number
  valor_liquido: number
  numero_parcelas: number
  valor_parcela: number
  data_vencimento_unico?: string
  data_vencimento_primeira_parcela?: string
  status: StatusLancamento
}

export interface IPTUParcela {
  id: string
  lancamento_id: string
  numero_parcela: number
  valor_principal: number
  valor_juros: number
  valor_multa: number
  valor_correcao: number
  valor_total: number
  data_vencimento: string
  pago: boolean
  data_pagamento?: string
  valor_pago?: number
}

export interface IPTUCorrecaoRequest {
  valor_iptu: number
  motivo: string
}

// =====================================================
// ITBI - Imposto de Transmissão de Bens Imóveis
// =====================================================

export type TipoTransmissao =
  | 'COMPRA_VENDA'
  | 'DOACAO'
  | 'PERMUTA'
  | 'INTEGRALIZACAO_CAPITAL'
  | 'ARREMATACAO'
  | 'ADJUDICACAO'
  | 'USUCAPIAO'
  | 'OUTROS'

export type StatusGuia = 'EMITIDA' | 'PAGA' | 'CANCELADA' | 'VENCIDA'

export interface ITBICalculoRequest {
  imovel_id: string
  valor_declarado: number
  valor_financiado_sfh?: number
  tipo_transmissao: TipoTransmissao
}

export interface ITBICalculoResponse {
  valor_declarado: number
  valor_venal: number
  valor_base_calculo: number
  valor_financiado_sfh: number
  valor_nao_financiado: number
  aliquota_sfh: number
  aliquota_normal: number
  valor_itbi_sfh: number
  valor_itbi_normal: number
  valor_itbi_total: number
  valor_isencao: number
  valor_liquido: number
}

export interface ITBIGuiaCreate {
  imovel_id: string
  transmitente_id: string
  adquirente_id: string
  tipo_transmissao: TipoTransmissao
  valor_declarado: number
  valor_financiado_sfh?: number
}

export interface ITBIGuia {
  id: string
  numero_guia: string
  data_emissao: string
  imovel_id: string
  transmitente_id: string
  adquirente_id: string
  tipo_transmissao: TipoTransmissao
  valor_declarado: number
  valor_venal: number
  valor_base_calculo: number
  valor_financiado_sfh: number
  valor_nao_financiado: number
  aliquota_sfh: number
  aliquota_normal: number
  valor_itbi_sfh: number
  valor_itbi_normal: number
  valor_itbi_total: number
  valor_liquido: number
  data_vencimento: string
  pago: boolean
  data_pagamento?: string
  status: StatusGuia
  arbitrado?: boolean
  fiscal_arbitrador_id?: string
  motivo_arbitragem?: string
}

export interface ITBIArbitramentoRequest {
  valor_arbitrado: number
  motivo: string
}

// =====================================================
// ISSQN - Imposto Sobre Serviços
// =====================================================

export type RegimeTributacao =
  | 'FIXO'
  | 'ESTIMATIVA'
  | 'VARIAVEL'
  | 'SOCIEDADE_PROFISSIONAIS'

export type StatusDeclaracao =
  | 'DECLARADA'
  | 'PAGA'
  | 'RETIFICADA'
  | 'CANCELADA'

export interface ISSQNCalculoRequest {
  estabelecimento_id: string
  mes_competencia: number
  ano_competencia: number
  receita_bruta_total: number
  deducoes_materiais?: number
  outras_deducoes?: number
  valor_retido_terceiros?: number
}

export interface ISSQNCalculoResponse {
  receita_bruta_total: number
  deducoes_materiais: number
  outras_deducoes: number
  base_calculo: number
  aliquota: number
  valor_issqn: number
  valor_retido_terceiros: number
  valor_a_recolher: number
}

export interface ISSQNDeclaracaoCreate {
  estabelecimento_id: string
  mes_competencia: number
  ano_competencia: number
  regime_tributacao: RegimeTributacao
  receita_bruta_total?: number
  deducoes_materiais?: number
  outras_deducoes?: number
  valor_retido_terceiros?: number
  valor_fixo_ufm?: number
  quantidade_profissionais?: number
}

export interface ISSQNDeclaracao {
  id: string
  numero_declaracao: string
  data_declaracao: string
  estabelecimento_id: string
  mes_competencia: number
  ano_competencia: number
  regime_tributacao: RegimeTributacao
  receita_bruta_total: number
  deducoes_materiais: number
  outras_deducoes: number
  base_calculo: number
  aliquota: number
  valor_issqn: number
  valor_retido_terceiros: number
  valor_a_recolher: number
  data_vencimento: string
  pago: boolean
  data_pagamento?: string
  status: StatusDeclaracao
}

export interface ISSQNRetificacaoRequest {
  receita_bruta_total: number
  deducoes_materiais?: number
  outras_deducoes?: number
  valor_retido_terceiros?: number
  motivo: string
}

export interface ISSQNRetencaoCreate {
  tomador_id: string
  prestador_id: string
  mes_competencia: number
  ano_competencia: number
  valor_servico: number
  codigo_servico?: string
}

export interface ISSQNRetencao {
  id: string
  numero_retencao: string
  data_retencao: string
  tomador_id: string
  prestador_id: string
  mes_competencia: number
  ano_competencia: number
  valor_servico: number
  codigo_servico?: string
  aliquota: number
  valor_issqn_retido: number
  data_vencimento: string
  recolhido: boolean
  data_recolhimento?: string
}

// =====================================================
// ISENÇÕES
// =====================================================

export type TipoTributo = 'IPTU' | 'ITBI' | 'ISSQN'

export type TipoIsencao = 'TOTAL' | 'PARCIAL'

export type MotivoIsencao =
  | 'IDOSO'
  | 'DEFICIENTE'
  | 'BAIXA_RENDA'
  | 'FILANTROPIA'
  | 'UTILIDADE_PUBLICA'
  | 'IMUNIDADE_CONSTITUCIONAL'
  | 'OUTROS'

export interface IsencaoCreate {
  beneficiario_id: string
  tipo_tributo: TipoTributo
  tipo_isencao: TipoIsencao
  percentual_isencao: number
  fundamento_legal: string
  artigo_lei?: string
  motivo: MotivoIsencao
  descricao_motivo?: string
  data_inicio: string
  data_fim?: string
  imovel_id?: string
  estabelecimento_id?: string
  documentos_anexos?: any[]
}

export interface IsencaoUpdate {
  data_fim?: string
  ativa?: boolean
  motivo_cancelamento?: string
}

export interface Isencao {
  id: string
  numero_processo: string
  data_solicitacao: string
  beneficiario_id: string
  tipo_tributo: TipoTributo
  tipo_isencao: TipoIsencao
  percentual_isencao: number
  fundamento_legal: string
  artigo_lei?: string
  motivo: MotivoIsencao
  descricao_motivo?: string
  data_inicio: string
  data_fim?: string
  imovel_id?: string
  estabelecimento_id?: string
  data_aprovacao?: string
  ativa: boolean
  data_cancelamento?: string
  motivo_cancelamento?: string
}

// =====================================================
// ALÍQUOTAS
// =====================================================

export interface AliquotaCreate {
  tipo_tributo: TipoTributo
  categoria?: string
  valor_minimo?: number
  valor_maximo?: number
  aliquota: number
  ano_vigencia: number
  data_inicio_vigencia: string
  data_fim_vigencia?: string
  ativa?: boolean
  observacoes?: string
}

export interface Aliquota {
  id: number
  tipo_tributo: TipoTributo
  categoria?: string
  valor_minimo?: number
  valor_maximo?: number
  aliquota: number
  ano_vigencia: number
  data_inicio_vigencia: string
  data_fim_vigencia?: string
  ativa: boolean
  observacoes?: string
}

// =====================================================
// PGV - Planta Genérica de Valores
// =====================================================

export interface PlantaGenericaValorCreate {
  setor_fiscal_id: number
  ano_vigencia: number
  data_inicio_vigencia: string
  data_fim_vigencia?: string
  valor_m2_terreno: number
  ativa?: boolean
  observacoes?: string
}

export interface PlantaGenericaValor {
  id: number
  setor_fiscal_id: number
  ano_vigencia: number
  data_inicio_vigencia: string
  data_fim_vigencia?: string
  valor_m2_terreno: number
  ativa: boolean
  observacoes?: string
}

// =====================================================
// TPC - Tabela de Preço de Construção
// =====================================================

export type PadraoConstrutivo =
  | 'ALTO'
  | 'MEDIO_ALTO'
  | 'MEDIO'
  | 'MEDIO_BAIXO'
  | 'BAIXO'

export interface TabelaPrecoConstrucaoCreate {
  ano_vigencia: number
  mes_vigencia: number
  data_inicio_vigencia: string
  data_fim_vigencia?: string
  padrao_construtivo: PadraoConstrutivo
  valor_m2_edificacao: number
  cub_referencia?: number
  ativa?: boolean
  observacoes?: string
}

export interface TabelaPrecoConstrucao {
  id: number
  ano_vigencia: number
  mes_vigencia: number
  data_inicio_vigencia: string
  data_fim_vigencia?: string
  padrao_construtivo: PadraoConstrutivo
  valor_m2_edificacao: number
  cub_referencia?: number
  ativa: boolean
  observacoes?: string
}

// =====================================================
// PARCELAMENTOS
// =====================================================

export type StatusParcelamento = 'ATIVO' | 'QUITADO' | 'CANCELADO'

export interface ParcelamentoCreate {
  contribuinte_id: string
  debitos_ids: string[]
  numero_parcelas: number
  valor_entrada?: number
  dia_vencimento?: number
  observacoes?: string
}

export interface Parcelamento {
  id: string
  numero_parcelamento: string
  contribuinte_id: string
  valor_original: number
  valor_entrada: number
  valor_parcelado: number
  numero_parcelas: number
  valor_parcela: number
  data_primeira_parcela: string
  status: StatusParcelamento
  debitos_ids: string[]
  created_at: string
}

export interface ParcelamentoParcela {
  id: string
  parcelamento_id: string
  numero_parcela: number
  valor: number
  data_vencimento: string
  pago: boolean
  data_pagamento?: string
  valor_pago?: number
}

// =====================================================
// RELATÓRIOS
// =====================================================

export interface RelatorioArrecadacaoParams {
  data_inicio: string
  data_fim: string
  tipo_tributo?: TipoTributo
  formato?: 'json' | 'csv' | 'pdf'
}

export interface RelatorioArrecadacaoResponse {
  periodo: {
    data_inicio: string
    data_fim: string
  }
  totais: {
    iptu: number
    itbi: number
    issqn: number
    total_geral: number
  }
  por_mes: Array<{
    mes: string
    valor: number
  }>
  por_status: {
    pago: number
    pendente: number
  }
}

export interface RelatorioInadimplenciaParams {
  data_referencia?: string
  tipo_tributo?: TipoTributo
  aging_buckets?: boolean
}

export interface RelatorioInadimplenciaResponse {
  data_referencia: string
  total_inadimplentes: number
  valor_total: number
  por_tributo: {
    iptu: number
    itbi: number
    issqn: number
  }
  aging_buckets?: {
    '0-30': { quantidade: number; valor: number }
    '31-60': { quantidade: number; valor: number }
    '61-90': { quantidade: number; valor: number }
    '90+': { quantidade: number; valor: number }
  }
  top_devedores: Array<{
    contribuinte_id: string
    nome: string
    valor_total: number
    quantidade_debitos: number
  }>
}
