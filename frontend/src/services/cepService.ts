/**
 * Service para Consulta de CEP
 * Integração com ViaCEP através do backend
 */
import api from './api'

export interface CepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
}

const cepService = {
  /**
   * Busca informações de endereço por CEP
   * @param cep - CEP com ou sem formatação
   * @returns Dados do endereço
   */
  async buscarCep(cep: string): Promise<CepResponse> {
    const cepLimpo = cep.replace(/\D/g, '')

    if (cepLimpo.length !== 8) {
      throw new Error('CEP deve conter 8 dígitos')
    }

    const response = await api.get(`/cadastro/cep/${cepLimpo}`)
    return response.data
  },

  /**
   * Formata CEP para exibição
   * @param cep - CEP sem formatação
   * @returns CEP formatado (XXXXX-XXX)
   */
  formatarCep(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '')

    if (cepLimpo.length !== 8) {
      return cep
    }

    return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2')
  },

  /**
   * Remove formatação do CEP
   * @param cep - CEP formatado
   * @returns CEP sem formatação
   */
  limparCep(cep: string): string {
    return cep.replace(/\D/g, '')
  },

  /**
   * Valida formato de CEP (apenas quantidade de dígitos)
   * @param cep - CEP a validar
   * @returns true se formato válido
   */
  validarFormatoCep(cep: string): boolean {
    const cepLimpo = cep.replace(/\D/g, '')
    return cepLimpo.length === 8
  },

  /**
   * Aplica máscara ao CEP durante digitação
   * @param value - Valor atual do input
   * @returns Valor formatado
   */
  aplicarMascara(value: string): string {
    const cepLimpo = value.replace(/\D/g, '')

    if (cepLimpo.length <= 5) {
      return cepLimpo
    }

    return cepLimpo.substring(0, 5) + '-' + cepLimpo.substring(5, 8)
  }
}

export default cepService
