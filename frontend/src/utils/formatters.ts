/**
 * Formatadores de dados para exibição
 */

export const formatters = {
  /**
   * Formata valor monetário
   */
  currency: (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return 'R$ 0,00'
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue)
  },

  /**
   * Formata data
   */
  date: (value: string | Date | null | undefined): string => {
    if (!value) return '-'
    const date = typeof value === 'string' ? new Date(value) : value
    return new Intl.DateTimeFormat('pt-BR').format(date)
  },

  /**
   * Formata data e hora
   */
  datetime: (value: string | Date | null | undefined): string => {
    if (!value) return '-'
    const date = typeof value === 'string' ? new Date(value) : value
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date)
  },

  /**
   * Formata CPF
   */
  cpf: (value: string | null | undefined): string => {
    if (!value) return '-'
    return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  },

  /**
   * Formata CNPJ
   */
  cnpj: (value: string | null | undefined): string => {
    if (!value) return '-'
    return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  },

  /**
   * Formata telefone
   */
  phone: (value: string | null | undefined): string => {
    if (!value) return '-'
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return value
  },

  /**
   * Formata CEP
   */
  cep: (value: string | null | undefined): string => {
    if (!value) return '-'
    return value.replace(/(\d{5})(\d{3})/, '$1-$2')
  },

  /**
   * Formata percentual
   */
  percent: (value: number | string | null | undefined, decimals: number = 2): string => {
    if (value === null || value === undefined) return '0%'
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return `${numValue.toFixed(decimals)}%`
  },

  /**
   * Formata número decimal
   */
  decimal: (value: number | string | null | undefined, decimals: number = 2): string => {
    if (value === null || value === undefined) return '0'
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return numValue.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  },

  /**
   * Trunca texto
   */
  truncate: (text: string | null | undefined, maxLength: number = 50): string => {
    if (!text) return '-'
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  },
}
