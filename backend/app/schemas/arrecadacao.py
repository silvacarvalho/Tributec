from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum


class TipoTributo(str, Enum):
    IPTU = "IPTU"
    ISSQN = "ISSQN"
    ITBI = "ITBI"
    TAXAS = "TAXAS"
    OUTROS = "OUTROS"


class StatusPagamento(str, Enum):
    PENDENTE = "PENDENTE"
    PAGO = "PAGO"
    PARCIAL = "PARCIAL"
    CANCELADO = "CANCELADO"
    VENCIDO = "VENCIDO"


class MeioPagamento(str, Enum):
    DINHEIRO = "DINHEIRO"
    PIX = "PIX"
    BOLETO = "BOLETO"
    CARTAO_CREDITO = "CARTAO_CREDITO"
    CARTAO_DEBITO = "CARTAO_DEBITO"
    TRANSFERENCIA = "TRANSFERENCIA"


# Dashboard Schemas
class DashboardArrecadacaoBase(BaseModel):
    total_arrecadado: Decimal
    total_previsto: Decimal
    taxa_arrecadacao: float
    total_pendente: Decimal
    total_vencido: Decimal


class ArrecadacaoPorTributo(BaseModel):
    tributo: TipoTributo
    arrecadado: Decimal
    previsto: Decimal
    percentual: float
    quantidade_pagamentos: int


class EvolucaoMensal(BaseModel):
    mes: int
    ano: int
    mes_nome: str
    arrecadado: Decimal
    previsto: Decimal
    variacao_percentual: float


class DashboardArrecadacaoResponse(DashboardArrecadacaoBase):
    por_tributo: List[ArrecadacaoPorTributo]
    evolucao_mensal: List[EvolucaoMensal]
    inadimplencia_percentual: float
    total_inadimplentes: int


# Pagamento Schemas
class PagamentoBase(BaseModel):
    contribuinte_id: str
    tipo_tributo: TipoTributo
    valor_principal: Decimal = Field(gt=0, description="Valor principal do tributo")
    valor_juros: Optional[Decimal] = Field(default=Decimal(0), ge=0)
    valor_multa: Optional[Decimal] = Field(default=Decimal(0), ge=0)
    valor_desconto: Optional[Decimal] = Field(default=Decimal(0), ge=0)
    data_vencimento: date
    nosso_numero: Optional[str] = None
    linha_digitavel: Optional[str] = None
    codigo_barras: Optional[str] = None
    observacoes: Optional[str] = None


class PagamentoCreate(PagamentoBase):
    pass


class PagamentoRegistro(BaseModel):
    pagamento_id: str
    meio_pagamento: MeioPagamento
    data_pagamento: datetime
    valor_pago: Decimal = Field(gt=0)
    numero_transacao: Optional[str] = None
    comprovante: Optional[str] = None
    observacoes: Optional[str] = None


class PagamentoResponse(PagamentoBase):
    id: str
    numero_documento: str
    valor_total: Decimal
    status: StatusPagamento
    data_pagamento: Optional[datetime] = None
    meio_pagamento: Optional[MeioPagamento] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PagamentosListResponse(BaseModel):
    itens: List[PagamentoResponse]
    total: int
    skip: int
    limit: int


# PIX Schemas
class PIXCreate(BaseModel):
    pagamento_id: str
    valor: Decimal = Field(gt=0)
    chave_pix: Optional[str] = None  # Se None, usa chave padrão da prefeitura
    validade_minutos: Optional[int] = Field(default=30, ge=5, le=1440)


class PIXResponse(BaseModel):
    id: str
    pagamento_id: str
    qr_code: str  # Base64 da imagem
    qr_code_texto: str  # Código copia e cola
    txid: str  # ID da transação PIX
    valor: Decimal
    data_criacao: datetime
    data_expiracao: datetime
    status: str  # ATIVO, CONCLUIDO, EXPIRADO, CANCELADO
    chave_pix: str

    class Config:
        from_attributes = True


class PIXWebhook(BaseModel):
    """Webhook do Banco Central para confirmação de pagamento PIX"""
    txid: str
    valor: Decimal
    data_pagamento: datetime
    pagador_cpf_cnpj: Optional[str] = None
    pagador_nome: Optional[str] = None
    end_to_end_id: str  # ID único da transação


# Boleto Schemas
class BoletoCreate(BaseModel):
    pagamento_id: str
    valor: Decimal = Field(gt=0)
    data_vencimento: date
    instrucoes: Optional[List[str]] = None
    juros_dia: Optional[Decimal] = Field(default=Decimal(0), ge=0)
    multa_apos_vencimento: Optional[Decimal] = Field(default=Decimal(0), ge=0)


class BoletoResponse(BaseModel):
    id: str
    pagamento_id: str
    nosso_numero: str
    linha_digitavel: str
    codigo_barras: str
    pdf_base64: Optional[str] = None
    data_vencimento: date
    valor: Decimal
    status: str  # REGISTRADO, PAGO, VENCIDO, CANCELADO
    data_registro: datetime

    class Config:
        from_attributes = True


class BoletoWebhook(BaseModel):
    """Webhook do banco para confirmação de pagamento de boleto"""
    nosso_numero: str
    valor_pago: Decimal
    data_pagamento: datetime
    data_credito: date
    tarifa_cobranca: Optional[Decimal] = None


# Relatórios
class RelatorioArrecadacaoParams(BaseModel):
    data_inicio: date
    data_fim: date
    tipo_tributo: Optional[TipoTributo] = None
    agrupamento: str = Field(default="mensal")  # diario, semanal, mensal, anual

    @validator('agrupamento')
    def validate_agrupamento(cls, v):
        if v not in ['diario', 'semanal', 'mensal', 'anual']:
            raise ValueError('Agrupamento inválido')
        return v


class InadimplenciaDetalhes(BaseModel):
    contribuinte_id: str
    contribuinte_nome: str
    contribuinte_cpf_cnpj: str
    tipo_tributo: TipoTributo
    valor_total: Decimal
    quantidade_debitos: int
    dias_vencido_mais_antigo: int
    score_risco: str  # BAIXO, MEDIO, ALTO, CRITICO


class RelatorioInadimplenciaResponse(BaseModel):
    total_inadimplentes: int
    valor_total: Decimal
    por_faixa_dias: dict  # {0-30: count, 31-60: count, ...}
    por_score: dict  # {BAIXO: count, MEDIO: count, ...}
    devedores: List[InadimplenciaDetalhes]


# Conciliação Bancária
class ConciliacaoItem(BaseModel):
    data_pagamento: date
    valor: Decimal
    nosso_numero: Optional[str] = None
    identificador_transacao: str
    nome_pagador: Optional[str] = None
    cpf_cnpj_pagador: Optional[str] = None


class ConciliacaoRequest(BaseModel):
    data_inicio: date
    data_fim: date
    itens: List[ConciliacaoItem]


class ConciliacaoResultado(BaseModel):
    total_processado: int
    conciliados: int
    nao_encontrados: int
    divergencias: int
    detalhes: List[dict]


# Validadores
@validator('valor_total', pre=True, always=True)
def calcular_valor_total(cls, v, values):
    if 'valor_principal' in values:
        return (
            values.get('valor_principal', Decimal(0)) +
            values.get('valor_juros', Decimal(0)) +
            values.get('valor_multa', Decimal(0)) -
            values.get('valor_desconto', Decimal(0))
        )
    return v
