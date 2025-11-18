"""Criação das tabelas do módulo de Cadastro

Revision ID: 003_cadastro
Revises: 002_criar_tabelas
Create Date: 2025-11-18 04:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from geoalchemy2 import Geometry
import uuid

# revision identifiers, used by Alembic.
revision: str = '003_cadastro'
down_revision: Union[str, None] = '002_criar_tabelas'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Cria tabelas do módulo de Cadastro
    """

    # =====================================================
    # SCHEMA: cadastro
    # =====================================================

    # Tabela: cadastro.pessoas
    op.create_table(
        'pessoas',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('tipo_pessoa', sa.Enum('F', 'J', name='tipo_pessoa'), nullable=False),
        sa.Column('situacao_cadastral', sa.Enum('ATIVO', 'INATIVO', 'SUSPENSO', 'CANCELADO', name='situacao_cadastral'), default='ATIVO'),
        # PF
        sa.Column('cpf', sa.String(length=11), nullable=True),
        sa.Column('rg', sa.String(length=20), nullable=True),
        sa.Column('nome_completo', sa.String(length=200), nullable=True),
        sa.Column('nome_mae', sa.String(length=200), nullable=True),
        sa.Column('data_nascimento', sa.Date(), nullable=True),
        sa.Column('sexo', sa.String(length=1), nullable=True),
        sa.Column('estado_civil', sa.String(length=20), nullable=True),
        sa.Column('profissao', sa.String(length=100), nullable=True),
        # PJ
        sa.Column('cnpj', sa.String(length=14), nullable=True),
        sa.Column('inscricao_estadual', sa.String(length=20), nullable=True),
        sa.Column('razao_social', sa.String(length=200), nullable=True),
        sa.Column('nome_fantasia', sa.String(length=200), nullable=True),
        sa.Column('data_abertura', sa.Date(), nullable=True),
        sa.Column('cnae_principal', sa.String(length=10), nullable=True),
        sa.Column('natureza_juridica', sa.String(length=50), nullable=True),
        sa.Column('porte_empresa', sa.String(length=20), nullable=True),
        # Contato
        sa.Column('email', sa.String(length=100), nullable=True),
        sa.Column('telefone', sa.String(length=20), nullable=True),
        sa.Column('celular', sa.String(length=20), nullable=True),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['criado_por_id'], ['admin.usuarios.id']),
        sa.ForeignKeyConstraint(['atualizado_por_id'], ['admin.usuarios.id']),
        sa.PrimaryKeyConstraint('id'),
        schema='cadastro'
    )
    op.create_index('idx_pessoas_cpf', 'pessoas', ['cpf'], unique=True, schema='cadastro')
    op.create_index('idx_pessoas_cnpj', 'pessoas', ['cnpj'], unique=True, schema='cadastro')
    op.create_index('idx_pessoas_tipo', 'pessoas', ['tipo_pessoa'], unique=False, schema='cadastro')
    op.create_index('idx_pessoas_situacao', 'pessoas', ['situacao_cadastral'], unique=False, schema='cadastro')

    # Tabela: cadastro.setores_fiscais
    op.create_table(
        'setores_fiscais',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('codigo', sa.String(length=10), nullable=False),
        sa.Column('nome', sa.String(length=100), nullable=False),
        sa.Column('descricao', sa.Text(), nullable=True),
        sa.Column('poligono', Geometry('POLYGON', srid=4326), nullable=True),
        sa.Column('ativo', sa.Boolean(), default=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['criado_por_id'], ['admin.usuarios.id']),
        sa.ForeignKeyConstraint(['atualizado_por_id'], ['admin.usuarios.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('codigo'),
        schema='cadastro'
    )
    op.create_index('idx_setores_codigo', 'setores_fiscais', ['codigo'], unique=False, schema='cadastro')

    # Tabela: cadastro.logradouros
    op.create_table(
        'logradouros',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('tipo_logradouro', sa.Enum('RUA', 'AVENIDA', 'TRAVESSA', 'PRAÇA', 'ALAMEDA', 'RODOVIA', 'ESTRADA', 'OUTRO', name='tipo_logradouro'), nullable=False),
        sa.Column('nome', sa.String(length=200), nullable=False),
        sa.Column('cep', sa.String(length=8), nullable=True),
        sa.Column('bairro', sa.String(length=100), nullable=True),
        sa.Column('setor_fiscal_id', sa.Integer(), nullable=True),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['setor_fiscal_id'], ['cadastro.setores_fiscais.id']),
        sa.ForeignKeyConstraint(['criado_por_id'], ['admin.usuarios.id']),
        sa.ForeignKeyConstraint(['atualizado_por_id'], ['admin.usuarios.id']),
        sa.PrimaryKeyConstraint('id'),
        schema='cadastro'
    )
    op.create_index('idx_logradouros_nome', 'logradouros', ['nome'], unique=False, schema='cadastro')
    op.create_index('idx_logradouros_cep', 'logradouros', ['cep'], unique=False, schema='cadastro')

    # Tabela: cadastro.enderecos
    op.create_table(
        'enderecos',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('pessoa_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('logradouro_id', sa.Integer(), nullable=True),
        sa.Column('numero', sa.String(length=10), nullable=True),
        sa.Column('complemento', sa.String(length=100), nullable=True),
        sa.Column('bairro', sa.String(length=100), nullable=True),
        sa.Column('cep', sa.String(length=8), nullable=True),
        sa.Column('cidade', sa.String(length=100), nullable=True),
        sa.Column('uf', sa.String(length=2), nullable=True),
        sa.Column('pais', sa.String(length=50), default='Brasil'),
        sa.Column('principal', sa.Boolean(), default=False),
        sa.Column('tipo_endereco', sa.String(length=30), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.ForeignKeyConstraint(['pessoa_id'], ['cadastro.pessoas.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['logradouro_id'], ['cadastro.logradouros.id']),
        sa.PrimaryKeyConstraint('id'),
        schema='cadastro'
    )
    op.create_index('idx_enderecos_pessoa', 'enderecos', ['pessoa_id'], unique=False, schema='cadastro')

    # Tabela: cadastro.loteamentos
    op.create_table(
        'loteamentos',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('nome', sa.String(length=200), nullable=False),
        sa.Column('codigo', sa.String(length=20), nullable=True),
        sa.Column('setor_fiscal_id', sa.Integer(), nullable=True),
        sa.Column('data_aprovacao', sa.Date(), nullable=True),
        sa.Column('decreto_aprovacao', sa.String(length=50), nullable=True),
        sa.Column('area_total', sa.Numeric(12, 2), nullable=True),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['setor_fiscal_id'], ['cadastro.setores_fiscais.id']),
        sa.ForeignKeyConstraint(['criado_por_id'], ['admin.usuarios.id']),
        sa.ForeignKeyConstraint(['atualizado_por_id'], ['admin.usuarios.id']),
        sa.PrimaryKeyConstraint('id'),
        schema='cadastro'
    )

    # Tabela: cadastro.imoveis
    op.create_table(
        'imoveis',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('inscricao_municipal', sa.String(length=20), nullable=False),
        sa.Column('tipo_imovel', sa.Enum('TERRENO', 'EDIFICADO', 'TERRITORIAL', name='tipo_imovel'), nullable=False),
        sa.Column('tipo_uso', sa.Enum('RESIDENCIAL', 'COMERCIAL', 'INDUSTRIAL', 'MISTO', 'RURAL', 'PUBLICO', name='tipo_uso'), nullable=False),
        sa.Column('situacao_cadastral', sa.Enum('ATIVO', 'INATIVO', 'SUSPENSO', 'CANCELADO', name='situacao_cadastral'), default='ATIVO'),
        sa.Column('proprietario_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('logradouro_id', sa.Integer(), nullable=True),
        sa.Column('numero', sa.String(length=10), nullable=True),
        sa.Column('complemento', sa.String(length=100), nullable=True),
        sa.Column('bairro', sa.String(length=100), nullable=True),
        sa.Column('loteamento_id', sa.Integer(), nullable=True),
        sa.Column('quadra', sa.String(length=10), nullable=True),
        sa.Column('lote', sa.String(length=10), nullable=True),
        sa.Column('setor_fiscal_id', sa.Integer(), nullable=True),
        sa.Column('localizacao', Geometry('POINT', srid=4326), nullable=True),
        sa.Column('matricula_registro', sa.String(length=50), nullable=True),
        sa.Column('cartorio', sa.String(length=100), nullable=True),
        sa.Column('livro', sa.String(length=20), nullable=True),
        sa.Column('folha', sa.String(length=20), nullable=True),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['proprietario_id'], ['cadastro.pessoas.id']),
        sa.ForeignKeyConstraint(['logradouro_id'], ['cadastro.logradouros.id']),
        sa.ForeignKeyConstraint(['loteamento_id'], ['cadastro.loteamentos.id']),
        sa.ForeignKeyConstraint(['setor_fiscal_id'], ['cadastro.setores_fiscais.id']),
        sa.ForeignKeyConstraint(['criado_por_id'], ['admin.usuarios.id']),
        sa.ForeignKeyConstraint(['atualizado_por_id'], ['admin.usuarios.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('inscricao_municipal'),
        schema='cadastro'
    )
    op.create_index('idx_imoveis_inscricao', 'imoveis', ['inscricao_municipal'], unique=True, schema='cadastro')
    op.create_index('idx_imoveis_proprietario', 'imoveis', ['proprietario_id'], unique=False, schema='cadastro')
    op.create_index('idx_imoveis_tipo', 'imoveis', ['tipo_imovel'], unique=False, schema='cadastro')
    op.create_index('idx_imoveis_situacao', 'imoveis', ['situacao_cadastral'], unique=False, schema='cadastro')

    # Tabela: cadastro.imoveis_terreno
    op.create_table(
        'imoveis_terreno',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('imovel_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('area_total', sa.Numeric(10, 2), nullable=False),
        sa.Column('testada_principal', sa.Numeric(8, 2), nullable=True),
        sa.Column('testada_secundaria', sa.Numeric(8, 2), nullable=True),
        sa.Column('profundidade_media', sa.Numeric(8, 2), nullable=True),
        sa.Column('topografia', sa.String(length=30), nullable=True),
        sa.Column('situacao', sa.String(length=30), nullable=True),
        sa.Column('pedologia', sa.String(length=50), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.ForeignKeyConstraint(['imovel_id'], ['cadastro.imoveis.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        schema='cadastro'
    )
    op.create_index('idx_imoveis_terreno_imovel', 'imoveis_terreno', ['imovel_id'], unique=True, schema='cadastro')

    # Tabela: cadastro.imoveis_edificacao
    op.create_table(
        'imoveis_edificacao',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('imovel_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('area_construida', sa.Numeric(10, 2), nullable=False),
        sa.Column('ano_construcao', sa.Integer(), nullable=True),
        sa.Column('ano_reforma', sa.Integer(), nullable=True),
        sa.Column('padrao_construtivo', sa.String(length=20), nullable=True),
        sa.Column('tipo_construcao', sa.String(length=50), nullable=True),
        sa.Column('estado_conservacao', sa.String(length=20), nullable=True),
        sa.Column('numero_pavimentos', sa.Integer(), default=1),
        sa.Column('numero_unidades', sa.Integer(), default=1),
        sa.Column('instalacoes', postgresql.JSONB(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.ForeignKeyConstraint(['imovel_id'], ['cadastro.imoveis.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        schema='cadastro'
    )
    op.create_index('idx_imoveis_edificacao_imovel', 'imoveis_edificacao', ['imovel_id'], unique=True, schema='cadastro')

    # Tabela: cadastro.estabelecimentos
    op.create_table(
        'estabelecimentos',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('inscricao_municipal', sa.String(length=20), nullable=False),
        sa.Column('situacao_cadastral', sa.Enum('ATIVO', 'INATIVO', 'SUSPENSO', 'CANCELADO', name='situacao_cadastral'), default='ATIVO'),
        sa.Column('pessoa_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('imovel_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('nome_fantasia', sa.String(length=200), nullable=False),
        sa.Column('cnae_principal', sa.String(length=10), nullable=True),
        sa.Column('cnae_secundario', postgresql.JSONB(), nullable=True),
        sa.Column('area_estabelecimento', sa.Numeric(10, 2), nullable=True),
        sa.Column('data_inicio_atividade', sa.Date(), nullable=True),
        sa.Column('data_encerramento', sa.Date(), nullable=True),
        sa.Column('regime_tributacao', sa.String(length=50), nullable=True),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['pessoa_id'], ['cadastro.pessoas.id']),
        sa.ForeignKeyConstraint(['imovel_id'], ['cadastro.imoveis.id']),
        sa.ForeignKeyConstraint(['criado_por_id'], ['admin.usuarios.id']),
        sa.ForeignKeyConstraint(['atualizado_por_id'], ['admin.usuarios.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('inscricao_municipal'),
        schema='cadastro'
    )
    op.create_index('idx_estabelecimentos_inscricao', 'estabelecimentos', ['inscricao_municipal'], unique=True, schema='cadastro')
    op.create_index('idx_estabelecimentos_pessoa', 'estabelecimentos', ['pessoa_id'], unique=False, schema='cadastro')

    print("✅ Tabelas do schema 'cadastro' criadas com sucesso")


def downgrade() -> None:
    """
    Remove tabelas do módulo de Cadastro
    """
    op.drop_table('estabelecimentos', schema='cadastro')
    op.drop_table('imoveis_edificacao', schema='cadastro')
    op.drop_table('imoveis_terreno', schema='cadastro')
    op.drop_table('imoveis', schema='cadastro')
    op.drop_table('loteamentos', schema='cadastro')
    op.drop_table('enderecos', schema='cadastro')
    op.drop_table('logradouros', schema='cadastro')
    op.drop_table('setores_fiscais', schema='cadastro')
    op.drop_table('pessoas', schema='cadastro')

    print("🗑️ Tabelas do schema 'cadastro' removidas")
