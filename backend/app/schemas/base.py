"""
Schemas base e comuns
"""
from datetime import datetime, date
from typing import Optional, List, TypeVar, Generic
from pydantic import BaseModel, ConfigDict, Field
from math import ceil

T = TypeVar('T')


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


class PaginacaoMeta(BaseModel):
    """Metadados de paginação"""
    pagina_atual: int
    total_paginas: int
    total_itens: int
    itens_por_pagina: int
    tem_proxima: bool
    tem_anterior: bool


class ResponsePaginado(BaseModel, Generic[T]):
    """Resposta paginada da API"""
    sucesso: bool = True
    mensagem: str = "Dados recuperados com sucesso"
    dados: List[T]
    paginacao: PaginacaoMeta


def criar_resposta_paginada(
    dados: List,
    total: int,
    pagina: int = 1,
    limite: int = 20
) -> dict:
    """
    Cria uma resposta paginada padronizada

    Args:
        dados: Lista de itens da página atual
        total: Total de itens (sem paginação)
        pagina: Número da página atual
        limite: Itens por página

    Returns:
        Dicionário com dados e metadados de paginação
    """
    total_paginas = ceil(total / limite) if limite > 0 else 0

    return {
        "sucesso": True,
        "mensagem": "Dados recuperados com sucesso",
        "dados": dados,
        "paginacao": {
            "pagina_atual": pagina,
            "total_paginas": total_paginas,
            "total_itens": total,
            "itens_por_pagina": limite,
            "tem_proxima": pagina < total_paginas,
            "tem_anterior": pagina > 1
        }
    }
