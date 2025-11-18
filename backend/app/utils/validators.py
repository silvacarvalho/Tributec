"""
Validadores de documentos e dados
"""
import re


def validar_cpf(cpf: str) -> bool:
    """
    Valida CPF (apenas dígitos)

    Args:
        cpf: CPF com 11 dígitos (somente números)

    Returns:
        True se o CPF é válido, False caso contrário
    """
    # Remove caracteres não numéricos
    cpf = re.sub(r'\D', '', cpf)

    # Verifica se tem 11 dígitos
    if len(cpf) != 11:
        return False

    # Verifica se todos os dígitos são iguais
    if cpf == cpf[0] * 11:
        return False

    # Calcula o primeiro dígito verificador
    soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto

    if int(cpf[9]) != digito1:
        return False

    # Calcula o segundo dígito verificador
    soma = sum(int(cpf[i]) * (11 - i) for i in range(10))
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto

    if int(cpf[10]) != digito2:
        return False

    return True


def validar_cnpj(cnpj: str) -> bool:
    """
    Valida CNPJ (apenas dígitos)

    Args:
        cnpj: CNPJ com 14 dígitos (somente números)

    Returns:
        True se o CNPJ é válido, False caso contrário
    """
    # Remove caracteres não numéricos
    cnpj = re.sub(r'\D', '', cnpj)

    # Verifica se tem 14 dígitos
    if len(cnpj) != 14:
        return False

    # Verifica se todos os dígitos são iguais
    if cnpj == cnpj[0] * 14:
        return False

    # Calcula o primeiro dígito verificador
    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma = sum(int(cnpj[i]) * pesos1[i] for i in range(12))
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto

    if int(cnpj[12]) != digito1:
        return False

    # Calcula o segundo dígito verificador
    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma = sum(int(cnpj[i]) * pesos2[i] for i in range(13))
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto

    if int(cnpj[13]) != digito2:
        return False

    return True


def limpar_documento(documento: str) -> str:
    """
    Remove caracteres não numéricos de um documento

    Args:
        documento: Documento com ou sem formatação

    Returns:
        Documento apenas com números
    """
    return re.sub(r'\D', '', documento)


def formatar_cpf(cpf: str) -> str:
    """
    Formata CPF no padrão XXX.XXX.XXX-XX

    Args:
        cpf: CPF com 11 dígitos

    Returns:
        CPF formatado
    """
    cpf = limpar_documento(cpf)
    if len(cpf) != 11:
        return cpf

    return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"


def formatar_cnpj(cnpj: str) -> str:
    """
    Formata CNPJ no padrão XX.XXX.XXX/XXXX-XX

    Args:
        cnpj: CNPJ com 14 dígitos

    Returns:
        CNPJ formatado
    """
    cnpj = limpar_documento(cnpj)
    if len(cnpj) != 14:
        return cnpj

    return f"{cnpj[:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:]}"


def validar_email(email: str) -> bool:
    """
    Valida formato de email

    Args:
        email: Email a ser validado

    Returns:
        True se o email é válido, False caso contrário
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validar_cep(cep: str) -> bool:
    """
    Valida formato de CEP (8 dígitos)

    Args:
        cep: CEP a ser validado

    Returns:
        True se o CEP é válido, False caso contrário
    """
    cep = limpar_documento(cep)
    return len(cep) == 8 and cep.isdigit()
