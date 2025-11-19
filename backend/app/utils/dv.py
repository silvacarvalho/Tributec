"""
Classe para cálculo de dígito verificador
Utilizada para validação de CPF e CNPJ
"""


class DigitoVerificador:
    """Calcula dígito verificador usando algoritmo de módulo 11"""

    def __init__(self, numero: str):
        self.numero = numero

    def calcula(self) -> int:
        """
        Calcula o dígito verificador usando módulo 11
        """
        soma = 0
        peso = len(self.numero) + 1

        for digito in self.numero:
            soma += int(digito) * peso
            peso -= 1

        resto = soma % 11

        if resto < 2:
            return 0
        else:
            return 11 - resto
