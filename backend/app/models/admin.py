"""
Modelos do Módulo Administrativo
Usuários, Perfis, Permissões, Certidões, Parâmetros, Auditoria
"""
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Date, DateTime, Boolean, Numeric,
    ForeignKey, Text, Enum as SQLEnum, Index, UniqueConstraint, Table
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
import uuid
import enum

from app.models.base import ModeloBase
from app.db.base import Base


# =====================================================
# ENUMS
# =====================================================

class TipoCertidao(str, enum.Enum):
    """Tipo de certidão"""
    NEGATIVA = "NEGATIVA"
    POSITIVA_EFEITOS_NEGATIVA = "POSITIVA_EFEITOS_NEGATIVA"
    POSITIVA = "POSITIVA"


# =====================================================
# TABELA ASSOCIATIVA
# =====================================================

usuarios_perfis = Table(
    'admin.usuarios_perfis',
    Base.metadata,
    Column('usuario_id', UUID(as_uuid=True), ForeignKey('admin.usuarios.id'), primary_key=True),
    Column('perfil_id', Integer, ForeignKey('admin.perfis.id'), primary_key=True)
)


# =====================================================
# MODELOS
# =====================================================

class Usuario(ModeloBase):
    """
    Usuários do Sistema
    """
    __tablename__ = "admin.usuarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Dados pessoais
    nome_completo = Column(String(200), nullable=False)
    cpf = Column(String(11), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)

    # Credenciais
    username = Column(String(50), unique=True, nullable=False, index=True)
    senha_hash = Column(String(255), nullable=False)

    # Matrícula funcional
    matricula = Column(String(20), unique=True, index=True)
    cargo = Column(String(100))
    setor = Column(String(100))

    # Perfis (RBAC)
    perfis = relationship(
        "Perfil",
        secondary=usuarios_perfis,
        back_populates="usuarios"
    )

    # Status
    ativo = Column(Boolean, default=True, nullable=False)
    bloqueado = Column(Boolean, default=False)
    data_bloqueio = Column(DateTime)
    motivo_bloqueio = Column(Text)

    # Tentativas de login
    tentativas_login_falhas = Column(Integer, default=0)
    data_ultima_tentativa = Column(DateTime)

    # Último acesso
    data_ultimo_acesso = Column(DateTime)
    ip_ultimo_acesso = Column(INET)

    # Tokens
    refresh_token = Column(String(500))
    refresh_token_expira_em = Column(DateTime)

    # Configurações do usuário
    preferencias = Column(JSONB, comment="Preferências e configurações do usuário")

    # Observações
    observacoes = Column(Text)

    __table_args__ = (
        Index("idx_usuarios_cpf", "cpf"),
        Index("idx_usuarios_email", "email"),
        Index("idx_usuarios_username", "username"),
        Index("idx_usuarios_ativo", "ativo"),
        {"schema": "admin"}
    )


class Perfil(ModeloBase):
    """
    Perfis de Acesso (RBAC - Role-Based Access Control)
    """
    __tablename__ = "admin.perfis"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Dados do perfil
    nome = Column(String(100), unique=True, nullable=False)
    descricao = Column(Text)

    # Slug (identificador único)
    slug = Column(String(50), unique=True, nullable=False, index=True)

    # Ativo
    ativo = Column(Boolean, default=True)

    # Permissões (JSONB para flexibilidade)
    permissoes = Column(
        JSONB,
        nullable=False,
        comment="Lista de permissões concedidas ao perfil"
    )

    # Relacionamentos
    usuarios = relationship(
        "Usuario",
        secondary=usuarios_perfis,
        back_populates="perfis"
    )

    __table_args__ = (
        Index("idx_perfis_slug", "slug"),
        {"schema": "admin"}
    )


