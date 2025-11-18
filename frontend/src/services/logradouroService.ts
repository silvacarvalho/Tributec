import api from './api'
import type {
  Logradouro,
  LogradouroCreate,
  LogradouroUpdate,
  ListResponse,
  PaginationParams,
} from '@/types'

interface LogradouroListParams extends PaginationParams {
  tipo_logradouro?: string
  bairro?: string
  setor_fiscal?: number
  ativo?: boolean
}

export const logradouroService = {
  /**
   * Lista logradouros com paginação e filtros
   */
  async listar(params?: LogradouroListParams): Promise<ListResponse<Logradouro>> {
    const { data } = await api.get<ListResponse<Logradouro>>('/cadastro/logradouros', {
      params: {
        skip: params?.pagina ? (params.pagina - 1) * (params.limite || 20) : 0,
        limit: params?.limite || 20,
        ...params,
      },
    })
    return data
  },

  /**
   * Cria novo logradouro
   */
  async criar(dados: LogradouroCreate): Promise<Logradouro> {
    const { data } = await api.post<Logradouro>('/cadastro/logradouros', dados)
    return data
  },

  /**
   * Obtém logradouro por ID
   */
  async obterPorId(id: number): Promise<Logradouro> {
    const { data } = await api.get<Logradouro>(`/cadastro/logradouros/${id}`)
    return data
  },

  /**
   * Atualiza logradouro
   */
  async atualizar(id: number, dados: LogradouroUpdate): Promise<Logradouro> {
    const { data } = await api.put<Logradouro>(`/cadastro/logradouros/${id}`, dados)
    return data
  },

  /**
   * Remove logradouro (soft delete)
   */
  async excluir(id: number): Promise<void> {
    await api.delete(`/cadastro/logradouros/${id}`)
  },
}
