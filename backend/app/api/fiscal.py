"""
API do Módulo Fiscal
Autos de Infração, Catálogo de Infrações, Intimações, etc.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from uuid import UUID
from decimal import Decimal

from app.db.session import get_db
from app.schemas.fiscal import (
    # Catálogo
    CatalogoInfracaoCreate,
    CatalogoInfracaoUpdate,
    CatalogoInfracaoResponse,
    ListaCatalogoResponse,
    # Auto de Infração
    AutoInfracaoCreate,
    AutoInfracaoUpdate,
    AutoInfracaoResponse,
    ListaAutosResponse,
    AutoInfracaoFiltros,
    NotificacaoAutoCreate,
    DefesaAutoCreate,
    PagamentoAutoCreate,
    # Ordem de Fiscalização
    OrdemFiscalizacaoCreate,
    OrdemFiscalizacaoUpdate,
    OrdemFiscalizacaoResponse,
    # Intimação
    IntimacaoCreate,
    IntimacaoUpdate,
    IntimacaoResponse,
    # Regime Especial
    RegimeEspecialCreate,
    RegimeEspecialUpdate,
    RegimeEspecialResponse
)
from app.services.fiscal_service import FiscalService

router = APIRouter(prefix="/fiscal", tags=["Fiscal"])


# =====================================================
# CATÁLOGO DE INFRAÇÕES
# =====================================================

@router.get("/catalogo-infracoes", response_model=ListaCatalogoResponse)
def listar_catalogo_infracoes(
    ativo: Optional[bool] = Query(None, description="Filtrar por ativo/inativo"),
    gravidade: Optional[str] = Query(None, description="Filtrar por gravidade"),
    db: Session = Depends(get_db)
):
    """Lista todas as infrações do catálogo"""
    service = FiscalService(db)
    infracoes = service.listar_catalogo_infracoes(ativo, gravidade)

    return {
        "total": len(infracoes),
        "items": infracoes
    }


@router.get("/catalogo-infracoes/codigo/{codigo}", response_model=CatalogoInfracaoResponse)
def obter_infracao_por_codigo(
    codigo: str,
    db: Session = Depends(get_db)
):
    """Busca infração por código"""
    service = FiscalService(db)
    infracao = service.buscar_catalogo_por_codigo(codigo)

    if not infracao:
        raise HTTPException(status_code=404, detail=f"Infração '{codigo}' não encontrada")

    return infracao


@router.post("/catalogo-infracoes", response_model=CatalogoInfracaoResponse, status_code=201)
def criar_catalogo_infracao(
    infracao: CatalogoInfracaoCreate,
    db: Session = Depends(get_db)
):
    """Cria uma nova infração no catálogo"""
    service = FiscalService(db)

    try:
        nova_infracao = service.criar_catalogo_infracao(infracao.dict())
        return nova_infracao
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/catalogo-infracoes/{infracao_id}", response_model=CatalogoInfracaoResponse)
def atualizar_catalogo_infracao(
    infracao_id: int,
    dados: CatalogoInfracaoUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza infração do catálogo"""
    service = FiscalService(db)

    try:
        dados_filtrados = {k: v for k, v in dados.dict().items() if v is not None}
        infracao = service.atualizar_catalogo_infracao(infracao_id, dados_filtrados)
        return infracao
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =====================================================
# AUTOS DE INFRAÇÃO
# =====================================================

@router.get("/autos-infracao", response_model=ListaAutosResponse)
def listar_autos_infracao(
    status: Optional[str] = Query(None, description="Filtrar por status"),
    autuado_id: Optional[UUID] = Query(None, description="Filtrar por autuado"),
    fiscal_id: Optional[UUID] = Query(None, description="Filtrar por fiscal"),
    data_inicio: Optional[date] = Query(None, description="Data inicial"),
    data_fim: Optional[date] = Query(None, description="Data final"),
    db: Session = Depends(get_db)
):
    """Lista autos de infração com filtros"""
    service = FiscalService(db)
    autos = service.listar_autos(status, autuado_id, fiscal_id, data_inicio, data_fim)

    return {
        "total": len(autos),
        "items": autos
    }


@router.get("/autos-infracao/{auto_id}", response_model=AutoInfracaoResponse)
def obter_auto_por_id(
    auto_id: UUID,
    db: Session = Depends(get_db)
):
    """Busca auto de infração por ID"""
    service = FiscalService(db)
    auto = service.buscar_auto_por_id(auto_id)

    if not auto:
        raise HTTPException(status_code=404, detail="Auto de infração não encontrado")

    return auto


@router.get("/autos-infracao/numero/{numero_auto}", response_model=AutoInfracaoResponse)
def obter_auto_por_numero(
    numero_auto: str,
    db: Session = Depends(get_db)
):
    """Busca auto de infração por número"""
    service = FiscalService(db)
    auto = service.buscar_auto_por_numero(numero_auto)

    if not auto:
        raise HTTPException(status_code=404, detail=f"Auto '{numero_auto}' não encontrado")

    return auto


@router.post("/autos-infracao", response_model=AutoInfracaoResponse, status_code=201)
def lavrar_auto_infracao(
    auto: AutoInfracaoCreate,
    db: Session = Depends(get_db)
):
    """
    Lavra um novo auto de infração com cálculo automático da multa

    O sistema:
    - Busca a infração no catálogo pelo código
    - Verifica reincidência do autuado
    - Calcula a multa baseado nos parâmetros do sistema
    - Aplica acréscimos por reincidência se aplicável
    - Gera número sequencial do auto
    """
    service = FiscalService(db)

    try:
        novo_auto = service.lavrar_auto_infracao(auto.dict())
        return novo_auto
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao lavrar auto: {str(e)}")


