import api from './api'
import type {
  LoginCredentials,
  TokenResponse,
  AlterarSenhaRequest,
  RecuperarSenhaRequest,
  RedefinirSenhaRequest,
  Usuario,
} from '@/types'

export const authService = {
  /**
   * Autentica usuário e retorna tokens JWT
   */
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/login', credentials)
    return data
  },

  /**
   * Renova access token usando refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return data
  },

  /**
   * Retorna dados do usuário autenticado
   */
  async getMe(): Promise<Usuario> {
    const { data } = await api.get<{ dados: Usuario }>('/auth/me')
    return data.dados
  },

  /**
   * Altera senha do usuário autenticado
   */
  async alterarSenha(dados: AlterarSenhaRequest): Promise<void> {
    await api.post('/auth/alterar-senha', dados)
  },

  /**
   * Solicita recuperação de senha por email
   */
  async recuperarSenha(dados: RecuperarSenhaRequest): Promise<void> {
    await api.post('/auth/recuperar-senha', dados)
  },

  /**
   * Redefine senha usando token recebido por email
   */
  async redefinirSenha(dados: RedefinirSenhaRequest): Promise<void> {
    await api.post('/auth/redefinir-senha', dados)
  },

  /**
   * Invalida tokens do usuário
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },
}
