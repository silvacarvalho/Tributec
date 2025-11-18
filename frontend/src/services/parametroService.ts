import api from './api'
import type {
  ParametroSistema,
  ParametroSistemaCreate,
  ParametroSistemaUpdate,
  ListaParametrosResponse
} from '../types/fiscal'

export const parametroService = {
  // ==================== CRUD ====================

  listarTodos: async (params?: {
    modulo?: string
    categoria?: string
    ano?: number
  }): Promise<ListaParametrosResponse> => {
    const response = await api.get('/parametros', { params })
    return response.data
  },

  listarPorModulo: async (
    modulo: string,
    categoria?: string,
    ano?: number
  ): Promise<ListaParametrosResponse> => {
    const response = await api.get(`/parametros/modulo/${modulo}`, {
      params: { categoria, ano }
    })
    return response.data
  },

  obterPorId: async (id: number): Promise<ParametroSistema> => {
    const response = await api.get(`/parametros/${id}`)
    return response.data
  },

  obterPorChave: async (chave: string, ano?: number): Promise<ParametroSistema> => {
    const response = await api.get(`/parametros/chave/${chave}`, {
      params: { ano }
    })
    return response.data
  },

  criar: async (dados: ParametroSistemaCreate): Promise<ParametroSistema> => {
    const response = await api.post('/parametros', dados)
    return response.data
  },

  atualizar: async (id: number, dados: ParametroSistemaUpdate): Promise<ParametroSistema> => {
    const response = await api.put(`/parametros/${id}`, dados)
    return response.data
  },

  // ==================== ATALHOS ====================

  obterUfmAtual: async (ano?: number): Promise<{ ano: number; valor_ufm: number }> => {
    const response = await api.get('/parametros/fiscal/ufm-atual', { params: { ano } })
    return response.data
  },

  obterPrazosFiscais: async (): Promise<{
    prazo_defesa_dias: number
    prazo_recurso_dias: number
  }> => {
    const response = await api.get('/parametros/fiscal/prazos')
    return response.data
  },

  obterDescontosIptu: async (): Promise<{
    desconto_cota_unica_pct: number
    vencimento_cota_unica_dia: number
  }> => {
    const response = await api.get('/parametros/tributario/iptu/descontos')
    return response.data
  },

  obterConfiguracoesItbi: async (): Promise<{
    aliquota_padrao: number
    valor_minimo_ufm: number
  }> => {
    const response = await api.get('/parametros/tributario/itbi/configuracoes')
    return response.data
  },
}
