"""
Rotas para o Portal do Contribuinte
"""
from typing import Optional, List
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.core.deps import get_current_user, get_db
from app.models.admin import Usuario, DomicilioTributarioDigital
from app.models.cadastro import Pessoa, Imovel, Estabelecimento
from app.models.tributario import (
    LancamentoIPTU, ITBI, DeclaracaoISSQN,
    Parcelamento, ParcelaPagamento
)
from app.schemas.cadastro import PessoaResponse, ImovelResponse, EstabelecimentoResponse


router = APIRouter(prefix="/portal/contribuinte", tags=["Portal do Contribuinte"])


# ==================== Dashboard ====================

@router.get("/dashboard")
def obter_dashboard_contribuinte(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Dashboard do contribuinte com resumo financeiro e avisos

    Retorna:
    - Total de débitos em aberto
    - Próximos vencimentos
    - Parcelamentos ativos
    - Mensagens não lidas (DTD)
    - Imóveis e estabelecimentos cadastrados
    """
    # Buscar pessoa do usuário logado
    pessoa = db.query(Pessoa).filter(Pessoa.email == current_user.email).first()

    if not pessoa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribuinte não encontrado"
        )

    # Total de imóveis
    total_imoveis = db.query(func.count(Imovel.id)).filter(
        Imovel.proprietario_id == pessoa.id
    ).scalar() or 0

    # Total de estabelecimentos
    total_estabelecimentos = db.query(func.count(Estabelecimento.id)).filter(
        Estabelecimento.responsavel_id == pessoa.id
    ).scalar() or 0

    # Débitos em aberto (IPTU)
    debitos_iptu = db.query(
        func.count(LancamentoIPTU.id),
        func.sum(LancamentoIPTU.valor_total)
    ).filter(
        and_(
            LancamentoIPTU.imovel_id.in_(
                db.query(Imovel.id).filter(Imovel.proprietario_id == pessoa.id)
            ),
            LancamentoIPTU.situacao.in_(['EM_ABERTO', 'VENCIDO'])
        )
    ).first()

    total_debitos_iptu = debitos_iptu[0] or 0
    valor_debitos_iptu = float(debitos_iptu[1] or 0)

    # Parcelamentos ativos
    parcelamentos_ativos = db.query(func.count(Parcelamento.id)).filter(
        and_(
            Parcelamento.contribuinte_id == pessoa.id,
            Parcelamento.status == 'ATIVO'
        )
    ).scalar() or 0

    # Mensagens não lidas (DTD)
    dtd = db.query(DomicilioTributarioDigital).filter(
        DomicilioTributarioDigital.contribuinte_id == pessoa.id
    ).first()

    mensagens_nao_lidas = 0
    if dtd:
        from app.models.admin import DTDMensagem
        mensagens_nao_lidas = db.query(func.count(DTDMensagem.id)).filter(
            and_(
                DTDMensagem.domicilio_id == dtd.id,
                DTDMensagem.lida == False
            )
        ).scalar() or 0

    # Próximos vencimentos (próximos 30 dias)
    from datetime import datetime, timedelta
    hoje = date.today()
    proximos_30_dias = hoje + timedelta(days=30)

    proximos_vencimentos = db.query(LancamentoIPTU).filter(
        and_(
            LancamentoIPTU.imovel_id.in_(
                db.query(Imovel.id).filter(Imovel.proprietario_id == pessoa.id)
            ),
            LancamentoIPTU.situacao == 'EM_ABERTO',
            LancamentoIPTU.data_vencimento.between(hoje, proximos_30_dias)
        )
    ).limit(5).all()

    vencimentos = [
        {
            "id": str(v.id),
            "descricao": f"IPTU {v.exercicio} - Parc. {v.numero_parcela}/{v.total_parcelas}",
            "valor": float(v.valor_total),
            "data_vencimento": v.data_vencimento.isoformat(),
            "tipo": "IPTU"
        }
        for v in proximos_vencimentos
    ]

    return {
        "contribuinte": {
            "id": str(pessoa.id),
            "nome": pessoa.nome_razao_social,
            "cpf": pessoa.cpf,
            "cnpj": pessoa.cnpj,
            "email": pessoa.email,
        },
        "resumo": {
            "total_imoveis": total_imoveis,
            "total_estabelecimentos": total_estabelecimentos,
            "total_debitos": total_debitos_iptu,
            "valor_total_debitos": valor_debitos_iptu,
            "parcelamentos_ativos": parcelamentos_ativos,
            "mensagens_nao_lidas": mensagens_nao_lidas,
        },
        "proximos_vencimentos": vencimentos,
        "tem_dtd": dtd is not None,
        "dtd_id": str(dtd.id) if dtd else None,
    }


# ==================== Meus Imóveis ====================

@router.get("/imoveis", response_model=List[ImovelResponse])
def listar_meus_imoveis(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista todos os imóveis do contribuinte"""
    pessoa = db.query(Pessoa).filter(Pessoa.email == current_user.email).first()

    if not pessoa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribuinte não encontrado"
        )

    imoveis = db.query(Imovel).filter(Imovel.proprietario_id == pessoa.id).all()
    return imoveis


