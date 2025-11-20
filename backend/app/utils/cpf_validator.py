"""
Validador de CPF
Baseado no algoritmo oficial da Receita Federal
"""
from typing import Optional
from app.utils.dv import DigitoVerificador


class CPFValidator:
    """Validador de CPF brasileiro"""

    def __init__(self, cpf: str):
        self.cpf_original = cpf
        self.cpf = self._remove_pontuacao(cpf)
        self.cpf_sem_dv: Optional[str] = None

    def _remove_pontuacao(self, cpf: str) -> str:
        """Remove pontuação do CPF"""
        return ''.join(x for x in cpf if x.isdigit())

    def _remove_digitos_cpf(self) -> None:
        """Remove os dígitos verificadores do CPF"""
        if len(self.cpf) == 11:
            self.cpf_sem_dv = self.cpf[0:9]
        elif len(self.cpf) == 9:
            self.cpf_sem_dv = self.cpf
        else:
            raise ValueError("CPF com tamanho inválido! Deve ter 9 ou 11 dígitos.")

    def valida(self) -> bool:
        """
        Valida se o CPF é válido

        Returns:
            bool: True se válido, False caso contrário
        """
        try:
            # CPF deve ter 11 dígitos
            if len(self.cpf) != 11:
                return False

            # Verifica se todos os dígitos são iguais (inválido)
            if len(set(self.cpf)) == 1:
                return False

            self._remove_digitos_cpf()
            dv = self.gera_dv()

            return f"{self.cpf_sem_dv}{dv}" == self.cpf

        except Exception:
            return False

    def gera_dv(self) -> str:
        """
        Gera os dígitos verificadores do CPF

        Returns:
            str: Dígitos verificadores (2 caracteres)
        """
        self._remove_digitos_cpf()

        # Primeiro dígito
        dv1 = DigitoVerificador(self.cpf_sem_dv)
        dv1char = str(dv1.calcula())

        # Segundo dígito
        dv2 = DigitoVerificador(self.cpf_sem_dv + dv1char)
        dv2char = str(dv2.calcula())

        return f"{dv1char}{dv2char}"

    @staticmethod
    def formatar(cpf: str) -> str:
        """
        Formata CPF para o padrão XXX.XXX.XXX-XX

        Args:
            cpf: CPF sem formatação (apenas números)

        Returns:
            str: CPF formatado
        """
        cpf_limpo = ''.join(x for x in cpf if x.isdigit())

        if len(cpf_limpo) != 11:
            return cpf

        return f"{cpf_limpo[0:3]}.{cpf_limpo[3:6]}.{cpf_limpo[6:9]}-{cpf_limpo[9:11]}"


def validar_cpf(cpf: str) -> bool:
    """
    Função auxiliar para validar CPF

    Args:
        cpf: CPF com ou sem formatação

    Returns:
        bool: True se válido, False caso contrário
    """
    try:
        validator = CPFValidator(cpf)
        return validator.valida()
    except Exception:
        return False


def formatar_cpf(cpf: str) -> str:
    """
    Função auxiliar para formatar CPF

    Args:
        cpf: CPF sem formatação

    Returns:
        str: CPF formatado
    """
    return CPFValidator.formatar(cpf)
