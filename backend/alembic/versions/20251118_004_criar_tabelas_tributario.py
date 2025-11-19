"""Criação das tabelas do módulo Tributário

Revision ID: 004_tributario
Revises: 003_cadastro
Create Date: 2025-11-18 05:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision: str = '004_tributario'
down_revision: Union[str, None] = '003_cadastro'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Cria tabelas do módulo Tributário
    """

    # =====================================================
    # SCHEMA: tributario
    # =====================================================

    # Tabela: tributario.planta_generica_valores
    op.create_table(
        'planta_generica_valores',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('setor_fiscal_id', sa.Integer(), nullable=False),
        sa.Column('logradouro_id', sa.Integer(), nullable=True),
        sa.Column('valor_m2', sa.Numeric(10, 2), nullable=False),
        sa.Column('ano_vigencia', sa.Integer(), nullable=False),
        sa.Column('fator_localizacao', sa.Numeric(5, 4), default=1.0),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['setor_fiscal_id'], ['cadastro.setores_fiscais.id']),
        sa.ForeignKeyConstraint(['logradouro_id'], ['cadastro.logradouros.id']),
        sa.ForeignKeyConstraint(['criado_por_id'], ['admin.usuarios.id']),
        sa.ForeignKeyConstraint(['atualizado_por_id'], ['admin.usuarios.id']),
        sa.PrimaryKeyConstraint('id'),
        schema='tributario'
    )
    op.create_index('idx_pgv_setor_ano', 'planta_generica_valores', ['setor_fiscal_id', 'ano_vigencia'], unique=False, schema='tributario')

    # Tabela: tributario.tabela_preco_construcao
    op.create_table(
        'tabela_preco_construcao',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('padrao_construtivo', sa.String(length=20), nullable=False),
        sa.Column('tipo_uso', postgresql.ENUM('RESIDENCIAL', 'COMERCIAL', 'INDUSTRIAL', 'MISTO', 'RURAL', 'PUBLICO', name='tipo_uso', create_type=False), nullable=False),
        sa.Column('valor_m2', sa.Numeric(10, 2), nullable=False),
        sa.Column('ano_vigencia', sa.Integer(), nullable=False),
        sa.Column('mes_vigencia', sa.Integer(), nullable=True),
        sa.Column('descricao', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['criado_por_id'], ['admin.usuarios.id']),
        sa.ForeignKeyConstraint(['atualizado_por_id'], ['admin.usuarios.id']),
        sa.PrimaryKeyConstraint('id'),
        schema='tributario'
    )
    op.create_index('idx_tpc_padrao_ano', 'tabela_preco_construcao', ['padrao_construtivo', 'ano_vigencia'], unique=False, schema='tributario')

    # Tabela: tributario.aliquotas
    op.create_table(
        'aliquotas',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('tipo_tributo', postgresql.ENUM('IPTU', 'ITBI', 'ISSQN', 'TAXA', 'CONTRIBUICAO', name='tipo_tributo', create_type=False), nullable=False),
        sa.Column('tipo_uso', postgresql.ENUM('RESIDENCIAL', 'COMERCIAL', 'INDUSTRIAL', 'MISTO', 'RURAL', 'PUBLICO', name='tipo_uso', create_type=False), nullable=True),
        sa.Column('aliquota', sa.Numeric(5, 4), nullable=False),
        sa.Column('valor_minimo', sa.Numeric(15, 2), nullable=True),
        sa.Column('valor_maximo', sa.Numeric(15, 2), nullable=True),
        sa.Column('ano_vigencia', sa.Integer(), nullable=False),
        sa.Column('descricao', sa.String(length=200), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['criado_por_id'], ['admin.usuarios.id']),
        sa.ForeignKeyConstraint(['atualizado_por_id'], ['admin.usuarios.id']),
        sa.PrimaryKeyConstraint('id'),
        schema='tributario'
    )
    op.create_index('idx_aliquotas_tributo', 'aliquotas', ['tipo_tributo', 'ano_vigencia'], unique=False, schema='tributario')

    # Tabela: tributario.iptu_lancamentos
    op.create_table(
        'iptu_lancamentos',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('numero_lancamento', sa.String(length=30), nullable=False),
        sa.Column('imovel_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('contribuinte_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ano_exercicio', sa.Integer(), nullable=False),
        sa.Column('status', postgresql.ENUM('LANCADO', 'PAGO', 'PAGO_PARCIAL', 'CANCELADO', 'PARCELADO', 'EM_DIVIDA', name='status_lancamento', create_type=False), default='LANCADO'),
        sa.Column('data_lancamento', sa.Date(), nullable=False),
        sa.Column('data_vencimento', sa.Date(), nullable=False),
        sa.Column('valor_venal_terreno', sa.Numeric(15, 2), nullable=False),
        sa.Column('valor_venal_edificacao', sa.Numeric(15, 2), default=0),
        sa.Column('valor_venal_total', sa.Numeric(15, 2), nullable=False),
        sa.Column('aliquota_aplicada', sa.Numeric(5, 4), nullable=False),
        sa.Column('valor_iptu', sa.Numeric(15, 2), nullable=False),
        sa.Column('descontos', sa.Numeric(15, 2), default=0),
        sa.Column('valor_liquido', sa.Numeric(15, 2), nullable=False),
        sa.Column('valor_pago', sa.Numeric(15, 2), default=0),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('calculo_detalhado', postgresql.JSONB(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['imovel_id'], ['cadastro.imoveis.id']),
        sa.ForeignKeyConstraint(['contribuinte_id'], ['cadastro.pessoas.id']),
        sa.ForeignKeyConstraint(['criado_por_id'], ['admin.usuarios.id']),
        sa.ForeignKeyConstraint(['atualizado_por_id'], ['admin.usuarios.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('numero_lancamento'),
        schema='tributario'
    )
    op.create_index('idx_iptu_numero', 'iptu_lancamentos', ['numero_lancamento'], unique=True, schema='tributario')
    op.create_index('idx_iptu_imovel_ano', 'iptu_lancamentos', ['imovel_id', 'ano_exercicio'], unique=False, schema='tributario')
    op.create_index('idx_iptu_status', 'iptu_lancamentos', ['status'], unique=False, schema='tributario')

    # Tabela: tributario.iptu_parcelas
    op.create_table(
        'iptu_parcelas',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('lancamento_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('numero_parcela', sa.Integer(), nullable=False),
        sa.Column('data_vencimento', sa.Date(), nullable=False),
        sa.Column('valor_parcela', sa.Numeric(15, 2), nullable=False),
        sa.Column('valor_pago', sa.Numeric(15, 2), default=0),
        sa.Column('data_pagamento', sa.Date(), nullable=True),
        sa.Column('paga', sa.Boolean(), default=False),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.ForeignKeyConstraint(['lancamento_id'], ['tributario.iptu_lancamentos.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        schema='tributario'
    )
    op.create_index('idx_iptu_parcelas_lancamento', 'iptu_parcelas', ['lancamento_id'], unique=False, schema='tributario')

    # Tabela: tributario.itbi_guias
    op.create_table(
        'itbi_guias',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('numero_guia', sa.String(length=30), nullable=False),
        sa.Column('imovel_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('transmitente_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('adquirente_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('data_emissao', sa.Date(), nullable=False),
        sa.Column('data_vencimento', sa.Date(), nullable=False),
        sa.Column('valor_declarado', sa.Numeric(15, 2), nullable=False),
        sa.Column('valor_venal', sa.Numeric(15, 2), nullable=False),
        sa.Column('valor_base_calculo', sa.Numeric(15, 2), nullable=False),
        sa.Column('valor_financiado_sfh', sa.Numeric(15, 2), default=0),
        sa.Column('aliquota_sfh', sa.Numeric(5, 4), default=0.01),
        sa.Column('aliquota_normal', sa.Numeric(5, 4), default=0.02),
        sa.Column('valor_itbi', sa.Numeric(15, 2), nullable=False),
        sa.Column('valor_pago', sa.Numeric(15, 2), default=0),
        sa.Column('data_pagamento', sa.Date(), nullable=True),
        sa.Column('pago', sa.Boolean(), default=False),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('calculo_detalhado', postgresql.JSONB(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['imovel_id'], ['cadastro.imoveis.id']),
        sa.ForeignKeyConstraint(['transmitente_id'], ['cadastro.pessoas.id']),
        sa.ForeignKeyConstraint(['adquirente_id'], ['cadastro.pessoas.id']),
        sa.ForeignKeyConstraint(['criado_por_id'], ['admin.usuarios.id']),
        sa.ForeignKeyConstraint(['atualizado_por_id'], ['admin.usuarios.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('numero_guia'),
        schema='tributario'
    )
    op.create_index('idx_itbi_numero', 'itbi_guias', ['numero_guia'], unique=True, schema='tributario')
    op.create_index('idx_itbi_imovel', 'itbi_guias', ['imovel_id'], unique=False, schema='tributario')

    # Tabela: tributario.issqn_declaracoes
    op.create_table(
        'issqn_declaracoes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('numero_declaracao', sa.String(length=30), nullable=False),
        sa.Column('estabelecimento_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ano_competencia', sa.Integer(), nullable=False),
        sa.Column('mes_competencia', sa.Integer(), nullable=False),
        sa.Column('data_apresentacao', sa.Date(), nullable=False),
        sa.Column('receita_bruta', sa.Numeric(15, 2), nullable=False),
        sa.Column('deducoes', sa.Numeric(15, 2), default=0),
        sa.Column('base_calculo', sa.Numeric(15, 2), nullable=False),
        sa.Column('aliquota', sa.Numeric(5, 4), nullable=False),
        sa.Column('valor_issqn', sa.Numeric(15, 2), nullable=False),
        sa.Column('valor_retido', sa.Numeric(15, 2), default=0),
        sa.Column('valor_a_recolher', sa.Numeric(15, 2), nullable=False),
        sa.Column('data_vencimento', sa.Date(), nullable=False),
        sa.Column('pago', sa.Boolean(), default=False),
        sa.Column('data_pagamento', sa.Date(), nullable=True),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['estabelecimento_id'], ['cadastro.estabelecimentos.id']),
        sa.ForeignKeyConstraint(['criado_por_id'], ['admin.usuarios.id']),
        sa.ForeignKeyConstraint(['atualizado_por_id'], ['admin.usuarios.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('numero_declaracao'),
        schema='tributario'
    )
    op.create_index('idx_issqn_numero', 'issqn_declaracoes', ['numero_declaracao'], unique=True, schema='tributario')
    op.create_index('idx_issqn_estabelecimento', 'issqn_declaracoes', ['estabelecimento_id'], unique=False, schema='tributario')

    # Tabela: tributario.issqn_retencoes
    op.create_table(
        'issqn_retencoes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('numero_retencao', sa.String(length=30), nullable=False),
        sa.Column('tomador_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('prestador_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('data_retencao', sa.Date(), nullable=False),
        sa.Column('valor_servico', sa.Numeric(15, 2), nullable=False),
        sa.Column('aliquota', sa.Numeric(5, 4), nullable=False),
        sa.Column('valor_retido', sa.Numeric(15, 2), nullable=False),
        sa.Column('competencia_mes', sa.Integer(), nullable=False),
        sa.Column('competencia_ano', sa.Integer(), nullable=False),
        sa.Column('numero_nf', sa.String(length=50), nullable=True),
        sa.Column('descricao_servico', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['tomador_id'], ['cadastro.pessoas.id']),
        sa.ForeignKeyConstraint(['prestador_id'], ['cadastro.pessoas.id']),
        sa.ForeignKeyConstraint(['criado_por_id'], ['admin.usuarios.id']),
        sa.ForeignKeyConstraint(['atualizado_por_id'], ['admin.usuarios.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('numero_retencao'),
        schema='tributario'
    )
    op.create_index('idx_issqn_retencoes_numero', 'issqn_retencoes', ['numero_retencao'], unique=True, schema='tributario')

    # Tabela: tributario.isencoes
    op.create_table(
        'isencoes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('numero_processo', sa.String(length=30), nullable=False),
        sa.Column('beneficiario_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tipo_tributo', postgresql.ENUM('IPTU', 'ITBI', 'ISSQN', 'TAXA', 'CONTRIBUICAO', name='tipo_tributo', create_type=False), nullable=False),
        sa.Column('tipo_isencao', postgresql.ENUM('TOTAL', 'PARCIAL', name='tipo_isencao', create_type=False), nullable=False),
        sa.Column('percentual', sa.Numeric(5, 2), default=100),
        sa.Column('data_solicitacao', sa.Date(), nullable=False),
        sa.Column('data_concessao', sa.Date(), nullable=True),
        sa.Column('data_validade', sa.Date(), nullable=True),
        sa.Column('motivo', sa.Text(), nullable=False),
        sa.Column('fundamentacao_legal', sa.Text(), nullable=True),
        sa.Column('aprovada', sa.Boolean(), default=False),
        sa.Column('ativa', sa.Boolean(), default=True),
        sa.Column('data_cancelamento', sa.Date(), nullable=True),
        sa.Column('motivo_cancelamento', sa.Text(), nullable=True),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('atualizado_em', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
        sa.Column('criado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('atualizado_por_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['beneficiario_id'], ['cadastro.pessoas.id']),
        sa.ForeignKeyConstraint(['criado_por_id'], ['admin.usuarios.id']),
        sa.ForeignKeyConstraint(['atualizado_por_id'], ['admin.usuarios.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('numero_processo'),
        schema='tributario'
    )
    op.create_index('idx_isencoes_numero', 'isencoes', ['numero_processo'], unique=True, schema='tributario')
    op.create_index('idx_isencoes_beneficiario', 'isencoes', ['beneficiario_id'], unique=False, schema='tributario')

    print("✅ Tabelas do schema 'tributario' criadas com sucesso")


def downgrade() -> None:
    """
    Remove tabelas do módulo Tributário
    """
    op.drop_table('isencoes', schema='tributario')
    op.drop_table('issqn_retencoes', schema='tributario')
    op.drop_table('issqn_declaracoes', schema='tributario')
    op.drop_table('itbi_guias', schema='tributario')
    op.drop_table('iptu_parcelas', schema='tributario')
    op.drop_table('iptu_lancamentos', schema='tributario')
    op.drop_table('aliquotas', schema='tributario')
    op.drop_table('tabela_preco_construcao', schema='tributario')
    op.drop_table('planta_generica_valores', schema='tributario')

    print("🗑️ Tabelas do schema 'tributario' removidas")
