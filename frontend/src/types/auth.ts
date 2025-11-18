// Tipos relacionados à autenticação e autorização

export type PerfilUsuario = 'ADMIN' | 'FISCAL' | 'ARRECADACAO' | 'CONTRIBUINTE'

export interface Usuario {
  id: string
  nome_completo: string
  email: string
  cpf?: string
  perfis: PerfilUsuario[]
  ativo: boolean
  data_ultimo_acesso?: string
  ip_ultimo_acesso?: string
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  senha: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface AlterarSenhaRequest {
  senha_atual: string
  senha_nova: string
  confirmar_senha: string
}

export interface RecuperarSenhaRequest {
  email: string
}

export interface RedefinirSenhaRequest {
  token: string
  senha_nova: string
  confirmar_senha: string
}

export interface AuthState {
  usuario: Usuario | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

export interface UsuarioCreate {
  nome_completo: string
  email: string
  cpf?: string
  senha: string
  perfis: PerfilUsuario[]
  ativo?: boolean
}

export interface UsuarioUpdate {
  nome_completo?: string
  email?: string
  cpf?: string
  perfis?: PerfilUsuario[]
  ativo?: boolean
}
