"""
Validador de CNPJ
Baseado no algoritmo oficial da Receita Federal
"""
import re
from typing import Optional
from app.utils.dv import DigitoVerificador


class CNPJValidator:
    """Validador de CNPJ brasileiro"""

    def __init__(self, cnpj: str):
        self.cnpj_original = cnpj
        self.cnpj = self._remove_pontuacao(cnpj)
        self.cnpj_sem_dv: Optional[str] = None

    def _remove_pontuacao(self, cnpj: str) -> str:
        """Remove pontuação do CNPJ"""
        return ''.join(x for x in cnpj if x.isdigit())

    def _remove_digitos_cnpj(self) -> None:
        """Remove os dígitos verificadores do CNPJ"""
        if len(self.cnpj) == 14:
            self.cnpj_sem_dv = self.cnpj[0:12]
        elif len(self.cnpj) == 12:
            self.cnpj_sem_dv = self.cnpj
        else:
            raise ValueError("CNPJ com tamanho inválido! Deve ter 12 ou 14 dígitos.")

    def valida(self) -> bool:
        """
        Valida se o CNPJ é válido

        Returns:
            bool: True se válido, False caso contrário
        """
        try:
            # CNPJ deve ter 14 dígitos
            if len(self.cnpj) != 14:
                return False

            # Verifica se todos os dígitos são iguais (inválido)
            if len(set(self.cnpj)) == 1:
                return False

            self._remove_digitos_cnpj()
            dv = self.gera_dv()

            return f"{self.cnpj_sem_dv}{dv}" == self.cnpj

        except Exception:
            return False

    def gera_dv(self) -> str:
        """
        Gera os dígitos verificadores do CNPJ

        Returns:
            str: Dígitos verificadores (2 caracteres)
        """
        self._remove_digitos_cnpj()

        # Primeiro dígito
        dv1 = DigitoVerificador(self.cnpj_sem_dv)
        dv1char = str(dv1.calcula())

        # Segundo dígito
        dv2 = DigitoVerificador(self.cnpj_sem_dv + dv1char)
        dv2char = str(dv2.calcula())

        return f"{dv1char}{dv2char}"

    @staticmethod
    def formatar(cnpj: str) -> str:
        """
        Formata CNPJ para o padrão XX.XXX.XXX/XXXX-XX

        Args:
            cnpj: CNPJ sem formatação (apenas números)

        Returns:
            str: CNPJ formatado
        """
        cnpj_limpo = ''.join(x for x in cnpj if x.isdigit())

        if len(cnpj_limpo) != 14:
            return cnpj

        return f"{cnpj_limpo[0:2]}.{cnpj_limpo[2:5]}.{cnpj_limpo[5:8]}/{cnpj_limpo[8:12]}-{cnpj_limpo[12:14]}"


def validar_cnpj(cnpj: str) -> bool:
    """
    Função auxiliar para validar CNPJ

    Args:
        cnpj: CNPJ com ou sem formatação

    Returns:
        bool: True se válido, False caso contrário
    """
    try:
        validator = CNPJValidator(cnpj)
        return validator.valida()
    except Exception:
        return False


def formatar_cnpj(cnpj: str) -> str:
    """
    Função auxiliar para formatar CNPJ

    Args:
        cnpj: CNPJ sem formatação

    Returns:
        str: CNPJ formatado
    """
    return CNPJValidator.formatar(cnpj)
