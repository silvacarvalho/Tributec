/**
 * Types para Domicílio Tributário Digital (DTD)
 */

// ==================== DTD - Domicílio Tributário Digital ====================

export interface DomicilioTributarioDigital {
  id: string
  contribuinte_id: string
  email_principal: string
  emails_alternativos?: string[]
  notificar_lancamentos: boolean
  notificar_vencimentos: boolean
  notificar_protestos: boolean
  notificar_avisos: boolean
  ativo: boolean
  data_ativacao?: string
  data_desativacao?: string
  created_at: string
  updated_at?: string
  // Informações do contribuinte
  contribuinte_nome?: string
  contribuinte_cpf?: string
  contribuinte_cnpj?: string
}

export interface DomicilioTributarioDigitalCreate {
  contribuinte_id: string
  email_principal: string
  emails_alternativos?: string[]
  notificar_lancamentos?: boolean
  notificar_vencimentos?: boolean
  notificar_protestos?: boolean
  notificar_avisos?: boolean
}

export interface DomicilioTributarioDigitalUpdate {
  email_principal?: string
  emails_alternativos?: string[]
  notificar_lancamentos?: boolean
  notificar_vencimentos?: boolean
  notificar_protestos?: boolean
  notificar_avisos?: boolean
  ativo?: boolean
}

// ==================== DTD Mensagem ====================

export type TipoMensagemDTD =
  | 'NOTIFICACAO'
  | 'ALERTA'
  | 'LANCAMENTO'
  | 'VENCIMENTO'
  | 'COBRANCA'
  | 'PROTESTO'

export type PrioridadeMensagemDTD = 'ALTA' | 'NORMAL' | 'BAIXA'

export interface DTDMensagem {
  id: string
  domicilio_id: string
  data_envio: string
  assunto: string
  conteudo: string
  tipo_mensagem: TipoMensagemDTD
  prioridade: PrioridadeMensagemDTD
  anexos?: Array<{
    nome: string
    url: string
    tipo?: string
  }>
  lida: boolean
  data_leitura?: string
  created_at: string
}

export interface DTDMensagemCreate {
  domicilio_id: string
  assunto: string
  conteudo: string
  tipo_mensagem: TipoMensagemDTD
  prioridade?: PrioridadeMensagemDTD
  anexos?: Array<{
    nome: string
    url: string
    tipo?: string
  }>
}

export interface DTDMensagemCreateByContribuinte {
  contribuinte_id: string
  assunto: string
  conteudo: string
  tipo_mensagem: TipoMensagemDTD
  prioridade?: PrioridadeMensagemDTD
  anexos?: Array<{
    nome: string
    url: string
    tipo?: string
  }>
}

// ==================== Estatísticas ====================

export interface DTDEstatisticas {
  total_mensagens: number
  mensagens_nao_lidas: number
  mensagens_por_tipo: Record<TipoMensagemDTD, number>
  mensagens_por_prioridade: Record<PrioridadeMensagemDTD, number>
  ultima_mensagem?: string
}

// ==================== Envio em Lote ====================

export interface DTDEnvioLoteRequest {
  contribuintes_ids: string[]
  assunto: string
  conteudo: string
  tipo_mensagem: TipoMensagemDTD
  prioridade?: PrioridadeMensagemDTD
  anexos?: Array<{
    nome: string
    url: string
    tipo?: string
  }>
}

export interface DTDEnvioLoteResponse {
  total_enviados: number
  total_erros: number
  mensagens_enviadas: string[]
  erros: Array<{
    contribuinte_id: string
    erro: string
  }>
}

// ==================== Parâmetros de Listagem ====================

export interface DTDListParams {
  pagina?: number
  limite?: number
  busca?: string
  ativo?: boolean
}

export interface DTDMensagemListParams {
  pagina?: number
  limite?: number
  tipo_mensagem?: TipoMensagemDTD
  lida?: boolean
}
