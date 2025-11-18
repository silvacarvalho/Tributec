"""
Módulo de segurança - Autenticação e Autorização
"""
from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# Contexto para hash de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    """
    Verifica se a senha plana corresponde ao hash

    Args:
        senha_plana: Senha em texto plano
        senha_hash: Hash da senha armazenado

    Returns:
        True se a senha está correta, False caso contrário
    """
    return pwd_context.verify(senha_plana, senha_hash)


def gerar_hash_senha(senha: str) -> str:
    """
    Gera hash bcrypt da senha

    Args:
        senha: Senha em texto plano

    Returns:
        Hash da senha
    """
    return pwd_context.hash(senha)


def criar_token_acesso(
    dados: dict,
    expira_em: Optional[timedelta] = None
) -> str:
    """
    Cria um token JWT de acesso

    Args:
        dados: Dados a serem codificados no token
        expira_em: Tempo de expiração customizado

    Returns:
        Token JWT codificado
    """
    dados_codificar = dados.copy()

    if expira_em:
        expirar = datetime.utcnow() + expira_em
    else:
        expirar = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    dados_codificar.update({"exp": expirar})

    token_codificado = jwt.encode(
        dados_codificar,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return token_codificado


def criar_token_refresh(
    dados: dict,
    expira_em: Optional[timedelta] = None
) -> str:
    """
    Cria um token JWT de refresh

    Args:
        dados: Dados a serem codificados no token
        expira_em: Tempo de expiração customizado

    Returns:
        Token JWT de refresh codificado
    """
    dados_codificar = dados.copy()

    if expira_em:
        expirar = datetime.utcnow() + expira_em
    else:
        expirar = datetime.utcnow() + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )

    dados_codificar.update({"exp": expirar, "tipo": "refresh"})

    token_codificado = jwt.encode(
        dados_codificar,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return token_codificado


def decodificar_token(token: str) -> Optional[dict]:
    """
    Decodifica e valida um token JWT

    Args:
        token: Token JWT a ser decodificado

    Returns:
        Payload do token se válido, None caso contrário
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None
