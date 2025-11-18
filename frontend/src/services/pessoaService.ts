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
    const response = await api.get('/cadastro/pessoas', { params })
    return response.data
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
