/**
 * Serviço para o Portal do Contribuinte
 */
import api from './api'

export interface DashboardContribuinte {
  contribuinte: {
    id: string
    nome: string
    cpf?: string
    cnpj?: string
    email?: string
  }
  resumo: {
    total_imoveis: number
    total_estabelecimentos: number
    total_debitos: number
    valor_total_debitos: number
    parcelamentos_ativos: number
    mensagens_nao_lidas: number
  }
  proximos_vencimentos: Array<{
    id: string
    descricao: string
    valor: number
    data_vencimento: string
    tipo: string
  }>
  tem_dtd: boolean
  dtd_id?: string
}

export interface Debito {
  id: string
  tipo: string
  descricao: string
  referencia: string
  valor_original: number
  valor_atualizado: number
  data_vencimento: string
  situacao: string
  dias_vencido: number
}

export interface ResumoDebitos {
  debitos: Debito[]
  resumo: {
    total_debitos: number
    valor_total: number
    debitos_vencidos: number
  }
}

export interface ParcelamentoContribuinte {
  id: string
  numero_parcelamento: string
  valor_original: number
  valor_entrada: number
  valor_parcelado: number
  numero_parcelas: number
  valor_parcela: number
  parcelas_pagas: number
  status: string
  data_primeira_parcela?: string
  created_at: string
}

export interface Parcela {
  id: string
  numero_parcela: number
  valor_parcela: number
  data_vencimento: string
  situacao: string
  data_pagamento?: string
}

export const portalService = {
  /**
   * Obtém o dashboard do contribuinte
   */
  async obterDashboard(): Promise<DashboardContribuinte> {
    const { data } = await api.get<DashboardContribuinte>('/portal/contribuinte/dashboard')
    return data
  },

  /**
   * Lista todos os débitos do contribuinte
   */
  async listarDebitos(): Promise<ResumoDebitos> {
    const { data } = await api.get<ResumoDebitos>('/portal/contribuinte/debitos')
    return data
  },

  /**
   * Lista imóveis do contribuinte
   */
  async listarMeusImoveis(): Promise<any[]> {
    const { data } = await api.get('/portal/contribuinte/imoveis')
    return data
  },

  /**
   * Obtém débitos de um imóvel específico
   */
  async obterDebitosImovel(imovelId: string): Promise<any> {
    const { data } = await api.get(`/portal/contribuinte/imoveis/${imovelId}/debitos`)
    return data
  },

  /**
   * Lista estabelecimentos do contribuinte
   */
  async listarMeusEstabelecimentos(): Promise<any[]> {
    const { data } = await api.get('/portal/contribuinte/estabelecimentos')
    return data
  },

  /**
   * Obtém declarações de um estabelecimento
   */
  async obterDeclaracoesEstabelecimento(estabelecimentoId: string): Promise<any> {
    const { data } = await api.get(`/portal/contribuinte/estabelecimentos/${estabelecimentoId}/declaracoes`)
    return data
  },

  /**
   * Lista parcelamentos do contribuinte
   */
  async listarMeusParcelamentos(): Promise<ParcelamentoContribuinte[]> {
    const { data } = await api.get<ParcelamentoContribuinte[]>('/portal/contribuinte/parcelamentos')
    return data
  },

  /**
   * Obtém parcelas de um parcelamento
   */
  async obterParcelasParcelamento(parcelamentoId: string): Promise<{ parcelamento_id: string; numero_parcelamento: string; parcelas: Parcela[] }> {
    const { data } = await api.get(`/portal/contribuinte/parcelamentos/${parcelamentoId}/parcelas`)
    return data
  },

  /**
   * Obtém dados cadastrais do contribuinte
   */
  async obterMeuCadastro(): Promise<any> {
    const { data } = await api.get('/portal/contribuinte/meu-cadastro')
    return data
  },

  /**
   * Atualiza dados de contato do contribuinte
   */
  async atualizarMeuCadastro(dados: {
    email?: string
    telefone?: string
    celular?: string
    endereco?: string
  }): Promise<any> {
    const { data } = await api.put('/portal/contribuinte/meu-cadastro', null, { params: dados })
    return data
  },
}