@router.post("/autos-infracao/{auto_id}/notificar", response_model=AutoInfracaoResponse)
def notificar_auto_infracao(
    auto_id: UUID,
    notificacao: NotificacaoAutoCreate,
    db: Session = Depends(get_db)
):
    """
    Registra notificação do auto de infração

    Define automaticamente a data limite para defesa baseado no parâmetro FISCAL.PRAZOS.DEFESA_AUTO_DIAS
    """
    service = FiscalService(db)

    try:
        auto = service.notificar_auto(
            auto_id,
            notificacao.forma_notificacao,
            notificacao.data_notificacao
        )
        return auto
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/autos-infracao/{auto_id}/defesa", response_model=AutoInfracaoResponse)
def registrar_defesa_auto(
    auto_id: UUID,
    defesa: DefesaAutoCreate,
    db: Session = Depends(get_db)
):
    """Registra apresentação de defesa do auto"""
    service = FiscalService(db)

    try:
        auto = service.registrar_defesa(
            auto_id,
            defesa.argumentacao,
            defesa.data_defesa
        )
        return auto
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/autos-infracao/{auto_id}/julgar-defesa", response_model=AutoInfracaoResponse)
def julgar_defesa_auto(
    auto_id: UUID,
    decisao: str = Query(..., description="DEFERIDO ou INDEFERIDO"),
    motivo: str = Query(..., description="Motivação da decisão"),
    data_decisao: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Julga defesa apresentada"""
    service = FiscalService(db)

    try:
        auto = service.julgar_defesa(auto_id, decisao, motivo, data_decisao)
        return auto
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/autos-infracao/{auto_id}/pagamento", response_model=AutoInfracaoResponse)
def registrar_pagamento_auto(
    auto_id: UUID,
    pagamento: PagamentoAutoCreate,
    db: Session = Depends(get_db)
):
    """Registra pagamento do auto de infração"""
    service = FiscalService(db)

    try:
        auto = service.registrar_pagamento(
            auto_id,
            pagamento.valor_pago,
            pagamento.data_pagamento
        )
        return auto
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/autos-infracao/{auto_id}/cancelar", response_model=AutoInfracaoResponse)
def cancelar_auto_infracao(
    auto_id: UUID,
    motivo: str = Query(..., description="Motivo do cancelamento"),
    db: Session = Depends(get_db)
):
    """Cancela auto de infração"""
    service = FiscalService(db)

    try:
        auto = service.cancelar_auto(auto_id, motivo)
        return auto
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/autos-infracao/{auto_id}", response_model=AutoInfracaoResponse)
def atualizar_auto_infracao(
    auto_id: UUID,
    dados: AutoInfracaoUpdate,
    db: Session = Depends(get_db)
):
    """Atualiza observações ou status do auto"""
    service = FiscalService(db)
    auto = service.buscar_auto_por_id(auto_id)

    if not auto:
        raise HTTPException(status_code=404, detail="Auto não encontrado")

    try:
        dados_filtrados = {k: v for k, v in dados.dict().items() if v is not None}

        for campo, valor in dados_filtrados.items():
            setattr(auto, campo, valor)

        service.db.commit()
        service.db.refresh(auto)
        return auto
    except Exception as e:
        service.db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# =====================================================
# RELATÓRIOS E ESTATÍSTICAS
# =====================================================

@router.get("/autos-infracao/estatisticas/por-status")
def estatisticas_autos_por_status(
    data_inicio: Optional[date] = Query(None),
    data_fim: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Estatísticas de autos por status"""
    service = FiscalService(db)
    autos = service.listar_autos(data_inicio=data_inicio, data_fim=data_fim)

    estatisticas = {}
    for auto in autos:
        status = auto.status.value if hasattr(auto.status, 'value') else auto.status
        estatisticas[status] = estatisticas.get(status, 0) + 1

    return estatisticas


@router.get("/autos-infracao/estatisticas/valores")
def estatisticas_valores_autos(
    data_inicio: Optional[date] = Query(None),
    data_fim: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Estatísticas de valores dos autos"""
    service = FiscalService(db)
    autos = service.listar_autos(data_inicio=data_inicio, data_fim=data_fim)

    total_lavrado = Decimal("0.00")
    total_pago = Decimal("0.00")
    total_cancelado = Decimal("0.00")

    for auto in autos:
        if auto.status.value == "CANCELADO":
            total_cancelado += auto.valor_total
        elif auto.status.value == "PAGO":
            total_pago += auto.valor_pago or Decimal("0.00")
        else:
            total_lavrado += auto.valor_total

    return {
        "total_lavrado": float(total_lavrado),
        "total_pago": float(total_pago),
        "total_cancelado": float(total_cancelado),
        "total_pendente": float(total_lavrado - total_pago)
    }


@router.get("/catalogo-infracoes/mais-aplicadas")
def infracoes_mais_aplicadas(
    limite: int = Query(10, description="Limite de resultados"),
    data_inicio: Optional[date] = Query(None),
    data_fim: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Infrações mais aplicadas"""
    service = FiscalService(db)
    autos = service.listar_autos(data_inicio=data_inicio, data_fim=data_fim)

    contagem = {}
    for auto in autos:
        codigo = auto.codigo_infracao
        if codigo not in contagem:
            contagem[codigo] = {
                "codigo": codigo,
                "descricao": auto.descricao_infracao,
                "quantidade": 0
            }
        contagem[codigo]["quantidade"] += 1

    ranking = sorted(contagem.values(), key=lambda x: x["quantidade"], reverse=True)
    return ranking[:limite]
