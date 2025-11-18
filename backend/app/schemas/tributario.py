"""
Schemas do Módulo Tributário
IPTU, ITBI, ISSQN, Isenções
"""
from datetime import date
from typing import Optional
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.schemas.base import SchemaBase


# =====================================================
# IPTU
# =====================================================

class IPTULancamentoBase(SchemaBase):
    """Schema base para lançamento de IPTU"""
    imovel_id: UUID = Field(..., description="ID do imóvel")
    ano_exercicio: int = Field(..., ge=2000, le=2100, description="Ano do exercício fiscal")


class IPTUCalculoRequest(BaseModel):
    """Request para cálculo de IPTU"""
    imovel_id: UUID
    ano_exercicio: int = Field(..., ge=2000, le=2100)
    numero_parcelas: int = Field(default=1, ge=1, le=12, description="Número de parcelas (1 a 12)")
    pagamento_unico: bool = Field(default=False, description="Pagamento em cota única (10% desconto)")
    iptu_digital: bool = Field(default=False, description="Adesão ao IPTU Digital (2% desconto)")


class IPTUCalculoResponse(SchemaBase):
    """Resposta do cálculo de IPTU"""
    # Valores Venais
    valor_venal_terreno: Decimal
    valor_venal_edificacao: Decimal
    valor_venal_total: Decimal

    # Fatores
    fator_correcao_terreno: Decimal
    fator_correcao_edificacao: Decimal
    fatores_aplicados: Optional[dict] = None

    # Alíquota
    aliquota_aplicada: Decimal
    tipo_uso_calculo: str

    # Valor do IPTU
    valor_iptu: Decimal

    # Descontos
    desconto_pagamento_unico: Decimal = Decimal("0.00")
    desconto_iptu_digital: Decimal = Decimal("0.00")
    desconto_anos_anteriores: Decimal = Decimal("0.00")
    percentual_desconto_anos: int = 0

    # Valor líquido
    valor_liquido: Decimal

    # Parcelamento
    numero_parcelas: int
    valor_parcela: Decimal

    model_config = ConfigDict(from_attributes=True)


class IPTULancamentoCreate(IPTULancamentoBase):
    """Schema para criação de lançamento de IPTU"""
    numero_parcelas: int = Field(default=1, ge=1, le=12)
    pagamento_unico: bool = Field(default=False)
    iptu_digital: bool = Field(default=False)


class IPTULancamentoResponse(SchemaBase):
    """Schema de resposta de lançamento de IPTU"""
    id: UUID
    imovel_id: UUID
    ano_exercicio: int
    numero_lancamento: str
    data_lancamento: date

    # Valores Venais
    valor_venal_terreno: Decimal
    valor_venal_edificacao: Decimal
    valor_venal_total: Decimal

    # Alíquota e Tipo
    aliquota_aplicada: Decimal
    tipo_uso_calculo: str

    # Valor do IPTU
    valor_iptu: Decimal
    valor_liquido: Decimal

    # Parcelamento
    numero_parcelas: int
    valor_parcela: Decimal

    # Vencimentos
    data_vencimento_unico: Optional[date] = None
    data_vencimento_primeira_parcela: Optional[date] = None

    # Status
    status: str

    model_config = ConfigDict(from_attributes=True)


class IPTUParcelaResponse(SchemaBase):
    """Schema de resposta de parcela de IPTU"""
    id: UUID
    lancamento_id: UUID
    numero_parcela: int
    valor_principal: Decimal
    valor_juros: Decimal
    valor_multa: Decimal
    valor_correcao: Decimal
    valor_total: Decimal
    data_vencimento: date
    pago: bool
    data_pagamento: Optional[date] = None
    valor_pago: Optional[Decimal] = None

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# ITBI
# =====================================================

class ITBIGuiaBase(SchemaBase):
    """Schema base para guia de ITBI"""
    imovel_id: UUID = Field(..., description="ID do imóvel")
    transmitente_id: UUID = Field(..., description="ID do transmitente (vendedor/doador)")
    adquirente_id: UUID = Field(..., description="ID do adquirente (comprador)")
    tipo_transmissao: str = Field(..., max_length=50, description="Tipo de transmissão")
    valor_declarado: Decimal = Field(..., ge=0, description="Valor declarado na transação")
    valor_financiado_sfh: Decimal = Field(default=Decimal("0.00"), ge=0, description="Valor financiado pelo SFH")


class ITBICalculoRequest(BaseModel):
    """Request para cálculo de ITBI"""
    imovel_id: UUID
    valor_declarado: Decimal = Field(..., ge=0)
    valor_financiado_sfh: Decimal = Field(default=Decimal("0.00"), ge=0)
    tipo_transmissao: str


