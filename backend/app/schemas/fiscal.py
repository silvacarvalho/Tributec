"""
Schemas Pydantic do Módulo Fiscal
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Any
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID


# =====================================================
# PARÂMETROS DO SISTEMA
# =====================================================

class ParametroSistemaBase(BaseModel):
    modulo: str = Field(..., description="Módulo do sistema")
    categoria: Optional[str] = Field(None, description="Categoria do parâmetro")
    chave: str = Field(..., description="Chave única do parâmetro")
    nome_exibicao: str = Field(..., description="Nome para exibição")
    descricao: str = Field(..., description="Descrição detalhada")
    texto_ajuda: Optional[str] = Field(None, description="Texto de ajuda para UI")
    tipo_valor: str = Field(..., description="Tipo do valor: STRING, INTEGER, DECIMAL, BOOLEAN, DATE, JSON, PERCENT")
    valor_string: Optional[str] = None
    valor_inteiro: Optional[int] = None
    valor_decimal: Optional[Decimal] = None
    valor_booleano: Optional[bool] = None
    valor_data: Optional[date] = None
    valor_json: Optional[Any] = None
    validacoes: Optional[dict] = None
    ano_vigencia: Optional[int] = None
    data_inicio_vigencia: Optional[date] = None
    data_fim_vigencia: Optional[date] = None
    obrigatorio: bool = False
    editavel: bool = True
    ordem_exibicao: int = 0
    base_legal: Optional[str] = None
    observacoes: Optional[str] = None


class ParametroSistemaCreate(ParametroSistemaBase):
    pass


class ParametroSistemaUpdate(BaseModel):
    valor_string: Optional[str] = None
    valor_inteiro: Optional[int] = None
    valor_decimal: Optional[Decimal] = None
    valor_booleano: Optional[bool] = None
    valor_data: Optional[date] = None
    valor_json: Optional[Any] = None
    observacoes: Optional[str] = None


class ParametroSistemaResponse(ParametroSistemaBase):
    id: int
    criado_em: datetime
    atualizado_em: Optional[datetime]

    class Config:
        from_attributes = True


# =====================================================
# CATÁLOGO DE INFRAÇÕES
# =====================================================

class CatalogoInfracaoBase(BaseModel):
    codigo: str = Field(..., description="Código único da infração")
    descricao: str = Field(..., description="Descrição da infração")
    artigo_lei: Optional[str] = Field(None, description="Artigo da lei")
    base_legal: Optional[str] = Field(None, description="Base legal completa")
    tipo_multa: str = Field(..., description="PERCENTUAL, FIXA_UFM, MISTA")
    valor_multa_ufm: Optional[Decimal] = Field(None, description="Valor em UFM")
    percentual_multa: Optional[Decimal] = Field(None, description="Percentual da multa")
    valor_minimo_ufm: Optional[Decimal] = Field(None, description="Valor mínimo em UFM")
    valor_maximo_ufm: Optional[Decimal] = Field(None, description="Valor máximo em UFM")
    gravidade: str = Field(default="MEDIA", description="LEVE, MEDIA, GRAVE, GRAVISSIMA")
    permite_reincidencia: bool = True
    data_inicio_vigencia: date
    data_fim_vigencia: Optional[date] = None
    ativo: bool = True
    observacoes: Optional[str] = None


class CatalogoInfracaoCreate(CatalogoInfracaoBase):
    pass


class CatalogoInfracaoUpdate(BaseModel):
    descricao: Optional[str] = None
    artigo_lei: Optional[str] = None
    base_legal: Optional[str] = None
    tipo_multa: Optional[str] = None
    valor_multa_ufm: Optional[Decimal] = None
    percentual_multa: Optional[Decimal] = None
    valor_minimo_ufm: Optional[Decimal] = None
    valor_maximo_ufm: Optional[Decimal] = None
    gravidade: Optional[str] = None
    permite_reincidencia: Optional[bool] = None
    data_fim_vigencia: Optional[date] = None
    ativo: Optional[bool] = None
    observacoes: Optional[str] = None


class CatalogoInfracaoResponse(CatalogoInfracaoBase):
    id: int
    criado_em: datetime
    atualizado_em: Optional[datetime]

    class Config:
        from_attributes = True


# =====================================================
# AUTO DE INFRAÇÃO
# =====================================================

class AutoInfracaoBase(BaseModel):
    ordem_fiscalizacao_id: Optional[int] = Field(None, description="ID da ordem de fiscalização")
    numero_auto: str = Field(..., description="Número do auto de infração")
    data_lavratura: date = Field(..., description="Data de lavratura")
    codigo_infracao: str = Field(..., description="Código da infração (do catálogo)")
    descricao_infracao: str = Field(..., description="Descrição da infração")
    artigo_lei: str = Field(..., description="Artigo da lei infringida")
    local_infracao: Optional[str] = None
    autuado_id: UUID = Field(..., description="ID do autuado (pessoa)")
    autuado_nome: str
    autuado_cpf_cnpj: str
    fiscal_autuante_id: UUID = Field(..., description="ID do fiscal")
    fiscal_nome: str
    fiscal_matricula: str
    tipo_multa: str = Field(..., description="PERCENTUAL, FIXA_UFM, MISTA")
    valor_base_calculo: Optional[Decimal] = Field(None, description="Valor base para cálculo percentual")
    valor_multa_ufm: Decimal = Field(..., description="Valor da multa em UFM")
    ufm_valor_referencia: Decimal = Field(..., description="Valor da UFM na data da lavratura")
    valor_multa: Decimal = Field(..., description="Valor da multa em R$")
    reincidente: bool = False
    quantidade_reincidencias: int = 0
    acrescimo_reincidencia: Decimal = Decimal("0.00")
    valor_total: Decimal = Field(..., description="Valor total (multa + acréscimos)")
    observacoes: Optional[str] = None


class AutoInfracaoCreate(AutoInfracaoBase):
    pass


class AutoInfracaoUpdate(BaseModel):
    status: Optional[str] = None
    observacoes: Optional[str] = None


class AutoInfracaoResponse(AutoInfracaoBase):
    id: UUID
    status: str
    data_notificacao: Optional[date]
    forma_notificacao: Optional[str]
    data_limite_defesa: Optional[date]
    data_defesa: Optional[date]
    data_decisao_defesa: Optional[date]
    decisao_defesa: Optional[str]
    motivo_decisao: Optional[str]
    data_pagamento: Optional[date]
    valor_pago: Optional[Decimal]
    data_inscricao_divida: Optional[date]
    numero_divida_ativa: Optional[str]
    cancelado: bool
    data_cancelamento: Optional[date]
    motivo_cancelamento: Optional[str]
    criado_em: datetime
    atualizado_em: Optional[datetime]

    class Config:
        from_attributes = True


# =====================================================
# NOTIFICAÇÃO DE AUTO
# =====================================================

class NotificacaoAutoCreate(BaseModel):
    auto_infracao_id: UUID = Field(..., description="ID do auto de infração")
    forma_notificacao: str = Field(..., description="PESSOAL, CORREIOS, EDITAL, EMAIL, DTD")
    data_notificacao: date
    observacoes: Optional[str] = None


class NotificacaoAutoResponse(BaseModel):
    auto_infracao_id: UUID
    forma_notificacao: str
    data_notificacao: date
    data_limite_defesa: date
    observacoes: Optional[str]

    class Config:
        from_attributes = True


# =====================================================
# DEFESA DE AUTO
# =====================================================

class DefesaAutoCreate(BaseModel):
    auto_infracao_id: UUID = Field(..., description="ID do auto de infração")
    data_defesa: date
    argumentacao: str = Field(..., description="Argumentação da defesa")
    documentos_anexos: Optional[List[dict]] = None


class DefesaAutoResponse(BaseModel):
    auto_infracao_id: UUID
    data_defesa: date
    argumentacao: str
    documentos_anexos: Optional[List[dict]]
    data_decisao: Optional[date]
    decisao: Optional[str]
    motivo_decisao: Optional[str]

    class Config:
        from_attributes = True


# =====================================================
# PAGAMENTO DE AUTO
# =====================================================

class PagamentoAutoCreate(BaseModel):
    auto_infracao_id: UUID = Field(..., description="ID do auto de infração")
    data_pagamento: date
    valor_pago: Decimal
    forma_pagamento: str
    comprovante: Optional[str] = None


class PagamentoAutoResponse(BaseModel):
    auto_infracao_id: UUID
    data_pagamento: date
    valor_pago: Decimal
    forma_pagamento: str

    class Config:
        from_attributes = True


# =====================================================
# ORDEM DE FISCALIZAÇÃO
# =====================================================

class OrdemFiscalizacaoBase(BaseModel):
    numero_ordem: str
    fiscal_id: UUID
    fiscal_nome: str
    tipo_fiscalizacao: str = Field(..., description="ROTINA, DENUNCIA, ESPECIAL")
    objetivo: str
    contribuinte_id: Optional[UUID] = None
    contribuinte_nome: Optional[str] = None
    imovel_id: Optional[UUID] = None
    estabelecimento_id: Optional[UUID] = None
    data_inicio: date
    data_fim_prevista: date
    observacoes: Optional[str] = None


class OrdemFiscalizacaoCreate(OrdemFiscalizacaoBase):
    pass


class OrdemFiscalizacaoUpdate(BaseModel):
    status: Optional[str] = None
    data_conclusao: Optional[date] = None
    relatorio: Optional[str] = None
    observacoes: Optional[str] = None


class OrdemFiscalizacaoResponse(OrdemFiscalizacaoBase):
    id: int
    status: str
    data_conclusao: Optional[date]
    relatorio: Optional[str]
    criado_em: datetime
    atualizado_em: Optional[datetime]

    class Config:
        from_attributes = True


# =====================================================
# INTIMAÇÃO
# =====================================================

class IntimacaoBase(BaseModel):
    numero_intimacao: str
    intimado_id: UUID
    intimado_nome: str
    intimado_cpf_cnpj: str
    fiscal_id: UUID
    fiscal_nome: str
    motivo: str
    descricao: str
    prazo_dias: int
    data_intimacao: date
    forma_intimacao: str = Field(..., description="PESSOAL, CORREIOS, EDITAL, EMAIL, DTD")
    observacoes: Optional[str] = None


class IntimacaoCreate(IntimacaoBase):
    pass


class IntimacaoUpdate(BaseModel):
    status: Optional[str] = None
    data_cumprimento: Optional[date] = None
    observacoes_cumprimento: Optional[str] = None


class IntimacaoResponse(IntimacaoBase):
    id: UUID
    status: str
    data_limite: date
    data_cumprimento: Optional[date]
    observacoes_cumprimento: Optional[str]
    criado_em: datetime
    atualizado_em: Optional[datetime]

    class Config:
        from_attributes = True


# =====================================================
# REGIME ESPECIAL DE FISCALIZAÇÃO
# =====================================================

class RegimeEspecialBase(BaseModel):
    numero_regime: str
    contribuinte_id: UUID
    contribuinte_nome: str
    motivo: str
    descricao: str
    data_inicio: date
    prazo_dias: int
    fiscal_responsavel_id: UUID
    fiscal_nome: str
    restricoes: Optional[dict] = None
    observacoes: Optional[str] = None


class RegimeEspecialCreate(RegimeEspecialBase):
    pass


class RegimeEspecialUpdate(BaseModel):
    status: Optional[str] = None
    data_fim: Optional[date] = None
    motivo_encerramento: Optional[str] = None
    observacoes: Optional[str] = None


class RegimeEspecialResponse(RegimeEspecialBase):
    id: UUID
    status: str
    data_fim: Optional[date]
    motivo_encerramento: Optional[str]
    criado_em: datetime
    atualizado_em: Optional[datetime]

    class Config:
        from_attributes = True


# =====================================================
# FILTROS E LISTAGENS
# =====================================================

class AutoInfracaoFiltros(BaseModel):
    status: Optional[str] = None
    autuado_id: Optional[UUID] = None
    fiscal_id: Optional[UUID] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    codigo_infracao: Optional[str] = None
    numero_auto: Optional[str] = None


class ListaAutosResponse(BaseModel):
    total: int
    items: List[AutoInfracaoResponse]


class ListaCatalogoResponse(BaseModel):
    total: int
    items: List[CatalogoInfracaoResponse]


class ListaParametrosResponse(BaseModel):
    total: int
    items: List[ParametroSistemaResponse]
