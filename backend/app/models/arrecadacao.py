"""
Modelos do Módulo de Arrecadação
DAM, Pagamentos, Parcelamentos, Compensações, Restituições
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

class StatusDAM(str, enum.Enum):
    """Status do DAM"""
    EMITIDO = "EMITIDO"
    PAGO = "PAGO"
    CANCELADO = "CANCELADO"
    VENCIDO = "VENCIDO"


class StatusPagamento(str, enum.Enum):
    """Status do pagamento"""
    PENDENTE = "PENDENTE"
    CONFIRMADO = "CONFIRMADO"
    CANCELADO = "CANCELADO"
    ESTORNADO = "ESTORNADO"


class TipoParcelamento(str, enum.Enum):
    """Tipo de parcelamento"""
    PRIMEIRO = "PRIMEIRO"
    REPARCELAMENTO = "REPARCELAMENTO"


class StatusParcelamento(str, enum.Enum):
    """Status do parcelamento"""
    ATIVO = "ATIVO"
    QUITADO = "QUITADO"
    CANCELADO = "CANCELADO"
    INADIMPLENTE = "INADIMPLENTE"


class TipoCanalPagamento(str, enum.Enum):
    """Canal de pagamento"""
    BANCO = "BANCO"
    LOTERIA = "LOTERIA"
    PIX = "PIX"
    CARTAO_CREDITO = "CARTAO_CREDITO"
    CARTAO_DEBITO = "CARTAO_DEBITO"
    GUICHE_PREFEITURA = "GUICHE_PREFEITURA"
    INTERNET_BANKING = "INTERNET_BANKING"


class TipoPagamento(str, enum.Enum):
    """Tipo de pagamento"""
    DINHEIRO = "DINHEIRO"
    PIX = "PIX"
    BOLETO = "BOLETO"
    CARTAO_CREDITO = "CARTAO_CREDITO"
    CARTAO_DEBITO = "CARTAO_DEBITO"
    TRANSFERENCIA = "TRANSFERENCIA"
    CHEQUE = "CHEQUE"


# =====================================================
# MODELOS
# =====================================================

class Debito(ModeloBase):
    """
    Modelo para débitos tributários
    Representa um débito (IPTU, ISSQN, Taxa, etc) que pode ser pago
    """
    __tablename__ = "debitos"
    __table_args__ = (
        Index("idx_debitos_contribuinte", "contribuinte_id"),
        Index("idx_debitos_status", "status"),
        {"schema": "arrecadacao"}
    )

    # Chaves
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contribuinte_id = Column(UUID(as_uuid=True), ForeignKey("cadastro.pessoas.id"), nullable=False)

    # Identificação
    numero_debito = Column(String(30), unique=True, nullable=False)
    tipo_tributo = Column(String(20), nullable=False, comment="IPTU, ISSQN, TAXA, etc")
    ano_exercicio = Column(Integer, nullable=False)

    # Valores
    valor_principal = Column(Numeric(15, 2), nullable=False)
    valor_juros = Column(Numeric(15, 2), default=0)
    valor_multa = Column(Numeric(15, 2), default=0)
    valor_correcao = Column(Numeric(15, 2), default=0)
    valor_total = Column(Numeric(15, 2), nullable=False)
    valor_pago = Column(Numeric(15, 2), default=0)

    # Datas
    data_vencimento = Column(Date, nullable=False)
    data_pagamento = Column(Date)

    # Status
    status = Column(String(20), default="PENDENTE", comment="PENDENTE, PAGO, VENCIDO, PARCELADO, CANCELADO")

    # Relacionamentos
    contribuinte = relationship("Pessoa")


class DAM(ModeloBase):
    """
    Documento de Arrecadação Municipal
    Guia unificada para pagamento de tributos e taxas
    """
    __tablename__ = "arrecadacao.dams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número do DAM (único)
    numero_dam = Column(
        String(30),
        unique=True,
        nullable=False,
        index=True,
        comment="Número único do DAM"
    )

    # Data de emissão
    data_emissao = Column(Date, default=date.today, nullable=False)

    # Contribuinte
    contribuinte_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Tipo de tributo/receita
    tipo_tributo = Column(
        String(50),
        nullable=False,
        comment="IPTU, ITBI, ISSQN, TAXA, CONTRIBUICAO, DIVIDA_ATIVA, etc."
    )

    # Código da receita
    codigo_receita = Column(
        String(20),
        comment="Código da receita no plano de contas"
    )

    # Descrição
    descricao = Column(String(200), nullable=False, comment="Descrição do DAM")

    # Referência (ID do lançamento original)
    referencia_tipo = Column(
        String(50),
        comment="Tipo da referência: IPTU_PARCELA, ITBI_GUIA, ISSQN_DECLARACAO, etc."
    )
    referencia_id = Column(
        UUID(as_uuid=True),
        comment="ID do registro de origem"
    )

    # Valores
    valor_principal = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor principal do débito"
    )
    valor_juros = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Juros de mora"
    )
    valor_multa = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Multa moratória"
    )
    valor_correcao = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Correção monetária"
    )
    valor_desconto = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Descontos aplicados"
    )
    valor_total = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor total a pagar"
    )

    # Vencimento
    data_vencimento = Column(Date, nullable=False, comment="Data de vencimento")

    # Código de barras e PIX
    codigo_barras = Column(String(48), comment="Código de barras (padrão FEBRABAN)")
    linha_digitavel = Column(String(54), comment="Linha digitável")
    pix_qrcode = Column(Text, comment="QR Code PIX (copia e cola)")
    pix_qrcode_imagem = Column(Text, comment="Imagem do QR Code PIX (base64)")

    # Nosso número (identificação bancária)
    nosso_numero = Column(String(20), comment="Nosso número (banco)")

    # Status
    status = Column(
        SQLEnum(StatusDAM),
        default=StatusDAM.EMITIDO,
        nullable=False
    )

    # Pagamento
    pago = Column(Boolean, default=False, comment="DAM pago")
    data_pagamento = Column(Date, comment="Data do pagamento")
    valor_pago = Column(Numeric(15, 2), comment="Valor efetivamente pago")

    # Canal de pagamento
    canal_pagamento = Column(SQLEnum(TipoCanalPagamento), comment="Canal utilizado para pagamento")

    # Baixa automática
    data_baixa = Column(DateTime, comment="Data/hora da baixa do pagamento")
    baixa_automatica = Column(Boolean, default=False, comment="Baixa automática via integração bancária")

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    contribuinte = relationship("Pessoa")
    pagamentos = relationship("Pagamento", back_populates="dam", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_dams_numero", "numero_dam"),
        Index("idx_dams_contribuinte", "contribuinte_id"),
        Index("idx_dams_tipo", "tipo_tributo"),
        Index("idx_dams_vencimento", "data_vencimento"),
        Index("idx_dams_status", "status"),
        Index("idx_dams_pago", "pago"),
        Index("idx_dams_referencia", "referencia_tipo", "referencia_id"),
        {"schema": "arrecadacao"}
    )


class Pagamento(ModeloBase):
    """
    Registro de Pagamentos
    Controle de pagamentos efetuados
    """
    __tablename__ = "arrecadacao.pagamentos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # DAM relacionado
    dam_id = Column(
        UUID(as_uuid=True),
        ForeignKey("arrecadacao.dams.id", ondelete="CASCADE"),
        nullable=False
    )

    # Número do pagamento
    numero_pagamento = Column(
        String(30),
        unique=True,
        nullable=False,
        comment="Número único do pagamento"
    )

    # Data e hora do pagamento
    data_pagamento = Column(Date, nullable=False, comment="Data do pagamento")
    hora_pagamento = Column(DateTime, default=datetime.utcnow, comment="Data/hora do pagamento")

    # Valor pago
    valor_pago = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor efetivamente pago"
    )

    # Canal de pagamento
    canal_pagamento = Column(
        SQLEnum(TipoCanalPagamento),
        nullable=False,
        comment="Canal utilizado"
    )

    # Dados bancários
    banco = Column(String(5), comment="Código do banco (3 dígitos)")
    agencia = Column(String(10), comment="Agência")
    codigo_autenticacao = Column(String(50), comment="Código de autenticação bancária")
    nosso_numero = Column(String(20), comment="Nosso número")

    # Comprovante
    numero_comprovante = Column(String(50), comment="Número do comprovante")
    comprovante_digital = Column(Text, comment="Comprovante digital (base64 ou URL)")

    # PIX
    pix_txid = Column(String(100), comment="Transaction ID do PIX")
    pix_end_to_end = Column(String(100), comment="End to End ID do PIX")

    # Status
    status = Column(
        SQLEnum(StatusPagamento),
        default=StatusPagamento.PENDENTE,
        nullable=False
    )

    # Confirmação
    confirmado = Column(Boolean, default=False, comment="Pagamento confirmado")
    data_confirmacao = Column(DateTime, comment="Data/hora da confirmação")
    confirmado_por_id = Column(UUID(as_uuid=True), ForeignKey("admin.usuarios.id"))

    # Estorno
    estornado = Column(Boolean, default=False)
    data_estorno = Column(Date)
    motivo_estorno = Column(Text)
    estornado_por_id = Column(UUID(as_uuid=True), ForeignKey("admin.usuarios.id"))

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    dam = relationship("DAM", back_populates="pagamentos")

    __table_args__ = (
        Index("idx_pagamentos_dam", "dam_id"),
        Index("idx_pagamentos_numero", "numero_pagamento"),
        Index("idx_pagamentos_data", "data_pagamento"),
        Index("idx_pagamentos_status", "status"),
        Index("idx_pagamentos_canal", "canal_pagamento"),
        {"schema": "arrecadacao"}
    )


class Parcelamento(ModeloBase):
    """
    Parcelamentos de Débitos
    Controle de parcelamentos concedidos
    """
    __tablename__ = "arrecadacao.parcelamentos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número do parcelamento
    numero_parcelamento = Column(
        String(30),
        unique=True,
        nullable=False,
        comment="Número único do parcelamento"
    )

    # Contribuinte
    contribuinte_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Tipo
    tipo_parcelamento = Column(
        SQLEnum(TipoParcelamento),
        nullable=False,
        comment="PRIMEIRO ou REPARCELAMENTO"
    )

    # Parcelamento anterior (se reparcelamento)
    parcelamento_anterior_id = Column(
        UUID(as_uuid=True),
        ForeignKey("arrecadacao.parcelamentos.id")
    )

    # Data da concessão
    data_concessao = Column(Date, default=date.today, nullable=False)

    # Débitos parcelados (JSONB com lista de DAMs)
    debitos_parcelados = Column(
        JSONB,
        nullable=False,
        comment="Lista de débitos incluídos no parcelamento"
    )

    # Valores
    valor_total_debito = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor total do débito parcelado"
    )
    valor_entrada = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Valor da entrada (se houver)"
    )
    valor_parcelado = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor a ser parcelado"
    )

    # Número de parcelas
    numero_parcelas = Column(
        Integer,
        nullable=False,
        comment="Número total de parcelas"
    )
    valor_parcela = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor de cada parcela"
    )
    valor_minimo_parcela = Column(
        Numeric(15, 2),
        comment="Valor mínimo da parcela (5 UFM PF, 20 UFM PJ)"
    )

    # Vencimento da primeira parcela
    data_vencimento_primeira_parcela = Column(Date, nullable=False)

    # Dia de vencimento
    dia_vencimento = Column(
        Integer,
        nullable=False,
        comment="Dia do vencimento das parcelas (1-31)"
    )

    # Status
    status = Column(
        SQLEnum(StatusParcelamento),
        default=StatusParcelamento.ATIVO,
        nullable=False
    )

    # Cancelamento
    cancelado = Column(Boolean, default=False)
    data_cancelamento = Column(Date)
    motivo_cancelamento = Column(
        Text,
        comment="Cancelamento automático: 2 parcelas em atraso ou 1 > 90 dias"
    )

    # Quitação
    quitado = Column(Boolean, default=False)
    data_quitacao = Column(Date)

    # Aprovação (se necessária anuência da Procuradoria)
    requer_aprovacao = Column(Boolean, default=False)
    aprovado = Column(Boolean, default=True)
    data_aprovacao = Column(Date)
    aprovado_por_id = Column(UUID(as_uuid=True), ForeignKey("admin.usuarios.id"))

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    contribuinte = relationship("Pessoa")
    parcelamento_anterior = relationship("Parcelamento", remote_side=[id])
    parcelas = relationship("ParcelamentoParcela", back_populates="parcelamento", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_parcelamentos_numero", "numero_parcelamento"),
        Index("idx_parcelamentos_contribuinte", "contribuinte_id"),
        Index("idx_parcelamentos_status", "status"),
        CheckConstraint(
            "numero_parcelas BETWEEN 1 AND 24",
            name="check_parcelamento_numero_parcelas"
        ),
        CheckConstraint(
            "dia_vencimento BETWEEN 1 AND 31",
            name="check_parcelamento_dia_vencimento"
        ),
        {"schema": "arrecadacao"}
    )


class ParcelamentoParcela(ModeloBase):
    """
    Parcelas do Parcelamento
    """
    __tablename__ = "arrecadacao.parcelamentos_parcelas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parcelamento_id = Column(
        UUID(as_uuid=True),
        ForeignKey("arrecadacao.parcelamentos.id", ondelete="CASCADE"),
        nullable=False
    )

    # Número da parcela
    numero_parcela = Column(
        Integer,
        nullable=False,
        comment="Número da parcela (1 a N)"
    )

    # Valores
    valor_principal = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor principal da parcela"
    )
    valor_juros = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Juros sobre a parcela"
    )
    valor_multa = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Multa sobre a parcela"
    )
    valor_correcao = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Correção monetária"
    )
    valor_total = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor total da parcela"
    )

    # Vencimento
    data_vencimento = Column(Date, nullable=False, comment="Data de vencimento")

    # Pagamento
    pago = Column(Boolean, default=False)
    data_pagamento = Column(Date)
    valor_pago = Column(Numeric(15, 2))

    # DAM
    dam_id = Column(UUID(as_uuid=True), ForeignKey("arrecadacao.dams.id"))

    # Dias de atraso (calculado)
    dias_atraso = Column(Integer, default=0, comment="Dias de atraso no pagamento")

    # Relacionamentos
    parcelamento = relationship("Parcelamento", back_populates="parcelas")

    __table_args__ = (
        UniqueConstraint("parcelamento_id", "numero_parcela", name="uq_parcelamento_parcela_numero"),
        Index("idx_parcelamentos_parcelas_parcelamento", "parcelamento_id"),
        Index("idx_parcelamentos_parcelas_vencimento", "data_vencimento"),
        Index("idx_parcelamentos_parcelas_pago", "pago"),
        {"schema": "arrecadacao"}
    )


class Compensacao(ModeloBase):
    """
    Compensações de Créditos
    Pagamentos indevidos ou a maior
    """
    __tablename__ = "arrecadacao.compensacoes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número da compensação
    numero_compensacao = Column(
        String(30),
        unique=True,
        nullable=False,
        comment="Número único da compensação"
    )

    # Contribuinte
    contribuinte_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Data da solicitação
    data_solicitacao = Column(Date, default=date.today, nullable=False)

    # Origem do crédito
    origem_credito = Column(
        String(200),
        nullable=False,
        comment="Descrição da origem do crédito"
    )
    pagamento_origem_id = Column(
        UUID(as_uuid=True),
        ForeignKey("arrecadacao.pagamentos.id"),
        comment="Pagamento que gerou o crédito"
    )

    # Valor do crédito
    valor_credito = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor disponível para compensação"
    )

    # Débito a compensar
    dam_compensar_id = Column(
        UUID(as_uuid=True),
        ForeignKey("arrecadacao.dams.id"),
        comment="DAM a ser compensado"
    )
    valor_compensado = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor compensado"
    )

    # Saldo remanescente
    valor_saldo = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Saldo de crédito remanescente"
    )

    # Aprovação
    aprovado = Column(Boolean, default=False)
    data_aprovacao = Column(Date)
    aprovado_por_id = Column(UUID(as_uuid=True), ForeignKey("admin.usuarios.id"))

    # Deferimento
    deferido = Column(Boolean, default=False)
    data_deferimento = Column(Date)
    motivo_indeferimento = Column(Text)

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    contribuinte = relationship("Pessoa")
    pagamento_origem = relationship("Pagamento", foreign_keys=[pagamento_origem_id])
    dam_compensar = relationship("DAM", foreign_keys=[dam_compensar_id])

    __table_args__ = (
        Index("idx_compensacoes_numero", "numero_compensacao"),
        Index("idx_compensacoes_contribuinte", "contribuinte_id"),
        Index("idx_compensacoes_aprovado", "aprovado"),
        {"schema": "arrecadacao"}
    )


class Restituicao(ModeloBase):
    """
    Restituições de Pagamentos Indevidos
    """
    __tablename__ = "arrecadacao.restituicoes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número da restituição
    numero_restituicao = Column(
        String(30),
        unique=True,
        nullable=False,
        comment="Número único da restituição"
    )

    # Contribuinte
    contribuinte_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Data da solicitação
    data_solicitacao = Column(Date, default=date.today, nullable=False)

    # Motivo
    motivo = Column(
        String(200),
        nullable=False,
        comment="PAGAMENTO_INDEVIDO, PAGAMENTO_A_MAIOR, ERRO_LANÇAMENTO, etc."
    )
    descricao_motivo = Column(Text, nullable=False)

    # Pagamento de origem
    pagamento_origem_id = Column(
        UUID(as_uuid=True),
        ForeignKey("arrecadacao.pagamentos.id"),
        comment="Pagamento que será restituído"
    )

    # Valor
    valor_pago_indevido = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor pago indevidamente"
    )
    valor_restituir = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor a ser restituído"
    )

    # Correção monetária
    valor_correcao = Column(
        Numeric(15, 2),
        default=Decimal("0.00"),
        comment="Correção monetária sobre o valor"
    )
    valor_total_restituir = Column(
        Numeric(15, 2),
        nullable=False,
        comment="Valor total a restituir"
    )

    # Aprovação
    aprovado = Column(Boolean, default=False)
    data_aprovacao = Column(Date)
    aprovado_por_id = Column(UUID(as_uuid=True), ForeignKey("admin.usuarios.id"))

    # Deferimento
    deferido = Column(Boolean, default=False)
    data_deferimento = Column(Date)
    motivo_indeferimento = Column(Text)

    # Restituição
    restituido = Column(Boolean, default=False)
    data_restituicao = Column(Date)
    forma_restituicao = Column(
        String(50),
        comment="DEPOSITO_BANCARIO, CHEQUE, COMPENSACAO"
    )

    # Dados bancários (se depósito)
    banco = Column(String(5))
    agencia = Column(String(10))
    conta = Column(String(20))
    tipo_conta = Column(String(20), comment="CORRENTE, POUPANCA")

    # Observações
    observacoes = Column(Text)

    # Relacionamentos
    contribuinte = relationship("Pessoa")
    pagamento_origem = relationship("Pagamento", foreign_keys=[pagamento_origem_id])

    __table_args__ = (
        Index("idx_restituicoes_numero", "numero_restituicao"),
        Index("idx_restituicoes_contribuinte", "contribuinte_id"),
        Index("idx_restituicoes_aprovado", "aprovado"),
        Index("idx_restituicoes_restituido", "restituido"),
        {"schema": "arrecadacao"}
    )

# ==================================================
# PIX E BOLETO
# ==================================================

class PIXTransacao(ModeloBase):
    """
    Modelo para transações PIX
    Armazena dados de QR Code e transações PIX
    """
    __tablename__ = "pix_transacoes"
    __table_args__ = (
        Index("idx_pix_txid", "txid"),
        Index("idx_pix_pagamento", "pagamento_id"),
        {"schema": "arrecadacao"}
    )

    # Chaves
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid)
    pagamento_id = Column(UUID(as_uuid=True), ForeignKey("arrecadacao.pagamentos.id"))

    # Identificação PIX
    txid = Column(String(32), unique=True, nullable=False, comment="ID único da transação PIX")
    chave_pix = Column(String(100), nullable=False, comment="Chave PIX utilizada")
    
    # QR Code
    qr_code_texto = Column(Text, comment="Texto do QR Code (BRCode)")
    qr_code_imagem = Column(Text, comment="QR Code em base64")

    # Valores
    valor = Column(Numeric(15, 2), nullable=False)
    
    # Datas
    data_expiracao = Column(DateTime, comment="Data de expiração do QR Code")
    data_pagamento = Column(DateTime, comment="Data de confirmação do pagamento")
    
    # Status
    status = Column(String(20), default="ATIVO", comment="ATIVO, CONCLUIDO, EXPIRADO, CANCELADO")

    # Relacionamentos
    pagamento = relationship("Pagamento", foreign_keys=[pagamento_id])


class BoletoRegistro(ModeloBase):
    """
    Modelo para registro de boletos bancários
    """
    __tablename__ = "boletos"
    __table_args__ = (
        Index("idx_boletos_nosso_numero", "nosso_numero"),
        Index("idx_boletos_pagamento", "pagamento_id"),
        {"schema": "arrecadacao"}
    )

    # Chaves
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid)
    pagamento_id = Column(UUID(as_uuid=True), ForeignKey("arrecadacao.pagamentos.id"))

    # Identificação do boleto
    nosso_numero = Column(String(20), unique=True, nullable=False, comment="Nosso número do boleto")
    codigo_barras = Column(String(48), comment="Código de barras")
    linha_digitavel = Column(String(54), comment="Linha digitável")
    
    # Valores
    valor = Column(Numeric(15, 2), nullable=False)
    juros_dia = Column(Numeric(15, 2), default=0, comment="Juros por dia de atraso")
    multa_apos_vencimento = Column(Numeric(5, 2), default=0, comment="Multa após vencimento (%)")
    
    # Datas
    data_vencimento = Column(Date, nullable=False)
    data_pagamento = Column(Date, comment="Data de pagamento do boleto")
    data_baixa = Column(Date, comment="Data de baixa do boleto")
    
    # Status
    status = Column(String(20), default="REGISTRADO", comment="REGISTRADO, PAGO, BAIXADO, CANCELADO")
    
    # Relacionamentos
    pagamento = relationship("Pagamento", foreign_keys=[pagamento_id])