class ITBICalculoResponse(SchemaBase):
    """Resposta do cálculo de ITBI"""
    valor_declarado: Decimal
    valor_venal: Decimal
    valor_base_calculo: Decimal
    valor_financiado_sfh: Decimal
    valor_nao_financiado: Decimal
    aliquota_sfh: Decimal
    aliquota_normal: Decimal
    valor_itbi_sfh: Decimal
    valor_itbi_normal: Decimal
    valor_itbi_total: Decimal
    valor_isencao: Decimal = Decimal("0.00")
    valor_liquido: Decimal

    model_config = ConfigDict(from_attributes=True)


class ITBIGuiaCreate(ITBIGuiaBase):
    """Schema para criação de guia de ITBI"""
    pass


class ITBIGuiaResponse(ITBIGuiaBase):
    """Schema de resposta de guia de ITBI"""
    id: UUID
    numero_guia: str
    data_emissao: date
    valor_venal: Decimal
    valor_base_calculo: Decimal
    valor_nao_financiado: Decimal
    aliquota_sfh: Decimal
    aliquota_normal: Decimal
    valor_itbi_sfh: Decimal
    valor_itbi_normal: Decimal
    valor_itbi_total: Decimal
    valor_liquido: Decimal
    data_vencimento: date
    pago: bool
    data_pagamento: Optional[date] = None
    status: str

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# ISSQN
# =====================================================

class ISSQNDeclaracaoBase(SchemaBase):
    """Schema base para declaração de ISSQN"""
    estabelecimento_id: UUID = Field(..., description="ID do estabelecimento")
    mes_competencia: int = Field(..., ge=1, le=12, description="Mês de competência")
    ano_competencia: int = Field(..., ge=2000, le=2100, description="Ano de competência")
    regime_tributacao: str = Field(..., max_length=30, description="Regime de tributação")


class ISSQNDeclaracaoCreate(ISSQNDeclaracaoBase):
    """Schema para criação de declaração de ISSQN"""
    receita_bruta_total: Decimal = Field(default=Decimal("0.00"), ge=0)
    deducoes_materiais: Decimal = Field(default=Decimal("0.00"), ge=0)
    outras_deducoes: Decimal = Field(default=Decimal("0.00"), ge=0)
    valor_retido_terceiros: Decimal = Field(default=Decimal("0.00"), ge=0)

    # Para regime fixo
    valor_fixo_ufm: Optional[Decimal] = Field(None, ge=0)
    quantidade_profissionais: Optional[int] = Field(None, ge=1)


class ISSQNCalculoRequest(BaseModel):
    """Request para cálculo de ISSQN"""
    estabelecimento_id: UUID
    mes_competencia: int = Field(..., ge=1, le=12)
    ano_competencia: int = Field(..., ge=2000, le=2100)
    receita_bruta_total: Decimal = Field(..., ge=0)
    deducoes_materiais: Decimal = Field(default=Decimal("0.00"), ge=0)
    outras_deducoes: Decimal = Field(default=Decimal("0.00"), ge=0)
    valor_retido_terceiros: Decimal = Field(default=Decimal("0.00"), ge=0)


class ISSQNCalculoResponse(SchemaBase):
    """Resposta do cálculo de ISSQN"""
    receita_bruta_total: Decimal
    deducoes_materiais: Decimal
    outras_deducoes: Decimal
    base_calculo: Decimal
    aliquota: Decimal
    valor_issqn: Decimal
    valor_retido_terceiros: Decimal
    valor_a_recolher: Decimal

    model_config = ConfigDict(from_attributes=True)


class ISSQNDeclaracaoResponse(ISSQNDeclaracaoBase):
    """Schema de resposta de declaração de ISSQN"""
    id: UUID
    numero_declaracao: str
    data_declaracao: date
    receita_bruta_total: Decimal
    deducoes_materiais: Decimal
    outras_deducoes: Decimal
    base_calculo: Decimal
    aliquota: Decimal
    valor_issqn: Decimal
    valor_retido_terceiros: Decimal
    valor_a_recolher: Decimal
    data_vencimento: date
    pago: bool
    data_pagamento: Optional[date] = None
    status: str

    model_config = ConfigDict(from_attributes=True)


class ISSQNRetencaoBase(SchemaBase):
    """Schema base para retenção de ISSQN"""
    tomador_id: UUID = Field(..., description="ID do tomador (responsável pela retenção)")
    prestador_id: UUID = Field(..., description="ID do prestador")
    mes_competencia: int = Field(..., ge=1, le=12)
    ano_competencia: int = Field(..., ge=2000, le=2100)
    valor_servico: Decimal = Field(..., ge=0)
    codigo_servico: Optional[str] = Field(None, max_length=10)


