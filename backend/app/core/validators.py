"""
Validadores de negócio customizados
Validações complexas e regras de negócio da aplicação
"""
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from fastapi import HTTPException, status


class BusinessValidator:
    """
    Validador de regras de negócio
    """

    @staticmethod
    def validar_data_nascimento(data_nascimento: date) -> None:
        """
        Valida se a data de nascimento é válida

        Regras:
        - Não pode ser futura
        - Pessoa deve ter no máximo 150 anos
        - Pessoa deve ter no mínimo 1 dia de vida
        """
        hoje = date.today()

        if data_nascimento > hoje:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Data de nascimento não pode ser futura",
            )

        idade = (hoje - data_nascimento).days / 365.25

        if idade > 150:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Data de nascimento inválida (idade superior a 150 anos)",
            )

        if idade < 0.003:  # Menos de 1 dia
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Data de nascimento inválida (menos de 1 dia)",
            )

    @staticmethod
    def validar_area_imovel(area_terreno: Decimal, area_construida: Decimal) -> None:
        """
        Valida áreas de imóvel

        Regras:
        - Área do terreno deve ser positiva
        - Área construída não pode ser maior que área do terreno
        - Áreas devem ser menores que 1 milhão de m²
        """
        if area_terreno <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Área do terreno deve ser maior que zero",
            )

        if area_terreno > Decimal("1000000"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Área do terreno não pode exceder 1.000.000 m²",
            )

        if area_construida < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Área construída não pode ser negativa",
            )

        if area_construida > area_terreno * Decimal("3"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Área construída não pode ser maior que 3x a área do terreno "
                    "(considerando múltiplos pavimentos)"
                ),
            )

    @staticmethod
    def validar_valor_transacao(valor: Decimal, valor_minimo: Decimal = Decimal("100")) -> None:
        """
        Valida valor de transação

        Regras:
        - Valor deve ser positivo
        - Valor deve ser maior que mínimo definido
        - Valor não pode exceder 1 bilhão
        """
        if valor <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor da transação deve ser maior que zero",
            )

        if valor < valor_minimo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Valor da transação deve ser maior que R$ {valor_minimo}",
            )

        if valor > Decimal("1000000000"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor da transação não pode exceder R$ 1.000.000.000,00",
            )

    @staticmethod
    def validar_numero_parcelas(numero_parcelas: int, maximo: int = 120) -> None:
        """
        Valida número de parcelas

        Regras:
        - Deve ser entre 1 e máximo permitido
        """
        if numero_parcelas < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Número de parcelas deve ser no mínimo 1",
            )

        if numero_parcelas > maximo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Número de parcelas não pode exceder {maximo}",
            )

    @staticmethod
    def validar_aliquota(aliquota: Decimal) -> None:
        """
        Valida alíquota tributária

        Regras:
        - Deve estar entre 0% e 100%
        - Máximo de 2 casas decimais
        """
        if aliquota < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Alíquota não pode ser negativa",
            )

        if aliquota > Decimal("100"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Alíquota não pode exceder 100%",
            )

        # Verificar se tem no máximo 2 casas decimais
        if aliquota.as_tuple().exponent < -2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Alíquota deve ter no máximo 2 casas decimais",
            )

    @staticmethod
    def validar_percentual_isencao(percentual: Decimal) -> None:
        """
        Valida percentual de isenção

        Regras:
        - Deve estar entre 0% e 100%
        - Apenas valores inteiros (sem casas decimais)
        """
        if percentual < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Percentual de isenção não pode ser negativo",
            )

        if percentual > Decimal("100"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Percentual de isenção não pode exceder 100%",
            )

        # Verificar se é inteiro
        if percentual % 1 != 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Percentual de isenção deve ser um número inteiro",
            )

    @staticmethod
    def validar_ano_exercicio(ano: int) -> None:
        """
        Valida ano de exercício tributário

        Regras:
        - Não pode ser anterior a 2000
        - Não pode ser superior ao ano atual + 1
        """
        ano_atual = datetime.now().year

        if ano < 2000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ano de exercício não pode ser anterior a 2000",
            )

        if ano > ano_atual + 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ano de exercício não pode ser superior a {ano_atual + 1}",
            )

    @staticmethod
    def validar_competencia(competencia: str) -> None:
        """
        Valida competência tributária (formato YYYY-MM)

        Regras:
        - Formato deve ser YYYY-MM
        - Mês deve estar entre 01 e 12
        - Ano deve ser válido
        """
        try:
            ano, mes = competencia.split("-")
            ano = int(ano)
            mes = int(mes)
        except (ValueError, AttributeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Competência deve estar no formato YYYY-MM (ex: 2024-01)",
            )

        if mes < 1 or mes > 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mês deve estar entre 01 e 12",
            )

        BusinessValidator.validar_ano_exercicio(ano)

    @staticmethod
    def validar_inscricao_imobiliaria(inscricao: str) -> None:
        """
        Valida formato de inscrição imobiliária

        Regras:
        - Deve conter apenas números
        - Deve ter entre 6 e 20 dígitos
        """
        inscricao_limpa = "".join(filter(str.isdigit, inscricao))

        if len(inscricao_limpa) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inscrição imobiliária deve ter no mínimo 6 dígitos",
            )

        if len(inscricao_limpa) > 20:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inscrição imobiliária deve ter no máximo 20 dígitos",
            )

    @staticmethod
    def validar_inscricao_municipal(inscricao: str) -> None:
        """
        Valida formato de inscrição municipal

        Regras:
        - Deve conter apenas números
        - Deve ter entre 4 e 15 dígitos
        """
        inscricao_limpa = "".join(filter(str.isdigit, inscricao))

        if len(inscricao_limpa) < 4:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inscrição municipal deve ter no mínimo 4 dígitos",
            )

        if len(inscricao_limpa) > 15:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inscrição municipal deve ter no máximo 15 dígitos",
            )

    @staticmethod
    def validar_prazo_pagamento(
        data_vencimento: date,
        data_minima: Optional[date] = None,
    ) -> None:
        """
        Valida prazo de pagamento

        Regras:
        - Data de vencimento não pode ser anterior à data mínima
        - Data de vencimento não pode ser mais de 10 anos no futuro
        """
        hoje = date.today()

        if data_minima and data_vencimento < data_minima:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Data de vencimento não pode ser anterior à data mínima permitida",
            )

        # Não permitir vencimentos muito distantes
        anos_futuro = (data_vencimento - hoje).days / 365.25
        if anos_futuro > 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Data de vencimento não pode ser superior a 10 anos no futuro",
            )

    @staticmethod
    def validar_valor_multa_juros(
        valor_original: Decimal,
        valor_multa: Decimal,
        valor_juros: Decimal,
    ) -> None:
        """
        Valida valores de multa e juros

        Regras:
        - Multa não pode exceder 100% do valor original
        - Juros não podem exceder 200% do valor original
        - Valores não podem ser negativos
        """
        if valor_multa < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor de multa não pode ser negativo",
            )

        if valor_juros < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor de juros não pode ser negativo",
            )

        if valor_multa > valor_original:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor de multa não pode exceder o valor original",
            )

        if valor_juros > valor_original * 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor de juros não pode exceder 200% do valor original",
            )


