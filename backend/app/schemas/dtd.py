"""
Schemas para Domicílio Tributário Digital (DTD)
"""
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID


# ==================== DTD - Domicílio Tributário Digital ====================

class DomicilioTributarioDigitalBase(BaseModel):
    """Schema base para DTD"""
    email_principal: EmailStr
    emails_alternativos: Optional[List[EmailStr]] = Field(default_factory=list)
    notificar_lancamentos: bool = True
    notificar_vencimentos: bool = True
    notificar_protestos: bool = True
    notificar_avisos: bool = True


class DomicilioTributarioDigitalCreate(DomicilioTributarioDigitalBase):
    """Schema para criação de DTD"""
    contribuinte_id: UUID


class DomicilioTributarioDigitalUpdate(BaseModel):
    """Schema para atualização de DTD"""
    email_principal: Optional[EmailStr] = None
    emails_alternativos: Optional[List[EmailStr]] = None
    notificar_lancamentos: Optional[bool] = None
    notificar_vencimentos: Optional[bool] = None
    notificar_protestos: Optional[bool] = None
    notificar_avisos: Optional[bool] = None
    ativo: Optional[bool] = None


class DomicilioTributarioDigitalResponse(DomicilioTributarioDigitalBase):
    """Schema de resposta para DTD"""
    id: UUID
    contribuinte_id: UUID
    ativo: bool
    data_ativacao: Optional[date]
    data_desativacao: Optional[date]
    created_at: datetime
    updated_at: Optional[datetime]

    # Informações do contribuinte (opcional)
    contribuinte_nome: Optional[str] = None
    contribuinte_cpf: Optional[str] = None
    contribuinte_cnpj: Optional[str] = None

    class Config:
        from_attributes = True


class DomicilioTributarioDigitalListResponse(BaseModel):
    """Response para listagem paginada de DTDs"""
    itens: List[DomicilioTributarioDigitalResponse]
    total: int
    pagina: int
    limite: int
    total_paginas: int
    tem_proxima: bool
    tem_anterior: bool


# ==================== DTD Mensagem ====================

class DTDMensagemBase(BaseModel):
    """Schema base para mensagem do DTD"""
    assunto: str = Field(..., min_length=1, max_length=200)
    conteudo: str = Field(..., min_length=1)
    tipo_mensagem: str = Field(
        ...,
        description="NOTIFICACAO, ALERTA, LANCAMENTO, VENCIMENTO, COBRANCA, PROTESTO"
    )
    prioridade: str = Field(default="NORMAL", description="ALTA, NORMAL, BAIXA")
    anexos: Optional[List[dict]] = Field(default_factory=list)


class DTDMensagemCreate(DTDMensagemBase):
    """Schema para criação de mensagem do DTD"""
    domicilio_id: UUID


class DTDMensagemCreateByContribuinte(DTDMensagemBase):
    """Schema para criação de mensagem usando ID do contribuinte"""
    contribuinte_id: UUID


class DTDMensagemUpdate(BaseModel):
    """Schema para atualização de mensagem do DTD"""
    lida: Optional[bool] = None


class DTDMensagemResponse(DTDMensagemBase):
    """Schema de resposta para mensagem do DTD"""
    id: UUID
    domicilio_id: UUID
    data_envio: datetime
    lida: bool
    data_leitura: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class DTDMensagemListResponse(BaseModel):
    """Response para listagem paginada de mensagens"""
    itens: List[DTDMensagemResponse]
    total: int
    pagina: int
    limite: int
    total_paginas: int
    tem_proxima: bool
    tem_anterior: bool
    total_nao_lidas: int  # Total de mensagens não lidas


# ==================== Estatísticas ====================

class DTDEstatisticas(BaseModel):
    """Estatísticas do DTD"""
    total_mensagens: int
    mensagens_nao_lidas: int
    mensagens_por_tipo: dict
    mensagens_por_prioridade: dict
    ultima_mensagem: Optional[datetime]


# ==================== Envio em lote ====================

class DTDEnvioLoteRequest(BaseModel):
    """Request para envio de mensagens em lote"""
    contribuintes_ids: List[UUID] = Field(..., min_items=1)
    assunto: str = Field(..., min_length=1, max_length=200)
    conteudo: str = Field(..., min_length=1)
    tipo_mensagem: str
    prioridade: str = "NORMAL"
    anexos: Optional[List[dict]] = None


class DTDEnvioLoteResponse(BaseModel):
    """Response do envio em lote"""
    total_enviados: int
    total_erros: int
    mensagens_enviadas: List[UUID]
    erros: List[dict]
