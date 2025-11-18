"""
Módulo de cálculos tributários e fiscais
"""
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from dateutil.relativedelta import relativedelta


def calcular_juros_moratoria(
    valor_principal: Decimal,
    data_vencimento: date,
    data_pagamento: Optional[date] = None,
    taxa_mensal: Decimal = Decimal("1.0")
) -> Decimal:
    """
    Calcula juros de mora sobre débito tributário

    Regra: 1% ao mês (pro rata die: 0,033%/dia)

    Args:
        valor_principal: Valor do débito
        data_vencimento: Data de vencimento original
        data_pagamento: Data de pagamento (default: hoje)
        taxa_mensal: Taxa de juros mensal em % (default: 1%)

    Returns:
        Valor dos juros calculados
    """
    if data_pagamento is None:
        data_pagamento = date.today()

    if data_pagamento <= data_vencimento:
        return Decimal("0.00")

    # Calcula dias de atraso
    dias_atraso = (data_pagamento - data_vencimento).days

    # Calcula juros pro rata die (0,033% ao dia)
    taxa_diaria = taxa_mensal / Decimal("30")
    juros = valor_principal * (taxa_diaria / Decimal("100")) * Decimal(dias_atraso)

    return juros.quantize(Decimal("0.01"))


def calcular_multa_moratoria(
    valor_principal: Decimal,
    data_vencimento: date,
    data_pagamento: Optional[date] = None,
    com_acao_fiscal: bool = False
) -> Decimal:
    """
    Calcula multa moratória sobre débito tributário

    Regras:
    - 2% (até 15 dias)
    - 5% (16-30 dias)
    - 10% (31-60 dias)
    - 20% (>60 dias)
    - 50% (com ação fiscal)

    Args:
        valor_principal: Valor do débito
        data_vencimento: Data de vencimento original
        data_pagamento: Data de pagamento (default: hoje)
        com_acao_fiscal: Se há ação fiscal instaurada

    Returns:
        Valor da multa calculada
    """
    if data_pagamento is None:
        data_pagamento = date.today()

    if data_pagamento <= data_vencimento:
        return Decimal("0.00")

    # Se há ação fiscal, multa é 50%
    if com_acao_fiscal:
        multa = valor_principal * Decimal("0.50")
        return multa.quantize(Decimal("0.01"))

    # Calcula dias de atraso
    dias_atraso = (data_pagamento - data_vencimento).days

    # Aplica percentual conforme dias de atraso
    if dias_atraso <= 15:
        percentual = Decimal("0.02")  # 2%
    elif dias_atraso <= 30:
        percentual = Decimal("0.05")  # 5%
    elif dias_atraso <= 60:
        percentual = Decimal("0.10")  # 10%
    else:
        percentual = Decimal("0.20")  # 20%

    multa = valor_principal * percentual
    return multa.quantize(Decimal("0.01"))


def calcular_correcao_monetaria(
    valor_principal: Decimal,
    data_base: date,
    data_calculo: Optional[date] = None,
    indices_ipca: Optional[dict] = None
) -> Decimal:
    """
    Calcula correção monetária pelo IPCA-IBGE

    Args:
        valor_principal: Valor a ser corrigido
        data_base: Data base do valor
        data_calculo: Data até quando corrigir (default: hoje)
        indices_ipca: Dict com índices IPCA {(ano, mes): indice}

    Returns:
        Valor da correção monetária
    """
    if data_calculo is None:
        data_calculo = date.today()

    if data_calculo <= data_base:
        return Decimal("0.00")

    # TODO: Integrar com API do IBGE para obter índices IPCA reais
    # Por enquanto, retorna 0 (implementar posteriormente)
    return Decimal("0.00")


def calcular_acrescimos_legais(
    valor_principal: Decimal,
    data_vencimento: date,
    data_pagamento: Optional[date] = None,
    com_acao_fiscal: bool = False,
    incluir_correcao: bool = True
) -> dict:
    """
    Calcula todos os acréscimos legais (multa, juros e correção)

    Args:
        valor_principal: Valor do débito
        data_vencimento: Data de vencimento original
        data_pagamento: Data de pagamento (default: hoje)
        com_acao_fiscal: Se há ação fiscal instaurada
        incluir_correcao: Se deve incluir correção monetária

    Returns:
        Dict com valores de multa, juros, correção e total
    """
    if data_pagamento is None:
        data_pagamento = date.today()

    multa = calcular_multa_moratoria(
        valor_principal,
        data_vencimento,
        data_pagamento,
        com_acao_fiscal
    )

    juros = calcular_juros_moratoria(
        valor_principal,
        data_vencimento,
        data_pagamento
    )

    correcao = Decimal("0.00")
    if incluir_correcao:
        correcao = calcular_correcao_monetaria(
            valor_principal,
            data_vencimento,
            data_pagamento
        )

    total = valor_principal + multa + juros + correcao

    return {
        "valor_principal": valor_principal.quantize(Decimal("0.01")),
        "multa": multa,
        "juros": juros,
        "correcao": correcao,
        "total_acrescimos": (multa + juros + correcao).quantize(Decimal("0.01")),
        "valor_total": total.quantize(Decimal("0.01")),
        "dias_atraso": (data_pagamento - data_vencimento).days if data_pagamento > data_vencimento else 0
    }


def calcular_ufm(quantidade: Decimal, valor_ufm: Decimal = Decimal("14.01")) -> Decimal:
    """
    Calcula valor em UFM (Unidade Fiscal Municipal)

    Args:
        quantidade: Quantidade de UFMs
        valor_ufm: Valor unitário da UFM (default: R$ 14,01)

    Returns:
        Valor em reais
    """
    valor = quantidade * valor_ufm
    return valor.quantize(Decimal("0.01"))
