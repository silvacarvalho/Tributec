"""
Serviços para Domicílio Tributário Digital (DTD)
"""
from datetime import date, datetime
from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_
from fastapi import HTTPException, status

from app.models.admin import DomicilioTributarioDigital, DTDMensagem
from app.models.cadastro import Pessoa
from app.schemas.dtd import (
    DomicilioTributarioDigitalCreate,
    DomicilioTributarioDigitalUpdate,
    DomicilioTributarioDigitalResponse,
    DomicilioTributarioDigitalListResponse,
    DTDMensagemCreate,
    DTDMensagemCreateByContribuinte,
    DTDMensagemUpdate,
    DTDMensagemResponse,
    DTDMensagemListResponse,
    DTDEstatisticas,
    DTDEnvioLoteRequest,
    DTDEnvioLoteResponse,
)


class DTDService:
    """Serviço para gerenciamento do DTD"""

    @staticmethod
    def criar_dtd(db: Session, dtd_data: DomicilioTributarioDigitalCreate) -> DomicilioTributarioDigitalResponse:
        """Cria um novo DTD"""
        # Verificar se contribuinte existe
        contribuinte = db.query(Pessoa).filter(Pessoa.id == dtd_data.contribuinte_id).first()
        if not contribuinte:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contribuinte não encontrado"
            )

        # Verificar se já existe DTD para este contribuinte
        dtd_existente = db.query(DomicilioTributarioDigital).filter(
            DomicilioTributarioDigital.contribuinte_id == dtd_data.contribuinte_id
        ).first()

        if dtd_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Contribuinte já possui DTD cadastrado"
            )

        # Criar DTD
        dtd = DomicilioTributarioDigital(
            contribuinte_id=dtd_data.contribuinte_id,
            email_principal=dtd_data.email_principal,
            emails_alternativos=dtd_data.emails_alternativos or [],
            notificar_lancamentos=dtd_data.notificar_lancamentos,
            notificar_vencimentos=dtd_data.notificar_vencimentos,
            notificar_protestos=dtd_data.notificar_protestos,
            notificar_avisos=dtd_data.notificar_avisos,
            ativo=True,
            data_ativacao=date.today()
        )

        db.add(dtd)
        db.commit()
        db.refresh(dtd)

        # Montar response com dados do contribuinte
        response = DomicilioTributarioDigitalResponse.model_validate(dtd)
        response.contribuinte_nome = contribuinte.nome_razao_social
        response.contribuinte_cpf = contribuinte.cpf
        response.contribuinte_cnpj = contribuinte.cnpj

        return response

    @staticmethod
    def obter_dtd(db: Session, dtd_id: UUID) -> DomicilioTributarioDigitalResponse:
        """Obtém um DTD por ID"""
        dtd = db.query(DomicilioTributarioDigital).filter(
            DomicilioTributarioDigital.id == dtd_id
        ).options(joinedload(DomicilioTributarioDigital.contribuinte)).first()

        if not dtd:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="DTD não encontrado"
            )

        response = DomicilioTributarioDigitalResponse.model_validate(dtd)
        if dtd.contribuinte:
            response.contribuinte_nome = dtd.contribuinte.nome_razao_social
            response.contribuinte_cpf = dtd.contribuinte.cpf
            response.contribuinte_cnpj = dtd.contribuinte.cnpj

        return response

    @staticmethod
    def obter_dtd_por_contribuinte(db: Session, contribuinte_id: UUID) -> Optional[DomicilioTributarioDigitalResponse]:
        """Obtém DTD de um contribuinte"""
        dtd = db.query(DomicilioTributarioDigital).filter(
            DomicilioTributarioDigital.contribuinte_id == contribuinte_id
        ).options(joinedload(DomicilioTributarioDigital.contribuinte)).first()

        if not dtd:
            return None

        response = DomicilioTributarioDigitalResponse.model_validate(dtd)
        if dtd.contribuinte:
            response.contribuinte_nome = dtd.contribuinte.nome_razao_social
            response.contribuinte_cpf = dtd.contribuinte.cpf
            response.contribuinte_cnpj = dtd.contribuinte.cnpj

        return response

    @staticmethod
    def listar_dtds(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        busca: Optional[str] = None,
        ativo: Optional[bool] = None
    ) -> DomicilioTributarioDigitalListResponse:
        """Lista DTDs com paginação e filtros"""
        query = db.query(DomicilioTributarioDigital).options(
            joinedload(DomicilioTributarioDigital.contribuinte)
        )

        # Filtro por status
        if ativo is not None:
            query = query.filter(DomicilioTributarioDigital.ativo == ativo)

        # Busca por nome ou email
        if busca:
            query = query.join(Pessoa).filter(
                or_(
                    Pessoa.nome_razao_social.ilike(f"%{busca}%"),
                    DomicilioTributarioDigital.email_principal.ilike(f"%{busca}%"),
                    Pessoa.cpf.ilike(f"%{busca}%"),
                    Pessoa.cnpj.ilike(f"%{busca}%")
                )
            )

        total = query.count()
        dtds = query.offset(skip).limit(limit).all()

        # Montar responses
        itens = []
        for dtd in dtds:
            response = DomicilioTributarioDigitalResponse.model_validate(dtd)
            if dtd.contribuinte:
                response.contribuinte_nome = dtd.contribuinte.nome_razao_social
                response.contribuinte_cpf = dtd.contribuinte.cpf
                response.contribuinte_cnpj = dtd.contribuinte.cnpj
            itens.append(response)

        pagina_atual = (skip // limit) + 1
        total_paginas = (total + limit - 1) // limit

        return DomicilioTributarioDigitalListResponse(
            itens=itens,
            total=total,
            pagina=pagina_atual,
            limite=limit,
            total_paginas=total_paginas,
            tem_proxima=pagina_atual < total_paginas,
            tem_anterior=pagina_atual > 1
        )

    @staticmethod
    def atualizar_dtd(
        db: Session,
        dtd_id: UUID,
        dtd_data: DomicilioTributarioDigitalUpdate
    ) -> DomicilioTributarioDigitalResponse:
        """Atualiza um DTD"""
        dtd = db.query(DomicilioTributarioDigital).filter(
            DomicilioTributarioDigital.id == dtd_id
        ).first()

        if not dtd:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="DTD não encontrado"
            )

        # Atualizar campos
        update_data = dtd_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "ativo":
                if value and not dtd.ativo:
                    # Reativando
                    dtd.data_ativacao = date.today()
                    dtd.data_desativacao = None
                elif not value and dtd.ativo:
                    # Desativando
                    dtd.data_desativacao = date.today()
            setattr(dtd, field, value)

        db.commit()
        db.refresh(dtd)

        return DTDService.obter_dtd(db, dtd_id)

    @staticmethod
    def excluir_dtd(db: Session, dtd_id: UUID) -> None:
        """Exclui um DTD"""
        dtd = db.query(DomicilioTributarioDigital).filter(
            DomicilioTributarioDigital.id == dtd_id
        ).first()

        if not dtd:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="DTD não encontrado"
            )

        db.delete(dtd)
        db.commit()


