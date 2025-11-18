"""
Modelos do Módulo Tributário
IPTU, ITBI, ISSQN, Motor de Isenções
"""
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Date, DateTime, Boolean, Numeric,
    ForeignKey, Text, Enum as SQLEnum, Index, CheckConstraint,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
import enum

from app.models.base import ModeloBase


# =====================================================
# ENUMS
# =====================================================

class TipoTributo(str, enum.Enum):
    """Tipo de tributo"""
    IPTU = "IPTU"
    ITBI = "ITBI"
    ISSQN = "ISSQN"
    TAXA = "TAXA"
    CONTRIBUICAO = "CONTRIBUICAO"


class StatusLancamento(str, enum.Enum):
    """Status do lançamento tributário"""
    LANCADO = "LANCADO"
    PAGO = "PAGO"
    PAGO_PARCIAL = "PAGO_PARCIAL"
    CANCELADO = "CANCELADO"
    PARCELADO = "PARCELADO"
    EM_DIVIDA = "EM_DIVIDA"


class TipoIsencao(str, enum.Enum):
    """Tipo de isenção"""
    TOTAL = "TOTAL"
    PARCIAL = "PARCIAL"


# =====================================================
# TABELAS AUXILIARES
# =====================================================

class PlantaGenericaValor(ModeloBase):
    """
    Planta Genérica de Valores Territoriais (PGVT)
    Valores de metro quadrado por setor fiscal para cálculo do IPTU
    """
    __tablename__ = "tributario.planta_generica_valores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    setor_fiscal_id = Column(
        Integer,
        ForeignKey("cadastro.setores_fiscais.id"),
        nullable=False
    )

    # Vigência
    ano_vigencia = Column(Integer, nullable=False, comment="Ano de vigência dos valores")
    data_inicio_vigencia = Column(Date, nullable=False, comment="Data de início da vigência")
    data_fim_vigencia = Column(Date, comment="Data de fim da vigência")

    # Valor do metro quadrado
    valor_m2_terreno = Column(
        Numeric(10, 2),
        nullable=False,
        comment="Valor do m² de terreno (VmTT)"
    )

    # Ativa
    ativa = Column(Boolean, default=True, comment="PGV ativa")

    # Observações
    observacoes = Column(Text, comment="Observações")

    # Relacionamentos
    setor_fiscal = relationship("SetorFiscal", back_populates="valores_pgv")

    __table_args__ = (
        UniqueConstraint("setor_fiscal_id", "ano_vigencia", name="uq_pgv_setor_ano"),
        Index("idx_pgv_setor", "setor_fiscal_id"),
        Index("idx_pgv_ano", "ano_vigencia"),
        {"schema": "tributario"}
    )


class TabelaPrecoConstrucao(ModeloBase):
    """
    Tabela de Preços de Construção (TPC)
    Baseada no CUB/SINDUSCON-PA
    Valores de metro quadrado de construção por padrão construtivo
    """
    __tablename__ = "tributario.tabela_preco_construcao"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Vigência
    ano_vigencia = Column(Integer, nullable=False)
    mes_vigencia = Column(Integer, nullable=False, comment="Mês de vigência (1-12)")
    data_inicio_vigencia = Column(Date, nullable=False)
    data_fim_vigencia = Column(Date)

    # Padrão construtivo
    padrao_construtivo = Column(
        String(20),
        nullable=False,
        comment="ALTO, MEDIO_ALTO, MEDIO, MEDIO_BAIXO, BAIXO"
    )

    # Valor do metro quadrado de edificação
    valor_m2_edificacao = Column(
        Numeric(10, 2),
        nullable=False,
        comment="Valor do m² de edificação (VmTE)"
    )

    # Referência CUB
    cub_referencia = Column(
        Numeric(10, 2),
        comment="Valor do CUB de referência (SINDUSCON-PA)"
    )

    # Ativa
    ativa = Column(Boolean, default=True)

    # Observações
    observacoes = Column(Text)

    __table_args__ = (
        UniqueConstraint("ano_vigencia", "mes_vigencia", "padrao_construtivo", name="uq_tpc_periodo_padrao"),
        Index("idx_tpc_ano_mes", "ano_vigencia", "mes_vigencia"),
        Index("idx_tpc_padrao", "padrao_construtivo"),
        {"schema": "tributario"}
    )


