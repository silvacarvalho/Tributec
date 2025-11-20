"""
Schemas do Módulo de Cadastros
"""
from datetime import date
from typing import Optional
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict
from app.schemas.base import SchemaBase


# =====================================================
# PESSOA
# =====================================================

class EnderecoBase(SchemaBase):
    """Schema base para endereço"""
    cep: Optional[str] = Field(None, max_length=8, description="CEP (somente números)")
    logradouro_id: Optional[int] = None
    numero: Optional[str] = Field(None, max_length=10)
    complemento: Optional[str] = Field(None, max_length=100)
    bairro: Optional[str] = Field(None, max_length=100)
    cidade: str = Field(default="Município", max_length=100)
    uf: str = Field(default="PA", max_length=2)
    pais: str = Field(default="Brasil", max_length=50)
    tipo_endereco: Optional[str] = Field(None, max_length=20)
    principal: bool = True


class EnderecoCreate(EnderecoBase):
    """Schema para criação de endereço"""
    pass


class EnderecoResponse(EnderecoBase):
    """Schema de resposta de endereço"""
    id: UUID
    pessoa_id: UUID

    model_config = ConfigDict(from_attributes=True)


class PessoaBase(SchemaBase):
    """Schema base para pessoa"""
    tipo_pessoa: str = Field(..., pattern="^(F|J)$", description="F=Física, J=Jurídica")

    # Pessoa Física
    cpf: Optional[str] = Field(None, max_length=11, description="CPF (somente números)")
    nome: Optional[str] = Field(None, max_length=200)
    data_nascimento: Optional[date] = None
    nome_mae: Optional[str] = Field(None, max_length=200)
    rg: Optional[str] = Field(None, max_length=20)
    rg_orgao_expedidor: Optional[str] = Field(None, max_length=20)
    rg_data_expedicao: Optional[date] = None

    # Pessoa Jurídica
    cnpj: Optional[str] = Field(None, max_length=14, description="CNPJ (somente números)")
    razao_social: Optional[str] = Field(None, max_length=200)
    nome_fantasia: Optional[str] = Field(None, max_length=200)
    data_abertura: Optional[date] = None
    inscricao_estadual: Optional[str] = Field(None, max_length=20)
    inscricao_municipal: Optional[str] = Field(None, max_length=20)

    # Contato
    email: Optional[EmailStr] = None
    telefone: Optional[str] = Field(None, max_length=20)
    celular: Optional[str] = Field(None, max_length=20)

    # Observações
    observacoes: Optional[str] = None

    @field_validator('cpf')
    @classmethod
    def validar_cpf(cls, v):
        if v and len(v) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        return v

    @field_validator('cnpj')
    @classmethod
    def validar_cnpj(cls, v):
        if v and len(v) != 14:
            raise ValueError('CNPJ deve ter 14 dígitos')
        return v


class PessoaCreate(PessoaBase):
    """Schema para criação de pessoa"""
    pass


class PessoaUpdate(BaseModel):
    """Schema para atualização de pessoa"""
    email: Optional[EmailStr] = None
    telefone: Optional[str] = Field(None, max_length=20)
    celular: Optional[str] = Field(None, max_length=20)
    observacoes: Optional[str] = None


class PessoaResponse(PessoaBase):
    """Schema de resposta de pessoa"""
    id: UUID
    situacao_cadastral: str
    data_situacao: date
    created_at: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)


class PessoaComEnderecos(PessoaResponse):
    """Schema de pessoa com endereços"""
    enderecos: list[EnderecoResponse] = []


# =====================================================
# IMÓVEL
# =====================================================

class ImovelTerrenoBase(SchemaBase):
    """Schema base para terreno"""
    area_terreno: Decimal = Field(..., ge=0, description="Área do terreno em m²")
    testada_principal: Optional[Decimal] = Field(None, ge=0)
    testada_secundaria: Optional[Decimal] = Field(None, ge=0)
    profundidade: Optional[Decimal] = Field(None, ge=0)
    topografia: Optional[str] = Field(None, max_length=20)
    pedologia: Optional[str] = Field(None, max_length=20)
    situacao_quadra: Optional[str] = Field(None, max_length=20)

    # Infraestrutura
    pavimentacao: bool = False
    meio_fio: bool = False
    calcada: bool = False
    arborizacao: bool = False
    iluminacao_publica: bool = False
    rede_agua: bool = False
    rede_esgoto: bool = False
    rede_eletrica: bool = False
    coleta_lixo: bool = False


class ImovelTerrenoCreate(ImovelTerrenoBase):
    """Schema para criação de terreno"""
    pass


class ImovelTerrenoResponse(ImovelTerrenoBase):
    """Schema de resposta de terreno"""
    id: UUID
    imovel_id: UUID

    model_config = ConfigDict(from_attributes=True)


class ImovelEdificacaoBase(SchemaBase):
    """Schema base para edificação"""
    numero_edificacao: int = Field(default=1, ge=1)
    area_construida: Decimal = Field(..., ge=0, description="Área construída em m²")
    area_privativa: Optional[Decimal] = Field(None, ge=0)
    padrao_construtivo: str = Field(..., max_length=20)
    tipo_estrutura: Optional[str] = Field(None, max_length=20)
    tipo_parede: Optional[str] = Field(None, max_length=20)
    tipo_cobertura: Optional[str] = Field(None, max_length=20)
    numero_pavimentos: int = Field(default=1, ge=1)
    ano_construcao: Optional[int] = Field(None, ge=1900, le=2100)
    estado_conservacao: Optional[str] = Field(None, max_length=20)
    quantidade_quartos: int = Field(default=0, ge=0)
    quantidade_salas: int = Field(default=0, ge=0)
    quantidade_banheiros: int = Field(default=0, ge=0)
    quantidade_vagas_garagem: int = Field(default=0, ge=0)
    tipo_ocupacao: Optional[str] = Field(None, max_length=20)


