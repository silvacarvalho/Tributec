"""Adiciona tabelas parametros_sistema e catalogo_infracoes

Revision ID: 20251118_005
Revises: 20251118_004
Create Date: 2025-11-18

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

# revision identifiers, used by Alembic.
revision = '20251118_005'
down_revision = '004_tributario'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Criar tabela admin.parametros_sistema
    op.create_table(
        'parametros_sistema',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),

        # Organização
        sa.Column('modulo', sa.String(length=50), nullable=False, comment='Módulo do sistema: FISCAL, TRIBUTARIO, ARRECADACAO, CADASTRO, GERAL'),
        sa.Column('categoria', sa.String(length=100), nullable=True, comment='Subcategoria dentro do módulo (ex: MULTAS, PRAZOS, VALORES)'),

        # Identificação
        sa.Column('chave', sa.String(length=100), nullable=False, comment='Chave única (ex: FISCAL.UFM_VALOR, FISCAL.PRAZO_DEFESA)'),
        sa.Column('nome_exibicao', sa.String(length=200), nullable=False, comment='Nome amigável para exibição na UI'),
        sa.Column('descricao', sa.Text(), nullable=False, comment='Descrição detalhada do parâmetro'),
        sa.Column('texto_ajuda', sa.Text(), nullable=True, comment='Texto de ajuda para popover/tooltip na UI'),

        # Tipo e Valor
        sa.Column('tipo_valor', sa.String(length=20), nullable=False, comment='STRING, INTEGER, DECIMAL, BOOLEAN, DATE, JSON, PERCENT'),
        sa.Column('valor_string', sa.String(length=500), nullable=True),
        sa.Column('valor_inteiro', sa.Integer(), nullable=True),
        sa.Column('valor_decimal', sa.Numeric(precision=15, scale=6), nullable=True),
        sa.Column('valor_booleano', sa.Boolean(), nullable=True),
        sa.Column('valor_data', sa.Date(), nullable=True),
        sa.Column('valor_json', JSONB(), nullable=True),

        # Validações
        sa.Column('validacoes', JSONB(), nullable=True, comment='Regras de validação: min, max, regex, opcoes, unidade'),

        # Vigência
        sa.Column('ano_vigencia', sa.Integer(), nullable=True, comment='Ano de vigência (null = válido para todos os anos)'),
        sa.Column('data_inicio_vigencia', sa.Date(), nullable=True, comment='Data de início da vigência'),
        sa.Column('data_fim_vigencia', sa.Date(), nullable=True, comment='Data de fim da vigência'),

        # Controle
        sa.Column('obrigatorio', sa.Boolean(), nullable=True, server_default='false', comment='Parâmetro obrigatório para funcionamento do módulo'),
        sa.Column('editavel', sa.Boolean(), nullable=True, server_default='true', comment='Pode ser editado via interface'),
        sa.Column('ordem_exibicao', sa.Integer(), nullable=True, server_default='0', comment='Ordem de exibição na UI'),

        # Referência Legal
        sa.Column('base_legal', sa.Text(), nullable=True, comment='Lei/artigo que fundamenta o parâmetro'),
        sa.Column('observacoes', sa.Text(), nullable=True),

        # Timestamps (ModeloBase)
        sa.Column('criado_em', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('atualizado_em', sa.DateTime(), nullable=True, onupdate=sa.func.now()),
        sa.Column('criado_por_id', UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', UUID(as_uuid=True), nullable=True),

        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('chave'),
        schema='admin'
    )

    # Criar índices para parametros_sistema
    op.create_index('idx_parametros_modulo_categoria', 'parametros_sistema', ['modulo', 'categoria'], schema='admin')
    op.create_index('idx_parametros_chave', 'parametros_sistema', ['chave'], schema='admin')
    op.create_index('idx_parametros_ano', 'parametros_sistema', ['ano_vigencia'], schema='admin')

    # Criar tabela fiscal.catalogo_infracoes
    op.create_table(
        'catalogo_infracoes',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),

        # Identificação
        sa.Column('codigo', sa.String(length=20), nullable=False, comment='Código único da infração (ex: IPTU-001, ISSQN-005)'),
        sa.Column('descricao', sa.Text(), nullable=False, comment='Descrição detalhada da infração'),

        # Base Legal
        sa.Column('artigo_lei', sa.String(length=100), nullable=True, comment='Artigo da lei que tipifica a infração'),
        sa.Column('base_legal', sa.Text(), nullable=True, comment='Texto completo da base legal'),

        # Tipo de Multa
        sa.Column('tipo_multa', sa.Enum('PERCENTUAL', 'FIXA_UFM', 'MISTA', name='tipomulta'), nullable=False, server_default='FIXA_UFM'),

        # Valores
        sa.Column('valor_multa_ufm', sa.Numeric(precision=10, scale=2), nullable=True, comment='Valor em UFM (para FIXA_UFM ou parte fixa da MISTA)'),
        sa.Column('percentual_multa', sa.Numeric(precision=5, scale=2), nullable=True, comment='Percentual da multa (para PERCENTUAL ou parte da MISTA)'),

        # Limites
        sa.Column('valor_minimo_ufm', sa.Numeric(precision=10, scale=2), nullable=True, comment='Valor mínimo da multa em UFM'),
        sa.Column('valor_maximo_ufm', sa.Numeric(precision=10, scale=2), nullable=True, comment='Valor máximo da multa em UFM'),

        # Gravidade
        sa.Column('gravidade', sa.String(length=20), nullable=True, server_default='MEDIA', comment='LEVE, MEDIA, GRAVE, GRAVISSIMA'),

        # Reincidência
        sa.Column('permite_reincidencia', sa.Boolean(), nullable=True, server_default='true', comment='Se permite cálculo de acréscimo por reincidência'),

        # Vigência
        sa.Column('data_inicio_vigencia', sa.Date(), nullable=False),
        sa.Column('data_fim_vigencia', sa.Date(), nullable=True),

        # Status
        sa.Column('ativo', sa.Boolean(), nullable=False, server_default='true'),

        # Observações
        sa.Column('observacoes', sa.Text(), nullable=True),

        # Timestamps (ModeloBase)
        sa.Column('criado_em', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('atualizado_em', sa.DateTime(), nullable=True, onupdate=sa.func.now()),
        sa.Column('criado_por_id', UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', UUID(as_uuid=True), nullable=True),

        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('codigo'),
        schema='fiscal'
    )

    # Criar índices para catalogo_infracoes
    op.create_index('idx_catalogo_codigo', 'catalogo_infracoes', ['codigo'], schema='fiscal')
    op.create_index('idx_catalogo_ativo', 'catalogo_infracoes', ['ativo'], schema='fiscal')


def downgrade() -> None:
    # Remover índices de catalogo_infracoes
    op.drop_index('idx_catalogo_ativo', table_name='catalogo_infracoes', schema='fiscal')
    op.drop_index('idx_catalogo_codigo', table_name='catalogo_infracoes', schema='fiscal')

    # Remover tabela catalogo_infracoes
    op.drop_table('catalogo_infracoes', schema='fiscal')

    # Remover enum
    op.execute('DROP TYPE IF EXISTS tipomulta')

    # Remover índices de parametros_sistema
    op.drop_index('idx_parametros_ano', table_name='parametros_sistema', schema='admin')
    op.drop_index('idx_parametros_chave', table_name='parametros_sistema', schema='admin')
    op.drop_index('idx_parametros_modulo_categoria', table_name='parametros_sistema', schema='admin')

    # Remover tabela parametros_sistema
    op.drop_table('parametros_sistema', schema='admin')
