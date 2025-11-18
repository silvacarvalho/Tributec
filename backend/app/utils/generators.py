"""
Geradores de números e códigos
"""
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session


def gerar_inscricao_imobiliaria(
    db: Session,
    setor_fiscal_id: int,
    quadra: Optional[str] = None,
    lote: Optional[str] = None
) -> str:
    """
    Gera número de inscrição imobiliária

    Formato: SSS.QQQQ.LLLL.NNNN
    - SSS: Setor fiscal (3 dígitos)
    - QQQQ: Quadra (4 dígitos)
    - LLLL: Lote (4 dígitos)
    - NNNN: Sequencial (4 dígitos)

    Args:
        db: Sessão do banco de dados
        setor_fiscal_id: ID do setor fiscal
        quadra: Quadra (opcional)
        lote: Lote (opcional)

    Returns:
        Inscrição imobiliária formatada
    """
    # Formatar setor fiscal
    setor = str(setor_fiscal_id).zfill(3)

    # Formatar quadra e lote
    quadra_fmt = str(quadra or "0").zfill(4)
    lote_fmt = str(lote or "0").zfill(4)

    # Buscar último sequencial usado
    # TODO: Implementar busca no banco
    # Por enquanto, usar timestamp
    sequencial = str(int(datetime.now().timestamp()) % 10000).zfill(4)

    return f"{setor}.{quadra_fmt}.{lote_fmt}.{sequencial}"


def gerar_inscricao_municipal(
    db: Session,
    cnpj: str
) -> str:
    """
    Gera número de inscrição municipal (CCM)

    Formato: CCCCCCCC-DD
    - CCCCCCCC: Número sequencial (8 dígitos)
    - DD: Dígitos verificadores (2 dígitos)

    Args:
        db: Sessão do banco de dados
        cnpj: CNPJ do estabelecimento

    Returns:
        Inscrição municipal formatada
    """
    # TODO: Implementar busca do último número no banco
    # Por enquanto, usar timestamp
    numero = str(int(datetime.now().timestamp()) % 100000000).zfill(8)

    # Calcular dígitos verificadores (algoritmo simples)
    soma = sum(int(numero[i]) * (9 - i) for i in range(8))
    dv = str(soma % 100).zfill(2)

    return f"{numero}-{dv}"


def gerar_numero_lancamento_iptu(
    db: Session,
    ano_exercicio: int,
    inscricao_imobiliaria: str
) -> str:
    """
    Gera número de lançamento de IPTU

    Formato: AAAA.IIIIIIIIIIII.NNN
    - AAAA: Ano do exercício
    - IIIIIIIIIIII: Inscrição imobiliária (sem pontos)
    - NNN: Sequencial (3 dígitos)

    Args:
        db: Sessão do banco de dados
        ano_exercicio: Ano do exercício
        inscricao_imobiliaria: Inscrição imobiliária

    Returns:
        Número do lançamento
    """
    # Remover pontos da inscrição
    inscricao_limpa = inscricao_imobiliaria.replace(".", "")

    # Sequencial (normalmente sempre 001, a menos que haja relançamento)
    sequencial = "001"

    return f"{ano_exercicio}.{inscricao_limpa}.{sequencial}"


def gerar_numero_guia_itbi(
    db: Session
) -> str:
    """
    Gera número de guia de ITBI

    Formato: AAAA.MMDDHHMMSS.NNN
    - AAAA: Ano
    - MMDDHHMMSS: Data/hora (mês, dia, hora, minuto, segundo)
    - NNN: Sequencial do dia

    Args:
        db: Sessão do banco de dados

    Returns:
        Número da guia
    """
    now = datetime.now()
    ano = now.year
    timestamp = now.strftime("%m%d%H%M%S")

    # TODO: Buscar sequencial do dia no banco
    sequencial = "001"

    return f"{ano}.{timestamp}.{sequencial}"