class ImovelEdificacaoCreate(ImovelEdificacaoBase):
    """Schema para criação de edificação"""
    pass


class ImovelEdificacaoResponse(ImovelEdificacaoBase):
    """Schema de resposta de edificação"""
    id: UUID
    imovel_id: UUID

    model_config = ConfigDict(from_attributes=True)


class ImovelBase(SchemaBase):
    """Schema base para imóvel"""
    inscricao_imobiliaria: str = Field(..., max_length=20, description="Inscrição imobiliária única")
    tipo_imovel: str = Field(..., description="TERRENO, EDIFICADO, TERRITORIAL")
    tipo_uso: str = Field(..., description="Tipo de uso do imóvel")

    # Localização
    logradouro_id: Optional[int] = None
    numero: Optional[str] = Field(None, max_length=10)
    complemento: Optional[str] = Field(None, max_length=100)
    bairro: Optional[str] = Field(None, max_length=100)
    cep: Optional[str] = Field(None, max_length=8)

    # Loteamento
    loteamento_id: Optional[int] = None
    quadra: Optional[str] = Field(None, max_length=10)
    lote: Optional[str] = Field(None, max_length=10)

    # Setor fiscal
    setor_fiscal_id: int = Field(..., description="ID do setor fiscal")

    # Propriedade
    proprietario_id: UUID = Field(..., description="ID do proprietário")
    possuidor_id: Optional[UUID] = None
    dominio_util_id: Optional[UUID] = None

    # Matrícula
    matricula_registro: Optional[str] = Field(None, max_length=50)
    livro: Optional[str] = Field(None, max_length=10)
    folha: Optional[str] = Field(None, max_length=10)
    cartorio: Optional[str] = Field(None, max_length=100)
    data_registro: Optional[date] = None

    # Geo-referenciamento
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None

    # Observações
    observacoes: Optional[str] = None


class ImovelCreate(ImovelBase):
    """Schema para criação de imóvel"""
    terreno: Optional[ImovelTerrenoCreate] = None
    edificacoes: list[ImovelEdificacaoCreate] = []


class ImovelUpdate(BaseModel):
    """Schema para atualização de imóvel"""
    tipo_uso: Optional[str] = None
    numero: Optional[str] = Field(None, max_length=10)
    complemento: Optional[str] = Field(None, max_length=100)
    observacoes: Optional[str] = None


class ImovelResponse(ImovelBase):
    """Schema de resposta de imóvel"""
    id: UUID
    situacao: str
    data_cadastro: date
    data_situacao: date

    model_config = ConfigDict(from_attributes=True)


class ImovelCompleto(ImovelResponse):
    """Schema de imóvel completo com relações"""
    terreno: Optional[ImovelTerrenoResponse] = None
    edificacoes: list[ImovelEdificacaoResponse] = []


# =====================================================
# ESTABELECIMENTO
# =====================================================

class EstabelecimentoBase(SchemaBase):
    """Schema base para estabelecimento"""
    inscricao_municipal: str = Field(..., max_length=20, description="Inscrição Municipal (CCM)")
    pessoa_id: UUID = Field(..., description="ID da pessoa jurídica")
    nome_fantasia: Optional[str] = Field(None, max_length=200)
    data_inicio_atividade: Optional[date] = None

    # Endereço
    logradouro_id: Optional[int] = None
    numero: Optional[str] = Field(None, max_length=10)
    complemento: Optional[str] = Field(None, max_length=100)
    bairro: Optional[str] = Field(None, max_length=100)
    cep: Optional[str] = Field(None, max_length=8)

    # CNAE
    cnae_principal: Optional[str] = Field(None, max_length=10)
    cnaes_secundarios: Optional[list] = None
    atividades: Optional[list] = None

    # Regime de ISSQN
    regime_issqn: Optional[str] = Field(None, max_length=20)
    area_ocupada: Optional[Decimal] = Field(None, ge=0)
    observacoes: Optional[str] = None


class EstabelecimentoCreate(EstabelecimentoBase):
    """Schema para criação de estabelecimento"""
    pass


class EstabelecimentoUpdate(BaseModel):
    """Schema para atualização de estabelecimento"""
    nome_fantasia: Optional[str] = Field(None, max_length=200)
    regime_issqn: Optional[str] = Field(None, max_length=20)
    area_ocupada: Optional[Decimal] = Field(None, ge=0)
    observacoes: Optional[str] = None


class EstabelecimentoResponse(EstabelecimentoBase):
    """Schema de resposta de estabelecimento"""
    id: UUID
    situacao: str
    data_situacao: date

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# LOGRADOURO
# =====================================================

class LogradouroBase(SchemaBase):
    """Schema base para logradouro"""
    tipo: str = Field(..., description="Tipo de logradouro")
    nome: str = Field(..., max_length=200)
    bairro: Optional[str] = Field(None, max_length=100)
    cep: Optional[str] = Field(None, max_length=8)
    setor_fiscal_id: Optional[int] = None


class LogradouroCreate(LogradouroBase):
    """Schema para criação de logradouro"""
    pass


class LogradouroResponse(LogradouroBase):
    """Schema de resposta de logradouro"""
    id: int

    model_config = ConfigDict(from_attributes=True)