class Aliquota(ModeloBase):
    """
    Alíquotas dos Tributos
    """
    __tablename__ = "tributario.aliquotas"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Tributo
    tipo_tributo = Column(SQLEnum(TipoTributo), nullable=False)

    # Categoria (para IPTU: RESIDENCIAL, COMERCIAL, etc.)
    categoria = Column(String(50), comment="Categoria do imóvel/serviço")

    # Faixa de valor (para alíquotas progressivas)
    valor_minimo = Column(Numeric(15, 2), comment="Valor mínimo da faixa")
    valor_maximo = Column(Numeric(15, 2), comment="Valor máximo da faixa")

    # Alíquota
    aliquota = Column(
        Numeric(5, 4),
        nullable=False,
        comment="Alíquota em decimal (ex: 0.0050 para 0,5%)"
    )

    # Vigência
    ano_vigencia = Column(Integer, nullable=False)
    data_inicio_vigencia = Column(Date, nullable=False)
    data_fim_vigencia = Column(Date)

    # Ativa
    ativa = Column(Boolean, default=True)

    # Observações
    observacoes = Column(Text)

    __table_args__ = (
        Index("idx_aliquotas_tributo", "tipo_tributo"),
        Index("idx_aliquotas_ano", "ano_vigencia"),
        {"schema": "tributario"}
    )


# =====================================================
# IPTU - IMPOSTO PREDIAL E TERRITORIAL URBANO
# =====================================================

class IPTULancamento(ModeloBase):
    """
    Lançamentos de IPTU
    Lançado anualmente de ofício
    """
    __tablename__ = "tributario.iptu_lancamentos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    imovel_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.imoveis.id"),
        nullable=False
    )

    # Exercício
    ano_exercicio = Column(Integer, nullable=False, comment="Ano do exercício fiscal")

    # Número do lançamento
    numero_lancamento = Column(
        String(30),
        unique=True,
        nullable=False,
        comment="Número único do lançamento"
    )

    # Data do lançamento
    data_lancamento = Column(Date, default=date.today, nullable=False)

    # Valores Venais (calculados)
    valor_venal_terreno = Column(
        Numeric(15, 2),
        nullable=False,
        comment="VVT = Área × VmTT × FCT"
    )
    valor_venal_edificacao = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="VVE = Área × VmTE × FCE"
    )
    valor_venal_total = Column(
        Numeric(15, 2),
        nullable=False,
        comment="VVI = VVT + VVE"
    )

    # Fatores de Correção aplicados
    fator_correcao_terreno = Column(
        Numeric(5, 4),
        default=Decimal("1.0000"),
        comment="FCT = Fat_Situacao × Fat_Topografia × Fat_Pedologia"
    )
    fator_correcao_edificacao = Column(
        Numeric(5, 4),
        default=Decimal("1.0000"),
        comment="FCE = Fat_Tipo × Fat_Estrutura × Fat_Parede"
    )

    # Detalhamento dos fatores (JSONB para flexibilidade)
    fatores_aplicados = Column(
        JSONB,
        comment="Detalhamento de todos os fatores aplicados"
    )

    # Alíquota aplicada
    aliquota_aplicada = Column(
        Numeric(5, 4),
        nullable=False,
        comment="Alíquota aplicada (progressiva)"
    )
    tipo_uso_calculo = Column(
        String(20),
        nullable=False,
        comment="RESIDENCIAL, MISTO, NAO_RESIDENCIAL, TERRITORIAL"
    )

    # Valor do IPTU
    valor_iptu = Column(
        Numeric(15, 2),
        nullable=False,
        comment="IPTU = VVI × Alíquota"
    )

    # Descontos aplicados
    desconto_pagamento_unico = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Desconto de 10% para pagamento em cota única"
    )
    desconto_iptu_digital = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Desconto adicional de 2% para IPTU Digital"
    )
    desconto_anos_anteriores = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Desconto progressivo (90% a 30% nos primeiros 5 anos)"
    )
    percentual_desconto_anos = Column(
        Integer,
        default=0,
        comment="Percentual de desconto por anos anteriores"
    )

    # Valor líquido
    valor_liquido = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor líquido após descontos"
    )

    # Forma de pagamento
    numero_parcelas = Column(
        Integer,
        default=1,
        comment="Número de parcelas (1 a 12)"
    )
    valor_parcela = Column(
        Numeric(15, 2),
        comment="Valor de cada parcela"
    )

    # Vencimentos
    data_vencimento_unico = Column(Date, comment="Vencimento para pagamento único")
    data_vencimento_primeira_parcela = Column(Date, comment="Vencimento da 1ª parcela")

    # Isenção
    isencao_id = Column(UUID(as_uuid=True), ForeignKey("tributario.isencoes.id"))
    valor_isencao = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Valor da isenção concedida"
    )

    # Status
    status = Column(
        SQLEnum(StatusLancamento),
        default=StatusLancamento.LANCADO,
        nullable=False
    )

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    imovel = relationship("Imovel")
    isencao = relationship("Isencao")
    parcelas = relationship("IPTUParcela", back_populates="lancamento", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("imovel_id", "ano_exercicio", name="uq_iptu_imovel_ano"),
        Index("idx_iptu_lancamentos_imovel", "imovel_id"),
        Index("idx_iptu_lancamentos_ano", "ano_exercicio"),
        Index("idx_iptu_lancamentos_numero", "numero_lancamento"),
        Index("idx_iptu_lancamentos_status", "status"),
        {"schema": "tributario"}
    )


