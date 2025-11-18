"""
Modelos do Módulo de Cadastros
Cadastro Imobiliário Municipal, Contribuintes, Cadastros Auxiliares
"""
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Date, DateTime, Boolean, Numeric,
    ForeignKey, Text, Enum as SQLEnum, Index, CheckConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from geoalchemy2 import Geometry
import uuid
import enum

from app.models.base import ModeloBase


# =====================================================
# ENUMS
# =====================================================

class TipoPessoa(str, enum.Enum):
    """Tipo de pessoa"""
    FISICA = "F"
    JURIDICA = "J"


class SituacaoCadastral(str, enum.Enum):
    """Situação cadastral"""
    ATIVO = "ATIVO"
    INATIVO = "INATIVO"
    SUSPENSO = "SUSPENSO"
    CANCELADO = "CANCELADO"


class TipoImovel(str, enum.Enum):
    """Tipo de imóvel"""
    TERRENO = "TERRENO"
    EDIFICADO = "EDIFICADO"
    TERRITORIAL = "TERRITORIAL"


class TipoUso(str, enum.Enum):
    """Tipo de uso do imóvel"""
    RESIDENCIAL = "RESIDENCIAL"
    COMERCIAL = "COMERCIAL"
    INDUSTRIAL = "INDUSTRIAL"
    MISTO = "MISTO"
    RURAL = "RURAL"
    PUBLICO = "PUBLICO"


class TipoLogradouro(str, enum.Enum):
    """Tipo de logradouro"""
    RUA = "RUA"
    AVENIDA = "AVENIDA"
    TRAVESSA = "TRAVESSA"
    PRACA = "PRAÇA"
    ALAMEDA = "ALAMEDA"
    RODOVIA = "RODOVIA"
    ESTRADA = "ESTRADA"
    OUTRO = "OUTRO"


# =====================================================
# MODELOS
# =====================================================

class Pessoa(ModeloBase):
    """
    Cadastro de Pessoas Físicas e Jurídicas (Contribuintes)
    """
    __tablename__ = "cadastro.pessoas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tipo_pessoa = Column(SQLEnum(TipoPessoa), nullable=False, comment="F=Física, J=Jurídica")

    # Pessoa Física
    cpf = Column(String(11), unique=True, index=True, comment="CPF (somente números)")
    nome = Column(String(200), comment="Nome completo")
    data_nascimento = Column(Date, comment="Data de nascimento")
    nome_mae = Column(String(200), comment="Nome da mãe")
    rg = Column(String(20), comment="RG")
    rg_orgao_expedidor = Column(String(20), comment="Órgão expedidor do RG")
    rg_data_expedicao = Column(Date, comment="Data de expedição do RG")

    # Pessoa Jurídica
    cnpj = Column(String(14), unique=True, index=True, comment="CNPJ (somente números)")
    razao_social = Column(String(200), comment="Razão social")
    nome_fantasia = Column(String(200), comment="Nome fantasia")
    data_abertura = Column(Date, comment="Data de abertura da empresa")
    inscricao_estadual = Column(String(20), comment="Inscrição estadual")
    inscricao_municipal = Column(String(20), unique=True, index=True, comment="Inscrição municipal (CCM)")

    # Contato
    email = Column(String(100), comment="E-mail")
    telefone = Column(String(20), comment="Telefone")
    celular = Column(String(20), comment="Celular")

    # Status
    situacao_cadastral = Column(
        SQLEnum(SituacaoCadastral),
        default=SituacaoCadastral.ATIVO,
        nullable=False,
        comment="Situação cadastral"
    )
    data_situacao = Column(Date, default=date.today, comment="Data da situação cadastral")

    # Observações
    observacoes = Column(Text, comment="Observações gerais")

    # Relacionamentos
    enderecos = relationship("Endereco", back_populates="pessoa", cascade="all, delete-orphan")
    imoveis_proprietario = relationship(
        "Imovel",
        foreign_keys="Imovel.proprietario_id",
        back_populates="proprietario"
    )
    estabelecimentos = relationship("Estabelecimento", back_populates="pessoa", cascade="all, delete-orphan")
    procuracoes_outorgante = relationship(
        "Procuracao",
        foreign_keys="Procuracao.outorgante_id",
        back_populates="outorgante"
    )
    procuracoes_outorgado = relationship(
        "Procuracao",
        foreign_keys="Procuracao.outorgado_id",
        back_populates="outorgado"
    )

    __table_args__ = (
        CheckConstraint(
            "(tipo_pessoa = 'F' AND cpf IS NOT NULL) OR (tipo_pessoa = 'J' AND cnpj IS NOT NULL)",
            name="check_pessoa_documento"
        ),
        Index("idx_pessoas_cpf", "cpf"),
        Index("idx_pessoas_cnpj", "cnpj"),
        Index("idx_pessoas_inscricao_municipal", "inscricao_municipal"),
        {"schema": "cadastro"}
    )


