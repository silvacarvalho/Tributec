import api from './api'
import type { Pessoa, PessoaCreate, PessoaUpdate } from '@/types/cadastro'

export interface ListPessoasParams {
  pagina?: number
  limite?: number
  tipo_pessoa?: 'F' | 'J'
  ativo?: boolean
  busca?: string
}

export interface ListPessoasResponse {
  itens: Pessoa[]
  total: number
  pagina: number
  limite: number
  total_paginas: number
}

export const pessoaService = {
  async listar(params?: ListPessoasParams): Promise<ListPessoasResponse> {
    // Convert pagina/limite to skip/limit for backend
    const skip = params?.pagina ? (params.pagina - 1) * (params.limite || 20) : 0
    const limit = params?.limite || 20

    const backendParams = {
      skip,
      limit,
      tipo_pessoa: params?.tipo_pessoa,
      situacao: params?.ativo !== undefined ? (params.ativo ? 'ATIVO' : 'INATIVO') : undefined,
    }

    const response = await api.get('/cadastro/pessoas', { params: backendParams })

    // Transform backend response to frontend format
    return {
      itens: response.data.dados,
      total: response.data.paginacao.total_itens,
      pagina: response.data.paginacao.pagina_atual,
      limite: response.data.paginacao.itens_por_pagina,
      total_paginas: response.data.paginacao.total_paginas,
    }
  },

  async obter(id: string): Promise<Pessoa> {
    const response = await api.get(`/cadastro/pessoas/${id}`)
    return response.data
  },

  async criar(data: PessoaCreate): Promise<Pessoa> {
    const response = await api.post('/cadastro/pessoas', data)
    return response.data
  },

  async atualizar(id: string, data: PessoaUpdate): Promise<Pessoa> {
    const response = await api.put(`/cadastro/pessoas/${id}`, data)
    return response.data
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/cadastro/pessoas/${id}`)
  },

  async buscarPorDocumento(documento: string): Promise<Pessoa | null> {
    const response = await api.get(`/cadastro/pessoas/documento/${documento}`)
    return response.data
  },
}
