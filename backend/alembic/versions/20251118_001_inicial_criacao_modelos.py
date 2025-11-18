"""Inicial: Criação de todos os modelos do sistema Tributec

Revision ID: 001_inicial
Revises:
Create Date: 2025-11-18 02:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import geoalchemy2

# revision identifiers, used by Alembic.
revision: str = '001_inicial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Cria todos os schemas e tabelas iniciais do sistema
    """

    # Criar schemas
    op.execute('CREATE SCHEMA IF NOT EXISTS cadastro')
    op.execute('CREATE SCHEMA IF NOT EXISTS tributario')
    op.execute('CREATE SCHEMA IF NOT EXISTS arrecadacao')
    op.execute('CREATE SCHEMA IF NOT EXISTS nfse')
    op.execute('CREATE SCHEMA IF NOT EXISTS taxas')
    op.execute('CREATE SCHEMA IF NOT EXISTS fiscal')
    op.execute('CREATE SCHEMA IF NOT EXISTS divida_ativa')
    op.execute('CREATE SCHEMA IF NOT EXISTS admin')

    # Habilitar extensão PostGIS
    op.execute('CREATE EXTENSION IF NOT EXISTS postgis')

    # Criar ENUM types
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE tipo_pessoa AS ENUM ('F', 'J');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    op.execute("""
        DO $$ BEGIN
            CREATE TYPE situacao_cadastral AS ENUM ('ATIVO', 'INATIVO', 'SUSPENSO', 'CANCELADO');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    op.execute("""
        DO $$ BEGIN
            CREATE TYPE tipo_imovel AS ENUM ('TERRENO', 'EDIFICADO', 'TERRITORIAL');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    op.execute("""
        DO $$ BEGIN
            CREATE TYPE tipo_uso AS ENUM ('RESIDENCIAL', 'COMERCIAL', 'INDUSTRIAL', 'MISTO', 'RURAL', 'PUBLICO');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    op.execute("""
        DO $$ BEGIN
            CREATE TYPE tipo_logradouro AS ENUM ('RUA', 'AVENIDA', 'TRAVESSA', 'PRAÇA', 'ALAMEDA', 'RODOVIA', 'ESTRADA', 'OUTRO');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    op.execute("""
        DO $$ BEGIN
            CREATE TYPE tipo_tributo AS ENUM ('IPTU', 'ITBI', 'ISSQN', 'TAXA', 'CONTRIBUICAO');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    op.execute("""
        DO $$ BEGIN
            CREATE TYPE status_lancamento AS ENUM ('LANCADO', 'PAGO', 'PAGO_PARCIAL', 'CANCELADO', 'PARCELADO', 'EM_DIVIDA');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    op.execute("""
        DO $$ BEGIN
            CREATE TYPE tipo_isencao AS ENUM ('TOTAL', 'PARCIAL');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    print("✅ Schemas, extensões e ENUMs criados com sucesso")
    print("📝 NOTA: Para criar todas as tabelas, execute as migrations específicas de cada módulo")
    print("📝 Os modelos estão definidos em app/models/")


def downgrade() -> None:
    """
    Remove todos os schemas e tabelas
    """

    # Remover schemas (CASCADE remove todas as tabelas e objetos)
    op.execute('DROP SCHEMA IF EXISTS admin CASCADE')
    op.execute('DROP SCHEMA IF EXISTS divida_ativa CASCADE')
    op.execute('DROP SCHEMA IF EXISTS fiscal CASCADE')
    op.execute('DROP SCHEMA IF EXISTS taxas CASCADE')
    op.execute('DROP SCHEMA IF EXISTS nfse CASCADE')
    op.execute('DROP SCHEMA IF EXISTS arrecadacao CASCADE')
    op.execute('DROP SCHEMA IF NOT EXISTS tributario CASCADE')
    op.execute('DROP SCHEMA IF EXISTS cadastro CASCADE')

    # Remover ENUMs
    op.execute('DROP TYPE IF EXISTS tipo_isencao CASCADE')
    op.execute('DROP TYPE IF EXISTS status_lancamento CASCADE')
    op.execute('DROP TYPE IF EXISTS tipo_tributo CASCADE')
    op.execute('DROP TYPE IF EXISTS tipo_logradouro CASCADE')
    op.execute('DROP TYPE IF EXISTS tipo_uso CASCADE')
    op.execute('DROP TYPE IF EXISTS tipo_imovel CASCADE')
    op.execute('DROP TYPE IF EXISTS situacao_cadastral CASCADE')
    op.execute('DROP TYPE IF EXISTS tipo_pessoa CASCADE')

    print("🗑️ Todos os schemas e ENUMs removidos")
