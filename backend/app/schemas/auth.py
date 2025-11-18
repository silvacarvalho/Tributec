"""
Schemas de Autenticação e Autorização
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.schemas.base import SchemaBase


class UsuarioLogin(BaseModel):
    """Schema para login de usuário"""
    email: EmailStr = Field(..., description="Email do usuário")
    senha: str = Field(..., min_length=6, description="Senha do usuário")


class TokenResponse(BaseModel):
    """Resposta do token de autenticação"""
    access_token: str = Field(..., description="Token de acesso JWT")
    refresh_token: str = Field(..., description="Token de refresh")
    token_type: str = Field(default="bearer", description="Tipo do token")
    expires_in: int = Field(..., description="Tempo de expiração em segundos")


class TokenData(BaseModel):
    """Dados extraídos do token"""
    usuario_id: str
    email: str
    perfis: list[str] = []


class AlterarSenha(BaseModel):
    """Schema para alteração de senha"""
    senha_atual: str = Field(..., min_length=6, description="Senha atual")
    senha_nova: str = Field(..., min_length=6, description="Nova senha")
    senha_confirmacao: str = Field(..., min_length=6, description="Confirmação da nova senha")

    @field_validator('senha_confirmacao')
    @classmethod
    def senhas_devem_coincidir(cls, v, info):
        if 'senha_nova' in info.data and v != info.data['senha_nova']:
            raise ValueError('As senhas não coincidem')
        return v


class RecuperarSenha(BaseModel):
    """Schema para recuperação de senha"""
    email: EmailStr = Field(..., description="Email do usuário")


class RedefinirSenha(BaseModel):
    """Schema para redefinição de senha com token"""
    token: str = Field(..., description="Token de recuperação")
    senha_nova: str = Field(..., min_length=6, description="Nova senha")
    senha_confirmacao: str = Field(..., min_length=6, description="Confirmação da nova senha")

    @field_validator('senha_confirmacao')
    @classmethod
    def senhas_devem_coincidir(cls, v, info):
        if 'senha_nova' in info.data and v != info.data['senha_nova']:
            raise ValueError('As senhas não coincidem')
        return v
