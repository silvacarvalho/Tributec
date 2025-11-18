"""
Seeds de Parâmetros do Sistema
Parâmetros configuráveis para FISCAL, TRIBUTÁRIO (IPTU/ITBI), etc.
"""
from decimal import Decimal
from datetime import date


# =====================================================
# PARÂMETROS FISCAIS
# =====================================================

PARAMETROS_FISCAL = [
    # ============ VALORES ============
    {
        "modulo": "FISCAL",
        "categoria": "VALORES",
        "chave": "FISCAL.VALORES.UFM_VALOR_ATUAL",
        "nome_exibicao": "Valor Atual da UFM",
        "descricao": "Valor monetário atual da Unidade Fiscal Municipal",
        "texto_ajuda": "A UFM é usada como base para cálculo de multas e taxas fiscais. O valor é atualizado anualmente conforme legislação municipal.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("150.50"),
        "validacoes": {"min": 0.01, "unidade": "R$"},
        "ano_vigencia": 2025,
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 1,
        "base_legal": "Lei Municipal nº 1.234/2024, Art. 5º"
    },

    # ============ PRAZOS ============
    {
        "modulo": "FISCAL",
        "categoria": "PRAZOS",
        "chave": "FISCAL.PRAZOS.DEFESA_AUTO_DIAS",
        "nome_exibicao": "Prazo para Defesa (Auto de Infração)",
        "descricao": "Número de dias corridos que o autuado tem para apresentar defesa após notificação",
        "texto_ajuda": "Prazo legal para defesa conforme Código Tributário Municipal. A contagem inicia no dia seguinte à notificação.",
        "tipo_valor": "INTEGER",
        "valor_inteiro": 30,
        "validacoes": {"min": 5, "max": 90, "unidade": "dias"},
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 10,
        "base_legal": "CTM, Art. 142"
    },
    {
        "modulo": "FISCAL",
        "categoria": "PRAZOS",
        "chave": "FISCAL.PRAZOS.RECURSO_DIAS",
        "nome_exibicao": "Prazo para Recurso",
        "descricao": "Número de dias corridos para interpor recurso após decisão de primeira instância",
        "texto_ajuda": "Prazo para apresentar recurso quando a defesa for indeferida.",
        "tipo_valor": "INTEGER",
        "valor_inteiro": 15,
        "validacoes": {"min": 5, "max": 60, "unidade": "dias"},
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 11,
        "base_legal": "CTM, Art. 145"
    },
    {
        "modulo": "FISCAL",
        "categoria": "PRAZOS",
        "chave": "FISCAL.PRAZOS.NOTIFICACAO_DIAS",
        "nome_exibicao": "Prazo para Notificação",
        "descricao": "Número de dias para notificar o autuado após lavratura do auto",
        "texto_ajuda": "Prazo máximo para notificar o contribuinte sobre o auto de infração lavrado.",
        "tipo_valor": "INTEGER",
        "valor_inteiro": 10,
        "validacoes": {"min": 1, "max": 30, "unidade": "dias"},
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 12,
        "base_legal": "CTM, Art. 140"
    },
    {
        "modulo": "FISCAL",
        "categoria": "PRAZOS",
        "chave": "FISCAL.PRAZOS.REGIME_ESPECIAL_MIN_DIAS",
        "nome_exibicao": "Regime Especial - Prazo Mínimo",
        "descricao": "Prazo mínimo de duração do regime especial de fiscalização",
        "texto_ajuda": "Duração mínima quando o contribuinte é incluído em regime especial de fiscalização.",
        "tipo_valor": "INTEGER",
        "valor_inteiro": 60,
        "validacoes": {"min": 30, "max": 180, "unidade": "dias"},
        "obrigatorio": False,
        "editavel": True,
        "ordem_exibicao": 13,
        "base_legal": "CTM, Art. 180"
    },
    {
        "modulo": "FISCAL",
        "categoria": "PRAZOS",
        "chave": "FISCAL.PRAZOS.REGIME_ESPECIAL_MAX_DIAS",
        "nome_exibicao": "Regime Especial - Prazo Máximo",
        "descricao": "Prazo máximo de duração do regime especial de fiscalização",
        "texto_ajuda": "Duração máxima do regime especial. Após esse período, nova análise é necessária.",
        "tipo_valor": "INTEGER",
        "valor_inteiro": 360,
        "validacoes": {"min": 180, "max": 730, "unidade": "dias"},
        "obrigatorio": False,
        "editavel": True,
        "ordem_exibicao": 14,
        "base_legal": "CTM, Art. 180, §2º"
    },

    # ============ MULTAS ============
    {
        "modulo": "FISCAL",
        "categoria": "MULTAS",
        "chave": "FISCAL.MULTAS.MINIMA_UFM",
        "nome_exibicao": "Multa Mínima (UFM)",
        "descricao": "Valor mínimo de multa em UFM",
        "texto_ajuda": "Piso mínimo para qualquer multa fiscal, mesmo que o cálculo percentual resulte em valor menor.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("5.0"),
        "validacoes": {"min": 1, "unidade": "UFM"},
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 20,
        "base_legal": "CTM, Art. 87"
    },
    {
        "modulo": "FISCAL",
        "categoria": "MULTAS",
        "chave": "FISCAL.MULTAS.MAXIMA_UFM",
        "nome_exibicao": "Multa Máxima (UFM)",
        "descricao": "Valor máximo de multa em UFM",
        "texto_ajuda": "Teto máximo para multas fiscais, mesmo em casos de infrações gravíssimas.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("1000.0"),
        "validacoes": {"min": 100, "unidade": "UFM"},
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 21,
        "base_legal": "CTM, Art. 87, §3º"
    },
    {
        "modulo": "FISCAL",
        "categoria": "MULTAS",
        "chave": "FISCAL.MULTAS.REINCIDENCIA_ACRESCIMO",
        "nome_exibicao": "Acréscimo por Reincidência",
        "descricao": "Forma de cálculo do acréscimo em caso de reincidência",
        "texto_ajuda": "1ª reincidência: dobro da multa original. 2ª reincidência em diante: acréscimo de 30% sobre o valor anterior a cada nova reincidência.",
        "tipo_valor": "JSON",
        "valor_json": {
            "primeira_reincidencia": "DOBRO",
            "demais_reincidencias": "ACRESCIMO_30_PCT",
            "prazo_entre_infracoes_dias": 365
        },
        "obrigatorio": True,
        "editavel": False,
        "ordem_exibicao": 22,
        "base_legal": "CTM, Art. 88, §2º"
    },
    {
        "modulo": "FISCAL",
        "categoria": "MULTAS",
        "chave": "FISCAL.MULTAS.PERCENTUAL_PADRAO",
        "nome_exibicao": "Percentual Padrão de Multa",
        "descricao": "Percentual padrão aplicado quando não há valor específico",
        "texto_ajuda": "Usado quando a infração prevê multa percentual mas não especifica o percentual exato.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("50.0"),
        "validacoes": {"min": 10, "max": 100, "unidade": "%"},
        "obrigatorio": False,
        "editavel": True,
        "ordem_exibicao": 23,
        "base_legal": "CTM, Art. 89"
    },

    # ============ NOTIFICAÇÃO ============
    {
        "modulo": "FISCAL",
        "categoria": "NOTIFICACAO",
        "chave": "FISCAL.NOTIFICACAO.FORMAS_VALIDAS",
        "nome_exibicao": "Formas Válidas de Notificação",
        "descricao": "Formas aceitas para notificação do autuado",
        "texto_ajuda": "Formas de notificação previstas em lei. O DTD (Domicílio Tributário Digital) é prioritário quando ativo.",
        "tipo_valor": "JSON",
        "valor_json": ["PESSOAL", "CORREIOS", "EDITAL", "EMAIL", "DTD"],
        "validacoes": {
            "opcoes": ["PESSOAL", "CORREIOS", "EDITAL", "EMAIL", "DTD"]
        },
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 30,
        "base_legal": "Lei do DTD, Art. 3º"
    },
    {
        "modulo": "FISCAL",
        "categoria": "NOTIFICACAO",
        "chave": "FISCAL.NOTIFICACAO.PRIORIDADE_DTD",
        "nome_exibicao": "Priorizar DTD",
        "descricao": "Se deve priorizar notificação via DTD quando disponível",
        "texto_ajuda": "Quando ativo, o sistema tentará notificar primeiro via DTD antes de outras formas.",
        "tipo_valor": "BOOLEAN",
        "valor_booleano": True,
        "obrigatorio": False,
        "editavel": True,
        "ordem_exibicao": 31,
        "base_legal": "Lei do DTD, Art. 5º"
    },

    # ============ INTIMAÇÃO ============
    {
        "modulo": "FISCAL",
        "categoria": "INTIMACAO",
        "chave": "FISCAL.INTIMACAO.PRAZO_PADRAO_DIAS",
        "nome_exibicao": "Prazo Padrão para Intimação",
        "descricao": "Número de dias para cumprimento de intimação",
        "texto_ajuda": "Prazo padrão concedido ao contribuinte para atender intimação fiscal.",
        "tipo_valor": "INTEGER",
        "valor_inteiro": 15,
        "validacoes": {"min": 5, "max": 60, "unidade": "dias"},
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 40,
        "base_legal": "CTM, Art. 150"
    },
    {
        "modulo": "FISCAL",
        "categoria": "INTIMACAO",
        "chave": "FISCAL.INTIMACAO.PRAZO_MINIMO_DIAS",
        "nome_exibicao": "Prazo Mínimo para Intimação",
        "descricao": "Prazo mínimo que pode ser concedido em intimação",
        "texto_ajuda": "Piso legal para prazo de intimação, mesmo em casos urgentes.",
        "tipo_valor": "INTEGER",
        "valor_inteiro": 5,
        "validacoes": {"min": 1, "max": 15, "unidade": "dias"},
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 41,
        "base_legal": "CTM, Art. 150, §1º"
    },
]


