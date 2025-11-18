// Exportações centralizadas de todos os tipos

export * from './auth'
export * from './cadastro'
export * from './tributario'

// Tipos comuns/compartilhados

export interface PaginationParams {
  pagina?: number
  limite?: number
  busca?: string
  ordenar_por?: string
  ordem?: 'asc' | 'desc'
}

export interface PaginationMeta {
  total: number
  pagina: number
  limite: number
  total_paginas: number
  tem_proxima: boolean
  tem_anterior: boolean
}

export interface ListResponse<T> {
  itens: T[]
  total: number
  pagina: number
  limite: number
  total_paginas: number
  tem_proxima: boolean
  tem_anterior: boolean
}

export interface ApiResponse<T = any> {
  sucesso: boolean
  mensagem?: string
  dados?: T
  erros?: string[]
}

export interface ApiError {
  detail: string | { loc: string[]; msg: string; type: string }[]
  message?: string
}

export type Status = 'ATIVO' | 'INATIVO' | 'PENDENTE' | 'APROVADO' | 'CANCELADO'

export type TipoDocumento = 'CPF' | 'CNPJ' | 'RG' | 'IE'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}
