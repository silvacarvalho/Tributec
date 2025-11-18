"""
Modelos do Módulo NFS-e
Nota Fiscal de Serviço Eletrônica, RPS, Declarações
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

class StatusNFSe(str, enum.Enum):
    """Status da NFS-e"""
    EMITIDA = "EMITIDA"
    CANCELADA = "CANCELADA"
    SUBSTITUIDA = "SUBSTITUIDA"


class StatusRPS(str, enum.Enum):
    """Status do RPS"""
    AGUARDANDO_CONVERSAO = "AGUARDANDO_CONVERSAO"
    CONVERTIDO = "CONVERTIDO"
    CANCELADO = "CANCELADO"
    EXPIRADO = "EXPIRADO"


# =====================================================
# MODELOS
# =====================================================

class NFSe(ModeloBase):
    """
    Nota Fiscal de Serviço Eletrônica
    """
    __tablename__ = "nfse.notas_fiscais"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número da NFS-e
    numero_nfse = Column(
        String(30),
        unique=True,
        nullable=False,
        index=True,
        comment="Número único da NFS-e"
    )

    # Código de verificação
    codigo_verificacao = Column(
        String(20),
        unique=True,
        nullable=False,
        comment="Código de verificação da autenticidade"
    )

    # Data de emissão
    data_emissao = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Prestador
    prestador_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.estabelecimentos.id"),
        nullable=False
    )

    # Tomador
    tomador_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Dados do serviço
    codigo_servico = Column(
        String(10),
        nullable=False,
        comment="Código do serviço na lista (ex: 7.02)"
    )
    discriminacao_servico = Column(
        Text,
        nullable=False,
        comment="Descrição detalhada do serviço prestado"
    )

    # Valores
    valor_servicos = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor total dos serviços"
    )
    valor_deducoes = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Deduções permitidas"
    )
    valor_base_calculo = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Base de cálculo do ISSQN"
    )

    # ISSQN
    aliquota_issqn = Column(
        Numeric(5, 4),
        nullable=False,
        comment="Alíquota do ISSQN aplicada"
    )
    valor_issqn = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor do ISSQN"
    )

    # Retenção
    issqn_retido = Column(
        Boolean,
        default=False,
        comment="ISSQN foi retido pelo tomador"
    )
    valor_issqn_retido = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Valor do ISSQN retido"
    )

    # Outras retenções federais
    valor_pis = Column(Numeric(15, 2), default=Decimal("0.00"))
    valor_cofins = Column(Numeric(15, 2), default=Decimal("0.00"))
    valor_inss = Column(Numeric(15, 2), default=Decimal("0.00"))
    valor_ir = Column(Numeric(15, 2), default=Decimal("0.00"))
    valor_csll = Column(Numeric(15, 2), default=Decimal("0.00"))

    # Valor líquido
    valor_liquido = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor líquido da nota"
    )

    # Competência
    mes_competencia = Column(Integer, nullable=False)
    ano_competencia = Column(Integer, nullable=False)

    # Local da prestação
    municipio_prestacao = Column(
        String(100),
        nullable=False,
        default="Município",
        comment="Município onde o serviço foi prestado"
    )
    codigo_municipio_ibge = Column(
        String(7),
        comment="Código IBGE do município"
    )

    # Status
    status = Column(
        SQLEnum(StatusNFSe),
        default=StatusNFSe.EMITIDA,
        nullable=False
    )

    # Cancelamento
    cancelada = Column(Boolean, default=False)
    data_cancelamento = Column(DateTime)
    motivo_cancelamento = Column(Text)

    # Substituição
    substitui_nfse_id = Column(
        UUID(as_uuid=True),
        ForeignKey("nfse.notas_fiscais.id"),
        comment="NFS-e que esta nota substitui"
    )
    substituida_por_nfse_id = Column(
        UUID(as_uuid=True),
        ForeignKey("nfse.notas_fiscais.id"),
        comment="NFS-e que substituiu esta nota"
    )

    # RPS de origem
    rps_id = Column(
        UUID(as_uuid=True),
        ForeignKey("nfse.rps.id"),
        comment="RPS que originou esta NFS-e"
    )

    # XML
    xml_nfse = Column(Text, comment="XML completo da NFS-e")

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    prestador = relationship("Estabelecimento", foreign_keys=[prestador_id])
    tomador = relationship("Pessoa", foreign_keys=[tomador_id])
    rps = relationship("RPS", back_populates="nfse")
    substitui = relationship(
        "NFSe",
        remote_side=[id],
        foreign_keys=[substitui_nfse_id],
        backref="substituicoes"
    )

    __table_args__ = (
        Index("idx_nfse_numero", "numero_nfse"),
        Index("idx_nfse_prestador", "prestador_id"),
        Index("idx_nfse_tomador", "tomador_id"),
        Index("idx_nfse_competencia", "ano_competencia", "mes_competencia"),
        Index("idx_nfse_status", "status"),
        Index("idx_nfse_codigo_verificacao", "codigo_verificacao"),
        {"schema": "nfse"}
    )


class RPS(ModeloBase):
    """
    Recibo Provisório de Serviços
    Deve ser convertido em NFS-e em até 30 dias
    """
    __tablename__ = "nfse.rps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número do RPS
    numero_rps = Column(
        String(30),
        nullable=False,
        comment="Número do RPS"
    )
    serie_rps = Column(
        String(5),
        default="A",
        comment="Série do RPS"
    )

    # Data de emissão
    data_emissao = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Prestador
    prestador_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.estabelecimentos.id"),
        nullable=False
    )

    # Tomador
    tomador_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Dados do serviço
    codigo_servico = Column(String(10), nullable=False)
    discriminacao_servico = Column(Text, nullable=False)

    # Valores
    valor_servicos = Column(Numeric(15, 2), nullable=False)
    valor_deducoes = Column(Numeric(15, 2), default=Decimal("0.00"))
    valor_base_calculo = Column(Numeric(15, 2), nullable=False)
    aliquota_issqn = Column(Numeric(5, 4), nullable=False)
    valor_issqn = Column(Numeric(15, 2), nullable=False)
    issqn_retido = Column(Boolean, default=False)

    # Competência
    mes_competencia = Column(Integer, nullable=False)
    ano_competencia = Column(Integer, nullable=False)

    # Status
    status = Column(
        SQLEnum(StatusRPS),
        default=StatusRPS.AGUARDANDO_CONVERSAO,
        nullable=False
    )

    # Conversão em NFS-e
    convertido = Column(Boolean, default=False)
    data_conversao = Column(DateTime)
    nfse_numero = Column(String(30), comment="Número da NFS-e gerada")

    # Cancelamento
    cancelado = Column(Boolean, default=False)
    data_cancelamento = Column(DateTime)
    motivo_cancelamento = Column(Text)

    # Prazo para conversão (30 dias)
    data_limite_conversao = Column(Date, nullable=False)

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    prestador = relationship("Estabelecimento", foreign_keys=[prestador_id])
    tomador = relationship("Pessoa", foreign_keys=[tomador_id])
    nfse = relationship("NFSe", back_populates="rps", uselist=False)

    __table_args__ = (
        UniqueConstraint("prestador_id", "numero_rps", "serie_rps", name="uq_rps_numero_serie"),
        Index("idx_rps_prestador", "prestador_id"),
        Index("idx_rps_status", "status"),
        Index("idx_rps_data_limite", "data_limite_conversao"),
        {"schema": "nfse"}
    )


class DeclaracaoServico(ModeloBase):
    """
    Declarações de Serviços
    Escrituração digital de serviços prestados/tomados
    """
    __tablename__ = "nfse.declaracoes_servico"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Estabelecimento declarante
    estabelecimento_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.estabelecimentos.id"),
        nullable=False
    )

    # Tipo de declaração
    tipo_declaracao = Column(
        String(50),
        nullable=False,
        comment="DES-IF, DOC, DVM, DAME"
    )

    # Período de apuração
    mes_competencia = Column(Integer, nullable=False)
    ano_competencia = Column(Integer, nullable=False)

    # Data da declaração
    data_declaracao = Column(Date, default=date.today, nullable=False)

    # Dados declarados (JSONB para flexibilidade)
    dados_declarados = Column(
        JSONB,
        nullable=False,
        comment="Dados da declaração em formato estruturado"
    )

    # Totalizadores
    total_receita_bruta = Column(Numeric(15, 2), default=Decimal("0.00"))
    total_base_calculo = Column(Numeric(15, 2), default=Decimal("0.00"))
    total_issqn_devido = Column(Numeric(15, 2), default=Decimal("0.00"))
    total_issqn_retido = Column(Numeric(15, 2), default=Decimal("0.00"))

    # Entrega
    data_entrega = Column(DateTime)
    protocolo = Column(String(50), unique=True, comment="Protocolo de entrega")

    # Retificação
    retificadora = Column(Boolean, default=False)
    declaracao_retificada_id = Column(
        UUID(as_uuid=True),
        ForeignKey("nfse.declaracoes_servico.id")
    )

    # Validação
    validada = Column(Boolean, default=False)
    data_validacao = Column(DateTime)
    erros_validacao = Column(JSONB, comment="Lista de erros de validação")

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    estabelecimento = relationship("Estabelecimento")
    declaracao_retificada = relationship(
        "DeclaracaoServico",
        remote_side=[id],
        foreign_keys=[declaracao_retificada_id]
    )

    __table_args__ = (
        UniqueConstraint(
            "estabelecimento_id",
            "tipo_declaracao",
            "mes_competencia",
            "ano_competencia",
            "retificadora",
            name="uq_declaracao_servico"
        ),
        Index("idx_declaracoes_servico_estabelecimento", "estabelecimento_id"),
        Index("idx_declaracoes_servico_tipo", "tipo_declaracao"),
        Index("idx_declaracoes_servico_competencia", "ano_competencia", "mes_competencia"),
        Index("idx_declaracoes_servico_protocolo", "protocolo"),
        {"schema": "nfse"}
    )
