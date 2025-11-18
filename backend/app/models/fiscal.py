"""
Modelos do Módulo Fiscal
Fiscalização, Autos de Infração, Intimações, Notificações
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

class StatusFiscalizacao(str, enum.Enum):
    """Status da fiscalização"""
    EM_ANDAMENTO = "EM_ANDAMENTO"
    CONCLUIDA = "CONCLUIDA"
    CANCELADA = "CANCELADA"


class StatusAutoInfracao(str, enum.Enum):
    """Status do auto de infração"""
    LAVRADO = "LAVRADO"
    NOTIFICADO = "NOTIFICADO"
    PAGO = "PAGO"
    EM_DEFESA = "EM_DEFESA"
    EM_RECURSO = "EM_RECURSO"
    DEFERIDO = "DEFERIDO"
    INDEFERIDO = "INDEFERIDO"
    CANCELADO = "CANCELADO"
    INSCRITO_DIVIDA = "INSCRITO_DIVIDA"


class TipoMulta(str, enum.Enum):
    """Tipo de cálculo da multa"""
    PERCENTUAL = "PERCENTUAL"  # Percentual sobre valor base
    FIXA_UFM = "FIXA_UFM"  # Valor fixo em UFM
    MISTA = "MISTA"  # Combinação de percentual + UFM


# =====================================================
# MODELOS
# =====================================================

class CatalogoInfracao(ModeloBase):
    """
    Catálogo de Infrações Fiscais
    Infrações previstas em lei com multas configuráveis
    """
    __tablename__ = "fiscal.catalogo_infracoes"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Identificação
    codigo = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
        comment="Código único da infração (ex: IPTU-001, ISSQN-005)"
    )

    descricao = Column(
        Text,
        nullable=False,
        comment="Descrição detalhada da infração"
    )

    # Base legal
    artigo_lei = Column(
        String(100),
        comment="Artigo da lei que tipifica a infração"
    )

    base_legal = Column(
        Text,
        comment="Texto completo da base legal"
    )

    # Tipo de multa
    tipo_multa = Column(
        SQLEnum(TipoMulta),
        nullable=False,
        default=TipoMulta.FIXA_UFM
    )

    # Valores (usar conforme tipo_multa)
    valor_multa_ufm = Column(
        Numeric(10, 2),
        comment="Valor em UFM (para FIXA_UFM ou parte fixa da MISTA)"
    )

    percentual_multa = Column(
        Numeric(5, 2),
        comment="Percentual da multa (para PERCENTUAL ou parte da MISTA)"
    )

    # Limites (em UFM)
    valor_minimo_ufm = Column(
        Numeric(10, 2),
        comment="Valor mínimo da multa em UFM"
    )

    valor_maximo_ufm = Column(
        Numeric(10, 2),
        comment="Valor máximo da multa em UFM"
    )

    # Gravidade
    gravidade = Column(
        String(20),
        default="MEDIA",
        comment="LEVE, MEDIA, GRAVE, GRAVISSIMA"
    )

    # Reincidência
    permite_reincidencia = Column(
        Boolean,
        default=True,
        comment="Se permite cálculo de acréscimo por reincidência"
    )

    # Vigência
    data_inicio_vigencia = Column(Date, nullable=False)
    data_fim_vigencia = Column(Date)

    # Status
    ativo = Column(Boolean, default=True, nullable=False)

    # Observações
    observacoes = Column(Text)

    __table_args__ = (
        Index("idx_catalogo_codigo", "codigo"),
        Index("idx_catalogo_ativo", "ativo"),
        {"schema": "fiscal"}
    )

class OrdemFiscalizacao(ModeloBase):
    """
    Ordem de Fiscalização
    Autoriza agente fiscal a realizar diligências
    """
    __tablename__ = "fiscal.ordens_fiscalizacao"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número da ordem
    numero_ordem = Column(String(30), unique=True, nullable=False)

    # Data de emissão
    data_emissao = Column(Date, default=date.today, nullable=False)

    # Fiscal responsável
    fiscal_id = Column(
        UUID(as_uuid=True),
        ForeignKey("admin.usuarios.id"),
        nullable=False
    )

    # Contribuinte fiscalizado
    contribuinte_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Estabelecimento (se aplicável)
    estabelecimento_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.estabelecimentos.id")
    )

    # Imóvel (se aplicável)
    imovel_id = Column(UUID(as_uuid=True), ForeignKey("cadastro.imoveis.id"))

    # Tipo de fiscalização
    tipo_fiscalizacao = Column(
        String(50),
        nullable=False,
        comment="ROTINA, DENUNCIA, ESPECIAL, OBRAS, ISSQN, IPTU, etc."
    )

    # Motivo/Objeto
    objeto_fiscalizacao = Column(
        Text,
        nullable=False,
        comment="Descrição do objeto da fiscalização"
    )

    # Período fiscalizado
    data_inicio_periodo = Column(Date, comment="Início do período a fiscalizar")
    data_fim_periodo = Column(Date, comment="Fim do período a fiscalizar")

    # Prazo para conclusão
    data_prazo = Column(Date, nullable=False, comment="Prazo para conclusão")

    # Status
    status = Column(
        SQLEnum(StatusFiscalizacao),
        default=StatusFiscalizacao.EM_ANDAMENTO,
        nullable=False
    )

    # Conclusão
    data_conclusao = Column(Date)
    relatorio_final = Column(Text, comment="Relatório final da fiscalização")

    # Irregularidades encontradas
    irregularidades_encontradas = Column(Boolean, default=False)
    descricao_irregularidades = Column(Text)

    # Relacionamentos
    fiscal = relationship("Usuario", foreign_keys=[fiscal_id])
    contribuinte = relationship("Pessoa", foreign_keys=[contribuinte_id])
    estabelecimento = relationship("Estabelecimento")
    imovel = relationship("Imovel")
    autos_infracao = relationship("AutoInfracao", back_populates="ordem_fiscalizacao")

    __table_args__ = (
        Index("idx_ordens_fiscalizacao_numero", "numero_ordem"),
        Index("idx_ordens_fiscalizacao_fiscal", "fiscal_id"),
        Index("idx_ordens_fiscalizacao_contribuinte", "contribuinte_id"),
        Index("idx_ordens_fiscalizacao_status", "status"),
        {"schema": "fiscal"}
    )


class AutoInfracao(ModeloBase):
    """
    Auto de Infração
    Lavrado quando constatada infração à legislação tributária
    """
    __tablename__ = "fiscal.autos_infracao"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número do auto
    numero_auto = Column(
        String(30),
        unique=True,
        nullable=False,
        comment="Número único do auto de infração"
    )

    # Data de lavratura
    data_lavratura = Column(Date, default=date.today, nullable=False)

    # Ordem de fiscalização relacionada
    ordem_fiscalizacao_id = Column(
        UUID(as_uuid=True),
        ForeignKey("fiscal.ordens_fiscalizacao.id")
    )

    # Fiscal autuante
    fiscal_autuante_id = Column(
        UUID(as_uuid=True),
        ForeignKey("admin.usuarios.id"),
        nullable=False
    )

    # Autuado (infrator)
    autuado_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Estabelecimento/Imóvel (se aplicável)
    estabelecimento_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.estabelecimentos.id")
    )
    imovel_id = Column(UUID(as_uuid=True), ForeignKey("cadastro.imoveis.id"))

    # Tipo de infração
    codigo_infracao = Column(
        String(20),
        nullable=False,
        comment="Código da infração no catálogo"
    )
    descricao_infracao = Column(
        Text,
        nullable=False,
        comment="Descrição da infração cometida"
    )
    artigo_lei = Column(
        String(100),
        nullable=False,
        comment="Artigo da lei infringido"
    )

    # Fundamentação legal
    fundamentacao_legal = Column(Text, nullable=False)

    # Tributo relacionado (se aplicável)
    tipo_tributo = Column(String(20), comment="IPTU, ISSQN, ITBI, TAXA, etc.")

    # Período da infração
    data_inicio_infracao = Column(Date, comment="Início do período da infração")
    data_fim_infracao = Column(Date, comment="Fim do período da infração")

    # Reincidência
    reincidente = Column(Boolean, default=False, comment="Autuado é reincidente")
    numero_reincidencias = Column(Integer, default=0, comment="Número de reincidências")

    # Cálculo da multa
    tipo_multa = Column(
        String(20),
        nullable=False,
        comment="PERCENTUAL, FIXA_UFM, MISTA"
    )
    percentual_multa = Column(
        Numeric(8, 4),
        comment="Percentual da multa (ex: 0.5000 para 50%)"
    )
    ufm_multa = Column(
        Numeric(10, 2),
        comment="Quantidade de UFM (multa fixa)"
    )
    valor_base_calculo = Column(
        Numeric(15, 2),
        comment="Base de cálculo da multa (se percentual)"
    )

    # Valor da multa
    valor_multa = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor total da multa"
    )

    # Acréscimo por reincidência (dobro + 30% a cada nova)
    acrescimo_reincidencia = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Acréscimo devido à reincidência"
    )

    # Valor total
    valor_total = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor total do auto"
    )

    # Notificação
    notificado = Column(Boolean, default=False)
    data_notificacao = Column(Date)
    forma_notificacao = Column(String(50), comment="PESSOAL, CORREIOS, EDITAL, EMAIL")

    # Prazo para defesa
    prazo_defesa_dias = Column(Integer, default=30, comment="Prazo para defesa (dias)")
    data_limite_defesa = Column(Date, comment="Data limite para apresentar defesa")

    # Status
    status = Column(
        SQLEnum(StatusAutoInfracao),
        default=StatusAutoInfracao.LAVRADO,
        nullable=False
    )

    # Pagamento
    pago = Column(Boolean, default=False)
    data_pagamento = Column(Date)
    valor_pago = Column(Numeric(15, 2))

    # DAM
    dam_id = Column(UUID(as_uuid=True), ForeignKey("arrecadacao.dams.id"))

    # Cancelamento
    cancelado = Column(Boolean, default=False)
    data_cancelamento = Column(Date)
    motivo_cancelamento = Column(Text)

    # Inscrição em Dívida Ativa
    inscrito_divida_ativa = Column(Boolean, default=False)
    data_inscricao_divida = Column(Date)

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    ordem_fiscalizacao = relationship("OrdemFiscalizacao", back_populates="autos_infracao")
    fiscal_autuante = relationship("Usuario", foreign_keys=[fiscal_autuante_id])
    autuado = relationship("Pessoa", foreign_keys=[autuado_id])
    estabelecimento = relationship("Estabelecimento")
    imovel = relationship("Imovel")

    __table_args__ = (
        Index("idx_autos_infracao_numero", "numero_auto"),
        Index("idx_autos_infracao_autuado", "autuado_id"),
        Index("idx_autos_infracao_fiscal", "fiscal_autuante_id"),
        Index("idx_autos_infracao_status", "status"),
        Index("idx_autos_infracao_data", "data_lavratura"),
        {"schema": "fiscal"}
    )


class Intimacao(ModeloBase):
    """
    Intimações
    Notificação formal para comparecimento ou apresentação de documentos
    """
    __tablename__ = "fiscal.intimacoes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número da intimação
    numero_intimacao = Column(String(30), unique=True, nullable=False)

    # Data de emissão
    data_emissao = Column(Date, default=date.today, nullable=False)

    # Fiscal responsável
    fiscal_id = Column(UUID(as_uuid=True), ForeignKey("admin.usuarios.id"), nullable=False)

    # Intimado
    intimado_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Tipo de intimação
    tipo_intimacao = Column(
        String(50),
        nullable=False,
        comment="COMPARECIMENTO, DOCUMENTOS, ESCLARECIMENTO, etc."
    )

    # Motivo
    motivo = Column(Text, nullable=False, comment="Motivo da intimação")

    # Prazo para atendimento
    prazo_dias = Column(Integer, nullable=False, default=15)
    data_limite = Column(Date, nullable=False)

    # Documentos solicitados (se aplicável)
    documentos_solicitados = Column(JSONB, comment="Lista de documentos a apresentar")

    # Cumprimento
    cumprida = Column(Boolean, default=False)
    data_cumprimento = Column(Date)
    observacoes_cumprimento = Column(Text)

    # Relacionamentos
    fiscal = relationship("Usuario", foreign_keys=[fiscal_id])
    intimado = relationship("Pessoa", foreign_keys=[intimado_id])

    __table_args__ = (
        Index("idx_intimacoes_numero", "numero_intimacao"),
        Index("idx_intimacoes_intimado", "intimado_id"),
        Index("idx_intimacoes_fiscal", "fiscal_id"),
        Index("idx_intimacoes_cumprida", "cumprida"),
        {"schema": "fiscal"}
    )


class RegimeEspecialFiscalizacao(ModeloBase):
    """
    Regime Especial de Fiscalização
    Controle intensivo sobre contribuinte
    """
    __tablename__ = "fiscal.regime_especial_fiscalizacao"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número do regime
    numero_regime = Column(String(30), unique=True, nullable=False)

    # Contribuinte
    contribuinte_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Estabelecimento (se aplicável)
    estabelecimento_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.estabelecimentos.id")
    )

    # Motivo do regime especial
    motivo = Column(
        Text,
        nullable=False,
        comment="Motivo da instituição do regime especial"
    )

    # Data de início
    data_inicio = Column(Date, default=date.today, nullable=False)

    # Prazo (60 a 360 dias)
    prazo_dias = Column(
        Integer,
        nullable=False,
        comment="Prazo do regime (60-360 dias)"
    )
    data_fim = Column(Date, nullable=False)

    # Fiscal responsável
    fiscal_responsavel_id = Column(
        UUID(as_uuid=True),
        ForeignKey("admin.usuarios.id"),
        nullable=False
    )

    # Medidas especiais
    medidas_especiais = Column(
        JSONB,
        comment="Lista de medidas especiais aplicadas"
    )

    # Acompanhamento diário
    relatorios_acompanhamento = Column(
        JSONB,
        comment="Relatórios de acompanhamento"
    )

    # Ativo
    ativo = Column(Boolean, default=True)
    data_encerramento = Column(Date)
    motivo_encerramento = Column(Text)

    # Relacionamentos
    contribuinte = relationship("Pessoa")
    estabelecimento = relationship("Estabelecimento")
    fiscal_responsavel = relationship("Usuario", foreign_keys=[fiscal_responsavel_id])

    __table_args__ = (
        Index("idx_regime_especial_numero", "numero_regime"),
        Index("idx_regime_especial_contribuinte", "contribuinte_id"),
        Index("idx_regime_especial_ativo", "ativo"),
        {"schema": "fiscal"}
    )
