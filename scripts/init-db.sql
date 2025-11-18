-- Script de inicialização do banco de dados
-- Executado automaticamente na criação do container PostgreSQL

-- Habilitar extensão PostGIS para geo-referenciamento
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Habilitar extensão uuid-ossp para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar extensão pgcrypto para funções de criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar schema para separação lógica dos módulos
CREATE SCHEMA IF NOT EXISTS cadastro;
CREATE SCHEMA IF NOT EXISTS tributario;
CREATE SCHEMA IF NOT EXISTS arrecadacao;
CREATE SCHEMA IF NOT EXISTS nfse;
CREATE SCHEMA IF NOT EXISTS taxas;
CREATE SCHEMA IF NOT EXISTS fiscal;
CREATE SCHEMA IF NOT EXISTS divida_ativa;
CREATE SCHEMA IF NOT EXISTS admin;

-- Comentários nos schemas
COMMENT ON SCHEMA cadastro IS 'Módulo de Cadastros - Imobiliário, Contribuintes, Auxiliares';
COMMENT ON SCHEMA tributario IS 'Módulo Tributário - IPTU, ITBI, ISSQN, Isenções';
COMMENT ON SCHEMA arrecadacao IS 'Módulo de Arrecadação - DAM, Pagamentos, Parcelamentos';
COMMENT ON SCHEMA nfse IS 'Módulo NFS-e - Notas Fiscais Eletrônicas';
COMMENT ON SCHEMA taxas IS 'Módulo de Taxas - TLLFF, Publicidade, Obras';
COMMENT ON SCHEMA fiscal IS 'Módulo Fiscal - Fiscalização, Autos de Infração';
COMMENT ON SCHEMA divida_ativa IS 'Módulo Dívida Ativa - Inscrições, Certidões';
COMMENT ON SCHEMA admin IS 'Módulo Administrativo - Usuários, Parâmetros, Auditoria';

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION atualizar_timestamp() IS 'Trigger para atualizar automaticamente o campo atualizado_em';
