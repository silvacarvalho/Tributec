"""
API de Parâmetros do Sistema
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.db.base import get_db
from app.schemas.fiscal import (
    ParametroSistemaCreate,
    ParametroSistemaUpdate,
    ParametroSistemaResponse,
    ListaParametrosResponse
)
from app.services.parametro_service import ParametroService

router = APIRouter(prefix="/parametros", tags=["Parâmetros"])


@router.get("", response_model=ListaParametrosResponse)
def listar_parametros(
    modulo: Optional[str] = Query(None, description="Filtrar por módulo"),
    categoria: Optional[str] = Query(None, description="Filtrar por categoria"),
    ano: Optional[int] = Query(None, description="Ano de vigência"),
    db: Session = Depends(get_db)
):
    """Lista todos os parâmetros do sistema com filtros opcionais"""
    service = ParametroService(db)

    if modulo:
        parametros = service.listar_por_modulo(modulo, categoria, ano)
    else:
        parametros = service.listar_todos()

    return {
        "total": len(parametros),
        "items": parametros
    }


@router.get("/{parametro_id}", response_model=ParametroSistemaResponse)
def obter_parametro_por_id(
    parametro_id: int,
    db: Session = Depends(get_db)
):
    """Busca parâmetro por ID"""
    service = ParametroService(db)
    parametro = service.buscar_por_id(parametro_id)

    if not parametro:
        raise HTTPException(status_code=404, detail="Parâmetro não encontrado")

    return parametro


@router.get("/chave/{chave}", response_model=ParametroSistemaResponse)
def obter_parametro_por_chave(
    chave: str,
    ano: Optional[int] = Query(None, description="Ano de vigência"),
    db: Session = Depends(get_db)
):
    """Busca parâmetro por chave"""
    service = ParametroService(db)
    parametro = service.obter_parametro_completo(chave, ano)

    if not parametro:
        raise HTTPException(status_code=404, detail=f"Parâmetro '{chave}' não encontrado")

    return parametro


@router.post("", response_model=ParametroSistemaResponse, status_code=201)
def criar_parametro(
    parametro: ParametroSistemaCreate,
    db: Session = Depends(get_db)
):
    """Cria um novo parâmetro"""
    service = ParametroService(db)

    try:
        novo_parametro = service.criar_parametro(parametro.dict())
        return novo_parametro
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{parametro_id}", response_model=ParametroSistemaResponse)
def atualizar_parametro(
    parametro_id: int,
    dados: ParametroSistemaUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza um parâmetro existente"""
    service = ParametroService(db)
    parametro = service.buscar_por_id(parametro_id)

    if not parametro:
        raise HTTPException(status_code=404, detail="Parâmetro não encontrado")

    if not parametro.editavel:
        raise HTTPException(status_code=403, detail="Parâmetro não é editável")

    try:
        # Atualiza apenas o campo de valor correspondente ao tipo
        dados_filtrados = {k: v for k, v in dados.dict().items() if v is not None}

        for campo, valor in dados_filtrados.items():
            setattr(parametro, campo, valor)

        db.commit()
        db.refresh(parametro)
        return parametro
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/modulo/{modulo}", response_model=ListaParametrosResponse)
def listar_parametros_por_modulo(
    modulo: str,
    categoria: Optional[str] = Query(None),
    ano: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Lista parâmetros de um módulo específico"""
    service = ParametroService(db)
    parametros = service.listar_por_modulo(modulo, categoria, ano)

    return {
        "total": len(parametros),
        "items": parametros
    }


# =====================================================
# ATALHOS PARA PARÂMETROS ESPECÍFICOS
# =====================================================

@router.get("/fiscal/ufm-atual")
def obter_ufm_atual(
    ano: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Retorna valor atual da UFM"""
    service = ParametroService(db)
    valor = service.obter_ufm_atual(ano)

    return {
        "ano": ano or date.today().year,
        "valor_ufm": float(valor)
    }


@router.get("/fiscal/prazos")
def obter_prazos_fiscais(db: Session = Depends(get_db)):
    """Retorna todos os prazos fiscais"""
    service = ParametroService(db)

    return {
        "prazo_defesa_dias": service.obter_prazo_defesa(),
        "prazo_recurso_dias": service.obter_prazo_recurso()
    }


@router.get("/tributario/iptu/descontos")
def obter_descontos_iptu(db: Session = Depends(get_db)):
    """Retorna configurações de descontos do IPTU"""
    service = ParametroService(db)

    return {
        "desconto_cota_unica_pct": float(service.obter_desconto_cota_unica_iptu()),
        "vencimento_cota_unica_dia": service.obter_vencimento_cota_unica_iptu()
    }


@router.get("/tributario/itbi/configuracoes")
def obter_configuracoes_itbi(db: Session = Depends(get_db)):
    """Retorna configurações do ITBI"""
    service = ParametroService(db)

    return {
        "aliquota_padrao": float(service.obter_aliquota_itbi()),
        "valor_minimo_ufm": float(service.obter_itbi_minimo_ufm())
    }