@router.get("/imoveis/{imovel_id}/debitos")
def obter_debitos_imovel(
    imovel_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtém débitos de IPTU de um imóvel específico"""
    pessoa = db.query(Pessoa).filter(Pessoa.email == current_user.email).first()

    if not pessoa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribuinte não encontrado"
        )

    # Verificar se o imóvel pertence ao contribuinte
    imovel = db.query(Imovel).filter(
        and_(Imovel.id == imovel_id, Imovel.proprietario_id == pessoa.id)
    ).first()

    if not imovel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imóvel não encontrado"
        )

    # Buscar débitos de IPTU
    debitos = db.query(LancamentoIPTU).filter(
        and_(
            LancamentoIPTU.imovel_id == imovel_id,
            LancamentoIPTU.situacao.in_(['EM_ABERTO', 'VENCIDO'])
        )
    ).order_by(LancamentoIPTU.data_vencimento.desc()).all()

    return {
        "imovel_id": str(imovel_id),
        "inscricao_imobiliaria": imovel.inscricao_imobiliaria,
        "endereco": imovel.endereco,
        "debitos": [
            {
                "id": str(d.id),
                "exercicio": d.exercicio,
                "numero_parcela": d.numero_parcela,
                "total_parcelas": d.total_parcelas,
                "valor_original": float(d.valor_original),
                "valor_total": float(d.valor_total),
                "data_vencimento": d.data_vencimento.isoformat(),
                "situacao": d.situacao,
            }
            for d in debitos
        ],
        "total_debitos": len(debitos),
        "valor_total": sum(float(d.valor_total) for d in debitos),
    }


# ==================== Meus Estabelecimentos ====================

@router.get("/estabelecimentos", response_model=List[EstabelecimentoResponse])
def listar_meus_estabelecimentos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista todos os estabelecimentos do contribuinte"""
    pessoa = db.query(Pessoa).filter(Pessoa.email == current_user.email).first()

    if not pessoa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribuinte não encontrado"
        )

    estabelecimentos = db.query(Estabelecimento).filter(
        Estabelecimento.responsavel_id == pessoa.id
    ).all()

    return estabelecimentos


@router.get("/estabelecimentos/{estabelecimento_id}/declaracoes")
def obter_declaracoes_estabelecimento(
    estabelecimento_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtém declarações de ISSQN de um estabelecimento"""
    pessoa = db.query(Pessoa).filter(Pessoa.email == current_user.email).first()

    if not pessoa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribuinte não encontrado"
        )

    # Verificar se o estabelecimento pertence ao contribuinte
    estabelecimento = db.query(Estabelecimento).filter(
        and_(
            Estabelecimento.id == estabelecimento_id,
            Estabelecimento.responsavel_id == pessoa.id
        )
    ).first()

    if not estabelecimento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estabelecimento não encontrado"
        )

    # Buscar declarações de ISSQN
    declaracoes = db.query(DeclaracaoISSQN).filter(
        DeclaracaoISSQN.estabelecimento_id == estabelecimento_id
    ).order_by(
        DeclaracaoISSQN.ano_competencia.desc(),
        DeclaracaoISSQN.mes_competencia.desc()
    ).limit(12).all()

    return {
        "estabelecimento_id": str(estabelecimento_id),
        "inscricao_municipal": estabelecimento.inscricao_municipal,
        "nome_fantasia": estabelecimento.nome_fantasia,
        "declaracoes": [
            {
                "id": str(d.id),
                "mes_competencia": d.mes_competencia,
                "ano_competencia": d.ano_competencia,
                "regime_tributacao": d.regime_tributacao,
                "receita_bruta_total": float(d.receita_bruta_total or 0),
                "valor_issqn": float(d.valor_issqn or 0),
                "data_declaracao": d.created_at.isoformat(),
            }
            for d in declaracoes
        ],
    }


# ==================== Meus Parcelamentos ====================

@router.get("/parcelamentos")
def listar_meus_parcelamentos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista todos os parcelamentos do contribuinte"""
    pessoa = db.query(Pessoa).filter(Pessoa.email == current_user.email).first()

    if not pessoa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribuinte não encontrado"
        )

    parcelamentos = db.query(Parcelamento).filter(
        Parcelamento.contribuinte_id == pessoa.id
    ).order_by(Parcelamento.created_at.desc()).all()

    resultado = []
    for p in parcelamentos:
        # Contar parcelas pagas
        parcelas_pagas = db.query(func.count(ParcelaPagamento.id)).filter(
            and_(
                ParcelaPagamento.parcelamento_id == p.id,
                ParcelaPagamento.situacao == 'PAGO'
            )
        ).scalar() or 0

        resultado.append({
            "id": str(p.id),
            "numero_parcelamento": p.numero_parcelamento,
            "valor_original": float(p.valor_original),
            "valor_entrada": float(p.valor_entrada),
            "valor_parcelado": float(p.valor_parcelado),
            "numero_parcelas": p.numero_parcelas,
            "valor_parcela": float(p.valor_parcela),
            "parcelas_pagas": parcelas_pagas,
            "status": p.status,
            "data_primeira_parcela": p.data_primeira_parcela.isoformat() if p.data_primeira_parcela else None,
            "created_at": p.created_at.isoformat(),
        })

    return resultado