class DTDMensagemService:
    """Serviço para gerenciamento de mensagens do DTD"""

    @staticmethod
    def criar_mensagem(db: Session, mensagem_data: DTDMensagemCreate) -> DTDMensagemResponse:
        """Cria uma nova mensagem no DTD"""
        # Verificar se DTD existe
        dtd = db.query(DomicilioTributarioDigital).filter(
            DomicilioTributarioDigital.id == mensagem_data.domicilio_id
        ).first()

        if not dtd:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="DTD não encontrado"
            )

        if not dtd.ativo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="DTD está inativo"
            )

        # Criar mensagem
        mensagem = DTDMensagem(
            domicilio_id=mensagem_data.domicilio_id,
            assunto=mensagem_data.assunto,
            conteudo=mensagem_data.conteudo,
            tipo_mensagem=mensagem_data.tipo_mensagem,
            prioridade=mensagem_data.prioridade,
            anexos=mensagem_data.anexos or []
        )

        db.add(mensagem)
        db.commit()
        db.refresh(mensagem)

        return DTDMensagemResponse.model_validate(mensagem)

    @staticmethod
    def criar_mensagem_por_contribuinte(
        db: Session,
        mensagem_data: DTDMensagemCreateByContribuinte
    ) -> DTDMensagemResponse:
        """Cria mensagem usando ID do contribuinte"""
        # Buscar DTD do contribuinte
        dtd = db.query(DomicilioTributarioDigital).filter(
            DomicilioTributarioDigital.contribuinte_id == mensagem_data.contribuinte_id
        ).first()

        if not dtd:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contribuinte não possui DTD cadastrado"
            )

        # Converter para DTDMensagemCreate
        mensagem_create = DTDMensagemCreate(
            domicilio_id=dtd.id,
            assunto=mensagem_data.assunto,
            conteudo=mensagem_data.conteudo,
            tipo_mensagem=mensagem_data.tipo_mensagem,
            prioridade=mensagem_data.prioridade,
            anexos=mensagem_data.anexos
        )

        return DTDMensagemService.criar_mensagem(db, mensagem_create)

    @staticmethod
    def listar_mensagens(
        db: Session,
        domicilio_id: UUID,
        skip: int = 0,
        limit: int = 20,
        tipo_mensagem: Optional[str] = None,
        lida: Optional[bool] = None
    ) -> DTDMensagemListResponse:
        """Lista mensagens de um DTD"""
        query = db.query(DTDMensagem).filter(DTDMensagem.domicilio_id == domicilio_id)

        # Filtros
        if tipo_mensagem:
            query = query.filter(DTDMensagem.tipo_mensagem == tipo_mensagem)
        if lida is not None:
            query = query.filter(DTDMensagem.lida == lida)

        # Ordenar por data (mais recentes primeiro)
        query = query.order_by(DTDMensagem.data_envio.desc())

        total = query.count()
        mensagens = query.offset(skip).limit(limit).all()

        # Total não lidas
        total_nao_lidas = db.query(func.count(DTDMensagem.id)).filter(
            and_(
                DTDMensagem.domicilio_id == domicilio_id,
                DTDMensagem.lida == False
            )
        ).scalar()

        itens = [DTDMensagemResponse.model_validate(m) for m in mensagens]

        pagina_atual = (skip // limit) + 1
        total_paginas = (total + limit - 1) // limit

        return DTDMensagemListResponse(
            itens=itens,
            total=total,
            pagina=pagina_atual,
            limite=limit,
            total_paginas=total_paginas,
            tem_proxima=pagina_atual < total_paginas,
            tem_anterior=pagina_atual > 1,
            total_nao_lidas=total_nao_lidas or 0
        )

    @staticmethod
    def obter_mensagem(db: Session, mensagem_id: UUID) -> DTDMensagemResponse:
        """Obtém uma mensagem por ID"""
        mensagem = db.query(DTDMensagem).filter(DTDMensagem.id == mensagem_id).first()

        if not mensagem:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mensagem não encontrada"
            )

        return DTDMensagemResponse.model_validate(mensagem)

    @staticmethod
    def marcar_como_lida(db: Session, mensagem_id: UUID) -> DTDMensagemResponse:
        """Marca uma mensagem como lida"""
        mensagem = db.query(DTDMensagem).filter(DTDMensagem.id == mensagem_id).first()

        if not mensagem:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mensagem não encontrada"
            )

        if not mensagem.lida:
            mensagem.lida = True
            mensagem.data_leitura = datetime.utcnow()
            db.commit()
            db.refresh(mensagem)

        return DTDMensagemResponse.model_validate(mensagem)

    @staticmethod
    def obter_estatisticas(db: Session, domicilio_id: UUID) -> DTDEstatisticas:
        """Obtém estatísticas do DTD"""
        # Total de mensagens
        total_mensagens = db.query(func.count(DTDMensagem.id)).filter(
            DTDMensagem.domicilio_id == domicilio_id
        ).scalar() or 0

        # Mensagens não lidas
        mensagens_nao_lidas = db.query(func.count(DTDMensagem.id)).filter(
            and_(
                DTDMensagem.domicilio_id == domicilio_id,
                DTDMensagem.lida == False
            )
        ).scalar() or 0

        # Mensagens por tipo
        mensagens_por_tipo = {}
        tipos = db.query(
            DTDMensagem.tipo_mensagem,
            func.count(DTDMensagem.id)
        ).filter(
            DTDMensagem.domicilio_id == domicilio_id
        ).group_by(DTDMensagem.tipo_mensagem).all()

        for tipo, count in tipos:
            mensagens_por_tipo[tipo] = count

        # Mensagens por prioridade
        mensagens_por_prioridade = {}
        prioridades = db.query(
            DTDMensagem.prioridade,
            func.count(DTDMensagem.id)
        ).filter(
            DTDMensagem.domicilio_id == domicilio_id
        ).group_by(DTDMensagem.prioridade).all()

        for prioridade, count in prioridades:
            mensagens_por_prioridade[prioridade] = count

        # Última mensagem
        ultima_mensagem = db.query(func.max(DTDMensagem.data_envio)).filter(
            DTDMensagem.domicilio_id == domicilio_id
        ).scalar()

        return DTDEstatisticas(
            total_mensagens=total_mensagens,
            mensagens_nao_lidas=mensagens_nao_lidas,
            mensagens_por_tipo=mensagens_por_tipo,
            mensagens_por_prioridade=mensagens_por_prioridade,
            ultima_mensagem=ultima_mensagem
        )

    @staticmethod
    def enviar_mensagem_lote(
        db: Session,
        lote_data: DTDEnvioLoteRequest
    ) -> DTDEnvioLoteResponse:
        """Envia mensagem para múltiplos contribuintes"""
        mensagens_enviadas = []
        erros = []

        for contribuinte_id in lote_data.contribuintes_ids:
            try:
                mensagem_data = DTDMensagemCreateByContribuinte(
                    contribuinte_id=contribuinte_id,
                    assunto=lote_data.assunto,
                    conteudo=lote_data.conteudo,
                    tipo_mensagem=lote_data.tipo_mensagem,
                    prioridade=lote_data.prioridade,
                    anexos=lote_data.anexos
                )

                mensagem = DTDMensagemService.criar_mensagem_por_contribuinte(db, mensagem_data)
                mensagens_enviadas.append(mensagem.id)
            except Exception as e:
                erros.append({
                    "contribuinte_id": str(contribuinte_id),
                    "erro": str(e)
                })

        return DTDEnvioLoteResponse(
            total_enviados=len(mensagens_enviadas),
            total_erros=len(erros),
            mensagens_enviadas=mensagens_enviadas,
            erros=erros
        )
