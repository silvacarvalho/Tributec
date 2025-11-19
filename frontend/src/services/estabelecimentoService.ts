import api from './api'
import type {
  Estabelecimento,
  EstabelecimentoCreate,
  EstabelecimentoUpdate,
  ListResponse,
  PaginationParams,
} from '@/types'

interface EstabelecimentoListParams extends PaginationParams {
  proprietario_id?: string
  cnae?: string
  ativo?: boolean
}

export const estabelecimentoService = {
  /**
   * Lista estabelecimentos com paginação e filtros
   */
  async listar(
    params?: EstabelecimentoListParams
  ): Promise<ListResponse<Estabelecimento>> {
    const { data } = await api.get<ListResponse<Estabelecimento>>(
      '/cadastro/estabelecimentos',
      {
        params: {
          skip: params?.pagina ? (params.pagina - 1) * (params.limite || 20) : 0,
          limit: params?.limite || 20,
          ...params,
        },
      }
    )
    return data
  },

  /**
   * Cria novo estabelecimento
   */
  async criar(dados: EstabelecimentoCreate): Promise<Estabelecimento> {
    const { data } = await api.post<Estabelecimento>('/cadastro/estabelecimentos', dados)
    return data
  },

  /**
   * Obtém estabelecimento por ID
   */
  async obterPorId(id: string): Promise<Estabelecimento> {
    const { data } = await api.get<Estabelecimento>(`/cadastro/estabelecimentos/${id}`)
    return data
  },

  /**
   * Obtém estabelecimento por CCM (Inscrição Municipal)
   */
  async obterPorCcm(ccm: string): Promise<Estabelecimento> {
    const { data } = await api.get<Estabelecimento>(`/cadastro/estabelecimentos/ccm/${ccm}`)
    return data
  },

  /**
   * Atualiza estabelecimento
   */
  async atualizar(
    id: string,
    dados: EstabelecimentoUpdate
  ): Promise<Estabelecimento> {
    const { data } = await api.put<Estabelecimento>(
      `/cadastro/estabelecimentos/${id}`,
      dados
    )
    return data
  },

  /**
   * Remove estabelecimento (soft delete)
   */
  async excluir(id: string): Promise<void> {
    await api.delete(`/cadastro/estabelecimentos/${id}`)
  },
}