@router.get("/parcelamentos/{parcelamento_id}/parcelas")
def obter_parcelas_parcelamento(
    parcelamento_id: UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtém as parcelas de um parcelamento"""
    pessoa = db.query(Pessoa).filter(Pessoa.email == current_user.email).first()

    if not pessoa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribuinte não encontrado"
        )

    # Verificar se o parcelamento pertence ao contribuinte
    parcelamento = db.query(Parcelamento).filter(
        and_(
            Parcelamento.id == parcelamento_id,
            Parcelamento.contribuinte_id == pessoa.id
        )
    ).first()

    if not parcelamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parcelamento não encontrado"
        )

    # Buscar parcelas
    parcelas = db.query(ParcelaPagamento).filter(
        ParcelaPagamento.parcelamento_id == parcelamento_id
    ).order_by(ParcelaPagamento.numero_parcela).all()

    return {
        "parcelamento_id": str(parcelamento_id),
        "numero_parcelamento": parcelamento.numero_parcelamento,
        "parcelas": [
            {
                "id": str(parc.id),
                "numero_parcela": parc.numero_parcela,
                "valor_parcela": float(parc.valor_parcela),
                "data_vencimento": parc.data_vencimento.isoformat(),
                "situacao": parc.situacao,
                "data_pagamento": parc.data_pagamento.isoformat() if parc.data_pagamento else None,
            }
            for parc in parcelas
        ],
    }


# ==================== Meus Débitos (Geral) ====================

@router.get("/debitos")
def listar_meus_debitos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista todos os débitos do contribuinte (IPTU, ITBI, ISSQN)"""
    pessoa = db.query(Pessoa).filter(Pessoa.email == current_user.email).first()

    if not pessoa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribuinte não encontrado"
        )

    debitos_resultado = []

    # Débitos de IPTU
    imoveis_ids = [i.id for i in db.query(Imovel.id).filter(Imovel.proprietario_id == pessoa.id).all()]

    if imoveis_ids:
        debitos_iptu = db.query(LancamentoIPTU).filter(
            and_(
                LancamentoIPTU.imovel_id.in_(imoveis_ids),
                LancamentoIPTU.situacao.in_(['EM_ABERTO', 'VENCIDO'])
            )
        ).all()

        for d in debitos_iptu:
            debitos_resultado.append({
                "id": str(d.id),
                "tipo": "IPTU",
                "descricao": f"IPTU {d.exercicio} - Parcela {d.numero_parcela}/{d.total_parcelas}",
                "referencia": d.inscricao_imobiliaria,
                "valor_original": float(d.valor_original),
                "valor_atualizado": float(d.valor_total),
                "data_vencimento": d.data_vencimento.isoformat(),
                "situacao": d.situacao,
                "dias_vencido": (date.today() - d.data_vencimento).days if d.data_vencimento < date.today() else 0,
            })

    # Ordenar por vencimento
    debitos_resultado.sort(key=lambda x: x['data_vencimento'])

    # Totalizadores
    total_debitos = len(debitos_resultado)
    valor_total = sum(d['valor_atualizado'] for d in debitos_resultado)
    debitos_vencidos = len([d for d in debitos_resultado if d['dias_vencido'] > 0])

    return {
        "debitos": debitos_resultado,
        "resumo": {
            "total_debitos": total_debitos,
            "valor_total": valor_total,
            "debitos_vencidos": debitos_vencidos,
        }
    }


# ==================== Meu Cadastro ====================

@router.get("/meu-cadastro", response_model=PessoaResponse)
def obter_meu_cadastro(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obtém dados cadastrais do contribuinte"""
    pessoa = db.query(Pessoa).filter(Pessoa.email == current_user.email).first()

    if not pessoa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribuinte não encontrado"
        )

    return pessoa


@router.put("/meu-cadastro")
def atualizar_meu_cadastro(
    email: Optional[str] = None,
    telefone: Optional[str] = None,
    celular: Optional[str] = None,
    endereco: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Atualiza dados de contato do contribuinte"""
    pessoa = db.query(Pessoa).filter(Pessoa.email == current_user.email).first()

    if not pessoa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribuinte não encontrado"
        )

    # Atualizar apenas campos permitidos
    if email:
        pessoa.email = email
    if telefone:
        pessoa.telefone = telefone
    if celular:
        pessoa.celular = celular
    if endereco:
        pessoa.endereco = endereco

    db.commit()
    db.refresh(pessoa)

    return {
        "mensagem": "Cadastro atualizado com sucesso",
        "pessoa": PessoaResponse.model_validate(pessoa)
    }
