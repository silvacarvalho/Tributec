/**
 * Sistema global de tratamento de erros
 */
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

export interface ErrorInfo {
  message: string
  status?: number
  code?: string
  field?: string
}

/**
 * Extrai informações de erro de várias fontes
 */
export function parseError(error: unknown): ErrorInfo {
  // Erro do Axios (HTTP)
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const data = error.response?.data

    // Tratar diferentes formatos de resposta
    if (typeof data?.detail === 'string') {
      return {
        message: data.detail,
        status,
        code: data.code,
      }
    }

    // Erros de validação do FastAPI
    if (Array.isArray(data?.detail)) {
      const messages = data.detail.map((err: any) => {
        const field = err.loc?.join('.') || 'Campo'
        return `${field}: ${err.msg}`
      })
      return {
        message: messages.join('; '),
        status,
      }
    }

    // Erros HTTP sem detail
    const httpMessages: Record<number, string> = {
      400: 'Requisição inválida',
      401: 'Não autenticado. Faça login novamente.',
      403: 'Sem permissão para acessar este recurso',
      404: 'Recurso não encontrado',
      409: 'Conflito: o recurso já existe',
      422: 'Dados inválidos',
      500: 'Erro interno do servidor',
      503: 'Serviço temporariamente indisponível',
    }

    return {
      message: httpMessages[status || 0] || error.message || 'Erro ao processar requisição',
      status,
    }
  }

  // Erro JavaScript padrão
  if (error instanceof Error) {
    return {
      message: error.message,
    }
  }

  // Erro desconhecido
  return {
    message: 'Erro desconhecido',
  }
}

/**
 * Mostra toast de erro com mensagem apropriada
 */
export function showError(error: unknown, customMessage?: string) {
  const errorInfo = parseError(error)
  const message = customMessage || errorInfo.message

  toast.error(message, {
    autoClose: 5000,
    position: 'top-right',
  })

  // Log no console em desenvolvimento
  if (import.meta.env.DEV) {
    console.error('Erro:', error)
  }
}

/**
 * Mostra toast de sucesso
 */
export function showSuccess(message: string) {
  toast.success(message, {
    autoClose: 3000,
    position: 'top-right',
  })
}

/**
 * Mostra toast de aviso
 */
export function showWarning(message: string) {
  toast.warning(message, {
    autoClose: 4000,
    position: 'top-right',
  })
}

/**
 * Mostra toast de informação
 */
export function showInfo(message: string) {
  toast.info(message, {
    autoClose: 3000,
    position: 'top-right',
  })
}

/**
 * Verifica se é erro de autenticação (401)
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401
  }
  return false
}

/**
 * Verifica se é erro de permissão (403)
 */
export function isPermissionError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 403
  }
  return false
}

/**
 * Verifica se é erro de não encontrado (404)
 */
export function isNotFoundError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 404
  }
  return false
}

/**
 * Verifica se é erro de conflito (409)
 */
export function isConflictError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 409
  }
  return false
}

/**
 * Verifica se é erro de validação (422)
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 422
  }
  return false
}

/**
 * Handler global para erros não capturados
 */
export function setupGlobalErrorHandler() {
  // Erros de Promise não capturados
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejeitada não tratada:', event.reason)
    showError(event.reason, 'Erro inesperado na aplicação')
    event.preventDefault()
  })

  // Erros JavaScript não capturados
  window.addEventListener('error', (event) => {
    console.error('Erro JavaScript não tratado:', event.error)
    showError(event.error, 'Erro inesperado na aplicação')
    event.preventDefault()
  })
}
