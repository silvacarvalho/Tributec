/**
 * Types do Módulo Fiscal
 */

// =====================================================
// PARÂMETROS DO SISTEMA
// =====================================================

export interface ParametroSistema {
  id: number
  modulo: string
  categoria: string | null
  chave: string
  nome_exibicao: string
  descricao: string
  texto_ajuda: string | null
  tipo_valor: 'STRING' | 'INTEGER' | 'DECIMAL' | 'BOOLEAN' | 'DATE' | 'JSON' | 'PERCENT'
  valor_string: string | null
  valor_inteiro: number | null
  valor_decimal: number | null
  valor_booleano: boolean | null
  valor_data: string | null
  valor_json: any | null
  validacoes: Record<string, any> | null
  ano_vigencia: number | null
  data_inicio_vigencia: string | null
  data_fim_vigencia: string | null
  obrigatorio: boolean
  editavel: boolean
  ordem_exibicao: number
  base_legal: string | null
  observacoes: string | null
  criado_em: string
  atualizado_em: string | null
}

export interface ParametroSistemaCreate {
  modulo: string
  categoria?: string | null
  chave: string
  nome_exibicao: string
  descricao: string
  texto_ajuda?: string | null
  tipo_valor: string
  valor_string?: string | null
  valor_inteiro?: number | null
  valor_decimal?: number | null
  valor_booleano?: boolean | null
  valor_data?: string | null
  valor_json?: any | null
  validacoes?: Record<string, any> | null
  ano_vigencia?: number | null
  data_inicio_vigencia?: string | null
  data_fim_vigencia?: string | null
  obrigatorio?: boolean
  editavel?: boolean
  ordem_exibicao?: number
  base_legal?: string | null
  observacoes?: string | null
}

export interface ParametroSistemaUpdate {
  valor_string?: string | null
  valor_inteiro?: number | null
  valor_decimal?: number | null
  valor_booleano?: boolean | null
  valor_data?: string | null
  valor_json?: any | null
  observacoes?: string | null
}

// =====================================================
// CATÁLOGO DE INFRAÇÕES
// =====================================================

export type TipoMulta = 'PERCENTUAL' | 'FIXA_UFM' | 'MISTA'
export type GravidadeInfracao = 'LEVE' | 'MEDIA' | 'GRAVE' | 'GRAVISSIMA'

export interface CatalogoInfracao {
  id: number
  codigo: string
  descricao: string
  artigo_lei: string | null
  base_legal: string | null
  tipo_multa: TipoMulta
  valor_multa_ufm: number | null
  percentual_multa: number | null
  valor_minimo_ufm: number | null
  valor_maximo_ufm: number | null
  gravidade: GravidadeInfracao
  permite_reincidencia: boolean
  data_inicio_vigencia: string
  data_fim_vigencia: string | null
  ativo: boolean
  observacoes: string | null
  criado_em: string
  atualizado_em: string | null
}

export interface CatalogoInfracaoCreate {
  codigo: string
  descricao: string
  artigo_lei?: string | null
  base_legal?: string | null
  tipo_multa: TipoMulta
  valor_multa_ufm?: number | null
  percentual_multa?: number | null
  valor_minimo_ufm?: number | null
  valor_maximo_ufm?: number | null
  gravidade: GravidadeInfracao
  permite_reincidencia?: boolean
  data_inicio_vigencia: string
  data_fim_vigencia?: string | null
  ativo?: boolean
  observacoes?: string | null
}

export interface CatalogoInfracaoUpdate {
  descricao?: string
  artigo_lei?: string | null
  base_legal?: string | null
  tipo_multa?: TipoMulta
  valor_multa_ufm?: number | null
  percentual_multa?: number | null
  valor_minimo_ufm?: number | null
  valor_maximo_ufm?: number | null
  gravidade?: GravidadeInfracao
  permite_reincidencia?: boolean
  data_fim_vigencia?: string | null
  ativo?: boolean
  observacoes?: string | null
}

// =====================================================
// AUTO DE INFRAÇÃO
// =====================================================

export type StatusAutoInfracao =
  | 'LAVRADO'
  | 'NOTIFICADO'
  | 'PAGO'
  | 'EM_DEFESA'
  | 'EM_RECURSO'
  | 'DEFERIDO'
  | 'INDEFERIDO'
  | 'CANCELADO'
  | 'INSCRITO_DIVIDA'

export type FormaNotificacao = 'PESSOAL' | 'CORREIOS' | 'EDITAL' | 'EMAIL' | 'DTD'

export interface AutoInfracao {
  id: string
  ordem_fiscalizacao_id: number | null
  numero_auto: string
  data_lavratura: string
  codigo_infracao: string
  descricao_infracao: string
  artigo_lei: string
  local_infracao: string | null
  autuado_id: string
  autuado_nome: string
  autuado_cpf_cnpj: string
  fiscal_autuante_id: string
  fiscal_nome: string
  fiscal_matricula: string
  tipo_multa: TipoMulta
  valor_base_calculo: number | null
  valor_multa_ufm: number
  ufm_valor_referencia: number
  valor_multa: number
  reincidente: boolean
  quantidade_reincidencias: number
  acrescimo_reincidencia: number
  valor_total: number
  status: StatusAutoInfracao
  data_notificacao: string | null
  forma_notificacao: FormaNotificacao | null
  data_limite_defesa: string | null
  data_defesa: string | null
  argumentacao_defesa?: string | null
  data_decisao_defesa: string | null
  decisao_defesa: string | null
  motivo_decisao: string | null
  data_pagamento: string | null
  valor_pago: number | null
  data_inscricao_divida: string | null
  numero_divida_ativa: string | null
  cancelado: boolean
  data_cancelamento: string | null
  motivo_cancelamento: string | null
  observacoes: string | null
  criado_em: string
  atualizado_em: string | null
}

export interface AutoInfracaoCreate {
  ordem_fiscalizacao_id?: number | null
  numero_auto?: string
  data_lavratura?: string
  codigo_infracao: string
  local_infracao?: string | null
  autuado_id: string
  fiscal_autuante_id: string
  valor_base_calculo?: number | null
  observacoes?: string | null
}

export interface NotificacaoAutoCreate {
  auto_infracao_id: string
  forma_notificacao: FormaNotificacao
  data_notificacao?: string
  observacoes?: string | null
}

export interface DefesaAutoCreate {
  auto_infracao_id: string
  data_defesa?: string
  argumentacao: string
  documentos_anexos?: any[]
}

export interface PagamentoAutoCreate {
  auto_infracao_id: string
  data_pagamento?: string
  valor_pago: number
  forma_pagamento: string
  comprovante?: string | null
}

// =====================================================
// FILTROS E LISTAGENS
// =====================================================

export interface AutoInfracaoFiltros {
  status?: StatusAutoInfracao
  autuado_id?: string
  fiscal_id?: string
  data_inicio?: string
  data_fim?: string
  codigo_infracao?: string
  numero_auto?: string
}

export interface ListaParametrosResponse {
  total: number
  items: ParametroSistema[]
}

export interface ListaCatalogoResponse {
  total: number
  items: CatalogoInfracao[]
}

export interface ListaAutosResponse {
  total: number
  items: AutoInfracao[]
}

// =====================================================
// ESTATÍSTICAS
// =====================================================

export interface EstatisticasAutosPorStatus {
  [status: string]: number
}

export interface EstatisticasValoresAutos {
  total_lavrado: number
  total_pago: number
  total_cancelado: number
  total_pendente: number
}

export interface InfracaoMaisAplicada {
  codigo: string
  descricao: string
  quantidade: number
}
