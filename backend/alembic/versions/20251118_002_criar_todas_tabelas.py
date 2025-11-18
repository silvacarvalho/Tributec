"""Criação de todas as tabelas do sistema

Revision ID: 002_criar_tabelas
Revises: 001_inicial
Create Date: 2025-11-18 03:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision: str = '002_criar_tabelas'
down_revision: Union[str, None] = '001_inicial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Cria todas as tabelas do sistema
    """

    # =====================================================
    # SCHEMA: admin
    # =====================================================

    # Tabela: admin.perfis
    op.create_table(
        'perfis',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('nome', sa.String(length=100), nullable=False),
        sa.Column('descricao', sa.Text(), nullable=True),
        sa.Column('slug', sa.String(length=50), nullable=False),
        sa.Column('ativo', sa.Boolean(), default=True),
        sa.Column('permissoes', postgresql.JSONB(), nullable=False, comment='Lista de permissões concedidas ao perfil'),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('nome'),
        sa.UniqueConstraint('slug'),
        schema='admin'
    )
    op.create_index('idx_perfis_slug', 'perfis', ['slug'], unique=False, schema='admin')

    # Tabela: admin.usuarios
    op.create_table(
        'usuarios',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('nome_completo', sa.String(length=200), nullable=False),
        sa.Column('cpf', sa.String(length=11), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('senha_hash', sa.String(length=255), nullable=False),
        sa.Column('matricula', sa.String(length=20), nullable=True),
        sa.Column('cargo', sa.String(length=100), nullable=True),
        sa.Column('setor', sa.String(length=100), nullable=True),
        sa.Column('ativo', sa.Boolean(), default=True, nullable=False),
        sa.Column('bloqueado', sa.Boolean(), default=False),
        sa.Column('data_bloqueio', sa.DateTime(), nullable=True),
        sa.Column('motivo_bloqueio', sa.Text(), nullable=True),
        sa.Column('tentativas_login_falhas', sa.Integer(), default=0),
        sa.Column('data_ultima_tentativa', sa.DateTime(), nullable=True),
        sa.Column('data_ultimo_acesso', sa.DateTime(), nullable=True),
        sa.Column('ip_ultimo_acesso', postgresql.INET(), nullable=True),
        sa.Column('refresh_token', sa.String(length=500), nullable=True),
        sa.Column('refresh_token_expira_em', sa.DateTime(), nullable=True),
        sa.Column('preferencias', postgresql.JSONB(), nullable=True, comment='Preferências e configurações do usuário'),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cpf'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('matricula'),
        schema='admin'
    )
    op.create_index('idx_usuarios_cpf', 'usuarios', ['cpf'], unique=False, schema='admin')
    op.create_index('idx_usuarios_email', 'usuarios', ['email'], unique=False, schema='admin')
    op.create_index('idx_usuarios_username', 'usuarios', ['username'], unique=False, schema='admin')
    op.create_index('idx_usuarios_ativo', 'usuarios', ['ativo'], unique=False, schema='admin')

    # Tabela associativa: admin.usuarios_perfis
    op.create_table(
        'usuarios_perfis',
        sa.Column('usuario_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('perfil_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['usuario_id'], ['admin.usuarios.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['perfil_id'], ['admin.perfis.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('usuario_id', 'perfil_id'),
        schema='admin'
    )

    # Tabela: admin.token_blacklist
    op.create_table(
        'token_blacklist',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('token', sa.Text(), nullable=False),
        sa.Column('data_adicao', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('expira_em', sa.DateTime(), nullable=False),
        sa.Column('motivo', sa.String(length=200), nullable=True, comment='Motivo da invalidação (opcional)'),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token'),
        schema='admin'
    )
    op.create_index('idx_token_blacklist_token', 'token_blacklist', ['token'], unique=False, schema='admin')
    op.create_index('idx_token_blacklist_expira', 'token_blacklist', ['expira_em'], unique=False, schema='admin')

    # Tabela: admin.parametros_fiscais
    op.create_table(
        'parametros_fiscais',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('chave', sa.String(length=100), nullable=False, comment='Chave única do parâmetro (ex: UFM_VALOR)'),
        sa.Column('descricao', sa.String(length=200), nullable=False),
        sa.Column('tipo_valor', sa.String(length=20), nullable=False, comment='STRING, INTEGER, DECIMAL, BOOLEAN, DATE, JSON'),
        sa.Column('valor_string', sa.String(length=500), nullable=True),
        sa.Column('valor_inteiro', sa.Integer(), nullable=True),
        sa.Column('valor_decimal', sa.Numeric(15, 6), nullable=True),
        sa.Column('valor_booleano', sa.Boolean(), nullable=True),
        sa.Column('valor_data', sa.Date(), nullable=True),
        sa.Column('valor_json', postgresql.JSONB(), nullable=True),
        sa.Column('ano_vigencia', sa.Integer(), nullable=True, comment='Ano de vigência (null = geral)'),
        sa.Column('editavel', sa.Boolean(), default=True, comment='Pode ser editado via interface'),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('chave'),
        schema='admin'
    )
    op.create_index('idx_parametros_chave', 'parametros_fiscais', ['chave'], unique=False, schema='admin')
    op.create_index('idx_parametros_ano', 'parametros_fiscais', ['ano_vigencia'], unique=False, schema='admin')

    # Tabela: admin.auditoria_log
    op.create_table(
        'auditoria_log',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('data_hora', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('usuario_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('usuario_nome', sa.String(length=200), nullable=True),
        sa.Column('usuario_ip', postgresql.INET(), nullable=True, comment='IP do usuário'),
        sa.Column('modulo', sa.String(length=50), nullable=False, comment='CADASTRO, TRIBUTARIO, ARRECADACAO, etc.'),
        sa.Column('entidade', sa.String(length=100), nullable=False, comment='Nome da tabela/entidade'),
        sa.Column('entidade_id', postgresql.UUID(as_uuid=True), nullable=True, comment='ID do registro afetado'),
        sa.Column('operacao', sa.String(length=20), nullable=False, comment='INSERT, UPDATE, DELETE, SELECT'),
        sa.Column('descricao', sa.Text(), nullable=False),
        sa.Column('dados_antes', postgresql.JSONB(), nullable=True, comment='Estado anterior do registro'),
        sa.Column('dados_depois', postgresql.JSONB(), nullable=True, comment='Estado posterior do registro'),
        sa.Column('metadados', postgresql.JSONB(), nullable=True, comment='Metadados adicionais da operação'),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['usuario_id'], ['admin.usuarios.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        schema='admin'
    )
    op.create_index('idx_auditoria_data', 'auditoria_log', ['data_hora'], unique=False, schema='admin')
    op.create_index('idx_auditoria_usuario', 'auditoria_log', ['usuario_id'], unique=False, schema='admin')
    op.create_index('idx_auditoria_modulo', 'auditoria_log', ['modulo'], unique=False, schema='admin')
    op.create_index('idx_auditoria_entidade', 'auditoria_log', ['entidade', 'entidade_id'], unique=False, schema='admin')
    op.create_index('idx_auditoria_operacao', 'auditoria_log', ['operacao'], unique=False, schema='admin')

    print("✅ Tabelas do schema 'admin' criadas com sucesso")
    print("✅ Migration completa executada")


def downgrade() -> None:
    """
    Remove todas as tabelas criadas
    """
    # admin
    op.drop_table('auditoria_log', schema='admin')
    op.drop_table('parametros_fiscais', schema='admin')
    op.drop_table('token_blacklist', schema='admin')
    op.drop_table('usuarios_perfis', schema='admin')
    op.drop_table('usuarios', schema='admin')
    op.drop_table('perfis', schema='admin')

    print("🗑️ Tabelas removidas")