def gerar_numero_declaracao_issqn(
    db: Session,
    mes_competencia: int,
    ano_competencia: int,
    inscricao_municipal: str
) -> str:
    """
    Gera número de declaração de ISSQN

    Formato: AAAAMM.CCCCCCCCDD.NNN
    - AAAAMM: Ano e mês de competência
    - CCCCCCCCDD: Inscrição municipal (CCM)
    - NNN: Sequencial do mês

    Args:
        db: Sessão do banco de dados
        mes_competencia: Mês de competência
        ano_competencia: Ano de competência
        inscricao_municipal: Inscrição municipal (CCM)

    Returns:
        Número da declaração
    """
    competencia = f"{ano_competencia}{str(mes_competencia).zfill(2)}"
    ccm_limpo = inscricao_municipal.replace("-", "")

    # TODO: Buscar sequencial do mês no banco
    sequencial = "001"

    return f"{competencia}.{ccm_limpo}.{sequencial}"


def gerar_numero_dam(
    db: Session,
    tipo_tributo: str
) -> str:
    """
    Gera número de DAM (Documento de Arrecadação Municipal)

    Formato: TTAAAAMMDDHHMMSSNNNNN
    - TT: Tipo de tributo (01=IPTU, 02=ITBI, 03=ISSQN, 04=TAXA, etc.)
    - AAAAMMDD: Data
    - HHMMSS: Hora
    - NNNNN: Sequencial do dia

    Args:
        db: Sessão do banco de dados
        tipo_tributo: Tipo de tributo

    Returns:
        Número do DAM
    """
    # Mapeamento de tipos
    tipos = {
        "IPTU": "01",
        "ITBI": "02",
        "ISSQN": "03",
        "TAXA": "04",
        "CONTRIBUICAO": "05"
    }

    tipo_codigo = tipos.get(tipo_tributo, "99")

    now = datetime.now()
    data = now.strftime("%Y%m%d")
    hora = now.strftime("%H%M%S")

    # TODO: Buscar sequencial do dia no banco
    sequencial = str(int(now.timestamp()) % 100000).zfill(5)

    return f"{tipo_codigo}{data}{hora}{sequencial}"


def gerar_numero_certidao(
    db: Session,
    tipo_certidao: str
) -> str:
    """
    Gera número de certidão

    Formato: TC/NNNNNN/AAAA
    - TC: Tipo de certidão (ND=Negativa de Débitos, PD=Positiva de Débitos, etc.)
    - NNNNNN: Sequencial anual
    - AAAA: Ano

    Args:
        db: Sessão do banco de dados
        tipo_certidao: Tipo de certidão

    Returns:
        Número da certidão
    """
    # Mapeamento de tipos
    tipos = {
        "NEGATIVA_DEBITOS": "ND",
        "POSITIVA_EFEITOS_NEGATIVA": "PN",
        "POSITIVA_DEBITOS": "PD",
        "QUITACAO": "QT",
        "OBJETO": "OB"
    }

    tipo_codigo = tipos.get(tipo_certidao, "XX")
    ano = datetime.now().year

    # TODO: Buscar sequencial anual no banco
    sequencial = str(int(datetime.now().timestamp()) % 1000000).zfill(6)

    return f"{tipo_codigo}/{sequencial}/{ano}"



def gerar_numero_lancamento(ano_exercicio: int, tipo_tributo: str) -> str:
    """
    Gera número genérico de lançamento

    Formato: TTAAAANNNNNNNN
    - TT: Tipo de tributo (IP=IPTU, IT=ITBI, IS=ISSQN)
    - AAAA: Ano do exercício
    - NNNNNNNN: Sequencial do ano

    Args:
        ano_exercicio: Ano do exercício
        tipo_tributo: Tipo de tributo

    Returns:
        Número do lançamento
    """
    # Mapeamento de tipos
    tipos = {
        "IPTU": "IP",
        "ITBI": "IT",
        "ISSQN": "IS",
        "TAXA": "TX"
    }

    tipo_codigo = tipos.get(tipo_tributo, "XX")

    # TODO: Buscar sequencial anual no banco
    # Por enquanto, usar timestamp
    sequencial = str(int(datetime.now().timestamp()) % 100000000).zfill(8)

    return f"{tipo_codigo}{ano_exercicio}{sequencial}"

