"""
Service para Gestão de Dívida Ativa
Inscrição, Parcelamento, Protesto e Execução Fiscal
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.divida_ativa import (
    DividaAtiva,
    ParcelamentoDividaAtiva,
    ParcelaDividaAtiva,
    StatusDividaAtiva,
    TipoDividaAtiva,
)
from app.models.arrecadacao import Debito
from app.models.cadastro import Pessoa


class DividaAtivaService:
    """Service para operações com dívida ativa"""

    def __init__(self, db: Session):
        self.db = db

    def inscrever_em_divida_ativa(
        self,
        debito_id: UUID,
        tipo_divida: TipoDividaAtiva,
        observacoes: Optional[str] = None
    ) -> DividaAtiva:
        """
        Inscreve um débito vencido em dívida ativa

        Args:
            debito_id: ID do débito vencido
            tipo_divida: Tipo da dívida ativa
            observacoes: Observações sobre a inscrição

        Returns:
            DividaAtiva criada
        """
        # Buscar débito
        debito = self.db.query(Debito).filter(Debito.id == debito_id).first()
        if not debito:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Débito não encontrado"
            )

        # Verificar se já está pago
        if debito.status == "PAGO":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Débito já está pago"
            )

        # Verificar se já está em dívida ativa
        divida_existente = self.db.query(DividaAtiva).filter(
            DividaAtiva.debito_id == debito_id
        ).first()

        if divida_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Débito já está inscrito em dívida ativa"
            )

        # Calcular valores
        valor_principal = debito.valor_original
        valor_multa = debito.valor_multa or Decimal('0')
        valor_juros = debito.valor_juros or Decimal('0')
        valor_correcao = debito.valor_correcao or Decimal('0')

        # Honorários advocatícios (10% padrão)
        percentual_honorarios = Decimal('10')
        valor_honorarios = (valor_principal + valor_multa + valor_juros + valor_correcao) * (percentual_honorarios / 100)

        valor_total = valor_principal + valor_multa + valor_juros + valor_correcao + valor_honorarios

        # Gerar número da CDA (Certidão de Dívida Ativa)
        ano_corrente = datetime.now().year
        ultimo_numero = self.db.query(DividaAtiva).filter(
            DividaAtiva.numero_cda.like(f"{ano_corrente}/%")
        ).count()
        numero_cda = f"{ano_corrente}/{(ultimo_numero + 1):06d}"

        # Criar dívida ativa
        divida = DividaAtiva(
            debito_id=debito_id,
            contribuinte_id=debito.contribuinte_id,
            tipo_divida=tipo_divida,
            numero_cda=numero_cda,
            data_inscricao=datetime.now(),
            data_vencimento_original=debito.data_vencimento,
            valor_principal=valor_principal,
            valor_multa=valor_multa,
            valor_juros=valor_juros,
            valor_correcao=valor_correcao,
            valor_honorarios=valor_honorarios,
            percentual_honorarios=percentual_honorarios,
            valor_total=valor_total,
            status=StatusDividaAtiva.INSCRITA,
            observacoes=observacoes,
        )

        self.db.add(divida)

        # Atualizar status do débito
        debito.status = "DIVIDA_ATIVA"

        self.db.commit()
        self.db.refresh(divida)

        return divida

    def criar_parcelamento(
        self,
        divida_id: UUID,
        numero_parcelas: int,
        valor_entrada: Optional[Decimal] = None,
        dia_vencimento: int = 10,
    ) -> ParcelamentoDividaAtiva:
        """
        Cria parcelamento de dívida ativa

        Args:
            divida_id: ID da dívida ativa
            numero_parcelas: Número de parcelas
            valor_entrada: Valor da entrada (opcional)
            dia_vencimento: Dia do vencimento das parcelas

        Returns:
            ParcelamentoDividaAtiva criado
        """
        # Buscar dívida
        divida = self.db.query(DividaAtiva).filter(DividaAtiva.id == divida_id).first()
        if not divida:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dívida ativa não encontrada"
            )

        # Verificar se dívida pode ser parcelada
        if divida.status not in [StatusDividaAtiva.INSCRITA, StatusDividaAtiva.PARCELADA]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Dívida com status {divida.status} não pode ser parcelada"
            )

        # Validar número de parcelas
        if numero_parcelas < 1 or numero_parcelas > 60:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Número de parcelas deve estar entre 1 e 60"
            )

        # Calcular valores
        valor_total = divida.valor_total
        valor_entrada = valor_entrada or Decimal('0')

        if valor_entrada >= valor_total:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor de entrada não pode ser maior ou igual ao valor total"
            )

        valor_parcelar = valor_total - valor_entrada
        valor_parcela = valor_parcelar / numero_parcelas

        # Valor mínimo da parcela (R$ 50,00)
        valor_minimo_parcela = Decimal('50.00')
        if valor_parcela < valor_minimo_parcela:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Valor da parcela (R$ {valor_parcela:.2f}) é menor que o mínimo permitido (R$ {valor_minimo_parcela:.2f})"
            )

        # Criar parcelamento
        parcelamento = ParcelamentoDividaAtiva(
            divida_id=divida_id,
            data_parcelamento=datetime.now(),
            numero_parcelas=numero_parcelas,
            valor_entrada=valor_entrada,
            valor_total=valor_total,
            valor_parcela=valor_parcela,
            parcelas_pagas=0,
            parcelas_abertas=numero_parcelas,
            status="ATIVO",
        )

        self.db.add(parcelamento)
        self.db.flush()

        # Criar parcelas
        data_base = datetime.now().replace(day=dia_vencimento)
        if data_base <= datetime.now():
            data_base = data_base.replace(month=data_base.month + 1)

        for i in range(numero_parcelas):
            data_vencimento = data_base + timedelta(days=30 * i)

            parcela = ParcelaDividaAtiva(
                parcelamento_id=parcelamento.id,
                numero_parcela=i + 1,
                data_vencimento=data_vencimento,
                valor_parcela=valor_parcela,
                status="ABERTA",
            )
            self.db.add(parcela)

        # Atualizar status da dívida
        divida.status = StatusDividaAtiva.PARCELADA

        self.db.commit()
        self.db.refresh(parcelamento)

        return parcelamento

    def enviar_para_protesto(
        self,
        divida_id: UUID,
        cartorio: str,
        observacoes: Optional[str] = None
    ) -> DividaAtiva:
        """
        Envia dívida ativa para protesto em cartório

        Args:
            divida_id: ID da dívida ativa
            cartorio: Nome do cartório
            observacoes: Observações sobre o protesto

        Returns:
            DividaAtiva atualizada
        """
        divida = self.db.query(DividaAtiva).filter(DividaAtiva.id == divida_id).first()
        if not divida:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dívida ativa não encontrada"
            )

        if divida.status != StatusDividaAtiva.INSCRITA:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Apenas dívidas inscritas podem ser enviadas para protesto"
            )

        # Atualizar dívida
        divida.status = StatusDividaAtiva.PROTESTADA
        divida.data_protesto = datetime.now()
        divida.cartorio_protesto = cartorio
        if observacoes:
            divida.observacoes = f"{divida.observacoes or ''}\nProtesto: {observacoes}"

        self.db.commit()
        self.db.refresh(divida)

        return divida

    def enviar_para_execucao_fiscal(
        self,
        divida_id: UUID,
        numero_processo: str,
        observacoes: Optional[str] = None
    ) -> DividaAtiva:
        """
        Envia dívida ativa para execução fiscal

        Args:
            divida_id: ID da dívida ativa
            numero_processo: Número do processo judicial
            observacoes: Observações sobre a execução

        Returns:
            DividaAtiva atualizada
        """
        divida = self.db.query(DividaAtiva).filter(DividaAtiva.id == divida_id).first()
        if not divida:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dívida ativa não encontrada"
            )

        if divida.status not in [StatusDividaAtiva.INSCRITA, StatusDividaAtiva.PROTESTADA]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status da dívida não permite execução fiscal"
            )

        # Atualizar dívida
        divida.status = StatusDividaAtiva.EXECUCAO_FISCAL
        divida.data_ajuizamento = datetime.now()
        divida.numero_processo = numero_processo
        if observacoes:
            divida.observacoes = f"{divida.observacoes or ''}\nExecução: {observacoes}"

        self.db.commit()
        self.db.refresh(divida)

        return divida

    def listar_dividas_ativas(
        self,
        contribuinte_id: Optional[UUID] = None,
        status: Optional[StatusDividaAtiva] = None,
        tipo: Optional[TipoDividaAtiva] = None,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[List[DividaAtiva], int]:
        """Lista dívidas ativas com filtros"""

        query = self.db.query(DividaAtiva)

        if contribuinte_id:
            query = query.filter(DividaAtiva.contribuinte_id == contribuinte_id)

        if status:
            query = query.filter(DividaAtiva.status == status)

        if tipo:
            query = query.filter(DividaAtiva.tipo_divida == tipo)

        if data_inicio:
            query = query.filter(DividaAtiva.data_inscricao >= data_inicio)

        if data_fim:
            query = query.filter(DividaAtiva.data_inscricao <= data_fim)

        total = query.count()
        dividas = query.order_by(DividaAtiva.data_inscricao.desc()).offset(skip).limit(limit).all()

        return dividas, total
