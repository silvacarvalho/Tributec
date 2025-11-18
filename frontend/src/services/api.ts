import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../stores/authStore'

// Configuração base da API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
})

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Se o token expirou, tentar renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = useAuthStore.getState().refreshToken
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/refresh`,
          { refresh_token: refreshToken }
        )
        const { access_token, refresh_token } = response.data

        // Atualizar tokens
        useAuthStore.getState().updateToken(access_token)
        if (refresh_token) {
          useAuthStore.getState().updateRefreshToken(refresh_token)
        }

        originalRequest.headers.Authorization = `Bearer ${access_token}`

        return api(originalRequest)
      } catch (refreshError) {
        // Se falhar ao renovar, fazer logout
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Tratamento de erros específicos
    if (error.response) {
      // Erro da resposta do servidor
      const { data, status } = error.response as any

      switch (status) {
        case 400:
          console.error('Requisição inválida:', data.detail || data.message)
          break
        case 403:
          console.error('Acesso negado:', data.detail || data.message)
          break
        case 404:
          console.error('Recurso não encontrado:', data.detail || data.message)
          break
        case 422:
          console.error('Erro de validação:', data.detail || data.message)
          break
        case 500:
          console.error('Erro interno do servidor')
          break
        default:
          console.error('Erro:', data.detail || data.message || 'Erro desconhecido')
      }
    } else if (error.request) {
      // Requisição foi feita mas não houve resposta
      console.error('Erro de conexão: Servidor não respondeu')
    } else {
      // Algo aconteceu ao configurar a requisição
      console.error('Erro:', error.message)
    }

    return Promise.reject(error)
  }
)

// Helper para extrair mensagem de erro
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.detail) {
    if (typeof error.response.data.detail === 'string') {
      return error.response.data.detail
    }
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail.map((e: any) => e.msg).join(', ')
    }
  }
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'Erro desconhecido'
}

export default api