class Endereco(ModeloBase):
    """
    Endereços de pessoas e imóveis
    """
    __tablename__ = "cadastro.enderecos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pessoa_id = Column(UUID(as_uuid=True), ForeignKey("cadastro.pessoas.id", ondelete="CASCADE"))

    # Endereço
    cep = Column(String(8), comment="CEP (somente números)")
    logradouro_id = Column(Integer, ForeignKey("cadastro.logradouros.id"))
    numero = Column(String(10), comment="Número")
    complemento = Column(String(100), comment="Complemento")
    bairro = Column(String(100), comment="Bairro")
    cidade = Column(String(100), nullable=False, default="Município", comment="Cidade")
    uf = Column(String(2), nullable=False, default="PA", comment="UF")
    pais = Column(String(50), default="Brasil", comment="País")

    # Tipo de endereço
    tipo_endereco = Column(String(20), comment="Tipo: RESIDENCIAL, COMERCIAL, CORRESPONDENCIA")
    principal = Column(Boolean, default=True, comment="Endereço principal")

    # Relacionamentos
    pessoa = relationship("Pessoa", back_populates="enderecos")
    logradouro = relationship("Logradouro")

    __table_args__ = (
        Index("idx_enderecos_pessoa", "pessoa_id"),
        Index("idx_enderecos_cep", "cep"),
        {"schema": "cadastro"}
    )


class Logradouro(ModeloBase):
    """
    Cadastro de Logradouros
    """
    __tablename__ = "cadastro.logradouros"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tipo = Column(SQLEnum(TipoLogradouro), nullable=False, comment="Tipo de logradouro")
    nome = Column(String(200), nullable=False, comment="Nome do logradouro")
    bairro = Column(String(100), comment="Bairro")
    cep = Column(String(8), comment="CEP")

    # Setor fiscal
    setor_fiscal_id = Column(Integer, ForeignKey("cadastro.setores_fiscais.id"))

    # Relacionamentos
    setor_fiscal = relationship("SetorFiscal", back_populates="logradouros")

    __table_args__ = (
        Index("idx_logradouros_nome", "nome"),
        Index("idx_logradouros_setor", "setor_fiscal_id"),
        {"schema": "cadastro"}
    )


class SetorFiscal(ModeloBase):
    """
    Setores Fiscais do Município
    Usado para Planta Genérica de Valores (IPTU)
    """
    __tablename__ = "cadastro.setores_fiscais"

    id = Column(Integer, primary_key=True, autoincrement=True)
    codigo = Column(String(10), unique=True, nullable=False, comment="Código do setor fiscal")
    nome = Column(String(100), nullable=False, comment="Nome/descrição do setor")
    descricao = Column(Text, comment="Descrição detalhada")

    # Geometria (PostGIS)
    geometria = Column(
        Geometry(geometry_type="POLYGON", srid=4326),
        comment="Polígono do setor fiscal (geo-referenciamento)"
    )

    # Status
    ativo = Column(Boolean, default=True, comment="Setor ativo")

    # Relacionamentos
    logradouros = relationship("Logradouro", back_populates="setor_fiscal")
    valores_pgv = relationship("PlantaGenericaValor", back_populates="setor_fiscal")

    __table_args__ = (
        Index("idx_setores_fiscais_codigo", "codigo"),
        Index("idx_setores_fiscais_geometria", "geometria", postgresql_using="gist"),
        {"schema": "cadastro"}
    )


class Loteamento(ModeloBase):
    """
    Cadastro de Loteamentos
    """
    __tablename__ = "cadastro.loteamentos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String(200), nullable=False, comment="Nome do loteamento")
    numero_processo = Column(String(50), comment="Número do processo de aprovação")
    data_aprovacao = Column(Date, comment="Data de aprovação")
    area_total = Column(Numeric(12, 2), comment="Área total em m²")

    # Localização
    bairro = Column(String(100), comment="Bairro")
    setor_fiscal_id = Column(Integer, ForeignKey("cadastro.setores_fiscais.id"))

    # Geometria
    geometria = Column(
        Geometry(geometry_type="MULTIPOLYGON", srid=4326),
        comment="Polígonos do loteamento"
    )

    # Relacionamentos
    setor_fiscal = relationship("SetorFiscal")
    imoveis = relationship("Imovel", back_populates="loteamento")

    __table_args__ = (
        Index("idx_loteamentos_nome", "nome"),
        Index("idx_loteamentos_geometria", "geometria", postgresql_using="gist"),
        {"schema": "cadastro"}
    )


