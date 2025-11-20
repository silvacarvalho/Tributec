"""
API de Pagamentos
Endpoints para PIX, Boleto e Conciliação
"""
from typing import Optional
from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.base import get_db
from app.services.pagamento_service import PagamentoService
from app.models.arrecadacao import StatusPagamento, TipoPagamento


router = APIRouter(prefix="/pagamentos", tags=["Pagamentos"])


# Schemas
class GerarPixRequest(BaseModel):
    debito_id: UUID


class GerarBoletoRequest(BaseModel):
    debito_id: UUID


class ConfirmarPagamentoRequest(BaseModel):
    data_pagamento: Optional[datetime] = None
    comprovante: Optional[str] = None
    txid: Optional[str] = None


class CancelarPagamentoRequest(BaseModel):
    motivo: str


# Endpoints
@router.post("/pix/gerar")
async def gerar_pix(
    request: GerarPixRequest,
    db: Session = Depends(get_db)
):
    """
    Gera QR Code PIX para pagamento de débito

    Returns:
        - qr_code: Imagem QR Code em base64
        - pix_copia_cola: String para copia e cola
        - valor: Valor do pagamento
        - data_vencimento: Validade do PIX (24h)
    """
    service = PagamentoService(db)
    return service.gerar_pix(request.debito_id)


@router.post("/boleto/gerar")
async def gerar_boleto(
    request: GerarBoletoRequest,
    db: Session = Depends(get_db)
):
    """
    Gera boleto bancário para pagamento de débito

    Returns:
        - linha_digitavel: Linha digitável do boleto
        - codigo_barras: Código de barras
        - nosso_numero: Nosso número do boleto
        - valor: Valor do boleto
        - data_vencimento: Data de vencimento
    """
    service = PagamentoService(db)
    return service.gerar_boleto(request.debito_id)


@router.post("/{pagamento_id}/confirmar")
async def confirmar_pagamento(
    pagamento_id: UUID,
    request: ConfirmarPagamentoRequest,
    db: Session = Depends(get_db)
):
    """
    Confirma um pagamento (baixa manual ou webhook)

    Args:
        pagamento_id: ID do pagamento
        data_pagamento: Data do pagamento (opcional)
        comprovante: Número do comprovante (opcional)
        txid: Transaction ID do PIX (opcional)
    """
    service = PagamentoService(db)
    pagamento = service.confirmar_pagamento(
        pagamento_id,
        request.model_dump(exclude_unset=True)
    )

    return {
        "sucesso": True,
        "mensagem": "Pagamento confirmado com sucesso",
        "pagamento_id": str(pagamento.id),
        "status": pagamento.status,
        "data_pagamento": pagamento.data_pagamento,
    }


@router.post("/{pagamento_id}/cancelar")
async def cancelar_pagamento(
    pagamento_id: UUID,
    request: CancelarPagamentoRequest,
    db: Session = Depends(get_db)
):
    """Cancela um pagamento pendente"""
    service = PagamentoService(db)
    pagamento = service.cancelar_pagamento(pagamento_id, request.motivo)

    return {
        "sucesso": True,
        "mensagem": "Pagamento cancelado",
        "pagamento_id": str(pagamento.id),
        "status": pagamento.status,
    }


@router.get("")
async def listar_pagamentos(
    contribuinte_id: Optional[UUID] = None,
    status: Optional[StatusPagamento] = None,
    tipo: Optional[TipoPagamento] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Lista pagamentos com filtros"""
    service = PagamentoService(db)
    pagamentos, total = service.listar_pagamentos(
        contribuinte_id=contribuinte_id,
        status=status,
        tipo=tipo,
        data_inicio=data_inicio,
        data_fim=data_fim,
        skip=skip,
        limit=limit,
    )

    return {
        "dados": [
            {
                "id": str(p.id),
                "tipo_pagamento": p.tipo_pagamento,
                "valor_pago": p.valor_pago,
                "status": p.status,
                "data_pagamento": p.data_pagamento,
                "data_criacao": p.data_criacao,
                "debito_id": str(p.debito_id),
            }
            for p in pagamentos
        ],
        "paginacao": {
            "total_itens": total,
            "itens_por_pagina": limit,
            "pagina_atual": (skip // limit) + 1,
            "total_paginas": (total + limit - 1) // limit,
        }
    }


@router.get("/{pagamento_id}")
async def obter_pagamento(
    pagamento_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtém detalhes de um pagamento"""
    service = PagamentoService(db)
    pagamento = service.db.query(service.db.query(Pagamento).filter(
        service.db.query(Pagamento).id == pagamento_id
    ).first())

    if not pagamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pagamento não encontrado"
        )

    return {
        "id": str(pagamento.id),
        "tipo_pagamento": pagamento.tipo_pagamento,
        "valor_pago": pagamento.valor_pago,
        "status": pagamento.status,
        "data_pagamento": pagamento.data_pagamento,
        "data_vencimento": pagamento.data_vencimento,
        "pix_copia_cola": pagamento.pix_copia_cola,
        "linha_digitavel": pagamento.linha_digitavel,
        "nosso_numero": pagamento.nosso_numero,
        "comprovante": pagamento.comprovante,
        "txid": pagamento.txid,
        "debito_id": str(pagamento.debito_id),
    }
