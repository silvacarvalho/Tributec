import api from './api'
import type {
  IPTUCalculoRequest,
  IPTUCalculoResponse,
  ITBICalculoRequest,
  ITBICalculoResponse,
  ISSQNCalculoRequest,
  ISSQNCalculoResponse,
  Aliquota,
} from '@/types/tributario'

export const tributarioService = {
  // IPTU
  async calcularIPTU(data: IPTUCalculoRequest): Promise<IPTUCalculoResponse> {
    const response = await api.post('/tributario/iptu/calcular', data)
    return response.data
  },

  async listarAliquotasIPTU(ano?: number): Promise<Aliquota[]> {
    const response = await api.get('/tributario/aliquotas/iptu', {
      params: { ano },
    })
    return response.data
  },

  // ITBI
  async calcularITBI(data: ITBICalculoRequest): Promise<ITBICalculoResponse> {
    const response = await api.post('/tributario/itbi/calcular', data)
    return response.data
  },

  async listarAliquotasITBI(ano?: number): Promise<Aliquota[]> {
    const response = await api.get('/tributario/aliquotas/itbi', {
      params: { ano },
    })
    return response.data
  },

  // ISSQN
  async calcularISSQN(data: ISSQNCalculoRequest): Promise<ISSQNCalculoResponse> {
    const response = await api.post('/tributario/issqn/calcular', data)
    return response.data
  },

  async listarAliquotasISSQN(ano?: number): Promise<Aliquota[]> {
    const response = await api.get('/tributario/aliquotas/issqn', {
      params: { ano },
    })
    return response.data
  },

  async buscarServicoPorCodigo(codigo: string): Promise<{ codigo: string; descricao: string }> {
    const response = await api.get(`/tributario/issqn/servicos/${codigo}`)
    return response.data
  },
}