class IPTUParcela(ModeloBase):
    """
    Parcelas do IPTU
    """
    __tablename__ = "tributario.iptu_parcelas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lancamento_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tributario.iptu_lancamentos.id", ondelete="CASCADE"),
        nullable=False
    )

    # Número da parcela
    numero_parcela = Column(Integer, nullable=False, comment="Número da parcela (1 a 12)")

    # Valores
    valor_principal = Column(Numeric(15, 2), nullable=False, comment="Valor principal da parcela")
    valor_juros = Column(Numeric(15, 2), default=Decimal("0.00"), comment="Juros de mora")
    valor_multa = Column(Numeric(15, 2), default=Decimal("0.00"), comment="Multa moratória")
    valor_correcao = Column(Numeric(15, 2), default=Decimal("0.00"), comment="Correção monetária")
    valor_total = Column(Numeric(15, 2), nullable=False, comment="Valor total com acréscimos")

    # Vencimento
    data_vencimento = Column(Date, nullable=False, comment="Data de vencimento original")
    data_vencimento_atualizado = Column(Date, comment="Data de vencimento atualizado (se prorrogado)")

    # Pagamento
    pago = Column(Boolean, default=False, comment="Parcela paga")
    data_pagamento = Column(Date, comment="Data do pagamento")
    valor_pago = Column(Numeric(15, 2), comment="Valor efetivamente pago")

    # DAM (Documento de Arrecadação Municipal)
    dam_id = Column(UUID(as_uuid=True), ForeignKey("arrecadacao.dams.id"))

    # Relacionamentos
    lancamento = relationship("IPTULancamento", back_populates="parcelas")

    __table_args__ = (
        UniqueConstraint("lancamento_id", "numero_parcela", name="uq_iptu_parcela_numero"),
        Index("idx_iptu_parcelas_lancamento", "lancamento_id"),
        Index("idx_iptu_parcelas_vencimento", "data_vencimento"),
        Index("idx_iptu_parcelas_pago", "pago"),
        {"schema": "tributario"}
    )


# =====================================================
# ITBI - IMPOSTO SOBRE TRANSMISSÃO DE BENS IMÓVEIS
# =====================================================

