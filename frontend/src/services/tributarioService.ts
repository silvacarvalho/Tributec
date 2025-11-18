import api from './api'
import type {
  // IPTU
  IPTUCalculoRequest,
  IPTUCalculoResponse,
  IPTULancamentoCreate,
  IPTULancamento,
  IPTUParcela,
  IPTUCorrecaoRequest,
  // ITBI
  ITBICalculoRequest,
  ITBICalculoResponse,
  ITBIGuiaCreate,
  ITBIGuia,
  ITBIArbitramentoRequest,
  // ISSQN
  ISSQNCalculoRequest,
  ISSQNCalculoResponse,
  ISSQNDeclaracaoCreate,
  ISSQNDeclaracao,
  ISSQNRetificacaoRequest,
  ISSQNRetencaoCreate,
  ISSQNRetencao,
  // Isenções
  IsencaoCreate,
  IsencaoUpdate,
  Isencao,
  // Alíquotas
  AliquotaCreate,
  Aliquota,
  // PGV/TPC
  PlantaGenericaValorCreate,
  PlantaGenericaValor,
  TabelaPrecoConstrucaoCreate,
  TabelaPrecoConstrucao,
  // Parcelamentos
  ParcelamentoCreate,
  Parcelamento,
  ParcelamentoParcela,
  // Relatórios
  RelatorioArrecadacaoParams,
  RelatorioArrecadacaoResponse,
  RelatorioInadimplenciaParams,
  RelatorioInadimplenciaResponse,
  // Common
  ListResponse,
  PaginationParams,
} from '@/types'

interface IPTUListParams extends PaginationParams {
  ano_exercicio?: number
  imovel_id?: string
  status?: string
}

interface ITBIListParams extends PaginationParams {
  imovel_id?: string
  transmitente_id?: string
  adquirente_id?: string
  status?: string
  data_inicio?: string
  data_fim?: string
}

interface ISSQNListParams extends PaginationParams {
  estabelecimento_id?: string
  mes_competencia?: number
  ano_competencia?: number
  regime_tributacao?: string
  status?: string
}

interface IsencaoListParams extends PaginationParams {
  beneficiario_id?: string
  tipo_tributo?: string
  ativa?: boolean
  motivo?: string
}

interface AliquotaListParams extends PaginationParams {
  tipo_tributo?: string
  categoria?: string
  ano_vigencia?: number
  ativa?: boolean
}

interface PGVListParams extends PaginationParams {
  setor_fiscal_id?: number
  ano_vigencia?: number
  ativa?: boolean
}

interface TPCListParams extends PaginationParams {
  padrao_construtivo?: string
  ano_vigencia?: number
  mes_vigencia?: number
  ativa?: boolean
}

interface ParcelamentoListParams extends PaginationParams {
  contribuinte_id?: string
  status?: string
}