# =====================================================
# PARÂMETROS IPTU - VALOR VENAL
# =====================================================

PARAMETROS_IPTU = [
    # ============ VALORES UNITÁRIOS - TERRENO ============
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_VALOR_VENAL",
        "chave": "TRIBUTARIO.IPTU.VU_TERRENO_ZONA_CENTRAL",
        "nome_exibicao": "VU m² Terreno - Zona Central",
        "descricao": "Valor unitário do m² de terreno na zona central do município",
        "texto_ajuda": "Usado para calcular o valor venal do terreno. Valor atualizado anualmente pela Planta Genérica de Valores (PGV).",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("850.00"),
        "validacoes": {"min": 0.01, "unidade": "R$/m²"},
        "ano_vigencia": 2025,
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 1,
        "base_legal": "Lei Municipal nº 1.234/2024, Anexo I - PGV"
    },
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_VALOR_VENAL",
        "chave": "TRIBUTARIO.IPTU.VU_TERRENO_ZONA_RESIDENCIAL",
        "nome_exibicao": "VU m² Terreno - Zona Residencial",
        "descricao": "Valor unitário do m² de terreno em zona residencial",
        "texto_ajuda": "Aplicado para terrenos localizados em zonas predominantemente residenciais.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("420.00"),
        "validacoes": {"min": 0.01, "unidade": "R$/m²"},
        "ano_vigencia": 2025,
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 2,
        "base_legal": "Lei Municipal nº 1.234/2024, Anexo I - PGV"
    },
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_VALOR_VENAL",
        "chave": "TRIBUTARIO.IPTU.VU_TERRENO_ZONA_COMERCIAL",
        "nome_exibicao": "VU m² Terreno - Zona Comercial",
        "descricao": "Valor unitário do m² de terreno em zona comercial",
        "texto_ajuda": "Aplicado para terrenos em áreas de comércio e serviços.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("720.00"),
        "validacoes": {"min": 0.01, "unidade": "R$/m²"},
        "ano_vigencia": 2025,
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 3,
        "base_legal": "Lei Municipal nº 1.234/2024, Anexo I - PGV"
    },
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_VALOR_VENAL",
        "chave": "TRIBUTARIO.IPTU.VU_TERRENO_ZONA_INDUSTRIAL",
        "nome_exibicao": "VU m² Terreno - Zona Industrial",
        "descricao": "Valor unitário do m² de terreno em zona industrial",
        "texto_ajuda": "Aplicado para terrenos em distritos industriais.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("350.00"),
        "validacoes": {"min": 0.01, "unidade": "R$/m²"},
        "ano_vigencia": 2025,
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 4,
        "base_legal": "Lei Municipal nº 1.234/2024, Anexo I - PGV"
    },

    # ============ VALORES UNITÁRIOS - EDIFICAÇÃO ============
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_VALOR_VENAL",
        "chave": "TRIBUTARIO.IPTU.VU_EDIFICACAO_PADRAO_ALTO",
        "nome_exibicao": "VU m² Edificação - Padrão Alto",
        "descricao": "Valor unitário do m² de construção de padrão alto",
        "texto_ajuda": "Multiplica pela área edificada para obter valor venal da edificação. Considera acabamento de primeira linha, materiais nobres.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("1250.00"),
        "validacoes": {"min": 0.01, "unidade": "R$/m²"},
        "ano_vigencia": 2025,
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 10,
        "base_legal": "Lei Municipal nº 1.234/2024, Anexo II"
    },
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_VALOR_VENAL",
        "chave": "TRIBUTARIO.IPTU.VU_EDIFICACAO_PADRAO_MEDIO",
        "nome_exibicao": "VU m² Edificação - Padrão Médio",
        "descricao": "Valor unitário do m² de construção de padrão médio",
        "texto_ajuda": "Padrão médio: acabamento padrão, materiais de qualidade média.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("850.00"),
        "validacoes": {"min": 0.01, "unidade": "R$/m²"},
        "ano_vigencia": 2025,
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 11,
        "base_legal": "Lei Municipal nº 1.234/2024, Anexo II"
    },
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_VALOR_VENAL",
        "chave": "TRIBUTARIO.IPTU.VU_EDIFICACAO_PADRAO_BAIXO",
        "nome_exibicao": "VU m² Edificação - Padrão Baixo",
        "descricao": "Valor unitário do m² de construção de padrão baixo",
        "texto_ajuda": "Padrão baixo: acabamento simples, materiais econômicos.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("520.00"),
        "validacoes": {"min": 0.01, "unidade": "R$/m²"},
        "ano_vigencia": 2025,
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 12,
        "base_legal": "Lei Municipal nº 1.234/2024, Anexo II"
    },

    # ============ FATORES DE VALORIZAÇÃO ============
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_FATORES",
        "chave": "TRIBUTARIO.IPTU.FATOR_ESQUINA",
        "nome_exibicao": "Fator de Esquina",
        "descricao": "Multiplicador aplicado para imóveis de esquina",
        "texto_ajuda": "Imóveis de esquina têm valorização de 10% (fator 1.10) devido à maior visibilidade e acesso.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("1.10"),
        "validacoes": {"min": 1.0, "max": 2.0},
        "obrigatorio": False,
        "editavel": True,
        "ordem_exibicao": 20,
        "base_legal": "CTM, Art. 45, §3º"
    },
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_FATORES",
        "chave": "TRIBUTARIO.IPTU.FATOR_DUAS_FRENTES",
        "nome_exibicao": "Fator Duas Frentes",
        "descricao": "Multiplicador para imóveis com duas frentes",
        "texto_ajuda": "Imóveis com duas frentes têm valorização de 15%.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("1.15"),
        "validacoes": {"min": 1.0, "max": 2.0},
        "obrigatorio": False,
        "editavel": True,
        "ordem_exibicao": 21,
        "base_legal": "CTM, Art. 45, §4º"
    },

    # ============ FATORES DE CONSERVAÇÃO ============
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_FATORES",
        "chave": "TRIBUTARIO.IPTU.FATOR_CONSERVACAO_OTIMO",
        "nome_exibicao": "Fator Conservação - Ótimo",
        "descricao": "Multiplicador para imóveis em estado ótimo de conservação",
        "texto_ajuda": "Imóvel novo ou recém-reformado, sem defeitos aparentes.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("1.05"),
        "validacoes": {"min": 0.5, "max": 1.2},
        "obrigatorio": False,
        "editavel": True,
        "ordem_exibicao": 25,
        "base_legal": "CTM, Art. 46"
    },
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_FATORES",
        "chave": "TRIBUTARIO.IPTU.FATOR_CONSERVACAO_BOM",
        "nome_exibicao": "Fator Conservação - Bom",
        "descricao": "Multiplicador para imóveis em bom estado de conservação",
        "texto_ajuda": "Imóvel bem mantido, pequenos defeitos apenas.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("1.00"),
        "validacoes": {"min": 0.5, "max": 1.2},
        "obrigatorio": False,
        "editavel": True,
        "ordem_exibicao": 26,
        "base_legal": "CTM, Art. 46"
    },
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_FATORES",
        "chave": "TRIBUTARIO.IPTU.FATOR_CONSERVACAO_REGULAR",
        "nome_exibicao": "Fator Conservação - Regular",
        "descricao": "Multiplicador para imóveis em estado regular",
        "texto_ajuda": "Imóvel com desgaste visível, necessita manutenção.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("0.85"),
        "validacoes": {"min": 0.5, "max": 1.2},
        "obrigatorio": False,
        "editavel": True,
        "ordem_exibicao": 27,
        "base_legal": "CTM, Art. 46"
    },
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_FATORES",
        "chave": "TRIBUTARIO.IPTU.FATOR_CONSERVACAO_RUIM",
        "nome_exibicao": "Fator Conservação - Ruim",
        "descricao": "Multiplicador para imóveis em mau estado de conservação",
        "texto_ajuda": "Imóvel deteriorado, necessita reformas significativas.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("0.70"),
        "validacoes": {"min": 0.5, "max": 1.2},
        "obrigatorio": False,
        "editavel": True,
        "ordem_exibicao": 28,
        "base_legal": "CTM, Art. 46"
    },

    # ============ DESCONTOS E BENEFÍCIOS ============
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_DESCONTOS",
        "chave": "TRIBUTARIO.IPTU.DESCONTO_COTA_UNICA_PCT",
        "nome_exibicao": "Desconto Cota Única (%)",
        "descricao": "Percentual de desconto para pagamento em cota única",
        "texto_ajuda": "Desconto aplicado quando o contribuinte paga o IPTU integral até a data limite da primeira parcela.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("10.00"),
        "validacoes": {"min": 0, "max": 100, "unidade": "%"},
        "obrigatorio": False,
        "editavel": True,
        "ordem_exibicao": 30,
        "base_legal": "Lei nº 1.234/2024, Art. 12"
    },
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_DESCONTOS",
        "chave": "TRIBUTARIO.IPTU.DESCONTO_COTA_UNICA_MES_LIMITE",
        "nome_exibicao": "Mês Limite Desconto Cota Única",
        "descricao": "Último mês para pagamento com desconto de cota única",
        "texto_ajuda": "Até este mês (número) o desconto de cota única é válido. Ex: 1 = Janeiro, 2 = Fevereiro.",
        "tipo_valor": "INTEGER",
        "valor_inteiro": 2,
        "validacoes": {"min": 1, "max": 12, "unidade": "mês"},
        "obrigatorio": False,
        "editavel": True,
        "ordem_exibicao": 31,
        "base_legal": "Lei nº 1.234/2024, Art. 12, §1º"
    },

    # ============ VENCIMENTOS ============
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_PRAZOS",
        "chave": "TRIBUTARIO.IPTU.VENCIMENTO_COTA_UNICA_DIA",
        "nome_exibicao": "Dia Vencimento - Cota Única",
        "descricao": "Dia do mês para vencimento da cota única/primeira parcela",
        "texto_ajuda": "Primeira parcela ou cota única vence sempre neste dia de fevereiro.",
        "tipo_valor": "INTEGER",
        "valor_inteiro": 10,
        "validacoes": {"min": 1, "max": 28, "unidade": "dia do mês"},
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 35,
        "base_legal": "Lei nº 1.234/2024, Art. 15"
    },
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_PRAZOS",
        "chave": "TRIBUTARIO.IPTU.NUMERO_PARCELAS_MAX",
        "nome_exibicao": "Número Máximo de Parcelas",
        "descricao": "Quantidade máxima de parcelas permitidas para IPTU",
        "texto_ajuda": "O IPTU pode ser parcelado em até este número de parcelas mensais.",
        "tipo_valor": "INTEGER",
        "valor_inteiro": 10,
        "validacoes": {"min": 1, "max": 12, "unidade": "parcelas"},
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 36,
        "base_legal": "Lei nº 1.234/2024, Art. 16"
    },

    # ============ FÓRMULA DE CÁLCULO ============
    {
        "modulo": "TRIBUTARIO",
        "categoria": "IPTU_CALCULO",
        "chave": "TRIBUTARIO.IPTU.FORMULA_VALOR_VENAL",
        "nome_exibicao": "Fórmula de Cálculo do Valor Venal",
        "descricao": "Fórmula completa para cálculo do valor venal do imóvel",
        "texto_ajuda": "VV = (VU_terreno × Área_terreno × Fatores) + (VU_edificação × Área_edificada × Fatores × Conservação)",
        "tipo_valor": "JSON",
        "valor_json": {
            "terreno": {
                "base": "VU_TERRENO_POR_ZONA",
                "multiplicadores": ["AREA_TERRENO"],
                "fatores": ["FATOR_LOCALIZACAO", "FATOR_ESQUINA", "FATOR_TOPOGRAFIA", "FATOR_DUAS_FRENTES"]
            },
            "edificacao": {
                "base": "VU_EDIFICACAO_POR_PADRAO",
                "multiplicadores": ["AREA_EDIFICADA"],
                "fatores": ["FATOR_CONSERVACAO", "FATOR_IDADE"]
            },
            "formula": "VV_TOTAL = VV_TERRENO + VV_EDIFICACAO"
        },
        "obrigatorio": False,
        "editavel": False,
        "ordem_exibicao": 50,
        "base_legal": "CTM, Art. 40-48"
    },
]


