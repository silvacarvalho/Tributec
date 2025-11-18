import api from './api'
import type { Imovel, ImovelCreate, ImovelUpdate, TipoImovel, SetorFiscal } from '@/types/cadastro'

export interface ListImoveisParams {
  pagina?: number
  limite?: number
  tipo_imovel_id?: string
  setor_fiscal_id?: string
  proprietario_id?: string
  ativo?: boolean
  busca?: string
}

export interface ListImoveisResponse {
  itens: Imovel[]
  total: number
  pagina: number
  limite: number
  total_paginas: number
}

export const imovelService = {
  async listar(params?: ListImoveisParams): Promise<ListImoveisResponse> {
    const response = await api.get('/cadastro/imoveis', { params })
    return response.data
  },

  async obter(id: string): Promise<Imovel> {
    const response = await api.get(`/cadastro/imoveis/${id}`)
    return response.data
  },

  async criar(data: ImovelCreate): Promise<Imovel> {
    const response = await api.post('/cadastro/imoveis', data)
    return response.data
  },

  async atualizar(id: string, data: ImovelUpdate): Promise<Imovel> {
    const response = await api.put(`/cadastro/imoveis/${id}`, data)
    return response.data
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/cadastro/imoveis/${id}`)
  },

  async buscarPorInscricao(inscricao: string): Promise<Imovel | null> {
    const response = await api.get(`/cadastro/imoveis/inscricao/${inscricao}`)
    return response.data
  },

  async listarTiposImovel(): Promise<TipoImovel[]> {
    const response = await api.get('/cadastro/tipos-imovel')
    return response.data
  },

  async listarSetoresFiscais(): Promise<SetorFiscal[]> {
    const response = await api.get('/cadastro/setores-fiscais')
    return response.data
  },
}
