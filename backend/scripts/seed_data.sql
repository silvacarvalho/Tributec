-- Script de Seed Data para Sistema Tributec
-- Dados iniciais: Usuários, Perfis e Parâmetros

-- =====================================================
-- PERFIS DE ACESSO
-- =====================================================

INSERT INTO admin.perfis (id, nome, descricao, slug, ativo, permissoes, criado_em) VALUES
(1, 'Administrador', 'Acesso total ao sistema', 'ADMIN', true, '["*"]'::jsonb, NOW()),
(2, 'Fiscal', 'Acesso a módulos de fiscalização e cadastro', 'FISCAL', true, '["cadastro.*", "tributario.*", "fiscal.*"]'::jsonb, NOW()),
(3, 'Arrecadação', 'Acesso a módulos de arrecadação e pagamentos', 'ARRECADACAO', true, '["arrecadacao.*", "tributario.read"]'::jsonb, NOW()),
(4, 'Atendimento', 'Acesso a consultas e emissão de certidões', 'ATENDIMENTO', true, '["cadastro.read", "certidoes.*"]'::jsonb, NOW()),
(5, 'Consulta', 'Acesso somente leitura', 'CONSULTA', true, '["*.read"]'::jsonb, NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- USUÁRIO ADMINISTRADOR PADRÃO
-- =====================================================
-- Senha: admin123 (hash bcrypt)

INSERT INTO admin.usuarios (
    id,
    nome_completo,
    cpf,
    email,
    username,
    senha_hash,
    matricula,
    cargo,
    setor,
    ativo,
    criado_em
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Administrador do Sistema',
    '00000000000',
    'admin@tributec.com',
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS0eUMWFG', -- admin123
    'ADM001',
    'Administrador de Sistemas',
    'TI',
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Associar usuário admin aos perfis
INSERT INTO admin.usuarios_perfis (usuario_id, perfil_id) VALUES
('550e8400-e29b-41d4-a716-446655440000'::uuid, 1), -- ADMIN
('550e8400-e29b-41d4-a716-446655440000'::uuid, 2), -- FISCAL
('550e8400-e29b-41d4-a716-446655440000'::uuid, 3)  -- ARRECADACAO
ON CONFLICT DO NOTHING;

-- =====================================================
-- PARÂMETROS FISCAIS
-- =====================================================

INSERT INTO admin.parametros_fiscais (chave, descricao, tipo_valor, valor_decimal, ano_vigencia, editavel, criado_em) VALUES
('UFM_VALOR', 'Valor da UFM (Unidade Fiscal Municipal)', 'DECIMAL', 14.01, 2024, true, NOW()),
('UFM_VALOR', 'Valor da UFM (Unidade Fiscal Municipal)', 'DECIMAL', 15.50, 2025, true, NOW())
ON CONFLICT (chave) DO NOTHING;

INSERT INTO admin.parametros_fiscais (chave, descricao, tipo_valor, valor_inteiro, editavel, criado_em) VALUES
('IPTU_NUMERO_PARCELAS_MAX', 'Número máximo de parcelas do IPTU', 'INTEGER', 10, true, NOW()),
('IPTU_DIAS_VENCIMENTO_PARCELA', 'Dias entre vencimentos de parcelas do IPTU', 'INTEGER', 30, true, NOW())
ON CONFLICT (chave) DO NOTHING;

INSERT INTO admin.parametros_fiscais (chave, descricao, tipo_valor, valor_decimal, editavel, criado_em) VALUES
('IPTU_DESCONTO_PAGAMENTO_UNICO', 'Desconto para pagamento único do IPTU (%)', 'DECIMAL', 10.00, true, NOW()),
('IPTU_DESCONTO_IPTU_DIGITAL', 'Desconto para adesão ao IPTU Digital (%)', 'DECIMAL', 2.00, true, NOW()),
('ITBI_ALIQUOTA_SFH', 'Alíquota do ITBI para SFH (%)', 'DECIMAL', 1.00, true, NOW()),
('ITBI_ALIQUOTA_NORMAL', 'Alíquota do ITBI normal (%)', 'DECIMAL', 2.00, true, NOW()),
('ISSQN_ALIQUOTA_NORMAL', 'Alíquota do ISSQN regime normal (%)', 'DECIMAL', 5.00, true, NOW())
ON CONFLICT (chave) DO NOTHING;

INSERT INTO admin.parametros_fiscais (chave, descricao, tipo_valor, valor_booleano, editavel, criado_em) VALUES
('SISTEMA_MANUTENCAO', 'Sistema em manutenção', 'BOOLEAN', false, true, NOW()),
('PERMITIR_AUTOCADASTRO', 'Permitir auto-cadastro de contribuintes', 'BOOLEAN', true, true, NOW())
ON CONFLICT (chave) DO NOTHING;

-- =====================================================
-- ALÍQUOTAS PADRÃO - IPTU
-- =====================================================

INSERT INTO tributario.aliquotas (tipo_tributo, tipo_uso, aliquota, valor_minimo, valor_maximo, ano_vigencia, descricao, criado_em) VALUES
-- IPTU 2024
('IPTU', 'RESIDENCIAL', 0.0050, 0, 50000, 2024, 'Faixa 1: Até R$ 50.000', NOW()),
('IPTU', 'RESIDENCIAL', 0.0075, 50000, 100000, 2024, 'Faixa 2: De R$ 50.000 a R$ 100.000', NOW()),
('IPTU', 'RESIDENCIAL', 0.0100, 100000, 200000, 2024, 'Faixa 3: De R$ 100.000 a R$ 200.000', NOW()),
('IPTU', 'RESIDENCIAL', 0.0125, 200000, NULL, 2024, 'Faixa 4: Acima de R$ 200.000', NOW()),
('IPTU', 'COMERCIAL', 0.0100, 0, 100000, 2024, 'Faixa 1: Até R$ 100.000', NOW()),
('IPTU', 'COMERCIAL', 0.0150, 100000, NULL, 2024, 'Faixa 2: Acima de R$ 100.000', NOW()),
('IPTU', 'INDUSTRIAL', 0.0100, 0, NULL, 2024, 'Alíquota única', NOW()),
-- IPTU 2025
('IPTU', 'RESIDENCIAL', 0.0050, 0, 50000, 2025, 'Faixa 1: Até R$ 50.000', NOW()),
('IPTU', 'RESIDENCIAL', 0.0075, 50000, 100000, 2025, 'Faixa 2: De R$ 50.000 a R$ 100.000', NOW()),
('IPTU', 'RESIDENCIAL', 0.0100, 100000, 200000, 2025, 'Faixa 3: De R$ 100.000 a R$ 200.000', NOW()),
('IPTU', 'RESIDENCIAL', 0.0125, 200000, NULL, 2025, 'Faixa 4: Acima de R$ 200.000', NOW()),
('IPTU', 'COMERCIAL', 0.0100, 0, 100000, 2025, 'Faixa 1: Até R$ 100.000', NOW()),
('IPTU', 'COMERCIAL', 0.0150, 100000, NULL, 2025, 'Faixa 2: Acima de R$ 100.000', NOW()),
('IPTU', 'INDUSTRIAL', 0.0100, 0, NULL, 2025, 'Alíquota única', NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- ALÍQUOTAS PADRÃO - ITBI
-- =====================================================

INSERT INTO tributario.aliquotas (tipo_tributo, aliquota, ano_vigencia, descricao, criado_em) VALUES
('ITBI', 0.0100, 2024, 'Alíquota para SFH', NOW()),
('ITBI', 0.0200, 2024, 'Alíquota normal', NOW()),
('ITBI', 0.0100, 2025, 'Alíquota para SFH', NOW()),
('ITBI', 0.0200, 2025, 'Alíquota normal', NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- ALÍQUOTAS PADRÃO - ISSQN
-- =====================================================

INSERT INTO tributario.aliquotas (tipo_tributo, aliquota, ano_vigencia, descricao, criado_em) VALUES
('ISSQN', 0.0500, 2024, 'Alíquota regime normal', NOW()),
('ISSQN', 0.0500, 2025, 'Alíquota regime normal', NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- MENSAGENS DE CONFIRMAÇÃO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Seed data inserido com sucesso!';
    RAISE NOTICE '📧 Usuário admin: admin@tributec.com';
    RAISE NOTICE '🔑 Senha: admin123';
    RAISE NOTICE '⚠️  IMPORTANTE: Altere a senha padrão após o primeiro login!';
END $$;