# =====================================================
# PARÂMETROS ITBI
# =====================================================

PARAMETROS_ITBI = [
    {
        "modulo": "TRIBUTARIO",
        "categoria": "ITBI",
        "chave": "TRIBUTARIO.ITBI.ALIQUOTA_PADRAO",
        "nome_exibicao": "Alíquota Padrão ITBI",
        "descricao": "Alíquota padrão do ITBI sobre o valor venal",
        "texto_ajuda": "Aplicada sobre o maior valor entre o declarado e o valor venal de referência do imóvel.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("2.00"),
        "validacoes": {"min": 0, "max": 5, "unidade": "%"},
        "obrigatorio": True,
        "editavel": True,
        "ordem_exibicao": 1,
        "base_legal": "CTM, Art. 156"
    },
    {
        "modulo": "TRIBUTARIO",
        "categoria": "ITBI",
        "chave": "TRIBUTARIO.ITBI.VALOR_MINIMO_UFM",
        "nome_exibicao": "Valor Mínimo ITBI (UFM)",
        "descricao": "Valor mínimo de ITBI em UFM",
        "texto_ajuda": "Valor mínimo a ser cobrado de ITBI, mesmo que o cálculo percentual resulte em valor inferior.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("10.0"),
        "validacoes": {"min": 1, "unidade": "UFM"},
        "obrigatorio": False,
        "editavel": True,
        "ordem_exibicao": 2,
        "base_legal": "CTM, Art. 157"
    },
    {
        "modulo": "TRIBUTARIO",
        "categoria": "ITBI_ISENCOES",
        "chave": "TRIBUTARIO.ITBI.ISENCAO_SFH_TETO",
        "nome_exibicao": "Teto Isenção SFH",
        "descricao": "Valor máximo do imóvel para isenção do ITBI em financiamento SFH",
        "texto_ajuda": "Imóveis financiados pelo Sistema Financeiro de Habitação (SFH) com valor até este teto têm isenção total de ITBI.",
        "tipo_valor": "DECIMAL",
        "valor_decimal": Decimal("150000.00"),
        "validacoes": {"min": 0, "unidade": "R$"},
        "obrigatorio": False,
        "editavel": True,
        "ordem_exibicao": 10,
        "base_legal": "Lei Municipal nº 2.345/2023"
    },
    {
        "modulo": "TRIBUTARIO",
        "categoria": "ITBI_ISENCOES",
        "chave": "TRIBUTARIO.ITBI.ISENCAO_PRIMEIRA_CASA",
        "nome_exibicao": "Isenção Primeira Casa",
        "descricao": "Se concede isenção para primeira aquisição de imóvel residencial",
        "texto_ajuda": "Quando ativo, isenta de ITBI a primeira aquisição de imóvel residencial por pessoa física.",
        "tipo_valor": "BOOLEAN",
        "valor_booleano": True,
        "obrigatorio": False,
        "editavel": True,
        "ordem_exibicao": 11,
        "base_legal": "Lei Municipal nº 2.456/2024"
    },
]


# =====================================================
# TODOS OS PARÂMETROS
# =====================================================

TODOS_PARAMETROS = PARAMETROS_FISCAL + PARAMETROS_IPTU + PARAMETROS_ITBI
