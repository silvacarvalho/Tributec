import api from './api'
import type {
  CatalogoInfracao,
  CatalogoInfracaoCreate,
  CatalogoInfracaoUpdate,
  ListaCatalogoResponse,
  AutoInfracao,
  AutoInfracaoCreate,
  NotificacaoAutoCreate,
  DefesaAutoCreate,
  PagamentoAutoCreate,
  ListaAutosResponse,
  AutoInfracaoFiltros,
  EstatisticasAutosPorStatus,
  EstatisticasValoresAutos,
  InfracaoMaisAplicada
} from '../types/fiscal'

export const fiscalService = {
  // ==================== CATÁLOGO DE INFRAÇÕES ====================

  listarCatalogoInfracoes: async (params?: {
    ativo?: boolean
    gravidade?: string
  }): Promise<ListaCatalogoResponse> => {
    const response = await api.get('/fiscal/catalogo-infracoes', { params })
    return response.data
  },

  obterInfracaoPorCodigo: async (codigo: string): Promise<CatalogoInfracao> => {
    const response = await api.get(`/fiscal/catalogo-infracoes/codigo/${codigo}`)
    return response.data
  },

  criarCatalogoInfracao: async (dados: CatalogoInfracaoCreate): Promise<CatalogoInfracao> => {
    const response = await api.post('/fiscal/catalogo-infracoes', dados)
    return response.data
  },

  atualizarCatalogoInfracao: async (
    id: number,
    dados: CatalogoInfracaoUpdate
  ): Promise<CatalogoInfracao> => {
    const response = await api.put(`/fiscal/catalogo-infracoes/${id}`, dados)
    return response.data
  },

  // ==================== AUTOS DE INFRAÇÃO ====================

  listarAutos: async (filtros?: AutoInfracaoFiltros): Promise<ListaAutosResponse> => {
    const response = await api.get('/fiscal/autos-infracao', { params: filtros })
    return response.data
  },

  obterAutoPorId: async (id: string): Promise<AutoInfracao> => {
    const response = await api.get(`/fiscal/autos-infracao/${id}`)
    return response.data
  },

  obterAutoPorNumero: async (numero: string): Promise<AutoInfracao> => {
    const response = await api.get(`/fiscal/autos-infracao/numero/${numero}`)
    return response.data
  },

  lavrarAuto: async (dados: AutoInfracaoCreate): Promise<AutoInfracao> => {
    const response = await api.post('/fiscal/autos-infracao', dados)
    return response.data
  },

  notificarAuto: async (
    autoId: string,
    dados: NotificacaoAutoCreate
  ): Promise<AutoInfracao> => {
    const response = await api.post(`/fiscal/autos-infracao/${autoId}/notificar`, dados)
    return response.data
  },

  registrarDefesa: async (
    autoId: string,
    dados: DefesaAutoCreate
  ): Promise<AutoInfracao> => {
    const response = await api.post(`/fiscal/autos-infracao/${autoId}/defesa`, dados)
    return response.data
  },

  julgarDefesa: async (
    autoId: string,
    dados: {
      decisao_defesa: string
      data_decisao_defesa: string
      motivo_decisao: string
    }
  ): Promise<AutoInfracao> => {
    const response = await api.post(`/fiscal/autos-infracao/${autoId}/julgar-defesa`, dados)
    return response.data
  },

  registrarPagamento: async (
    autoId: string,
    dados: PagamentoAutoCreate
  ): Promise<AutoInfracao> => {
    const response = await api.post(`/fiscal/autos-infracao/${autoId}/pagamento`, dados)
    return response.data
  },

  cancelarAuto: async (
    autoId: string,
    dados: { motivo_cancelamento: string }
  ): Promise<AutoInfracao> => {
    const response = await api.post(`/fiscal/autos-infracao/${autoId}/cancelar`, dados)
    return response.data
  },

  atualizarAuto: async (
    autoId: string,
    dados: { status?: string; observacoes?: string }
  ): Promise<AutoInfracao> => {
    const response = await api.put(`/fiscal/autos-infracao/${autoId}`, dados)
    return response.data
  },

  // ==================== RELATÓRIOS E ESTATÍSTICAS ====================

  obterEstatisticasPorStatus: async (params?: {
    data_inicio?: string
    data_fim?: string
  }): Promise<EstatisticasAutosPorStatus> => {
    const response = await api.get('/fiscal/autos-infracao/estatisticas/por-status', {
      params
    })
    return response.data
  },

  obterEstatisticasValores: async (params?: {
    data_inicio?: string
    data_fim?: string
  }): Promise<EstatisticasValoresAutos> => {
    const response = await api.get('/fiscal/autos-infracao/estatisticas/valores', {
      params
    })
    return response.data
  },

  obterInfracoesMaisAplicadas: async (params?: {
    limite?: number
    data_inicio?: string
    data_fim?: string
  }): Promise<InfracaoMaisAplicada[]> => {
    const response = await api.get('/fiscal/catalogo-infracoes/mais-aplicadas', {
      params
    })
    return response.data
  },
}
