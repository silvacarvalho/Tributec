/**
 * Service para operações com Endereços
 * CRUD completo de endereços de pessoas
 */
import api from './api'

export interface Endereco {
  id: number
  pessoa_id: string
  tipo_endereco: 'RESIDENCIAL' | 'COMERCIAL' | 'COBRANCA' | 'OUTRO'
  logradouro_id?: number
  cep?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  endereco_principal: boolean
  observacoes?: string
  created_at: string
  updated_at: string
  // Relações
  logradouro?: {
    id: number
    codigo: string
    nome: string
    tipo_logradouro: string
  }
}

export interface EnderecoCreate {
  tipo_endereco: 'RESIDENCIAL' | 'COMERCIAL' | 'COBRANCA' | 'OUTRO'
  logradouro_id?: number
  cep?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  endereco_principal?: boolean
  observacoes?: string
}

const enderecoService = {
  /**
   * Adiciona um novo endereço a uma pessoa
   * @param pessoaId - ID da pessoa
   * @param endereco - Dados do endereço
   * @returns Endereço criado
   */
  async criar(pessoaId: string, endereco: EnderecoCreate): Promise<Endereco> {
    const response = await api.post(`/cadastro/pessoas/${pessoaId}/enderecos`, endereco)
    return response.data
  },

  /**
   * Atualiza um endereço
   * @param enderecoId - ID do endereço
   * @param endereco - Dados a atualizar
   * @returns Endereço atualizado
   */
  async atualizar(enderecoId: number, endereco: Partial<EnderecoCreate>): Promise<Endereco> {
    const response = await api.put(`/cadastro/enderecos/${enderecoId}`, endereco)
    return response.data
  },

  /**
   * Remove um endereço
   * @param enderecoId - ID do endereço
   */
  async excluir(enderecoId: number): Promise<void> {
    await api.delete(`/cadastro/enderecos/${enderecoId}`)
  },

  /**
   * Define um endereço como principal
   * @param enderecoId - ID do endereço
   * @returns Endereço atualizado
   */
  async definirPrincipal(enderecoId: number): Promise<Endereco> {
    const response = await api.put(`/cadastro/enderecos/${enderecoId}/principal`)
    return response.data
  },

  /**
   * Formata endereço completo para exibição
   * @param endereco - Dados do endereço
   * @returns Endereço formatado em string
   */
  formatarEndereco(endereco: Endereco): string {
    const partes: string[] = []

    // Logradouro
    if (endereco.logradouro) {
      partes.push(
        `${endereco.logradouro.tipo_logradouro} ${endereco.logradouro.nome}`
      )
    }

    // Número
    if (endereco.numero) {
      partes.push(`nº ${endereco.numero}`)
    }

    // Complemento
    if (endereco.complemento) {
      partes.push(endereco.complemento)
    }

    // Bairro
    if (endereco.bairro) {
      partes.push(`- ${endereco.bairro}`)
    }

    // Cidade/Estado
    if (endereco.cidade && endereco.estado) {
      partes.push(`- ${endereco.cidade}/${endereco.estado}`)
    } else if (endereco.cidade) {
      partes.push(`- ${endereco.cidade}`)
    }

    // CEP
    if (endereco.cep) {
      partes.push(`- CEP ${endereco.cep}`)
    }

    return partes.join(' ')
  },

  /**
   * Formata endereço simplificado (sem CEP)
   * @param endereco - Dados do endereço
   * @returns Endereço formatado em string
   */
  formatarEnderecoSimples(endereco: Endereco): string {
    const partes: string[] = []

    if (endereco.logradouro) {
      partes.push(`${endereco.logradouro.tipo_logradouro} ${endereco.logradouro.nome}`)
    }

    if (endereco.numero) {
      partes.push(`, ${endereco.numero}`)
    }

    if (endereco.bairro) {
      partes.push(` - ${endereco.bairro}`)
    }

    return partes.join('')
  },

  /**
   * Retorna label do tipo de endereço
   * @param tipo - Tipo do endereço
   * @returns Label do tipo
   */
  getLabelTipoEndereco(tipo: string): string {
    const labels: Record<string, string> = {
      RESIDENCIAL: 'Residencial',
      COMERCIAL: 'Comercial',
      COBRANCA: 'Cobrança',
      OUTRO: 'Outro'
    }

    return labels[tipo] || tipo
  },

  /**
   * Retorna cor do chip do tipo de endereço
   * @param tipo - Tipo do endereço
   * @returns Cor do chip
   */
  getCorTipoEndereco(tipo: string): 'default' | 'primary' | 'secondary' | 'info' {
    const cores: Record<string, 'default' | 'primary' | 'secondary' | 'info'> = {
      RESIDENCIAL: 'primary',
      COMERCIAL: 'secondary',
      COBRANCA: 'info',
      OUTRO: 'default'
    }

    return cores[tipo] || 'default'
  },

  /**
   * Valida dados de endereço
   * @param endereco - Dados a validar
   * @returns true se válido, mensagem de erro caso contrário
   */
  validarEndereco(endereco: EnderecoCreate): { valido: boolean; erro?: string } {
    if (!endereco.tipo_endereco) {
      return { valido: false, erro: 'Tipo de endereço é obrigatório' }
    }

    // Se não tem logradouro_id, precisa ter CEP, bairro, cidade e estado
    if (!endereco.logradouro_id) {
      if (!endereco.cep) {
        return { valido: false, erro: 'CEP é obrigatório quando não há logradouro cadastrado' }
      }

      if (!endereco.bairro) {
        return { valido: false, erro: 'Bairro é obrigatório quando não há logradouro cadastrado' }
      }

      if (!endereco.cidade) {
        return { valido: false, erro: 'Cidade é obrigatória quando não há logradouro cadastrado' }
      }

      if (!endereco.estado) {
        return { valido: false, erro: 'Estado é obrigatório quando não há logradouro cadastrado' }
      }
    }

    return { valido: true }
  }
}

export default enderecoService
