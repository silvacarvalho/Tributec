"""
Modelos do Módulo Dívida Ativa
Inscrição, Certidões, Protestos, Cobrança
"""
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Date, DateTime, Boolean, Numeric,
    ForeignKey, Text, Enum as SQLEnum, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
import enum

from app.models.base import ModeloBase


# =====================================================
# ENUMS
# =====================================================

class StatusDividaAtiva(str, enum.Enum):
    """Status da dívida ativa"""
    INSCRITA = "INSCRITA"
    EM_COBRANCA = "EM_COBRANCA"
    PARCELADA = "PARCELADA"
    PROTESTADA = "PROTESTADA"
    EM_EXECUCAO = "EM_EXECUCAO"
    PAGA = "PAGA"
    CANCELADA = "CANCELADA"


# =====================================================
# MODELOS
# =====================================================

class DividaAtivaInscricao(ModeloBase):
    """
    Inscrição em Dívida Ativa
    Débitos tributários não pagos após esgotamento de prazos
    """
    __tablename__ = "divida_ativa.inscricoes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número da inscrição
    numero_inscricao = Column(
        String(30),
        unique=True,
        nullable=False,
        comment="Número único da inscrição em dívida ativa"
    )

    # Data de inscrição
    data_inscricao = Column(Date, default=date.today, nullable=False)

    # Exercício
    ano_exercicio = Column(Integer, nullable=False)

    # Devedor
    devedor_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Tipo de débito
    tipo_debito = Column(
        String(50),
        nullable=False,
        comment="IPTU, ISSQN, TAXA, AUTO_INFRACAO, etc."
    )

    # Origem do débito (referência)
    origem_tipo = Column(String(50), comment="Tipo do débito de origem")
    origem_id = Column(UUID(as_uuid=True), comment="ID do débito de origem")
    numero_origem = Column(String(30), comment="Número do documento de origem")

    # Fundamentação legal
    fundamentacao_legal = Column(
        Text,
        nullable=False,
        comment="Base legal da inscrição"
    )

    # Valores no momento da inscrição
    valor_principal = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor principal do débito"
    )
    valor_multa = Column(Numeric(15, 2), default=Decimal("0.00"))
    valor_juros = Column(Numeric(15, 2), default=Decimal("0.00"))
    valor_correcao = Column(Numeric(15, 2), default=Decimal("0.00"))
    valor_total_inscricao = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor total no momento da inscrição"
    )

    # Valores atualizados (recalculados)
    valor_total_atualizado = Column(
        Numeric(15, 2),
        comment="Valor total atualizado com acréscimos"
    )
    data_atualizacao_valor = Column(Date, comment="Data da última atualização de valor")

    # Certidão de Dívida Ativa (CDA)
    numero_cda = Column(
        String(30),
        unique=True,
        nullable=False,
        comment="Número da Certidão de Dívida Ativa"
    )
    data_emissao_cda = Column(Date, nullable=False)

    # Presunção de certeza e liquidez
    liquida_e_certa = Column(Boolean, default=True, nullable=False)

    # Status
    status = Column(
        SQLEnum(StatusDividaAtiva),
        default=StatusDividaAtiva.INSCRITA,
        nullable=False
    )

    # Cobrança administrativa
    em_cobranca_administrativa = Column(Boolean, default=False)
    data_inicio_cobranca = Column(Date)

    # Protesto extrajudicial
    protestada = Column(Boolean, default=False)
    data_protesto = Column(Date)
    numero_protesto = Column(String(30))
    cartorio_protesto = Column(String(200))

    # Execução fiscal
    em_execucao_fiscal = Column(Boolean, default=False)
    data_ajuizamento = Column(Date)
    numero_processo_judicial = Column(String(50))
    vara_judicial = Column(String(200))

    # Parcelamento
    parcelada = Column(Boolean, default=False)
    parcelamento_id = Column(UUID(as_uuid=True), ForeignKey("arrecadacao.parcelamentos.id"))
    data_parcelamento = Column(Date)

    # Pagamento
    paga = Column(Boolean, default=False)
    data_pagamento = Column(Date)
    valor_pago = Column(Numeric(15, 2))
    forma_pagamento = Column(String(50))

    # Cancelamento
    cancelada = Column(Boolean, default=False)
    data_cancelamento = Column(Date)
    motivo_cancelamento = Column(Text)

    # Sub-rogação (instituições financeiras com garantia FPM)
    sub_rogada = Column(Boolean, default=False)
    data_sub_rogacao = Column(Date)
    instituicao_financeira = Column(String(200))
    valor_sub_rogado = Column(Numeric(15, 2))

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    devedor = relationship("Pessoa")
    parcelamento = relationship("Parcelamento")
    certidoes = relationship("DividaAtivaCertidao", back_populates="inscricao")

    __table_args__ = (
        Index("idx_divida_ativa_numero", "numero_inscricao"),
        Index("idx_divida_ativa_devedor", "devedor_id"),
        Index("idx_divida_ativa_exercicio", "ano_exercicio"),
        Index("idx_divida_ativa_status", "status"),
        Index("idx_divida_ativa_cda", "numero_cda"),
        Index("idx_divida_ativa_origem", "origem_tipo", "origem_id"),
        {"schema": "divida_ativa"}
    )