class IPTUValidator:
    """
    Validador específico para IPTU
    """

    @staticmethod
    def validar_lancamento(
        area_terreno: Decimal,
        area_construida: Decimal,
        valor_m2_terreno: Decimal,
        valor_m2_construcao: Decimal,
        numero_parcelas: int,
    ) -> None:
        """
        Valida dados de lançamento de IPTU
        """
        # Validar áreas
        BusinessValidator.validar_area_imovel(area_terreno, area_construida)

        # Validar valores por m²
        if valor_m2_terreno <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor por m² do terreno deve ser maior que zero",
            )

        if area_construida > 0 and valor_m2_construcao <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor por m² da construção deve ser maior que zero",
            )

        # Validar número de parcelas (IPTU geralmente até 12 parcelas)
        BusinessValidator.validar_numero_parcelas(numero_parcelas, maximo=12)


class ITBIValidator:
    """
    Validador específico para ITBI
    """

    @staticmethod
    def validar_guia(
        valor_transacao: Decimal,
        valor_venal: Decimal,
        aliquota: Decimal,
    ) -> None:
        """
        Valida dados de guia de ITBI
        """
        # Validar valores
        BusinessValidator.validar_valor_transacao(valor_transacao)
        BusinessValidator.validar_valor_transacao(valor_venal)

        # Validar alíquota (ITBI geralmente 2% a 4%)
        BusinessValidator.validar_aliquota(aliquota)

        if aliquota < Decimal("0.5") or aliquota > Decimal("4"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Alíquota de ITBI deve estar entre 0,5% e 4%",
            )


class ISSQNValidator:
    """
    Validador específico para ISSQN
    """

    @staticmethod
    def validar_declaracao(
        valor_servicos: Decimal,
        aliquota: Decimal,
        competencia: str,
    ) -> None:
        """
        Valida dados de declaração de ISSQN
        """
        # Validar valor dos serviços
        BusinessValidator.validar_valor_transacao(valor_servicos, Decimal("0.01"))

        # Validar alíquota (ISSQN entre 2% e 5%)
        BusinessValidator.validar_aliquota(aliquota)

        if aliquota < Decimal("2") or aliquota > Decimal("5"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Alíquota de ISSQN deve estar entre 2% e 5%",
            )

        # Validar competência
        BusinessValidator.validar_competencia(competencia)
