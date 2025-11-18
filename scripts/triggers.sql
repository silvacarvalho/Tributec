-- =====================================================
-- TRIGGERS E FUNÇÕES AUTOMATIZADAS
-- Sistema de Gestão Tributária Municipal - Tributec
-- =====================================================

-- ====================================================
-- FUNÇÃO: Atualizar timestamp automaticamente
-- ====================================================
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION atualizar_timestamp() IS 'Atualiza automaticamente o campo atualizado_em';


-- =====================================================
-- FUNÇÃO: Transferência automática de propriedade (ITBI pago)
-- =====================================================
CREATE OR REPLACE FUNCTION transferir_propriedade_itbi()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando ITBI é marcado como pago, transferir propriedade do imóvel
    IF NEW.pago = TRUE AND OLD.pago = FALSE THEN
        UPDATE cadastro.imoveis
        SET proprietario_id = NEW.adquirente_id
        WHERE id = NEW.imovel_id;

        -- Registrar no log de auditoria
        INSERT INTO admin.auditoria_log (
            data_hora, modulo, entidade, entidade_id, operacao, descricao
        ) VALUES (
            CURRENT_TIMESTAMP,
            'TRIBUTARIO',
            'imoveis',
            NEW.imovel_id,
            'UPDATE',
            'Transferência automática de propriedade via pagamento de ITBI nº ' || NEW.numero_guia
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION transferir_propriedade_itbi() IS 'Transfere automaticamente a propriedade do imóvel quando ITBI é pago';


-- Trigger para transferência automática
CREATE TRIGGER trigger_transferir_propriedade_itbi
    AFTER UPDATE ON tributario.itbi_guias
    FOR EACH ROW
    WHEN (NEW.pago = TRUE AND OLD.pago = FALSE)
    EXECUTE FUNCTION transferir_propriedade_itbi();


-- =====================================================
-- FUNÇÃO: Calcular acréscimos legais em tempo real
-- =====================================================
CREATE OR REPLACE FUNCTION calcular_acrescimos_legais(
    p_valor_principal NUMERIC,
    p_data_vencimento DATE,
    p_data_pagamento DATE DEFAULT CURRENT_DATE,
    p_com_acao_fiscal BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    valor_multa NUMERIC,
    valor_juros NUMERIC,
    valor_correcao NUMERIC,
    valor_total NUMERIC,
    dias_atraso INTEGER
) AS $$
DECLARE
    v_dias_atraso INTEGER;
    v_multa NUMERIC;
    v_juros NUMERIC;
    v_correcao NUMERIC;
    v_taxa_juros_mensal NUMERIC := 1.0;
    v_taxa_juros_diaria NUMERIC;
BEGIN
    -- Calcular dias de atraso
    v_dias_atraso := GREATEST(0, p_data_pagamento - p_data_vencimento);

    IF v_dias_atraso = 0 THEN
        RETURN QUERY SELECT 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, p_valor_principal, 0;
        RETURN;
    END IF;

    -- Calcular multa moratória
    IF p_com_acao_fiscal THEN
        v_multa := p_valor_principal * 0.50; -- 50% com ação fiscal
    ELSIF v_dias_atraso <= 15 THEN
        v_multa := p_valor_principal * 0.02; -- 2% até 15 dias
    ELSIF v_dias_atraso <= 30 THEN
        v_multa := p_valor_principal * 0.05; -- 5% de 16 a 30 dias
    ELSIF v_dias_atraso <= 60 THEN
        v_multa := p_valor_principal * 0.10; -- 10% de 31 a 60 dias
    ELSE
        v_multa := p_valor_principal * 0.20; -- 20% acima de 60 dias
    END IF;

    -- Calcular juros de mora (1% ao mês pro rata die: 0,033%/dia)
    v_taxa_juros_diaria := v_taxa_juros_mensal / 30.0;
    v_juros := p_valor_principal * (v_taxa_juros_diaria / 100.0) * v_dias_atraso;

    -- Correção monetária (a implementar com índices IPCA reais)
    v_correcao := 0.00;

    -- Total
    RETURN QUERY SELECT
        ROUND(v_multa, 2),
        ROUND(v_juros, 2),
        ROUND(v_correcao, 2),
        ROUND(p_valor_principal + v_multa + v_juros + v_correcao, 2),
        v_dias_atraso;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calcular_acrescimos_legais IS 'Calcula multa, juros e correção monetária sobre débitos';


-- =====================================================
-- FUNÇÃO: Atualizar acréscimos das parcelas do IPTU
-- =====================================================
CREATE OR REPLACE FUNCTION atualizar_acrescimos_iptu_parcela()
RETURNS TRIGGER AS $$
DECLARE
    v_acrescimos RECORD;
BEGIN
    -- Se parcela não está paga e está vencida
    IF NEW.pago = FALSE AND NEW.data_vencimento < CURRENT_DATE THEN
        -- Calcular acréscimos
        SELECT * INTO v_acrescimos
        FROM calcular_acrescimos_legais(
            NEW.valor_principal,
            NEW.data_vencimento,
            CURRENT_DATE,
            FALSE
        );

        -- Atualizar valores
        NEW.valor_juros := v_acrescimos.valor_juros;
        NEW.valor_multa := v_acrescimos.valor_multa;
        NEW.valor_correcao := v_acrescimos.valor_correcao;
        NEW.valor_total := v_acrescimos.valor_total;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION atualizar_acrescimos_iptu_parcela IS 'Atualiza automaticamente acréscimos legais nas parcelas do IPTU';


-- Trigger para atualizar acréscimos
CREATE TRIGGER trigger_atualizar_acrescimos_iptu
    BEFORE INSERT OR UPDATE ON tributario.iptu_parcelas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_acrescimos_iptu_parcela();


-- =====================================================
-- FUNÇÃO: Cancelar parcelamento automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION verificar_inadimplencia_parcelamento()
RETURNS TRIGGER AS $$
DECLARE
    v_parcelas_em_atraso INTEGER;
    v_dias_atraso_maxima INTEGER;
BEGIN
    -- Se parcela não foi paga e está vencida
    IF NEW.pago = FALSE AND NEW.data_vencimento < CURRENT_DATE THEN
        -- Contar parcelas em atraso do parcelamento
        SELECT COUNT(*)
        INTO v_parcelas_em_atraso
        FROM arrecadacao.parcelamentos_parcelas
        WHERE parcelamento_id = NEW.parcelamento_id
          AND pago = FALSE
          AND data_vencimento < CURRENT_DATE;

        -- Pegar o maior número de dias em atraso
        SELECT MAX(CURRENT_DATE - data_vencimento)
        INTO v_dias_atraso_maxima
        FROM arrecadacao.parcelamentos_parcelas
        WHERE parcelamento_id = NEW.parcelamento_id
          AND pago = FALSE
          AND data_vencimento < CURRENT_DATE;

        -- Regra: cancelar se 2 parcelas em atraso OU 1 parcela > 90 dias
        IF v_parcelas_em_atraso >= 2 OR v_dias_atraso_maxima > 90 THEN
            UPDATE arrecadacao.parcelamentos
            SET status = 'CANCELADO',
                cancelado = TRUE,
                data_cancelamento = CURRENT_DATE,
                motivo_cancelamento = CASE
                    WHEN v_parcelas_em_atraso >= 2 THEN '2 ou mais parcelas em atraso'
                    ELSE '1 parcela com mais de 90 dias em atraso'
                END
            WHERE id = NEW.parcelamento_id
              AND status = 'ATIVO';

            -- Log de auditoria
            INSERT INTO admin.auditoria_log (
                data_hora, modulo, entidade, entidade_id, operacao, descricao
            ) VALUES (
                CURRENT_TIMESTAMP,
                'ARRECADACAO',
                'parcelamentos',
                NEW.parcelamento_id,
                'UPDATE',
                'Cancelamento automático por inadimplência'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION verificar_inadimplencia_parcelamento IS 'Cancela parcelamento automaticamente por inadimplência';


-- Trigger para verificar inadimplência
CREATE TRIGGER trigger_verificar_inadimplencia_parcelamento
    AFTER INSERT OR UPDATE ON arrecadacao.parcelamentos_parcelas
    FOR EACH ROW
    EXECUTE FUNCTION verificar_inadimplencia_parcelamento();


-- =====================================================
-- FUNÇÃO: Atualizar saldo do parcelamento
-- =====================================================
CREATE OR REPLACE FUNCTION atualizar_saldo_parcelamento()
RETURNS TRIGGER AS $$
DECLARE
    v_parcelas_pagas INTEGER;
    v_total_parcelas INTEGER;
BEGIN
    -- Contar parcelas pagas e totais
    SELECT COUNT(*) FILTER (WHERE pago = TRUE), COUNT(*)
    INTO v_parcelas_pagas, v_total_parcelas
    FROM arrecadacao.parcelamentos_parcelas
    WHERE parcelamento_id = NEW.parcelamento_id;

    -- Se todas as parcelas foram pagas, marcar parcelamento como quitado
    IF v_parcelas_pagas = v_total_parcelas THEN
        UPDATE arrecadacao.parcelamentos
        SET status = 'QUITADO',
            quitado = TRUE,
            data_quitacao = CURRENT_DATE
        WHERE id = NEW.parcelamento_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION atualizar_saldo_parcelamento IS 'Atualiza status do parcelamento quando todas as parcelas são pagas';


-- Trigger para atualizar saldo
CREATE TRIGGER trigger_atualizar_saldo_parcelamento
    AFTER UPDATE ON arrecadacao.parcelamentos_parcelas
    FOR EACH ROW
    WHEN (NEW.pago = TRUE AND OLD.pago = FALSE)
    EXECUTE FUNCTION atualizar_saldo_parcelamento();


-- =====================================================
-- FUNÇÃO: Baixa automática de DAM via pagamento
-- =====================================================
CREATE OR REPLACE FUNCTION baixar_dam_pagamento()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando pagamento é confirmado, baixar o DAM
    IF NEW.confirmado = TRUE AND OLD.confirmado = FALSE THEN
        UPDATE arrecadacao.dams
        SET pago = TRUE,
            data_pagamento = NEW.data_pagamento,
            valor_pago = NEW.valor_pago,
            canal_pagamento = NEW.canal_pagamento,
            status = 'PAGO',
            data_baixa = NEW.data_confirmacao,
            baixa_automatica = TRUE
        WHERE id = NEW.dam_id;

        -- Log de auditoria
        INSERT INTO admin.auditoria_log (
            data_hora, modulo, entidade, entidade_id, operacao, descricao
        ) VALUES (
            CURRENT_TIMESTAMP,
            'ARRECADACAO',
            'dams',
            NEW.dam_id,
            'UPDATE',
            'Baixa automática via pagamento confirmado nº ' || NEW.numero_pagamento
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION baixar_dam_pagamento IS 'Baixa automaticamente DAM quando pagamento é confirmado';


-- Trigger para baixa automática
CREATE TRIGGER trigger_baixar_dam_pagamento
    AFTER UPDATE ON arrecadacao.pagamentos
    FOR EACH ROW
    WHEN (NEW.confirmado = TRUE AND OLD.confirmado = FALSE)
    EXECUTE FUNCTION baixar_dam_pagamento();


-- =====================================================
-- FUNÇÃO: Converter RPS em NFS-e automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION alertar_rps_vencidos()
RETURNS void AS $$
BEGIN
    -- Marcar RPS expirados (30 dias sem conversão)
    UPDATE nfse.rps
    SET status = 'EXPIRADO'
    WHERE status = 'AGUARDANDO_CONVERSAO'
      AND data_limite_conversao < CURRENT_DATE;

    -- Log de auditoria
    INSERT INTO admin.auditoria_log (
        data_hora, modulo, entidade, operacao, descricao
    ) VALUES (
        CURRENT_TIMESTAMP,
        'NFSE',
        'rps',
        'UPDATE',
        'Marcação automática de RPS expirados (prazo > 30 dias)'
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION alertar_rps_vencidos IS 'Marca RPS como expirados após 30 dias sem conversão';


-- =====================================================
-- FUNÇÃO: Auditoria automática
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_auditoria()
RETURNS TRIGGER AS $$
DECLARE
    v_operacao TEXT;
    v_dados_antes JSONB;
    v_dados_depois JSONB;
BEGIN
    -- Determinar operação
    IF TG_OP = 'INSERT' THEN
        v_operacao := 'INSERT';
        v_dados_antes := NULL;
        v_dados_depois := row_to_json(NEW)::JSONB;
    ELSIF TG_OP = 'UPDATE' THEN
        v_operacao := 'UPDATE';
        v_dados_antes := row_to_json(OLD)::JSONB;
        v_dados_depois := row_to_json(NEW)::JSONB;
    ELSIF TG_OP = 'DELETE' THEN
        v_operacao := 'DELETE';
        v_dados_antes := row_to_json(OLD)::JSONB;
        v_dados_depois := NULL;
    END IF;

    -- Inserir log de auditoria
    INSERT INTO admin.auditoria_log (
        data_hora,
        modulo,
        entidade,
        entidade_id,
        operacao,
        descricao,
        dados_antes,
        dados_depois
    ) VALUES (
        CURRENT_TIMESTAMP,
        TG_TABLE_SCHEMA,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        v_operacao,
        'Operação ' || v_operacao || ' em ' || TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
        v_dados_antes,
        v_dados_depois
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION registrar_auditoria IS 'Registra automaticamente todas as operações críticas para auditoria';


-- =====================================================
-- APLICAR TRIGGERS DE AUDITORIA NAS TABELAS CRÍTICAS
-- =====================================================

-- Exemplo: Auditoria em lançamentos de IPTU
CREATE TRIGGER trigger_auditoria_iptu_lancamentos
    AFTER INSERT OR UPDATE OR DELETE ON tributario.iptu_lancamentos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_auditoria();

-- Exemplo: Auditoria em guias de ITBI
CREATE TRIGGER trigger_auditoria_itbi_guias
    AFTER INSERT OR UPDATE OR DELETE ON tributario.itbi_guias
    FOR EACH ROW
    EXECUTE FUNCTION registrar_auditoria();

-- Exemplo: Auditoria em DAMs
CREATE TRIGGER trigger_auditoria_dams
    AFTER INSERT OR UPDATE OR DELETE ON arrecadacao.dams
    FOR EACH ROW
    EXECUTE FUNCTION registrar_auditoria();

-- Exemplo: Auditoria em parcelamentos
CREATE TRIGGER trigger_auditoria_parcelamentos
    AFTER INSERT OR UPDATE OR DELETE ON arrecadacao.parcelamentos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_auditoria();

-- Exemplo: Auditoria em dívida ativa
CREATE TRIGGER trigger_auditoria_divida_ativa
    AFTER INSERT OR UPDATE OR DELETE ON divida_ativa.inscricoes
    FOR EACH ROW
    EXECUTE FUNCTION registrar_auditoria();


-- =====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índices para melhorar performance de consultas comuns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_iptu_lancamentos_ano_status
    ON tributario.iptu_lancamentos(ano_exercicio, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dams_contribuinte_status
    ON arrecadacao.dams(contribuinte_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dams_vencimento_pago
    ON arrecadacao.dams(data_vencimento, pago);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_parcelamentos_contribuinte_status
    ON arrecadacao.parcelamentos(contribuinte_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nfse_prestador_competencia
    ON nfse.notas_fiscais(prestador_id, ano_competencia, mes_competencia);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_divida_ativa_devedor_status
    ON divida_ativa.inscricoes(devedor_id, status);


-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Resumo de débitos por contribuinte
CREATE OR REPLACE VIEW arrecadacao.vw_debitos_contribuinte AS
SELECT
    p.id AS contribuinte_id,
    p.cpf,
    p.cnpj,
    COALESCE(p.nome, p.razao_social) AS nome,
    COUNT(d.id) AS quantidade_debitos,
    SUM(d.valor_total) AS total_debitos,
    SUM(CASE WHEN d.pago = FALSE THEN d.valor_total ELSE 0 END) AS total_em_aberto,
    SUM(CASE WHEN d.pago = TRUE THEN d.valor_total ELSE 0 END) AS total_pago
FROM cadastro.pessoas p
LEFT JOIN arrecadacao.dams d ON d.contribuinte_id = p.id
GROUP BY p.id, p.cpf, p.cnpj, p.nome, p.razao_social;

COMMENT ON VIEW arrecadacao.vw_debitos_contribuinte IS 'Resumo de débitos por contribuinte';


-- View: Arrecadação por tributo
CREATE OR REPLACE VIEW arrecadacao.vw_arrecadacao_por_tributo AS
SELECT
    d.tipo_tributo,
    COUNT(d.id) AS quantidade_guias,
    SUM(d.valor_total) AS valor_total_lancado,
    SUM(CASE WHEN d.pago = TRUE THEN d.valor_total ELSE 0 END) AS valor_arrecadado,
    SUM(CASE WHEN d.pago = FALSE THEN d.valor_total ELSE 0 END) AS valor_em_aberto,
    ROUND(
        (SUM(CASE WHEN d.pago = TRUE THEN d.valor_total ELSE 0 END) * 100.0) /
        NULLIF(SUM(d.valor_total), 0),
        2
    ) AS percentual_arrecadacao
FROM arrecadacao.dams d
GROUP BY d.tipo_tributo;

COMMENT ON VIEW arrecadacao.vw_arrecadacao_por_tributo IS 'Resumo de arrecadação por tipo de tributo';


-- =====================================================
-- FIM DOS TRIGGERS E FUNÇÕES
-- =====================================================

COMMENT ON SCHEMA tributario IS 'Módulo Tributário completo com triggers e funções automatizadas';