class ITBIGuia(ModeloBase):
    """
    Guias de ITBI
    Emitidas antes do registro da transmissão
    """
    __tablename__ = "tributario.itbi_guias"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número da guia
    numero_guia = Column(
        String(30),
        unique=True,
        nullable=False,
        comment="Número único da guia de ITBI"
    )

    # Data de emissão
    data_emissao = Column(Date, default=date.today, nullable=False)

    # Imóvel
    imovel_id = Column(UUID(as_uuid=True), ForeignKey("cadastro.imoveis.id"), nullable=False)

    # Transmitente (vendedor/doador)
    transmitente_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Adquirente (comprador)
    adquirente_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Tipo de transmissão
    tipo_transmissao = Column(
        String(50),
        nullable=False,
        comment="COMPRA_VENDA, DOACAO, PERMUTA, ARREMATACAO, ADJUDICACAO, etc."
    )

    # Valores
    valor_declarado = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor declarado na transação"
    )
    valor_venal = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor venal do imóvel (IPTU)"
    )
    valor_base_calculo = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Maior valor entre declarado e venal"
    )

    # Financiamento SFH
    valor_financiado_sfh = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Valor financiado pelo SFH (alíquota 1%)"
    )
    valor_nao_financiado = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Valor não financiado (alíquota 2%)"
    )

    # Alíquota
    aliquota_sfh = Column(
        Numeric(5, 4),
        default=Decimal("0.0100"),
        comment="Alíquota para parte financiada (1%)"
    )
    aliquota_normal = Column(
        Numeric(5, 4),
        default=Decimal("0.0200"),
        comment="Alíquota normal (2%)"
    )

    # Cálculo do ITBI
    valor_itbi_sfh = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="ITBI sobre parcela financiada"
    )
    valor_itbi_normal = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="ITBI sobre parcela não financiada"
    )
    valor_itbi_total = Column(
        Numeric(15, 2),
        nullable=False,
        comment="ITBI total = ITBI_SFH + ITBI_Normal"
    )

    # Isenção
    isencao_id = Column(UUID(as_uuid=True), ForeignKey("tributario.isencoes.id"))
    valor_isencao = Column(Numeric(15, 2), default=Decimal("0.00"))

    # Valor líquido
    valor_liquido = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor líquido a pagar"
    )

    # Vencimento
    data_vencimento = Column(Date, nullable=False, comment="Data de vencimento")

    # Pagamento
    pago = Column(Boolean, default=False)
    data_pagamento = Column(Date)
    valor_pago = Column(Numeric(15, 2))

    # DAM
    dam_id = Column(UUID(as_uuid=True), ForeignKey("arrecadacao.dams.id"))

    # Registro
    registrado = Column(Boolean, default=False, comment="Transmissão registrada no Cartório")
    data_registro = Column(Date, comment="Data do registro no Cartório")
    matricula_registro = Column(String(50), comment="Matrícula do registro")

    # Arbitramento
    arbitrado = Column(Boolean, default=False, comment="Valor foi arbitrado pela fiscalização")
    data_arbitramento = Column(Date)
    valor_arbitrado = Column(Numeric(15, 2))
    fiscal_arbitrador_id = Column(UUID(as_uuid=True), ForeignKey("admin.usuarios.id"))

    # Status
    status = Column(
        SQLEnum(StatusLancamento),
        default=StatusLancamento.LANCADO,
        nullable=False
    )

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    imovel = relationship("Imovel")
    transmitente = relationship("Pessoa", foreign_keys=[transmitente_id])
    adquirente = relationship("Pessoa", foreign_keys=[adquirente_id])
    isencao = relationship("Isencao")

    __table_args__ = (
        Index("idx_itbi_guias_numero", "numero_guia"),
        Index("idx_itbi_guias_imovel", "imovel_id"),
        Index("idx_itbi_guias_pago", "pago"),
        Index("idx_itbi_guias_status", "status"),
        {"schema": "tributario"}
    )


# =====================================================
# ISSQN - IMPOSTO SOBRE SERVIÇOS DE QUALQUER NATUREZA
# =====================================================

