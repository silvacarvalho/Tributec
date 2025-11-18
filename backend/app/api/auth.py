"""
Router de Autenticação e Autorização
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.core.config import settings
from app.core.security import (
    verificar_senha,
    gerar_hash_senha,
    criar_token_acesso,
    criar_token_refresh,
    get_current_user
)
from app.schemas.auth import (
    UsuarioLogin,
    TokenResponse,
    AlterarSenha,
    RecuperarSenha,
    RedefinirSenha
)
from app.schemas.base import ResponseBase

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login", response_model=TokenResponse)
async def login(
    credenciais: UsuarioLogin,
    db: Session = Depends(get_db)
):
    """
    Endpoint de login - Autentica usuário e retorna tokens JWT
    """
    # TODO: Buscar usuário no banco de dados
    # from app.models.admin import Usuario
    # usuario = db.query(Usuario).filter(Usuario.email == credenciais.email).first()
    #
    # if not usuario or not verificar_senha(credenciais.senha, usuario.senha_hash):
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="Email ou senha incorretos"
    #     )
    #
    # if not usuario.ativo:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Usuário inativo"
    #     )

    # Mock temporário para desenvolvimento
    if credenciais.email != "admin@tributec.com" or credenciais.senha != "admin123":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos"
        )

    # Criar tokens
    usuario_id = "550e8400-e29b-41d4-a716-446655440000"  # Mock UUID
    perfis = ["ADMIN", "FISCAL", "ARRECADACAO"]

    access_token = criar_token_acesso(
        dados={"sub": usuario_id, "email": credenciais.email, "perfis": perfis}
    )

    refresh_token = criar_token_refresh(
        dados={"sub": usuario_id, "email": credenciais.email}
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """
    Endpoint para renovar o access token usando refresh token
    """
    from app.core.security import decodificar_token

    payload = decodificar_token(refresh_token)

    if not payload or payload.get("tipo") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido"
        )

    usuario_id = payload.get("sub")

    # TODO: Buscar usuário no banco e validar
    # usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    # if not usuario or not usuario.ativo:
    #     raise HTTPException(status_code=401, detail="Usuário inválido")

    # Criar novo access token
    access_token = criar_token_acesso(
        dados={"sub": usuario_id, "email": payload.get("email"), "perfis": ["ADMIN"]}
    )

    new_refresh_token = criar_token_refresh(
        dados={"sub": usuario_id, "email": payload.get("email")}
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get("/me")
async def get_me(usuario_atual: dict = Depends(get_current_user)):
    """
    Retorna informações do usuário autenticado
    """
    return ResponseBase(
        sucesso=True,
        mensagem="Usuário autenticado",
        dados=usuario_atual
    )


@router.post("/alterar-senha", response_model=ResponseBase)
async def alterar_senha(
    dados: AlterarSenha,
    usuario_atual: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint para alterar senha do usuário autenticado
    """
    # TODO: Implementar alteração de senha
    # usuario = db.query(Usuario).filter(Usuario.id == usuario_atual["id"]).first()
    #
    # if not verificar_senha(dados.senha_atual, usuario.senha_hash):
    #     raise HTTPException(status_code=400, detail="Senha atual incorreta")
    #
    # usuario.senha_hash = gerar_hash_senha(dados.senha_nova)
    # db.commit()

    return ResponseBase(
        sucesso=True,
        mensagem="Senha alterada com sucesso"
    )


@router.post("/recuperar-senha", response_model=ResponseBase)
async def recuperar_senha(
    dados: RecuperarSenha,
    db: Session = Depends(get_db)
):
    """
    Endpoint para solicitar recuperação de senha
    Envia email com token de redefinição
    """
    # TODO: Implementar envio de email de recuperação
    # usuario = db.query(Usuario).filter(Usuario.email == dados.email).first()
    #
    # if usuario:
    #     # Gerar token de recuperação
    #     # Enviar email
    #     pass

    return ResponseBase(
        sucesso=True,
        mensagem="Se o email existir, você receberá instruções para redefinir a senha"
    )


@router.post("/redefinir-senha", response_model=ResponseBase)
async def redefinir_senha(
    dados: RedefinirSenha,
    db: Session = Depends(get_db)
):
    """
    Endpoint para redefinir senha usando token recebido por email
    """
    # TODO: Implementar redefinição de senha
    # Validar token
    # Atualizar senha

    return ResponseBase(
        sucesso=True,
        mensagem="Senha redefinida com sucesso"
    )


@router.post("/logout", response_model=ResponseBase)
async def logout(
    usuario_atual: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint de logout
    """
    # TODO: Adicionar token à blacklist se necessário
    # Registrar logout na auditoria

    return ResponseBase(
        sucesso=True,
        mensagem="Logout realizado com sucesso"
    )
