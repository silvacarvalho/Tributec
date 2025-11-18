"""
Schemas base e comuns
"""
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class SchemaBase(BaseModel):
    """Schema base com configurações comuns"""
    model_config = ConfigDict(from_attributes=True)


class ResponseBase(BaseModel):
    """Resposta padrão da API"""
    sucesso: bool = True
    mensagem: str = "Operação realizada com sucesso"
    dados: Optional[dict] = None


class PaginacaoParams(BaseModel):
    """Parâmetros de paginação"""
    pagina: int = Field(default=1, ge=1, description="Número da página")
    limite: int = Field(default=20, ge=1, le=100, description="Itens por página")
    ordenar_por: Optional[str] = Field(default=None, description="Campo para ordenação")
    ordem: Optional[str] = Field(default="asc", description="Ordem: asc ou desc")


class ResponsePaginado(BaseModel):
    """Resposta paginada da API"""
    sucesso: bool = True
    mensagem: str = "Dados recuperados com sucesso"
    dados: list
    paginacao: dict = Field(
        default_factory=lambda: {
            "pagina_atual": 1,
            "total_paginas": 1,
            "total_itens": 0,
            "itens_por_pagina": 20
        }
    )