class ISSQNDeclaracao(ModeloBase):
    """
    Declarações de ISSQN
    Regime de lançamento por homologação
    """
    __tablename__ = "tributario.issqn_declaracoes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Estabelecimento prestador
    estabelecimento_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.estabelecimentos.id"),
        nullable=False
    )

    # Número da declaração
    numero_declaracao = Column(
        String(30),
        unique=True,
        nullable=False,
        comment="Número único da declaração"
    )

    # Período de apuração
    mes_competencia = Column(Integer, nullable=False, comment="Mês de competência (1-12)")
    ano_competencia = Column(Integer, nullable=False, comment="Ano de competência")
    data_declaracao = Column(Date, default=date.today, nullable=False)

    # Regime de tributação
    regime_tributacao = Column(
        String(30),
        nullable=False,
        comment="NORMAL, FIXO, ESTIMATIVA, SIMPLES_NACIONAL"
    )

    # Receita bruta
    receita_bruta_total = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Receita bruta total do período"
    )

    # Deduções permitidas
    deducoes_materiais = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Dedução de materiais (construção civil 7.02, 7.05)"
    )
    outras_deducoes = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Outras deduções permitidas"
    )

    # Base de cálculo
    base_calculo = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Base de cálculo = Receita - Deduções"
    )

    # Alíquota
    aliquota = Column(
        Numeric(5, 4),
        default=Decimal("0.0500"),
        comment="Alíquota aplicada (padrão 5%)"
    )

    # Valor do ISSQN
    valor_issqn = Column(
        Numeric(15, 2),
        nullable=False,
        comment="ISSQN = Base × Alíquota"
    )

    # Retenções
    valor_retido_terceiros = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="ISSQN retido por tomadores"
    )

    # Valor a recolher
    valor_a_recolher = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor a recolher = ISSQN - Retenções"
    )

    # Regime fixo anual
    valor_fixo_ufm = Column(
        Numeric(10, 2),
        comment="Valor fixo em UFM (regime fixo anual)"
    )
    quantidade_profissionais = Column(
        Integer,
        comment="Quantidade de profissionais (sociedades uniprofissionais)"
    )

    # Isenção
    isencao_id = Column(UUID(as_uuid=True), ForeignKey("tributario.isencoes.id"))
    valor_isencao = Column(Numeric(15, 2), default=Decimal("0.00"))

    # Vencimento
    data_vencimento = Column(Date, nullable=False)

    # Pagamento
    pago = Column(Boolean, default=False)
    data_pagamento = Column(Date)
    valor_pago = Column(Numeric(15, 2))

    # DAM
    dam_id = Column(UUID(as_uuid=True), ForeignKey("arrecadacao.dams.id"))

    # Status
    status = Column(
        SQLEnum(StatusLancamento),
        default=StatusLancamento.LANCADO,
        nullable=False
    )

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    estabelecimento = relationship("Estabelecimento")
    isencao = relationship("Isencao")
    retencoes = relationship("ISSQNRetencao", back_populates="declaracao")

    __table_args__ = (
        UniqueConstraint("estabelecimento_id", "mes_competencia", "ano_competencia", name="uq_issqn_estab_competencia"),
        Index("idx_issqn_declaracoes_estabelecimento", "estabelecimento_id"),
        Index("idx_issqn_declaracoes_competencia", "ano_competencia", "mes_competencia"),
        Index("idx_issqn_declaracoes_numero", "numero_declaracao"),
        Index("idx_issqn_declaracoes_status", "status"),
        {"schema": "tributario"}
    )