class ParametroFiscal(ModeloBase):
    """
    Parâmetros Fiscais e de Sistema
    UFM, Alíquotas, Prazos, etc.
    """
    __tablename__ = "admin.parametros_fiscais"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Chave do parâmetro
    chave = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
        comment="Chave única do parâmetro (ex: UFM_VALOR)"
    )

    # Descrição
    descricao = Column(String(200), nullable=False)

    # Tipo de valor
    tipo_valor = Column(
        String(20),
        nullable=False,
        comment="STRING, INTEGER, DECIMAL, BOOLEAN, DATE, JSON"
    )

    # Valor
    valor_string = Column(String(500))
    valor_inteiro = Column(Integer)
    valor_decimal = Column(Numeric(15, 6))
    valor_booleano = Column(Boolean)
    valor_data = Column(Date)
    valor_json = Column(JSONB)

    # Ano de vigência (para parâmetros anuais)
    ano_vigencia = Column(Integer, comment="Ano de vigência (null = geral)")

    # Editável
    editavel = Column(
        Boolean,
        default=True,
        comment="Pode ser editado via interface"
    )

    # Observações
    observacoes = Column(Text)

    __table_args__ = (
        Index("idx_parametros_chave", "chave"),
        Index("idx_parametros_ano", "ano_vigencia"),
        {"schema": "admin"}
    )


class Certidao(ModeloBase):
    """
    Certidões Emitidas
    Negativa, Positiva com Efeitos de Negativa, Positiva
    """
    __tablename__ = "admin.certidoes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Número da certidão
    numero_certidao = Column(
        String(30),
        unique=True,
        nullable=False,
        index=True,
        comment="Número único da certidão"
    )

    # Tipo de certidão
    tipo_certidao = Column(
        SQLEnum(TipoCertidao),
        nullable=False
    )

    # Data de emissão
    data_emissao = Column(Date, default=date.today, nullable=False)

    # Validade (90 dias padrão, 120 para filantrópicas)
    data_validade = Column(Date, nullable=False)
    dias_validade = Column(Integer, default=90)

    # Interessado
    interessado_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        nullable=False
    )

    # Tipo de contribuinte
    tipo_contribuinte = Column(
        String(50),
        comment="PESSOA_FISICA, PESSOA_JURIDICA, FILANTROPICA"
    )

    # Finalidade
    finalidade = Column(
        String(200),
        comment="Finalidade da certidão solicitada"
    )

    # Débitos encontrados (se Positiva)
    debitos_encontrados = Column(
        JSONB,
        comment="Lista de débitos encontrados (se houver)"
    )
    valor_total_debitos = Column(
        Numeric(15, 2),
        default=Decimal("0.00")
    )

    # Observações sobre parcelamento (se Positiva com Efeitos)
    parcelamento_ativo = Column(Boolean, default=False)
    numero_parcelamento = Column(String(30))

    # Código de verificação
    codigo_verificacao = Column(
        String(20),
        unique=True,
        nullable=False,
        comment="Código para validação online"
    )

    # Emitido por
    emitido_por_id = Column(UUID(as_uuid=True), ForeignKey("admin.usuarios.id"))

    # PDF da certidão
    pdf_certidao = Column(Text, comment="Caminho ou base64 do PDF")

    # Validação online
    validacoes_online = Column(
        Integer,
        default=0,
        comment="Número de validações online realizadas"
    )

    # Cancelamento (se emitida indevidamente)
    cancelada = Column(Boolean, default=False)
    data_cancelamento = Column(Date)
    motivo_cancelamento = Column(Text)

    # Relacionamentos
    interessado = relationship("Pessoa")
    emitido_por = relationship("Usuario", foreign_keys=[emitido_por_id])

    __table_args__ = (
        Index("idx_certidoes_numero", "numero_certidao"),
        Index("idx_certidoes_interessado", "interessado_id"),
        Index("idx_certidoes_tipo", "tipo_certidao"),
        Index("idx_certidoes_codigo", "codigo_verificacao"),
        Index("idx_certidoes_validade", "data_validade"),
        {"schema": "admin"}
    )


class DomicilioTributarioDigital(ModeloBase):
    """
    Domicílio Tributário Digital (DTD)
    Caixa postal eletrônica do contribuinte
    """
    __tablename__ = "admin.domicilio_tributario_digital"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Contribuinte
    contribuinte_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cadastro.pessoas.id"),
        unique=True,
        nullable=False
    )

    # Email principal
    email_principal = Column(String(100), nullable=False)

    # Emails alternativos
    emails_alternativos = Column(
        JSONB,
        comment="Lista de emails alternativos"
    )

    # Configurações de notificação
    notificar_lancamentos = Column(Boolean, default=True)
    notificar_vencimentos = Column(Boolean, default=True)
    notificar_protestos = Column(Boolean, default=True)
    notificar_avisos = Column(Boolean, default=True)

    # Ativo
    ativo = Column(Boolean, default=True)
    data_ativacao = Column(Date, default=date.today)
    data_desativacao = Column(Date)

    # Relacionamentos
    contribuinte = relationship("Pessoa")
    mensagens = relationship(
        "DTDMensagem",
        back_populates="domicilio",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_dtd_contribuinte", "contribuinte_id"),
        Index("idx_dtd_email", "email_principal"),
        {"schema": "admin"}
    )