class DividaAtivaCertidao(ModeloBase):
    """
    Certidão de Dívida Ativa (CDA)
    Título executivo extrajudicial
    """
    __tablename__ = "divida_ativa.certidoes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Inscrição relacionada
    inscricao_id = Column(
        UUID(as_uuid=True),
        ForeignKey("divida_ativa.inscricoes.id"),
        nullable=False
    )

    # Número da certidão
    numero_certidao = Column(String(30), unique=True, nullable=False)

    # Data de emissão
    data_emissao = Column(Date, default=date.today, nullable=False)

    # Tipo de certidão
    tipo_certidao = Column(
        String(30),
        nullable=False,
        comment="ORIGINAL, 2_VIA, COMPLEMENTAR, SUBSTITUTIVA"
    )

    # Certidão substituída (se aplicável)
    substitui_certidao_id = Column(
        UUID(as_uuid=True),
        ForeignKey("divida_ativa.certidoes.id")
    )

    # Dados do devedor
    nome_devedor = Column(String(200), nullable=False)
    documento_devedor = Column(String(20), nullable=False)
    endereco_devedor = Column(Text)

    # Discriminação do débito
    discriminacao_debito = Column(
        Text,
        nullable=False,
        comment="Discriminação detalhada do débito"
    )

    # Valores
    valor_principal = Column(Numeric(15, 2), nullable=False)
    valor_multa = Column(Numeric(15, 2), default=Decimal("0.00"))
    valor_juros = Column(Numeric(15, 2), default=Decimal("0.00"))
    valor_correcao = Column(Numeric(15, 2), default=Decimal("0.00"))
    valor_total = Column(Numeric(15, 2), nullable=False)

    # Fundamentação legal
    fundamentacao_legal = Column(Text, nullable=False)

    # Emitido por
    emitido_por_id = Column(UUID(as_uuid=True), ForeignKey("admin.usuarios.id"))

    # PDF da certidão
    pdf_certidao = Column(Text, comment="Caminho ou base64 do PDF")

    # Relacionamentos
    inscricao = relationship("DividaAtivaInscricao", back_populates="certidoes")
    substitui = relationship(
        "DividaAtivaCertidao",
        remote_side=[id],
        foreign_keys=[substitui_certidao_id]
    )

    __table_args__ = (
        Index("idx_divida_ativa_certidoes_numero", "numero_certidao"),
        Index("idx_divida_ativa_certidoes_inscricao", "inscricao_id"),
        {"schema": "divida_ativa"}
    )


class DividaAtivaProtesto(ModeloBase):
    """
    Protestos de Dívida Ativa
    Lei 9.492/97 - Protesto extrajudicial
    """
    __tablename__ = "divida_ativa.protestos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Inscrição relacionada
    inscricao_id = Column(
        UUID(as_uuid=True),
        ForeignKey("divida_ativa.inscricoes.id"),
        nullable=False
    )

    # Número do protesto
    numero_protesto = Column(String(30), unique=True, nullable=False)

    # Data do protesto
    data_protesto = Column(Date, nullable=False)

    # Cartório
    cartorio_protesto = Column(String(200), nullable=False)
    livro = Column(String(20))
    folha = Column(String(20))

    # Valor protestado
    valor_protestado = Column(Numeric(15, 2), nullable=False)

    # Intimação do devedor
    devedor_intimado = Column(Boolean, default=False)
    data_intimacao = Column(Date)
    forma_intimacao = Column(String(50), comment="PESSOAL, CORREIOS, EDITAL")

    # Cancelamento/Sustação
    cancelado = Column(Boolean, default=False)
    data_cancelamento = Column(Date)
    motivo_cancelamento = Column(Text)

    # Relacionamentos
    inscricao = relationship("DividaAtivaInscricao")

    __table_args__ = (
        Index("idx_divida_ativa_protestos_numero", "numero_protesto"),
        Index("idx_divida_ativa_protestos_inscricao", "inscricao_id"),
        {"schema": "divida_ativa"}
    )
