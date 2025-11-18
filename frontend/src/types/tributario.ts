// Types for Tributário module

export interface IPTUCalculoRequest {
  imovel_id: string
  ano_exercicio: number
  aplicar_descontos: boolean
}

export interface Parcela {
  numero: number
  valor: number
  vencimento: string
}

export interface IPTUCalculoResponse {
  imovel_id: string
  inscricao_imobiliaria: string
  ano_exercicio: number
  valor_venal_terreno: number
  valor_venal_edificacao: number
  valor_venal_total: number
  aliquota: number
  valor_iptu_sem_desconto: number
  desconto_pagamento_unico: number
  desconto_aplicado: number
  valor_iptu_com_desconto: number
  valor_total: number
  parcelas: Parcela[]
  observacoes?: string
}

export interface ITBICalculoRequest {
  imovel_id: string
  valor_transacao: number
  tipo_transacao: 'compra_venda' | 'doacao' | 'permuta' | 'outro'
  comprador_id?: string
  vendedor_id?: string
}

export interface ITBICalculoResponse {
  imovel_id: string
  inscricao_imobiliaria: string
  valor_transacao: number
  valor_venal: number
  base_calculo: number
  aliquota: number
  valor_itbi: number
  observacoes?: string
}

export interface ISSQNCalculoRequest {
  estabelecimento_id: string
  mes_referencia: string
  valor_servicos: number
  codigo_servico: string
  descricao_servicos?: string
  municipio_prestacao?: string
}

export interface ISSQNCalculoResponse {
  estabelecimento_id: string
  inscricao_municipal: string
  mes_referencia: string
  valor_servicos: number
  codigo_servico: string
  descricao_servico: string
  aliquota: number
  valor_issqn: number
  municipio_prestacao: string
  observacoes?: string
}

export interface Aliquota {
  id: string
  tributo: 'IPTU' | 'ITBI' | 'ISSQN'
  codigo?: string
  descricao: string
  percentual: number
  ano_vigencia: number
  ativo: boolean
}