class DTDMensagem(ModeloBase):
    """
    Mensagens do Domicílio Tributário Digital
    """
    __tablename__ = "admin.dtd_mensagens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # DTD relacionado
    domicilio_id = Column(
        UUID(as_uuid=True),
        ForeignKey("admin.domicilio_tributario_digital.id", ondelete="CASCADE"),
        nullable=False
    )

    # Data/hora de envio
    data_envio = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Assunto
    assunto = Column(String(200), nullable=False)

    # Conteúdo
    conteudo = Column(Text, nullable=False)

    # Tipo de mensagem
    tipo_mensagem = Column(
        String(50),
        nullable=False,
        comment="NOTIFICACAO, ALERTA, LANCAMENTO, VENCIMENTO, etc."
    )

    # Anexos
    anexos = Column(JSONB, comment="Lista de anexos da mensagem")

    # Leitura
    lida = Column(Boolean, default=False)
    data_leitura = Column(DateTime)

    # Prioridade
    prioridade = Column(
        String(20),
        default="NORMAL",
        comment="ALTA, NORMAL, BAIXA"
    )

    # Relacionamentos
    domicilio = relationship("DomicilioTributarioDigital", back_populates="mensagens")

    __table_args__ = (
        Index("idx_dtd_mensagens_domicilio", "domicilio_id"),
        Index("idx_dtd_mensagens_data", "data_envio"),
        Index("idx_dtd_mensagens_lida", "lida"),
        {"schema": "admin"}
    )


class TokenBlacklist(ModeloBase):
    """
    Blacklist de Tokens JWT
    Tokens invalidados (logout) antes da expiração natural
    """
    __tablename__ = "admin.token_blacklist"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Token JWT
    token = Column(Text, nullable=False, unique=True, index=True)

    # Data de adição à blacklist
    data_adicao = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Data de expiração do token
    expira_em = Column(DateTime, nullable=False, index=True)

    # Motivo (opcional)
    motivo = Column(String(200), comment="Motivo da invalidação (opcional)")

    __table_args__ = (
        Index("idx_token_blacklist_token", "token"),
        Index("idx_token_blacklist_expira", "expira_em"),
        {"schema": "admin"}
    )


class AuditoriaLog(ModeloBase):
    """
    Log de Auditoria
    Registro de todas as operações críticas do sistema
    """
    __tablename__ = "admin.auditoria_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Data/hora da operação
    data_hora = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Usuário que executou a operação
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("admin.usuarios.id"))
    usuario_nome = Column(String(200))
    usuario_ip = Column(INET, comment="IP do usuário")

    # Módulo/Entidade afetada
    modulo = Column(
        String(50),
        nullable=False,
        comment="CADASTRO, TRIBUTARIO, ARRECADACAO, etc."
    )
    entidade = Column(
        String(100),
        nullable=False,
        comment="Nome da tabela/entidade"
    )
    entidade_id = Column(UUID(as_uuid=True), comment="ID do registro afetado")

    # Tipo de operação
    operacao = Column(
        String(20),
        nullable=False,
        comment="INSERT, UPDATE, DELETE, SELECT"
    )

    # Descrição da operação
    descricao = Column(Text, nullable=False)

    # Dados antes/depois (para UPDATE)
    dados_antes = Column(JSONB, comment="Estado anterior do registro")
    dados_depois = Column(JSONB, comment="Estado posterior do registro")

    # Informações adicionais
    metadados = Column(JSONB, comment="Metadados adicionais da operação")

    # Relacionamentos
    usuario = relationship("Usuario")

    __table_args__ = (
        Index("idx_auditoria_data", "data_hora"),
        Index("idx_auditoria_usuario", "usuario_id"),
        Index("idx_auditoria_modulo", "modulo"),
        Index("idx_auditoria_entidade", "entidade", "entidade_id"),
        Index("idx_auditoria_operacao", "operacao"),
        {"schema": "admin"}
    )
