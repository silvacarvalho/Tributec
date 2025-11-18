/**
 * Serviço para Domicílio Tributário Digital (DTD)
 */
import api from './api'
import type { ListResponse } from '@/types'
import type {
  DomicilioTributarioDigital,
  DomicilioTributarioDigitalCreate,
  DomicilioTributarioDigitalUpdate,
  DTDListParams,
  DTDMensagem,
  DTDMensagemCreate,
  DTDMensagemCreateByContribuinte,
  DTDMensagemListParams,
  DTDEstatisticas,
  DTDEnvioLoteRequest,
  DTDEnvioLoteResponse,
} from '@/types/dtd'

export const dtdService = {
  // ==================== DTD - CRUD ====================

  /**
   * Cria um novo DTD
   */
  async criarDTD(dados: DomicilioTributarioDigitalCreate): Promise<DomicilioTributarioDigital> {
    const { data } = await api.post<DomicilioTributarioDigital>('/dtd', dados)
    return data
  },

  /**
   * Obtém um DTD por ID
   */
  async obterDTD(id: string): Promise<DomicilioTributarioDigital> {
    const { data } = await api.get<DomicilioTributarioDigital>(`/dtd/${id}`)
    return data
  },

  /**
   * Obtém o DTD de um contribuinte
   */
  async obterDTDPorContribuinte(contribuinteId: string): Promise<DomicilioTributarioDigital> {
    const { data } = await api.get<DomicilioTributarioDigital>(`/dtd/contribuinte/${contribuinteId}`)
    return data
  },

  /**
   * Lista DTDs com paginação e filtros
   */
  async listarDTDs(params?: DTDListParams): Promise<ListResponse<DomicilioTributarioDigital>> {
    const { data } = await api.get<ListResponse<DomicilioTributarioDigital>>('/dtd', {
      params: {
        skip: params?.pagina ? (params.pagina - 1) * (params.limite || 20) : 0,
        limit: params?.limite || 20,
        busca: params?.busca,
        ativo: params?.ativo,
      },
    })
    return data
  },

  /**
   * Atualiza um DTD
   */
  async atualizarDTD(id: string, dados: DomicilioTributarioDigitalUpdate): Promise<DomicilioTributarioDigital> {
    const { data } = await api.put<DomicilioTributarioDigital>(`/dtd/${id}`, dados)
    return data
  },

  /**
   * Exclui um DTD
   */
  async excluirDTD(id: string): Promise<void> {
    await api.delete(`/dtd/${id}`)
  },

  // ==================== DTD Mensagens ====================

  /**
   * Cria uma nova mensagem no DTD
   */
  async criarMensagem(dados: DTDMensagemCreate): Promise<DTDMensagem> {
    const { data } = await api.post<DTDMensagem>('/dtd/mensagens', dados)
    return data
  },

  /**
   * Cria mensagem usando ID do contribuinte
   */
  async criarMensagemPorContribuinte(dados: DTDMensagemCreateByContribuinte): Promise<DTDMensagem> {
    const { data } = await api.post<DTDMensagem>('/dtd/mensagens/por-contribuinte', dados)
    return data
  },

  /**
   * Lista mensagens de um DTD
   */
  async listarMensagens(
    domicilioId: string,
    params?: DTDMensagemListParams
  ): Promise<ListResponse<DTDMensagem>> {
    const { data } = await api.get<ListResponse<DTDMensagem>>(`/dtd/mensagens/domicilio/${domicilioId}`, {
      params: {
        skip: params?.pagina ? (params.pagina - 1) * (params.limite || 20) : 0,
        limit: params?.limite || 20,
        tipo_mensagem: params?.tipo_mensagem,
        lida: params?.lida,
      },
    })
    return data
  },

  /**
   * Obtém uma mensagem por ID
   */
  async obterMensagem(id: string): Promise<DTDMensagem> {
    const { data } = await api.get<DTDMensagem>(`/dtd/mensagens/${id}`)
    return data
  },

  /**
   * Marca uma mensagem como lida
   */
  async marcarComoLida(id: string): Promise<DTDMensagem> {
    const { data } = await api.patch<DTDMensagem>(`/dtd/mensagens/${id}/marcar-lida`)
    return data
  },

  /**
   * Obtém estatísticas de um DTD
   */
  async obterEstatisticas(domicilioId: string): Promise<DTDEstatisticas> {
    const { data } = await api.get<DTDEstatisticas>(`/dtd/estatisticas/${domicilioId}`)
    return data
  },

  /**
   * Envia mensagem para múltiplos contribuintes
   */
  async enviarMensagemLote(dados: DTDEnvioLoteRequest): Promise<DTDEnvioLoteResponse> {
    const { data } = await api.post<DTDEnvioLoteResponse>('/dtd/mensagens/enviar-lote', dados)
    return data
  },
}