export const tributarioService = {
  // ========================================================
  // IPTU
  // ========================================================

  /**
   * Calcula IPTU de um imóvel
   */
  async calcularIPTU(dados: IPTUCalculoRequest): Promise<IPTUCalculoResponse> {
    const { data } = await api.post<IPTUCalculoResponse>('/tributario/iptu/calcular', dados)
    return data
  },

  /**
   * Lança IPTU no exercício
   */
  async lancarIPTU(dados: IPTULancamentoCreate): Promise<IPTULancamento> {
    const { data } = await api.post<IPTULancamento>('/tributario/iptu/lancar', dados)
    return data
  },

  /**
   * Lança IPTU em lote para todos os imóveis
   */
  async lancarIPTUEmLote(anoExercicio: number): Promise<{ sucesso: boolean; mensagem: string }> {
    const { data } = await api.post(`/tributario/iptu/lançamento-em-lote/${anoExercicio}`)
    return data
  },

  /**
   * Lista lançamentos de IPTU
   */
  async listarIPTU(params?: IPTUListParams): Promise<ListResponse<IPTULancamento>> {
    const { data } = await api.get<ListResponse<IPTULancamento>>('/tributario/iptu/lancamentos', {
      params: {
        skip: params?.pagina ? (params.pagina - 1) * (params.limite || 20) : 0,
        limit: params?.limite || 20,
        ...params,
      },
    })
    return data
  },

  /**
   * Obtém lançamento de IPTU por ID
   */
  async obterIPTU(id: string): Promise<IPTULancamento> {
    const { data } = await api.get<IPTULancamento>(`/tributario/iptu/lancamentos/${id}`)
    return data
  },

  /**
   * Lista parcelas de um lançamento de IPTU
   */
  async listarParcelasIPTU(lancamentoId: string): Promise<IPTUParcela[]> {
    const { data } = await api.get<IPTUParcela[]>(
      `/tributario/iptu/lancamentos/${lancamentoId}/parcelas`
    )
    return data
  },

  /**
   * Corrige valores de um lançamento de IPTU
   */
  async corrigirIPTU(
    lancamentoId: string,
    correcao: IPTUCorrecaoRequest
  ): Promise<IPTULancamento> {
    const { data } = await api.put<IPTULancamento>(
      `/tributario/iptu/lancamentos/${lancamentoId}/corrigir`,
      correcao
    )
    return data
  },

  /**
   * Cancela lançamento de IPTU
   */
  async cancelarIPTU(lancamentoId: string, motivo: string): Promise<IPTULancamento> {
    const { data } = await api.put<IPTULancamento>(
      `/tributario/iptu/lancamentos/${lancamentoId}/cancelar`,
      { motivo }
    )
    return data
  },

  // ========================================================
  // ITBI
  // ========================================================

  /**
   * Calcula ITBI para transação
   */
  async calcularITBI(dados: ITBICalculoRequest): Promise<ITBICalculoResponse> {
    const { data } = await api.post<ITBICalculoResponse>('/tributario/itbi/calcular', dados)
    return data
  },

  /**
   * Emite guia de ITBI
   */
  async emitirGuiaITBI(dados: ITBIGuiaCreate): Promise<ITBIGuia> {
    const { data } = await api.post<ITBIGuia>('/tributario/itbi/emitir-guia', dados)
    return data
  },

  /**
   * Lista guias de ITBI
   */
  async listarITBI(params?: ITBIListParams): Promise<ListResponse<ITBIGuia>> {
    const { data } = await api.get<ListResponse<ITBIGuia>>('/tributario/itbi/guias', {
      params: {
        skip: params?.pagina ? (params.pagina - 1) * (params.limite || 20) : 0,
        limit: params?.limite || 20,
        ...params,
      },
    })
    return data
  },

  /**
   * Obtém guia de ITBI por ID
   */
  async obterITBI(id: string): Promise<ITBIGuia> {
    const { data } = await api.get<ITBIGuia>(`/tributario/itbi/guias/${id}`)
    return data
  },

  /**
   * Gera PDF da guia de ITBI
   */
  async gerarPDFITBI(id: string): Promise<Blob> {
    const { data } = await api.get(`/tributario/itbi/guias/${id}/pdf`, {
      responseType: 'blob',
    })
    return data
  },

  /**
   * Registra pagamento de guia de ITBI
   */
  async registrarPagamentoITBI(
    id: string,
    dataPagamento: string,
    valorPago: number
  ): Promise<ITBIGuia> {
    const { data } = await api.put<ITBIGuia>(
      `/tributario/itbi/guias/${id}/registrar-pagamento`,
      { data_pagamento: dataPagamento, valor_pago: valorPago }
    )
    return data
  },

  /**
   * Arbitra valor de ITBI quando declarado é suspeito
   */
  async arbitrarITBI(id: string, arbitramento: ITBIArbitramentoRequest): Promise<ITBIGuia> {
    const { data } = await api.put<ITBIGuia>(
      `/tributario/itbi/guias/${id}/arbitrar`,
      arbitramento
    )
    return data
  },

  /**
   * Cancela guia de ITBI
   */
  async cancelarITBI(id: string, motivo: string): Promise<ITBIGuia> {
    const { data } = await api.put<ITBIGuia>(`/tributario/itbi/guias/${id}/cancelar`, { motivo })
    return data
  },

  // ========================================================
  // ISSQN
  // ========================================================

  /**
   * Calcula ISSQN para declaração
   */
  async calcularISSQN(dados: ISSQNCalculoRequest): Promise<ISSQNCalculoResponse> {
    const { data } = await api.post<ISSQNCalculoResponse>('/tributario/issqn/calcular', dados)
    return data
  },

  /**
   * Cria declaração de ISSQN
   */
  async declararISSQN(dados: ISSQNDeclaracaoCreate): Promise<ISSQNDeclaracao> {
    const { data } = await api.post<ISSQNDeclaracao>('/tributario/issqn/declarar', dados)
    return data
  },

  /**
   * Lista declarações de ISSQN
   */
  async listarISSQN(params?: ISSQNListParams): Promise<ListResponse<ISSQNDeclaracao>> {
    const { data } = await api.get<ListResponse<ISSQNDeclaracao>>(
      '/tributario/issqn/declaracoes',
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
   * Gera PDF da declaração de ISSQN
   */
  async gerarPDFISSQN(id: string): Promise<Blob> {
    const { data } = await api.get(`/tributario/issqn/declaracoes/${id}/pdf`, {
      responseType: 'blob',
    })
    return data
  },

  /**
   * Registra pagamento de declaração de ISSQN
   */
  async registrarPagamentoISSQN(
    id: string,
    dataPagamento: string,
    valorPago: number
  ): Promise<ISSQNDeclaracao> {
    const { data } = await api.put<ISSQNDeclaracao>(
      `/tributario/issqn/declaracoes/${id}/registrar-pagamento`,
      { data_pagamento: dataPagamento, valor_pago: valorPago }
    )
    return data
  },

  /**
   * Retifica declaração de ISSQN
   */
  async retificarISSQN(
    id: string,
    retificacao: ISSQNRetificacaoRequest
  ): Promise<ISSQNDeclaracao> {
    const { data } = await api.put<ISSQNDeclaracao>(
      `/tributario/issqn/declaracoes/${id}/retificar`,
      retificacao
    )
    return data
  },

  /**
   * Cancela declaração de ISSQN
   */
  async cancelarISSQN(id: string, motivo: string): Promise<ISSQNDeclaracao> {
    const { data } = await api.put<ISSQNDeclaracao>(
      `/tributario/issqn/declaracoes/${id}/cancelar`,
      { motivo }
    )
    return data
  },

  /**
   * Registra retenção de ISSQN na fonte
   */
  async registrarRetencaoISSQN(dados: ISSQNRetencaoCreate): Promise<ISSQNRetencao> {
    const { data } = await api.post<ISSQNRetencao>('/tributario/issqn/retencoes', dados)
    return data
  },

  /**
   * Lista retenções de ISSQN
   */
  async listarRetencoesISSQN(
    params?: PaginationParams & { tomador_id?: string; prestador_id?: string; recolhido?: boolean }
  ): Promise<ListResponse<ISSQNRetencao>> {
    const { data } = await api.get<ListResponse<ISSQNRetencao>>(
      '/tributario/issqn/retencoes',
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
   * Registra recolhimento de retenção
   */
  async recolherRetencaoISSQN(
    id: string,
    dataRecolhimento: string
  ): Promise<ISSQNRetencao> {
    const { data } = await api.put<ISSQNRetencao>(
      `/tributario/issqn/retencoes/${id}/recolher`,
      { data_recolhimento: dataRecolhimento }
    )
    return data
  },

  // ========================================================
  // ISENÇÕES
  // ========================================================

  /**
   * Cria solicitação de isenção
   */
  async criarIsencao(dados: IsencaoCreate): Promise<Isencao> {
    const { data } = await api.post<Isencao>('/tributario/isencoes', dados)
    return data
  },

  /**
   * Lista isenções
   */
  async listarIsencoes(params?: IsencaoListParams): Promise<ListResponse<Isencao>> {
    const { data } = await api.get<ListResponse<Isencao>>('/tributario/isencoes', {
      params: {
        skip: params?.pagina ? (params.pagina - 1) * (params.limite || 20) : 0,
        limit: params?.limite || 20,
        ...params,
      },
    })
    return data
  },

  /**
   * Obtém isenção por ID
   */
  async obterIsencao(id: string): Promise<Isencao> {
    const { data } = await api.get<Isencao>(`/tributario/isencoes/${id}`)
    return data
  },

  /**
   * Aprova solicitação de isenção
   */
  async aprovarIsencao(id: string): Promise<Isencao> {
    const { data } = await api.put<Isencao>(`/tributario/isencoes/${id}/aprovar`)
    return data
  },

  /**
   * Cancela isenção ativa
   */
  async cancelarIsencao(id: string, motivoCancelamento: string): Promise<Isencao> {
    const { data } = await api.put<Isencao>(`/tributario/isencoes/${id}/cancelar`, {
      motivo_cancelamento: motivoCancelamento,
    })
    return data
  },

  /**
   * Atualiza dados da isenção
   */
  async atualizarIsencao(id: string, dados: IsencaoUpdate): Promise<Isencao> {
    const { data } = await api.put<Isencao>(`/tributario/isencoes/${id}`, dados)
    return data
  },

  /**
   * Remove isenção
   */
  async excluirIsencao(id: string): Promise<void> {
    await api.delete(`/tributario/isencoes/${id}`)
  },

  // ========================================================
  // ALÍQUOTAS
  // ========================================================

  /**
   * Cria nova alíquota
   */
  async criarAliquota(dados: AliquotaCreate): Promise<Aliquota> {
    const { data } = await api.post<Aliquota>('/tributario/aliquotas', dados)
    return data
  },

  /**
   * Lista alíquotas
   */
  async listarAliquotas(params?: AliquotaListParams): Promise<ListResponse<Aliquota>> {
    const { data } = await api.get<ListResponse<Aliquota>>('/tributario/aliquotas', {
      params: {
        skip: params?.pagina ? (params.pagina - 1) * (params.limite || 20) : 0,
        limit: params?.limite || 20,
        ...params,
      },
    })
    return data
  },

  /**
   * Obtém alíquota por ID
   */
  async obterAliquota(id: number): Promise<Aliquota> {
    const { data } = await api.get<Aliquota>(`/tributario/aliquotas/${id}`)
    return data
  },

  /**
   * Atualiza alíquota
   */
  async atualizarAliquota(id: number, dados: AliquotaCreate): Promise<Aliquota> {
    const { data } = await api.put<Aliquota>(`/tributario/aliquotas/${id}`, dados)
    return data
  },

  /**
   * Remove alíquota
   */
  async excluirAliquota(id: number): Promise<void> {
    await api.delete(`/tributario/aliquotas/${id}`)
  },

  // ========================================================
  // PGV - Planta Genérica de Valores
  // ========================================================

  /**
   * Cria PGV (valor m² terreno)
   */
  async criarPGV(dados: PlantaGenericaValorCreate): Promise<PlantaGenericaValor> {
    const { data } = await api.post<PlantaGenericaValor>('/tributario/pgv', dados)
    return data
  },

  /**
   * Lista PGVs
   */
  async listarPGV(params?: PGVListParams): Promise<ListResponse<PlantaGenericaValor>> {
    const { data } = await api.get<ListResponse<PlantaGenericaValor>>('/tributario/pgv', {
      params: {
        skip: params?.pagina ? (params.pagina - 1) * (params.limite || 20) : 0,
        limit: params?.limite || 20,
        ...params,
      },
    })
    return data
  },

  /**
   * Obtém PGV por ID
   */
  async obterPGV(id: number): Promise<PlantaGenericaValor> {
    const { data } = await api.get<PlantaGenericaValor>(`/tributario/pgv/${id}`)
    return data
  },

  /**
   * Atualiza PGV
   */
  async atualizarPGV(
    id: number,
    dados: PlantaGenericaValorCreate
  ): Promise<PlantaGenericaValor> {
    const { data } = await api.put<PlantaGenericaValor>(`/tributario/pgv/${id}`, dados)
    return data
  },

  /**
   * Remove PGV
   */
  async excluirPGV(id: number): Promise<void> {
    await api.delete(`/tributario/pgv/${id}`)
  },

  // ========================================================
  // TPC - Tabela de Preço de Construção
  // ========================================================

  /**
   * Cria TPC (valor m² edificação)
   */
  async criarTPC(dados: TabelaPrecoConstrucaoCreate): Promise<TabelaPrecoConstrucao> {
    const { data } = await api.post<TabelaPrecoConstrucao>('/tributario/tpc', dados)
    return data
  },

  /**
   * Lista TPCs
   */
  async listarTPC(params?: TPCListParams): Promise<ListResponse<TabelaPrecoConstrucao>> {
    const { data } = await api.get<ListResponse<TabelaPrecoConstrucao>>('/tributario/tpc', {
      params: {
        skip: params?.pagina ? (params.pagina - 1) * (params.limite || 20) : 0,
        limit: params?.limite || 20,
        ...params,
      },
    })
    return data
  },

  /**
   * Obtém TPC por ID
   */
  async obterTPC(id: number): Promise<TabelaPrecoConstrucao> {
    const { data } = await api.get<TabelaPrecoConstrucao>(`/tributario/tpc/${id}`)
    return data
  },

  /**
   * Atualiza TPC
   */
  async atualizarTPC(
    id: number,
    dados: TabelaPrecoConstrucaoCreate
  ): Promise<TabelaPrecoConstrucao> {
    const { data } = await api.put<TabelaPrecoConstrucao>(`/tributario/tpc/${id}`, dados)
    return data
  },

  /**
   * Remove TPC
   */
  async excluirTPC(id: number): Promise<void> {
    await api.delete(`/tributario/tpc/${id}`)
  },

  // ========================================================
  // PARCELAMENTOS
  // ========================================================

  /**
   * Cria parcelamento de débitos
   */
  async criarParcelamento(dados: ParcelamentoCreate): Promise<Parcelamento> {
    const { data } = await api.post<Parcelamento>('/tributario/parcelamentos', dados)
    return data
  },

  /**
   * Lista parcelamentos
   */
  async listarParcelamentos(
    params?: ParcelamentoListParams
  ): Promise<ListResponse<Parcelamento>> {
    const { data } = await api.get<ListResponse<Parcelamento>>('/tributario/parcelamentos', {
      params: {
        skip: params?.pagina ? (params.pagina - 1) * (params.limite || 20) : 0,
        limit: params?.limite || 20,
        ...params,
      },
    })
    return data
  },

  /**
   * Registra pagamento de parcela
   */
  async pagarParcelaParcelamento(
    parcelamentoId: string,
    numeroParcela: number,
    dataPagamento: string,
    valorPago: number
  ): Promise<ParcelamentoParcela> {
    const { data } = await api.put<ParcelamentoParcela>(
      `/tributario/parcelamentos/${parcelamentoId}/parcela/${numeroParcela}/pagar`,
      { data_pagamento: dataPagamento, valor_pago: valorPago }
    )
    return data
  },

  /**
   * Cancela parcelamento
   */
  async cancelarParcelamento(id: string, motivo: string): Promise<Parcelamento> {
    const { data } = await api.put<Parcelamento>(`/tributario/parcelamentos/${id}/cancelar`, {
      motivo,
    })
    return data
  },

  // ========================================================
  // RELATÓRIOS
  // ========================================================

  /**
   * Relatório de arrecadação por período
   */
  async relatorioArrecadacao(
    params: RelatorioArrecadacaoParams
  ): Promise<RelatorioArrecadacaoResponse> {
    const { data } = await api.get<RelatorioArrecadacaoResponse>(
      '/tributario/relatorios/arrecadacao',
      { params }
    )
    return data
  },

  /**
   * Relatório de inadimplência com aging
   */
  async relatorioInadimplencia(
    params?: RelatorioInadimplenciaParams
  ): Promise<RelatorioInadimplenciaResponse> {
    const { data } = await api.get<RelatorioInadimplenciaResponse>(
      '/tributario/relatorios/inadimplencia',
      { params }
    )
    return data
  },
}
