"""
Schemas do Módulo Administrativo
Usuários, Perfis, Parâmetros
"""
from datetime import date, datetime
from typing import Optional
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from app.schemas.base import SchemaBase


# =====================================================
# USUÁRIO
# =====================================================

class UsuarioBase(SchemaBase):
    """Schema base para usuário"""
    nome: str = Field(..., max_length=200, description="Nome completo")
    email: EmailStr = Field(..., description="Email (usado para login)")
    cpf: str = Field(..., max_length=11, description="CPF (somente números)")
    telefone: Optional[str] = Field(None, max_length=20)
    cargo: Optional[str] = Field(None, max_length=100)
    departamento: Optional[str] = Field(None, max_length=100)

    @field_validator('cpf')
    @classmethod
    def validar_cpf(cls, v):
        if v and len(v) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        return v


class UsuarioCreate(UsuarioBase):
    """Schema para criação de usuário"""
    senha: str = Field(..., min_length=6, description="Senha do usuário")
    perfis: list[str] = Field(default=[], description="Lista de perfis do usuário")


class UsuarioUpdate(BaseModel):
    """Schema para atualização de usuário"""
    nome: Optional[str] = Field(None, max_length=200)
    telefone: Optional[str] = Field(None, max_length=20)
    cargo: Optional[str] = Field(None, max_length=100)
    departamento: Optional[str] = Field(None, max_length=100)
    ativo: Optional[bool] = None


class UsuarioResponse(UsuarioBase):
    """Schema de resposta de usuário"""
    id: UUID
    ativo: bool
    data_ultimo_acesso: Optional[datetime] = None
    perfis: list[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# PERFIL
# =====================================================

class PerfilBase(SchemaBase):
    """Schema base para perfil de acesso"""
    nome: str = Field(..., max_length=100, description="Nome do perfil")
    codigo: str = Field(..., max_length=50, description="Código único do perfil")
    descricao: Optional[str] = None
    permissoes: list[str] = Field(default=[], description="Lista de permissões")
    ativo: bool = True


class PerfilCreate(PerfilBase):
    """Schema para criação de perfil"""
    pass


class PerfilUpdate(BaseModel):
    """Schema para atualização de perfil"""
    nome: Optional[str] = Field(None, max_length=100)
    descricao: Optional[str] = None
    permissoes: Optional[list[str]] = None
    ativo: Optional[bool] = None


class PerfilResponse(PerfilBase):
    """Schema de resposta de perfil"""
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# PARÂMETROS DO SISTEMA
# =====================================================

class ParametroSistemaBase(SchemaBase):
    """Schema base para parâmetro do sistema"""
    chave: str = Field(..., max_length=100, description="Chave única do parâmetro")
    valor: str = Field(..., description="Valor do parâmetro")
    tipo: str = Field(..., max_length=20, description="Tipo: STRING, INTEGER, DECIMAL, BOOLEAN, JSON")
    descricao: Optional[str] = None
    categoria: Optional[str] = Field(None, max_length=50, description="Categoria do parâmetro")
    editavel: bool = True


class ParametroSistemaCreate(ParametroSistemaBase):
    """Schema para criação de parâmetro"""
    pass


class ParametroSistemaUpdate(BaseModel):
    """Schema para atualização de parâmetro"""
    valor: str


class ParametroSistemaResponse(ParametroSistemaBase):
    """Schema de resposta de parâmetro"""
    id: int

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# AUDITORIA
# =====================================================

class AuditoriaResponse(SchemaBase):
    """Schema de resposta de auditoria"""
    id: UUID
    usuario_id: Optional[UUID] = None
    tabela: str
    operacao: str
    registro_id: str
    dados_antes: Optional[dict] = None
    dados_depois: Optional[dict] = None
    ip_origem: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# CERTIDÕES
# =====================================================

class CertidaoSolicitacaoBase(SchemaBase):
    """Schema base para solicitação de certidão"""
    tipo_certidao: str = Field(..., max_length=50, description="Tipo de certidão")
    contribuinte_id: UUID = Field(..., description="ID do contribuinte")
    imovel_id: Optional[UUID] = None
    estabelecimento_id: Optional[UUID] = None
    finalidade: Optional[str] = None


class CertidaoSolicitacaoCreate(CertidaoSolicitacaoBase):
    """Schema para criação de solicitação de certidão"""
    pass


class CertidaoResponse(CertidaoSolicitacaoBase):
    """Schema de resposta de certidão"""
    id: UUID
    numero_certidao: str
    data_emissao: date
    data_validade: date
    situacao: str
    pdf_url: Optional[str] = None
    emitida_por_id: Optional[UUID] = None

    model_config = ConfigDict(from_attributes=True)
