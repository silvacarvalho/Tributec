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


# =====================================================
# DEPENDENCIES PARA AUTENTICAÇÃO
# =====================================================

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.base import get_db

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Dependency para obter o usuário atual autenticado a partir do token JWT
    """
    from app.models.admin import Usuario, TokenBlacklist
    from sqlalchemy import and_
    from datetime import datetime

    token = credentials.credentials

    # Verificar se o token está na blacklist
    token_blacklisted = db.query(TokenBlacklist).filter(
        and_(
            TokenBlacklist.token == token,
            TokenBlacklist.expira_em > datetime.utcnow()
        )
    ).first()

    if token_blacklisted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido (logout realizado)",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decodificar_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    usuario_id: str = payload.get("sub")
    if usuario_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não foi possível validar as credenciais",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Buscar usuário no banco de dados
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()

    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )

    if usuario.bloqueado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Usuário bloqueado. Motivo: {usuario.motivo_bloqueio}"
        )

    # Retornar dados do usuário com perfis
    perfis = [perfil.slug for perfil in usuario.perfis]

    return {
        "id": str(usuario.id),
        "email": usuario.email,
        "nome_completo": usuario.nome_completo,
        "username": usuario.username,
        "perfis": perfis,
        "usuario_obj": usuario  # Objeto completo para uso em endpoints
    }


def verificar_permissoes(permissoes_necessarias: list[str]):
    """
    Dependency factory para verificar se o usuário tem as permissões necessárias
    """
    async def verificar(usuario: dict = Depends(get_current_user)):
        usuario_perfis = usuario.get("perfis", [])

        # Admin tem todas as permissões
        if "ADMIN" in usuario_perfis:
            return usuario

        # Verificar se tem alguma das permissões necessárias
        if not any(perm in usuario_perfis for perm in permissoes_necessarias):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar este recurso"
            )

        return usuario

    return verificar