class Imovel(ModeloBase):
    """
    Cadastro Imobiliário Municipal (CIM)
    Registro de imóveis urbanos (terrenos e edificações)
    """
    __tablename__ = "cadastro.imoveis"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Inscrição Imobiliária (Código único do imóvel)
    inscricao_imobiliaria = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
        comment="Inscrição imobiliária única"
    )

    # Tipo do imóvel
    tipo_imovel = Column(
        SQLEnum(TipoImovel),
        nullable=False,
        comment="TERRENO, EDIFICADO, TERRITORIAL"
    )
    tipo_uso = Column(
        SQLEnum(TipoUso),
        nullable=False,
        comment="Tipo de uso do imóvel"
    )

    # Localização
    logradouro_id = Column(Integer, ForeignKey("cadastro.logradouros.id"))
    numero = Column(String(10), comment="Número do imóvel")
    complemento = Column(String(100), comment="Complemento")
    bairro = Column(String(100), comment="Bairro")
    cep = Column(String(8), comment="CEP")

    # Loteamento
    loteamento_id = Column(Integer, ForeignKey("cadastro.loteamentos.id"))
    quadra = Column(String(10), comment="Quadra")
    lote = Column(String(10), comment="Lote")

    # Setor fiscal
    setor_fiscal_id = Column(Integer, ForeignKey("cadastro.setores_fiscais.id"), nullable=False)

    # Propriedade
    proprietario_id = Column(UUID(as_uuid=True), ForeignKey("cadastro.pessoas.id"), nullable=False)
    possuidor_id = Column(UUID(as_uuid=True), ForeignKey("cadastro.pessoas.id"))
    dominio_util_id = Column(UUID(as_uuid=True), ForeignKey("cadastro.pessoas.id"))

    # Matrícula do Registro de Imóveis
    matricula_registro = Column(String(50), comment="Matrícula do Registro de Imóveis")
    livro = Column(String(10), comment="Livro")
    folha = Column(String(10), comment="Folha")
    cartorio = Column(String(100), comment="Cartório de Registro de Imóveis")
    data_registro = Column(Date, comment="Data do registro")

    # Geo-referenciamento
    geometria = Column(
        Geometry(geometry_type="POLYGON", srid=4326),
        comment="Polígono do imóvel (geo-referenciamento)"
    )
    latitude = Column(Numeric(10, 7), comment="Latitude")
    longitude = Column(Numeric(10, 7), comment="Longitude")

    # Status
    situacao = Column(
        SQLEnum(SituacaoCadastral),
        default=SituacaoCadastral.ATIVO,
        nullable=False
    )
    data_cadastro = Column(Date, default=date.today, comment="Data do cadastro")
    data_situacao = Column(Date, default=date.today, comment="Data da situação")

    # Observações
    observacoes = Column(Text, comment="Observações gerais")

    # Relacionamentos
    proprietario = relationship("Pessoa", foreign_keys=[proprietario_id], back_populates="imoveis_proprietario")
    possuidor = relationship("Pessoa", foreign_keys=[possuidor_id])
    dominio_util = relationship("Pessoa", foreign_keys=[dominio_util_id])
    logradouro = relationship("Logradouro")
    loteamento = relationship("Loteamento", back_populates="imoveis")
    setor_fiscal = relationship("SetorFiscal")
    terreno = relationship("ImovelTerreno", back_populates="imovel", uselist=False, cascade="all, delete-orphan")
    edificacoes = relationship("ImovelEdificacao", back_populates="imovel", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_imoveis_inscricao", "inscricao_imobiliaria"),
        Index("idx_imoveis_proprietario", "proprietario_id"),
        Index("idx_imoveis_setor", "setor_fiscal_id"),
        Index("idx_imoveis_geometria", "geometria", postgresql_using="gist"),
        {"schema": "cadastro"}
    )