class ISSQNRetencao(ModeloBase):
    """
    Retenções de ISSQN na Fonte
    Quando o tomador é responsável pelo recolhimento
    """
    __tablename__ = "tributario.issqn_retencoes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Tomador (responsável pela retenção)
    tomador_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Prestador (que teve o ISSQN retido)
    prestador_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.estabelecimentos.id"),
        nullable=False
    )

    # Declaração relacionada (opcional)
    declaracao_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tributario.issqn_declaracoes.id")
    )

    # Número do documento de retenção
    numero_retencao = Column(String(30), unique=True, nullable=False)

    # Período
    mes_competencia = Column(Integer, nullable=False)
    ano_competencia = Column(Integer, nullable=False)
    data_retencao = Column(Date, default=date.today, nullable=False)

    # Valores
    valor_servico = Column(Numeric(15, 2), nullable=False, comment="Valor do serviço prestado")
    aliquota = Column(Numeric(5, 4), default=Decimal("0.0500"))
    valor_issqn_retido = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor do ISSQN retido"
    )

    # Código do serviço
    codigo_servico = Column(String(10), comment="Código do serviço na lista (ex: 7.02)")

    # Vencimento
    data_vencimento = Column(Date, nullable=False)

    # Pagamento (recolhimento pelo tomador)
    recolhido = Column(Boolean, default=False)
    data_recolhimento = Column(Date)
    valor_recolhido = Column(Numeric(15, 2))

    # DAM
    dam_id = Column(UUID(as_uuid=True), ForeignKey("arrecadacao.dams.id"))

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    tomador = relationship("Pessoa", foreign_keys=[tomador_id])
    prestador = relationship("Estabelecimento", foreign_keys=[prestador_id])
    declaracao = relationship("ISSQNDeclaracao", back_populates="retencoes")

    __table_args__ = (
        Index("idx_issqn_retencoes_tomador", "tomador_id"),
        Index("idx_issqn_retencoes_prestador", "prestador_id"),
        Index("idx_issqn_retencoes_numero", "numero_retencao"),
        Index("idx_issqn_retencoes_competencia", "ano_competencia", "mes_competencia"),
        {"schema": "tributario"}
    )


# =====================================================
# ISENÇÕES
# =====================================================

class Isencao(ModeloBase):
    """
    Isenções Tributárias
    Controle de isenções totais ou parciais de tributos
    """
    __tablename__ = "tributario.isencoes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número do processo de isenção
    numero_processo = Column(String(30), unique=True, nullable=False)

    # Beneficiário
    beneficiario_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Tipo de tributo
    tipo_tributo = Column(SQLEnum(TipoTributo), nullable=False)

    # Tipo de isenção
    tipo_isencao = Column(SQLEnum(TipoIsencao), nullable=False)

    # Percentual de isenção (se parcial)
    percentual_isencao = Column(
        Numeric(5, 2),
        default=Decimal("100.00"),
        comment="Percentual de isenção (0 a 100)"
    )

    # Fundamento legal
    fundamento_legal = Column(
        String(200),
        nullable=False,
        comment="Base legal da isenção (Lei, Decreto, etc.)"
    )
    artigo_lei = Column(String(50), comment="Artigo da lei")

    # Motivo
    motivo = Column(
        String(100),
        nullable=False,
        comment="IDOSO, DEFICIENTE, BAIXA_RENDA, FILANTROPIA, RELIGIOSO, etc."
    )
    descricao_motivo = Column(Text, comment="Descrição detalhada do motivo")

    # Vigência
    data_inicio = Column(Date, nullable=False, comment="Data de início da isenção")
    data_fim = Column(Date, comment="Data de fim da isenção (null = indeterminado)")

    # Imóvel (para IPTU/ITBI)
    imovel_id = Column(UUID(as_uuid=True), ForeignKey("cadastro.imoveis.id"))

    # Estabelecimento (para ISSQN)
    estabelecimento_id = Column(UUID(as_uuid=True), ForeignKey("cadastro.estabelecimentos.id"))

    # Aprovação
    data_solicitacao = Column(Date, default=date.today)
    data_aprovacao = Column(Date)
    aprovado_por_id = Column(UUID(as_uuid=True), ForeignKey("admin.usuarios.id"))

    # Status
    ativa = Column(Boolean, default=True, comment="Isenção ativa")
    data_cancelamento = Column(Date)
    motivo_cancelamento = Column(Text)

    # Documentação
    documentos_anexos = Column(JSONB, comment="Lista de documentos anexados")

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    beneficiario = relationship("Pessoa")
    imovel = relationship("Imovel")
    estabelecimento = relationship("Estabelecimento")

    __table_args__ = (
        Index("idx_isencoes_beneficiario", "beneficiario_id"),
        Index("idx_isencoes_tributo", "tipo_tributo"),
        Index("idx_isencoes_numero", "numero_processo"),
        Index("idx_isencoes_ativa", "ativa"),
        CheckConstraint(
            "percentual_isencao >= 0 AND percentual_isencao <= 100",
            name="check_isencao_percentual"
        ),
        {"schema": "tributario"}
    )
