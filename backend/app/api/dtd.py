"""
Rotas para Domicílio Tributário Digital (DTD)
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.admin import Usuario
from app.schemas.dtd import (
    DomicilioTributarioDigitalCreate,
    DomicilioTributarioDigitalUpdate,
    DomicilioTributarioDigitalResponse,
    DomicilioTributarioDigitalListResponse,
    DTDMensagemCreate,
    DTDMensagemCreateByContribuinte,
    DTDMensagemResponse,
    DTDMensagemListResponse,
    DTDEstatisticas,
    DTDEnvioLoteRequest,
    DTDEnvioLoteResponse,
)
from app.services.dtd_service import DTDService, DTDMensagemService


router = APIRouter(prefix="/dtd", tags=["DTD - Domicílio Tributário Digital"])


# ==================== DTD - CRUD ====================

@router.post("", response_model=DomicilioTributarioDigitalResponse, status_code=status.HTTP_201_CREATED)
def criar_dtd(
    dtd_data: DomicilioTributarioDigitalCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Cria um novo Domicílio Tributário Digital (DTD)

    - **contribuinte_id**: ID do contribuinte
    - **email_principal**: Email principal para notificações
    - **emails_alternativos**: Lista de emails alternativos (opcional)
    - **notificar_***: Preferências de notificação
    """
    return DTDService.criar_dtd(db, dtd_data)


@router.get("/{dtd_id}", response_model=DomicilioTributarioDigitalResponse)
def obter_dtd(
    dtd_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtém um DTD por ID"""
    return DTDService.obter_dtd(db, dtd_id)


@router.get("/contribuinte/{contribuinte_id}", response_model=DomicilioTributarioDigitalResponse)
def obter_dtd_por_contribuinte(
    contribuinte_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtém o DTD de um contribuinte específico"""
    dtd = DTDService.obter_dtd_por_contribuinte(db, contribuinte_id)
    if not dtd:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribuinte não possui DTD cadastrado"
        )
    return dtd


@router.get("", response_model=DomicilioTributarioDigitalListResponse)
def listar_dtds(
    skip: int = 0,
    limit: int = 20,
    busca: Optional[str] = None,
    ativo: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Lista DTDs com paginação e filtros

    - **skip**: Offset para paginação
    - **limit**: Limite de registros por página
    - **busca**: Busca por nome, email, CPF ou CNPJ
    - **ativo**: Filtrar por status (ativo/inativo)
    """
    return DTDService.listar_dtds(db, skip, limit, busca, ativo)


@router.put("/{dtd_id}", response_model=DomicilioTributarioDigitalResponse)
def atualizar_dtd(
    dtd_id: UUID,
    dtd_data: DomicilioTributarioDigitalUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Atualiza um DTD"""
    return DTDService.atualizar_dtd(db, dtd_id, dtd_data)


@router.delete("/{dtd_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_dtd(
    dtd_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Exclui um DTD"""
    DTDService.excluir_dtd(db, dtd_id)
    return None


# ==================== DTD Mensagens ====================

@router.post("/mensagens", response_model=DTDMensagemResponse, status_code=status.HTTP_201_CREATED)
def criar_mensagem(
    mensagem_data: DTDMensagemCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Cria uma nova mensagem no DTD

    - **domicilio_id**: ID do DTD
    - **assunto**: Assunto da mensagem
    - **conteudo**: Conteúdo da mensagem
    - **tipo_mensagem**: NOTIFICACAO, ALERTA, LANCAMENTO, VENCIMENTO, etc.
    - **prioridade**: ALTA, NORMAL, BAIXA
    - **anexos**: Lista de anexos (opcional)
    """
    return DTDMensagemService.criar_mensagem(db, mensagem_data)


@router.post("/mensagens/por-contribuinte", response_model=DTDMensagemResponse, status_code=status.HTTP_201_CREATED)
def criar_mensagem_por_contribuinte(
    mensagem_data: DTDMensagemCreateByContribuinte,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Cria uma mensagem usando o ID do contribuinte

    Busca o DTD do contribuinte automaticamente
    """
    return DTDMensagemService.criar_mensagem_por_contribuinte(db, mensagem_data)


@router.get("/mensagens/domicilio/{domicilio_id}", response_model=DTDMensagemListResponse)
def listar_mensagens_dtd(
    domicilio_id: UUID,
    skip: int = 0,
    limit: int = 20,
    tipo_mensagem: Optional[str] = None,
    lida: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Lista mensagens de um DTD

    - **domicilio_id**: ID do DTD
    - **skip**: Offset para paginação
    - **limit**: Limite de registros por página
    - **tipo_mensagem**: Filtrar por tipo
    - **lida**: Filtrar por status de leitura
    """
    return DTDMensagemService.listar_mensagens(db, domicilio_id, skip, limit, tipo_mensagem, lida)


@router.get("/mensagens/{mensagem_id}", response_model=DTDMensagemResponse)
def obter_mensagem(
    mensagem_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtém uma mensagem por ID"""
    return DTDMensagemService.obter_mensagem(db, mensagem_id)


@router.patch("/mensagens/{mensagem_id}/marcar-lida", response_model=DTDMensagemResponse)
def marcar_mensagem_lida(
    mensagem_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Marca uma mensagem como lida"""
    return DTDMensagemService.marcar_como_lida(db, mensagem_id)


@router.get("/estatisticas/{domicilio_id}", response_model=DTDEstatisticas)
def obter_estatisticas_dtd(
    domicilio_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtém estatísticas de um DTD

    - Total de mensagens
    - Mensagens não lidas
    - Distribuição por tipo
    - Distribuição por prioridade
    - Data da última mensagem
    """
    return DTDMensagemService.obter_estatisticas(db, domicilio_id)


@router.post("/mensagens/enviar-lote", response_model=DTDEnvioLoteResponse)
def enviar_mensagem_lote(
    lote_data: DTDEnvioLoteRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Envia mensagem para múltiplos contribuintes

    - **contribuintes_ids**: Lista de IDs dos contribuintes
    - **assunto**: Assunto da mensagem
    - **conteudo**: Conteúdo da mensagem
    - **tipo_mensagem**: Tipo da mensagem
    - **prioridade**: Prioridade da mensagem

    Retorna o total enviado e lista de erros (se houver)
    """
    return DTDMensagemService.enviar_mensagem_lote(db, lote_data)