class ImovelTerreno(ModeloBase):
    """
    Características do Terreno
    """
    __tablename__ = "cadastro.imoveis_terrenos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    imovel_id = Column(UUID(as_uuid=True), ForeignKey("cadastro.imoveis.id", ondelete="CASCADE"), unique=True)

    # Dimensões
    area_terreno = Column(Numeric(12, 2), nullable=False, comment="Área do terreno em m²")
    testada_principal = Column(Numeric(8, 2), comment="Testada principal em metros")
    testada_secundaria = Column(Numeric(8, 2), comment="Testada secundária em metros")
    profundidade = Column(Numeric(8, 2), comment="Profundidade em metros")

    # Características físicas
    topografia = Column(
        String(20),
        comment="PLANO, ACLIVE, DECLIVE, IRREGULAR"
    )
    pedologia = Column(
        String(20),
        comment="NORMAL, ALAGADICO, ROCHOSO, SAIBRO"
    )
    situacao_quadra = Column(
        String(20),
        comment="MEIO, ESQUINA, DUAS_FRENTES, TRES_FRENTES, QUATRO_FRENTES, ENCRAVADO"
    )

    # Infraestrutura
    pavimentacao = Column(Boolean, default=False, comment="Possui pavimentação")
    meio_fio = Column(Boolean, default=False, comment="Possui meio-fio")
    calcada = Column(Boolean, default=False, comment="Possui calçada")
    arborizacao = Column(Boolean, default=False, comment="Possui arborização")
    iluminacao_publica = Column(Boolean, default=False, comment="Possui iluminação pública")
    rede_agua = Column(Boolean, default=False, comment="Ligado à rede de água")
    rede_esgoto = Column(Boolean, default=False, comment="Ligado à rede de esgoto")
    rede_eletrica = Column(Boolean, default=False, comment="Ligado à rede elétrica")
    coleta_lixo = Column(Boolean, default=False, comment="Possui coleta de lixo")

    # Relacionamentos
    imovel = relationship("Imovel", back_populates="terreno")

    __table_args__ = (
        Index("idx_imoveis_terrenos_imovel", "imovel_id"),
        {"schema": "cadastro"}
    )


class ImovelEdificacao(ModeloBase):
    """
    Características das Edificações
    Pode ter múltiplas edificações no mesmo terreno
    """
    __tablename__ = "cadastro.imoveis_edificacoes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    imovel_id = Column(UUID(as_uuid=True), ForeignKey("cadastro.imoveis.id", ondelete="CASCADE"))

    # Identificação
    numero_edificacao = Column(Integer, default=1, comment="Número sequencial da edificação no terreno")

    # Dimensões
    area_construida = Column(Numeric(12, 2), nullable=False, comment="Área construída em m²")
    area_privativa = Column(Numeric(12, 2), comment="Área privativa em m²")

    # Características construtivas
    padrao_construtivo = Column(
        String(20),
        nullable=False,
        comment="ALTO, MEDIO_ALTO, MEDIO, MEDIO_BAIXO, BAIXO"
    )
    tipo_estrutura = Column(
        String(20),
        comment="CONCRETO, METALICA, MADEIRA, ALVENARIA, MISTA"
    )
    tipo_parede = Column(
        String(20),
        comment="ALVENARIA, MADEIRA, MISTA, PRE_MOLDADA"
    )
    tipo_cobertura = Column(
        String(20),
        comment="LAJE, TELHA_CERAMICA, TELHA_METALICA, TELHA_FIBROCIMENTO, OUTRO"
    )

    # Características da edificação
    numero_pavimentos = Column(Integer, default=1, comment="Número de pavimentos")
    ano_construcao = Column(Integer, comment="Ano de construção")
    estado_conservacao = Column(
        String(20),
        comment="OTIMO, BOM, REGULAR, MAU, PESSIMO"
    )

    # Cômodos
    quantidade_quartos = Column(Integer, default=0, comment="Quantidade de quartos")
    quantidade_salas = Column(Integer, default=0, comment="Quantidade de salas")
    quantidade_banheiros = Column(Integer, default=0, comment="Quantidade de banheiros")
    quantidade_vagas_garagem = Column(Integer, default=0, comment="Vagas de garagem")

    # Tipo de ocupação
    tipo_ocupacao = Column(
        String(20),
        comment="PROPRIETARIO, LOCATARIO, CEDIDO, DESOCUPADO"
    )

    # Relacionamentos
    imovel = relationship("Imovel", back_populates="edificacoes")

    __table_args__ = (
        Index("idx_imoveis_edificacoes_imovel", "imovel_id"),
        {"schema": "cadastro"}
    )


