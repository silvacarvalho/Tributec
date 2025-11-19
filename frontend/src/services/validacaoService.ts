/**
 * Service para Validações de Documentos
 * Integração com endpoints de validação do backend
 */
import api from './api'

export interface ValidacaoCpfResponse {
  valido: boolean
  existe: boolean
  pessoa_id?: string
  mensagem?: string
}

export interface ValidacaoCnpjResponse {
  valido: boolean
  existe: boolean
  pessoa_id?: string
  mensagem?: string
}

export interface ValidacaoInscricaoResponse {
  valido: boolean
  existe: boolean
  imovel_id?: string
  mensagem?: string
}

export interface ValidacaoCcmResponse {
  valido: boolean
  existe: boolean
  estabelecimento_id?: string
  mensagem?: string
}

const validacaoService = {
  /**
   * Valida CPF e verifica se já existe no cadastro
   * @param cpf - CPF com ou sem formatação
   * @returns Validação do CPF
   */
  async validarCpf(cpf: string): Promise<ValidacaoCpfResponse> {
    const cpfLimpo = cpf.replace(/\D/g, '')
    const response = await api.get(`/cadastro/validar/cpf/${cpfLimpo}`)
    return response.data
  },

  /**
   * Valida CNPJ e verifica se já existe no cadastro
   * @param cnpj - CNPJ com ou sem formatação
   * @returns Validação do CNPJ
   */
  async validarCnpj(cnpj: string): Promise<ValidacaoCnpjResponse> {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    const response = await api.get(`/cadastro/validar/cnpj/${cnpjLimpo}`)
    return response.data
  },

  /**
   * Valida CPF/CNPJ automaticamente
   * @param documento - CPF ou CNPJ
   * @returns Validação do documento
   */
  async validarCpfCnpj(documento: string): Promise<ValidacaoCpfResponse | ValidacaoCnpjResponse> {
    const documentoLimpo = documento.replace(/\D/g, '')

    if (documentoLimpo.length === 11) {
      return this.validarCpf(documentoLimpo)
    } else if (documentoLimpo.length === 14) {
      return this.validarCnpj(documentoLimpo)
    } else {
      return {
        valido: false,
        existe: false,
        mensagem: 'CPF deve ter 11 dígitos e CNPJ deve ter 14 dígitos'
      }
    }
  },

  /**
   * Valida Inscrição Imobiliária e verifica se já existe
   * @param inscricao - Inscrição Imobiliária
   * @returns Validação da inscrição
   */
  async validarInscricaoImobiliaria(inscricao: string): Promise<ValidacaoInscricaoResponse> {
    const response = await api.get(`/cadastro/validar/inscricao/${inscricao}`)
    return response.data
  },

  /**
   * Valida CCM (Inscrição Municipal) e verifica se já existe
   * @param ccm - Cadastro de Contribuinte Municipal
   * @returns Validação do CCM
   */
  async validarCcm(ccm: string): Promise<ValidacaoCcmResponse> {
    const response = await api.get(`/cadastro/validar/ccm/${ccm}`)
    return response.data
  },

  /**
   * Formata CPF para exibição
   * @param cpf - CPF sem formatação
   * @returns CPF formatado (XXX.XXX.XXX-XX)
   */
  formatarCpf(cpf: string): string {
    const cpfLimpo = cpf.replace(/\D/g, '')

    if (cpfLimpo.length !== 11) {
      return cpf
    }

    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  },

  /**
   * Formata CNPJ para exibição
   * @param cnpj - CNPJ sem formatação
   * @returns CNPJ formatado (XX.XXX.XXX/XXXX-XX)
   */
  formatarCnpj(cnpj: string): string {
    const cnpjLimpo = cnpj.replace(/\D/g, '')

    if (cnpjLimpo.length !== 14) {
      return cnpj
    }

    return cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  },

  /**
   * Formata CPF ou CNPJ automaticamente
   * @param documento - CPF ou CNPJ
   * @returns Documento formatado
   */
  formatarCpfCnpj(documento: string): string {
    const documentoLimpo = documento.replace(/\D/g, '')

    if (documentoLimpo.length === 11) {
      return this.formatarCpf(documentoLimpo)
    } else if (documentoLimpo.length === 14) {
      return this.formatarCnpj(documentoLimpo)
    } else {
      return documento
    }
  },

  /**
   * Valida formato de CPF (apenas dígitos)
   * @param cpf - CPF a validar
   * @returns true se formato válido
   */
  validarFormatoCpf(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/\D/g, '')
    return cpfLimpo.length === 11
  },

  /**
   * Valida formato de CNPJ (apenas dígitos)
   * @param cnpj - CNPJ a validar
   * @returns true se formato válido
   */
  validarFormatoCnpj(cnpj: string): boolean {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    return cnpjLimpo.length === 14
  },

  /**
   * Remove formatação de documento (CPF/CNPJ)
   * @param documento - Documento formatado
   * @returns Documento sem formatação
   */
  limparDocumento(documento: string): string {
    return documento.replace(/\D/g, '')
  }
}

export default validacaoService