class ISSQNRetencaoCreate(ISSQNRetencaoBase):
    """Schema para criação de retenção de ISSQN"""
    pass


class ISSQNRetencaoResponse(ISSQNRetencaoBase):
    """Schema de resposta de retenção de ISSQN"""
    id: UUID
    numero_retencao: str
    data_retencao: date
    aliquota: Decimal
    valor_issqn_retido: Decimal
    data_vencimento: date
    recolhido: bool
    data_recolhimento: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# ISENÇÕES
# =====================================================

class IsencaoBase(SchemaBase):
    """Schema base para isenção"""
    beneficiario_id: UUID = Field(..., description="ID do beneficiário")
    tipo_tributo: str = Field(..., description="Tipo de tributo")
    tipo_isencao: str = Field(..., description="TOTAL ou PARCIAL")
    percentual_isencao: Decimal = Field(default=Decimal("100.00"), ge=0, le=100)
    fundamento_legal: str = Field(..., max_length=200, description="Base legal da isenção")
    artigo_lei: Optional[str] = Field(None, max_length=50)
    motivo: str = Field(..., max_length=100)
    descricao_motivo: Optional[str] = None
    data_inicio: date = Field(..., description="Data de início da isenção")
    data_fim: Optional[date] = None
    imovel_id: Optional[UUID] = None
    estabelecimento_id: Optional[UUID] = None


class IsencaoCreate(IsencaoBase):
    """Schema para criação de isenção"""
    documentos_anexos: Optional[list] = None


class IsencaoUpdate(BaseModel):
    """Schema para atualização de isenção"""
    data_fim: Optional[date] = None
    ativa: Optional[bool] = None
    motivo_cancelamento: Optional[str] = None


class IsencaoResponse(IsencaoBase):
    """Schema de resposta de isenção"""
    id: UUID
    numero_processo: str
    data_solicitacao: date
    data_aprovacao: Optional[date] = None
    ativa: bool
    data_cancelamento: Optional[date] = None
    motivo_cancelamento: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# PLANTA GENÉRICA DE VALORES
# =====================================================

class PlantaGenericaValorBase(SchemaBase):
    """Schema base para Planta Genérica de Valores"""
    setor_fiscal_id: int = Field(..., description="ID do setor fiscal")
    ano_vigencia: int = Field(..., ge=2000, le=2100)
    data_inicio_vigencia: date
    data_fim_vigencia: Optional[date] = None
    valor_m2_terreno: Decimal = Field(..., ge=0, description="Valor do m² de terreno")
    ativa: bool = True
    observacoes: Optional[str] = None


class PlantaGenericaValorCreate(PlantaGenericaValorBase):
    """Schema para criação de PGV"""
    pass


class PlantaGenericaValorResponse(PlantaGenericaValorBase):
    """Schema de resposta de PGV"""
    id: int

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# TABELA DE PREÇO DE CONSTRUÇÃO
# =====================================================

class TabelaPrecoConstrucaoBase(SchemaBase):
    """Schema base para Tabela de Preço de Construção"""
    ano_vigencia: int = Field(..., ge=2000, le=2100)
    mes_vigencia: int = Field(..., ge=1, le=12)
    data_inicio_vigencia: date
    data_fim_vigencia: Optional[date] = None
    padrao_construtivo: str = Field(..., max_length=20)
    valor_m2_edificacao: Decimal = Field(..., ge=0)
    cub_referencia: Optional[Decimal] = Field(None, ge=0)
    ativa: bool = True
    observacoes: Optional[str] = None


class TabelaPrecoConstrucaoCreate(TabelaPrecoConstrucaoBase):
    """Schema para criação de TPC"""
    pass


class TabelaPrecoConstrucaoResponse(TabelaPrecoConstrucaoBase):
    """Schema de resposta de TPC"""
    id: int

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# ALÍQUOTAS
# =====================================================

class AliquotaBase(SchemaBase):
    """Schema base para alíquota"""
    tipo_tributo: str = Field(..., description="Tipo de tributo")
    categoria: Optional[str] = Field(None, max_length=50)
    valor_minimo: Optional[Decimal] = Field(None, ge=0)
    valor_maximo: Optional[Decimal] = Field(None, ge=0)
    aliquota: Decimal = Field(..., ge=0, le=1, description="Alíquota em decimal")
    ano_vigencia: int = Field(..., ge=2000, le=2100)
    data_inicio_vigencia: date
    data_fim_vigencia: Optional[date] = None
    ativa: bool = True
    observacoes: Optional[str] = None


class AliquotaCreate(AliquotaBase):
    """Schema para criação de alíquota"""
    pass


class AliquotaResponse(AliquotaBase):
    """Schema de resposta de alíquota"""
    id: int

    model_config = ConfigDict(from_attributes=True)