class Estabelecimento(ModeloBase):
    """
    Cadastro de Estabelecimentos Comerciais/Industriais/Serviços
    Para fins de ISSQN
    """
    __tablename__ = "cadastro.estabelecimentos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pessoa_id = Column(UUID(as_uuid=True), ForeignKey("cadastro.pessoas.id", ondelete="CASCADE"), nullable=False)

    # Inscrição Municipal (CCM - Cadastro de Contribuintes Mobiliários)
    inscricao_municipal = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
        comment="Inscrição Municipal (CCM)"
    )

    # Dados do estabelecimento
    nome_fantasia = Column(String(200), comment="Nome fantasia")
    data_inicio_atividade = Column(Date, comment="Data de início das atividades")

    # Endereço do estabelecimento
    logradouro_id = Column(Integer, ForeignKey("cadastro.logradouros.id"))
    numero = Column(String(10), comment="Número")
    complemento = Column(String(100), comment="Complemento")
    bairro = Column(String(100), comment="Bairro")
    cep = Column(String(8), comment="CEP")

    # CNAE - Classificação Nacional de Atividades Econômicas
    cnae_principal = Column(String(10), comment="CNAE principal")
    cnaes_secundarios = Column(JSONB, comment="CNAEs secundários (array)")

    # Atividades (para ISSQN)
    atividades = Column(JSONB, comment="Lista de atividades econômicas (códigos de serviço)")

    # Regime de ISSQN
    regime_issqn = Column(
        String(20),
        comment="NORMAL, FIXO, ESTIMATIVA, SIMPLES_NACIONAL"
    )

    # Área do estabelecimento
    area_ocupada = Column(Numeric(10, 2), comment="Área ocupada em m²")

    # Status
    situacao = Column(
        SQLEnum(SituacaoCadastral),
        default=SituacaoCadastral.ATIVO,
        nullable=False
    )
    data_situacao = Column(Date, default=date.today)

    # Observações
    observacoes = Column(Text, comment="Observações")

    # Relacionamentos
    pessoa = relationship("Pessoa", back_populates="estabelecimentos")
    logradouro = relationship("Logradouro")

    __table_args__ = (
        Index("idx_estabelecimentos_inscricao", "inscricao_municipal"),
        Index("idx_estabelecimentos_pessoa", "pessoa_id"),
        Index("idx_estabelecimentos_cnae", "cnae_principal"),
        {"schema": "cadastro"}
    )


class Procuracao(ModeloBase):
    """
    Cadastro de Procurações e Representações Legais
    """
    __tablename__ = "cadastro.procuracoes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Outorgante (quem outorga os poderes)
    outorgante_id = Column(UUID(as_uuid=True), ForeignKey("cadastro.pessoas.id"), nullable=False)

    # Outorgado (procurador/representante)
    outorgado_id = Column(UUID(as_uuid=True), ForeignKey("cadastro.pessoas.id"), nullable=False)

    # Dados da procuração
    numero_procuracao = Column(String(50), comment="Número da procuração")
    tipo_procuracao = Column(
        String(20),
        nullable=False,
        comment="PUBLICA, PARTICULAR, SUBSTABELECIMENTO"
    )
    data_outorga = Column(Date, nullable=False, comment="Data da outorga")
    data_validade = Column(Date, comment="Data de validade")

    # Poderes
    poderes_especificos = Column(JSONB, comment="Lista de poderes específicos concedidos")
    texto_poderes = Column(Text, comment="Descrição dos poderes")

    # Documentação
    numero_livro = Column(String(20), comment="Número do livro (se pública)")
    numero_folha = Column(String(20), comment="Número da folha (se pública)")
    cartorio = Column(String(200), comment="Cartório onde foi lavrada")

    # Status
    ativa = Column(Boolean, default=True, comment="Procuração ativa")
    data_revogacao = Column(Date, comment="Data de revogação")

    # Relacionamentos
    outorgante = relationship("Pessoa", foreign_keys=[outorgante_id], back_populates="procuracoes_outorgante")
    outorgado = relationship("Pessoa", foreign_keys=[outorgado_id], back_populates="procuracoes_outorgado")

    __table_args__ = (
        Index("idx_procuracoes_outorgante", "outorgante_id"),
        Index("idx_procuracoes_outorgado", "outorgado_id"),
        {"schema": "cadastro"}
    )
