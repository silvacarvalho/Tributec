"""
Modelos do Módulo de Taxas
TLLFF, Publicidade, Obras, Serviços Urbanos, Contribuições
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

class StatusTaxa(str, enum.Enum):
    """Status da taxa"""
    LANCADA = "LANCADA"
    PAGA = "PAGA"
    CANCELADA = "CANCELADA"
    VENCIDA = "VENCIDA"


# =====================================================
# MODELOS
# =====================================================

class TaxaLFF(ModeloBase):
    """
    Taxa de Licença para Localização e Funcionamento (TLLFF)
    """
    __tablename__ = "taxas.taxa_lff"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número da taxa
    numero_taxa = Column(
        String(30),
        unique=True,
        nullable=False,
        comment="Número único da taxa"
    )

    # Estabelecimento
    estabelecimento_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.estabelecimentos.id"),
        nullable=False
    )

    # Exercício
    ano_exercicio = Column(Integer, nullable=False)

    # Data do lançamento
    data_lancamento = Column(Date, default=date.today, nullable=False)

    # Área do estabelecimento
    area_m2 = Column(
        Numeric(10, 2),
        nullable=False,
        comment="Área do estabelecimento em m²"
    )

    # Atividade principal
    cnae_principal = Column(String(10), nullable=False)
    codigo_atividade = Column(
        String(20),
        nullable=False,
        comment="Código da atividade na tabela de taxas"
    )
    descricao_atividade = Column(String(200), nullable=False)

    # Cálculo: Área × 0,1 × UFM × Fator_Atividade
    valor_ufm = Column(
        Numeric(10, 2),
        nullable=False,
        comment="Valor da UFM no exercício"
    )
    fator_atividade = Column(
        Numeric(5, 2),
        nullable=False,
        comment="Fator multiplicador da atividade"
    )
    valor_base = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Área × 0,1 × UFM"
    )
    valor_taxa = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor total da taxa"
    )

    # Vistoria
    vistoria_realizada = Column(Boolean, default=False)
    data_vistoria = Column(Date)
    fiscal_vistoria_id = Column(UUID(as_uuid=True), ForeignKey("admin.usuarios.id"))
    aprovado_vistoria = Column(Boolean, default=False)
    observacoes_vistoria = Column(Text)

    # Órgãos anuentes
    aprovacao_bombeiros = Column(Boolean, default=False)
    data_aprovacao_bombeiros = Column(Date)
    aprovacao_vigilancia_sanitaria = Column(Boolean, default=False)
    data_aprovacao_vigilancia_sanitaria = Column(Date)
    aprovacao_meio_ambiente = Column(Boolean, default=False)
    data_aprovacao_meio_ambiente = Column(Date)
    aprovacao_obras = Column(Boolean, default=False)
    data_aprovacao_obras = Column(Date)

    # Alvará
    alvara_emitido = Column(Boolean, default=False)
    numero_alvara = Column(String(30))
    data_emissao_alvara = Column(Date)
    data_validade_alvara = Column(Date)

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
        SQLEnum(StatusTaxa),
        default=StatusTaxa.LANCADA,
        nullable=False
    )

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    estabelecimento = relationship("Estabelecimento")

    __table_args__ = (
        UniqueConstraint("estabelecimento_id", "ano_exercicio", name="uq_taxa_lff_estab_ano"),
        Index("idx_taxa_lff_estabelecimento", "estabelecimento_id"),
        Index("idx_taxa_lff_ano", "ano_exercicio"),
        Index("idx_taxa_lff_numero", "numero_taxa"),
        Index("idx_taxa_lff_status", "status"),
        {"schema": "taxas"}
    )


class TaxaFuncionamentoEspecial(ModeloBase):
    """
    Taxa de Funcionamento em Horário Especial (TFHE)
    10% a 30% da TLLFF
    """
    __tablename__ = "taxas.taxa_funcionamento_especial"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Taxa LFF relacionada
    taxa_lff_id = Column(
        UUID(as_uuid=True),
        ForeignKey("taxas.taxa_lff.id"),
        nullable=False
    )

    # Número da taxa
    numero_taxa = Column(String(30), unique=True, nullable=False)

    # Horário especial
    dias_semana = Column(
        JSONB,
        nullable=False,
        comment="Lista de dias da semana: ['segunda', 'domingo', etc.]"
    )
    horario_inicio = Column(String(5), comment="HH:MM")
    horario_fim = Column(String(5), comment="HH:MM")

    # Percentual sobre TLLFF
    percentual_tllff = Column(
        Numeric(5, 2),
        nullable=False,
        comment="10% a 30% conforme horário"
    )

    # Valor
    valor_tllff_base = Column(Numeric(15, 2), nullable=False)
    valor_taxa = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor da TFHE"
    )

    # Vencimento
    data_vencimento = Column(Date, nullable=False)

    # Pagamento
    pago = Column(Boolean, default=False)
    data_pagamento = Column(Date)

    # DAM
    dam_id = Column(UUID(as_uuid=True), ForeignKey("arrecadacao.dams.id"))

    # Status
    status = Column(SQLEnum(StatusTaxa), default=StatusTaxa.LANCADA, nullable=False)

    # Relacionamentos
    taxa_lff = relationship("TaxaLFF")

    __table_args__ = (
        Index("idx_taxa_func_especial_lff", "taxa_lff_id"),
        Index("idx_taxa_func_especial_numero", "numero_taxa"),
        {"schema": "taxas"}
    )


class TaxaPublicidade(ModeloBase):
    """
    Taxa de Licença para Publicidade
    Outdoor, anúncios, faixas, etc.
    """
    __tablename__ = "taxas.taxa_publicidade"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número da taxa
    numero_taxa = Column(String(30), unique=True, nullable=False)

    # Contribuinte
    contribuinte_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Tipo de publicidade
    tipo_publicidade = Column(
        String(50),
        nullable=False,
        comment="OUTDOOR, BACKLIGHT, FAIXA, PAINEL_ELETRONICO, VEICULAR, etc."
    )

    # Localização
    logradouro_id = Column(Integer, ForeignKey("cadastro.logradouros.id"))
    numero = Column(String(10))
    complemento = Column(String(100))
    bairro = Column(String(100))
    referencia = Column(String(200), comment="Ponto de referência")

    # Dimensões
    largura_m = Column(Numeric(8, 2), comment="Largura em metros")
    altura_m = Column(Numeric(8, 2), comment="Altura em metros")
    area_m2 = Column(
        Numeric(10, 2),
        nullable=False,
        comment="Área total em m²"
    )
    quantidade = Column(
        Integer,
        default=1,
        comment="Quantidade de peças (faixas, placas, etc.)"
    )

    # Veículo (se publicidade veicular)
    veiculo_placa = Column(String(10))
    veiculo_modelo = Column(String(100))

    # Período de veiculação
    data_inicio = Column(Date, nullable=False)
    data_fim = Column(Date, nullable=False)
    dias_veiculacao = Column(Integer, comment="Número de dias de veiculação")

    # Cálculo
    valor_m2_dia = Column(
        Numeric(10, 2),
        nullable=False,
        comment="Valor por m²/dia conforme tipo"
    )
    valor_taxa = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Área × Valor_m2_dia × Dias"
    )

    # Autorização
    autorizado = Column(Boolean, default=False)
    data_autorizacao = Column(Date)
    numero_autorizacao = Column(String(30))
    autorizado_por_id = Column(UUID(as_uuid=True), ForeignKey("admin.usuarios.id"))

    # Vencimento
    data_vencimento = Column(Date, nullable=False)

    # Pagamento
    pago = Column(Boolean, default=False)
    data_pagamento = Column(Date)

    # DAM
    dam_id = Column(UUID(as_uuid=True), ForeignKey("arrecadacao.dams.id"))

    # Status
    status = Column(SQLEnum(StatusTaxa), default=StatusTaxa.LANCADA, nullable=False)

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    contribuinte = relationship("Pessoa")
    logradouro = relationship("Logradouro")

    __table_args__ = (
        Index("idx_taxa_publicidade_contribuinte", "contribuinte_id"),
        Index("idx_taxa_publicidade_numero", "numero_taxa"),
        Index("idx_taxa_publicidade_tipo", "tipo_publicidade"),
        {"schema": "taxas"}
    )


class TaxaObra(ModeloBase):
    """
    Taxas de Obras
    Construção, reforma, demolição, habite-se, loteamentos
    """
    __tablename__ = "taxas.taxa_obras"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número da taxa
    numero_taxa = Column(String(30), unique=True, nullable=False)

    # Número do processo de obra
    numero_processo = Column(String(30), nullable=False)

    # Proprietário/Requerente
    proprietario_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Responsável técnico
    responsavel_tecnico_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id")
    )
    registro_profissional = Column(String(50), comment="CREA, CAU, etc.")

    # Imóvel
    imovel_id = Column(UUID(as_uuid=True), ForeignKey("cadastro.imoveis.id"))

    # Tipo de obra
    tipo_obra = Column(
        String(50),
        nullable=False,
        comment="CONSTRUCAO, REFORMA, AMPLIACAO, DEMOLICAO, HABITE_SE, LOTEAMENTO"
    )

    # Área da obra
    area_construir_m2 = Column(Numeric(12, 2), comment="Área a construir em m²")
    area_reformar_m2 = Column(Numeric(12, 2), comment="Área a reformar em m²")
    area_demolir_m2 = Column(Numeric(12, 2), comment="Área a demolir em m²")
    area_total_m2 = Column(Numeric(12, 2), nullable=False, comment="Área total da obra")

    # Valor estimado da obra
    valor_estimado_obra = Column(
        Numeric(15, 2),
        comment="Valor estimado da obra (CUB × área)"
    )

    # Cálculo da taxa
    valor_ufm = Column(Numeric(10, 2), nullable=False)
    quantidade_ufm = Column(Numeric(10, 2), nullable=False, comment="Quantidade de UFMs")
    valor_taxa = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor da taxa"
    )

    # Aprovação do projeto
    projeto_aprovado = Column(Boolean, default=False)
    data_aprovacao_projeto = Column(Date)
    numero_aprovacao = Column(String(30))

    # Alvará de construção
    alvara_emitido = Column(Boolean, default=False)
    numero_alvara = Column(String(30))
    data_emissao_alvara = Column(Date)
    data_validade_alvara = Column(Date)

    # Habite-se (se aplicável)
    habite_se_emitido = Column(Boolean, default=False)
    numero_habite_se = Column(String(30))
    data_habite_se = Column(Date)

    # Vencimento
    data_vencimento = Column(Date, nullable=False)

    # Pagamento
    pago = Column(Boolean, default=False)
    data_pagamento = Column(Date)

    # DAM
    dam_id = Column(UUID(as_uuid=True), ForeignKey("arrecadacao.dams.id"))

    # Status
    status = Column(SQLEnum(StatusTaxa), default=StatusTaxa.LANCADA, nullable=False)

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    proprietario = relationship("Pessoa", foreign_keys=[proprietario_id])
    responsavel_tecnico = relationship("Pessoa", foreign_keys=[responsavel_tecnico_id])
    imovel = relationship("Imovel")

    __table_args__ = (
        Index("idx_taxa_obras_numero", "numero_taxa"),
        Index("idx_taxa_obras_processo", "numero_processo"),
        Index("idx_taxa_obras_proprietario", "proprietario_id"),
        Index("idx_taxa_obras_imovel", "imovel_id"),
        Index("idx_taxa_obras_tipo", "tipo_obra"),
        {"schema": "taxas"}
    )


class TaxaResiduosSolidos(ModeloBase):
    """
    Taxa de Resíduos Sólidos Domiciliares (TRSD)
    Cobrada junto com IPTU
    """
    __tablename__ = "taxas.taxa_residuos_solidos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número da taxa
    numero_taxa = Column(String(30), unique=True, nullable=False)

    # Imóvel
    imovel_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.imoveis.id"),
        nullable=False
    )

    # Exercício
    ano_exercicio = Column(Integer, nullable=False)

    # Tipo de imóvel
    tipo_imovel = Column(
        String(20),
        nullable=False,
        comment="RESIDENCIAL, COMERCIAL, INDUSTRIAL"
    )

    # Frequência de coleta
    frequencia_coleta = Column(
        String(20),
        nullable=False,
        comment="DIARIA, ALTERNADA, SEMANAL"
    )

    # Valor em UFM
    quantidade_ufm = Column(Numeric(10, 2), nullable=False)
    valor_ufm = Column(Numeric(10, 2), nullable=False)
    valor_taxa = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor da taxa"
    )

    # Lançamento conjunto com IPTU
    iptu_lancamento_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tributario.iptu_lancamentos.id")
    )

    # Vencimento
    data_vencimento = Column(Date, nullable=False)

    # Pagamento
    pago = Column(Boolean, default=False)
    data_pagamento = Column(Date)

    # DAM
    dam_id = Column(UUID(as_uuid=True), ForeignKey("arrecadacao.dams.id"))

    # Status
    status = Column(SQLEnum(StatusTaxa), default=StatusTaxa.LANCADA, nullable=False)

    # Relacionamentos
    imovel = relationship("Imovel")

    __table_args__ = (
        UniqueConstraint("imovel_id", "ano_exercicio", name="uq_taxa_residuos_imovel_ano"),
        Index("idx_taxa_residuos_imovel", "imovel_id"),
        Index("idx_taxa_residuos_ano", "ano_exercicio"),
        {"schema": "taxas"}
    )


class ContribuicaoMelhoria(ModeloBase):
    """
    Contribuição de Melhoria
    Obras de pavimentação, calçamento, etc.
    """
    __tablename__ = "taxas.contribuicao_melhoria"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número da contribuição
    numero_contribuicao = Column(String(30), unique=True, nullable=False)

    # Imóvel beneficiado
    imovel_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.imoveis.id"),
        nullable=False
    )

    # Obra pública
    numero_processo_obra = Column(String(30), nullable=False)
    descricao_obra = Column(
        Text,
        nullable=False,
        comment="Descrição da obra realizada"
    )
    data_conclusao_obra = Column(Date)

    # Custo total da obra
    custo_total_obra = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Custo total da obra pública"
    )

    # Rateio
    testada_imovel = Column(
        Numeric(10, 2),
        nullable=False,
        comment="Testada do imóvel em metros"
    )
    testada_total = Column(
        Numeric(12, 2),
        nullable=False,
        comment="Testada total de todos os imóveis beneficiados"
    )
    percentual_rateio = Column(
        Numeric(8, 6),
        nullable=False,
        comment="Percentual de rateio = Testada_Imóvel / Testada_Total"
    )

    # Valor da contribuição
    valor_contribuicao_total = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Custo_Obra × Percentual_Rateio"
    )

    # Limite: 3% do valor venal/ano
    valor_venal_imovel = Column(Numeric(15, 2), nullable=False)
    limite_anual = Column(
        Numeric(15, 2),
        nullable=False,
        comment="3% do valor venal"
    )

    # Parcelamento (em até 12x por ano)
    numero_parcelas = Column(Integer, default=12, nullable=False)
    valor_parcela = Column(Numeric(15, 2), nullable=False)

    # Exercício
    ano_exercicio = Column(Integer, nullable=False)

    # Vencimento
    data_vencimento_primeira_parcela = Column(Date, nullable=False)

    # Status
    status = Column(SQLEnum(StatusTaxa), default=StatusTaxa.LANCADA, nullable=False)

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    imovel = relationship("Imovel")
    parcelas = relationship(
        "ContribuicaoMelhoriaParcela",
        back_populates="contribuicao",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_contrib_melhoria_imovel", "imovel_id"),
        Index("idx_contrib_melhoria_numero", "numero_contribuicao"),
        Index("idx_contrib_melhoria_ano", "ano_exercicio"),
        {"schema": "taxas"}
    )


class ContribuicaoMelhoriaParcela(ModeloBase):
    """
    Parcelas da Contribuição de Melhoria
    """
    __tablename__ = "taxas.contribuicao_melhoria_parcelas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contribuicao_id = Column(
        UUID(as_uuid=True),
        ForeignKey("taxas.contribuicao_melhoria.id", ondelete="CASCADE"),
        nullable=False
    )

    # Número da parcela
    numero_parcela = Column(Integer, nullable=False)

    # Valor
    valor_parcela = Column(Numeric(15, 2), nullable=False)

    # Vencimento
    data_vencimento = Column(Date, nullable=False)

    # Pagamento
    pago = Column(Boolean, default=False)
    data_pagamento = Column(Date)
    valor_pago = Column(Numeric(15, 2))

    # DAM
    dam_id = Column(UUID(as_uuid=True), ForeignKey("arrecadacao.dams.id"))

    # Relacionamentos
    contribuicao = relationship("ContribuicaoMelhoria", back_populates="parcelas")

    __table_args__ = (
        UniqueConstraint("contribuicao_id", "numero_parcela", name="uq_contrib_melhoria_parcela"),
        Index("idx_contrib_melhoria_parcelas_contribuicao", "contribuicao_id"),
        Index("idx_contrib_melhoria_parcelas_vencimento", "data_vencimento"),
        {"schema": "taxas"}
    )


class ContribuicaoIluminacaoPublica(ModeloBase):
    """
    Contribuição para Custeio da Iluminação Pública (CCIP)
    """
    __tablename__ = "taxas.contribuicao_iluminacao_publica"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número da contribuição
    numero_contribuicao = Column(String(30), unique=True, nullable=False)

    # Imóvel
    imovel_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.imoveis.id"),
        nullable=False
    )

    # Exercício e mês
    mes_competencia = Column(Integer, nullable=False)
    ano_competencia = Column(Integer, nullable=False)

    # Consumo de energia
    consumo_kwh = Column(
        Numeric(10, 2),
        comment="Consumo em KWH (se disponível)"
    )

    # Isenção para consumo <= 80 KWH
    isento = Column(Boolean, default=False, comment="Isento se consumo <= 80 KWH")

    # Tarifa B-4b
    tarifa_b4b = Column(
        Numeric(10, 6),
        nullable=False,
        comment="Tarifa B-4b vigente"
    )

    # Valor da contribuição
    valor_contribuicao = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor da CCIP"
    )

    # Cobrada na fatura de energia
    cobrada_fatura_energia = Column(Boolean, default=True)

    # Vencimento
    data_vencimento = Column(Date, nullable=False)

    # Pagamento
    pago = Column(Boolean, default=False)
    data_pagamento = Column(Date)

    # Relacionamentos
    imovel = relationship("Imovel")

    __table_args__ = (
        UniqueConstraint("imovel_id", "mes_competencia", "ano_competencia", name="uq_ccip_imovel_competencia"),
        Index("idx_ccip_imovel", "imovel_id"),
        Index("idx_ccip_competencia", "ano_competencia", "mes_competencia"),
        {"schema": "taxas"}
    )
