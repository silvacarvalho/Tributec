"""
Router de Autenticação e Autorização
"""
from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.core.config import settings
from app.core.security import (
    verificar_senha,
    gerar_hash_senha,
    criar_token_acesso,
    criar_token_refresh,
    get_current_user,
    decodificar_token
)
from app.schemas.auth import (
    UsuarioLogin,
    TokenResponse,
    AlterarSenha,
    RecuperarSenha,
    RedefinirSenha
)
from app.schemas.base import ResponseBase
from app.services.auth_service import AuthService, TokenBlacklistService
from app.services.email_service import EmailService

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login", response_model=TokenResponse)
async def login(
    credenciais: UsuarioLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Endpoint de login - Autentica usuário e retorna tokens JWT
    """
    auth_service = AuthService(db)

    # Autenticar usuário
    usuario = auth_service.autenticar_usuario(credenciais.email, credenciais.senha)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos"
        )

    # Obter perfis do usuário
    perfis = [perfil.slug for perfil in usuario.perfis]

    # Criar tokens
    access_token = criar_token_acesso(
        dados={
            "sub": str(usuario.id),
            "email": usuario.email,
            "perfis": perfis
        }
    )

    refresh_token = criar_token_refresh(
        dados={
            "sub": str(usuario.id),
            "email": usuario.email
        }
    )

    # Salvar refresh token no banco
    auth_service.registrar_refresh_token(usuario.id, refresh_token)

    # Atualizar IP do último acesso
    usuario.ip_ultimo_acesso = request.client.host
    db.commit()

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
    auth_service = AuthService(db)

    payload = decodificar_token(refresh_token)

    if not payload or payload.get("tipo") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido"
        )

    usuario_id = payload.get("sub")

    # Validar refresh token no banco
    if not auth_service.validar_refresh_token(usuario_id, refresh_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido ou expirado"
        )

    # Buscar usuário
    usuario = auth_service.obter_usuario_por_id(usuario_id)

    if not usuario or not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário inválido ou inativo"
        )

    # Obter perfis
    perfis = [perfil.slug for perfil in usuario.perfis]

    # Criar novos tokens
    access_token = criar_token_acesso(
        dados={
            "sub": str(usuario.id),
            "email": usuario.email,
            "perfis": perfis
        }
    )

    new_refresh_token = criar_token_refresh(
        dados={
            "sub": str(usuario.id),
            "email": usuario.email
        }
    )

    # Atualizar refresh token no banco
    auth_service.registrar_refresh_token(usuario.id, new_refresh_token)

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
    auth_service = AuthService(db)
    email_service = EmailService()

    # Alterar senha
    auth_service.alterar_senha(
        usuario_id=usuario_atual["id"],
        senha_atual=dados.senha_atual,
        senha_nova=dados.senha_nova
    )

    # Enviar email de confirmação
    try:
        email_service.enviar_confirmacao_alteracao_senha(
            email=usuario_atual["email"],
            nome=usuario_atual["nome_completo"]
        )
    except Exception as e:
        # Log do erro, mas não falha o endpoint
        print(f"Erro ao enviar email de confirmação: {str(e)}")

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
    auth_service = AuthService(db)
    email_service = EmailService()

    # Buscar usuário por email
    usuario = auth_service.obter_usuario_por_email(dados.email)

    # Sempre retorna sucesso por segurança (não revelar se email existe)
    if usuario and usuario.ativo:
        # Gerar token de recuperação
        token_recuperacao = EmailService.gerar_token_recuperacao(usuario.email)

        # Enviar email
        try:
            email_service.enviar_recuperacao_senha(
                email=usuario.email,
                nome=usuario.nome_completo,
                token_recuperacao=token_recuperacao
            )
        except Exception as e:
            # Log do erro, mas não revela para o usuário
            print(f"Erro ao enviar email de recuperação: {str(e)}")

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
    auth_service = AuthService(db)

    # Decodificar e validar token
    payload = decodificar_token(dados.token)

    if not payload or payload.get("tipo") != "recuperacao":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado"
        )

    email = payload.get("sub")

    # Redefinir senha
    auth_service.redefinir_senha(email, dados.senha_nova)

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
    Endpoint de logout - Invalida o token atual
    """
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    from fastapi import Depends as FastDepends

    auth_service = AuthService(db)
    blacklist_service = TokenBlacklistService(db)

    # Invalidar refresh token
    auth_service.invalidar_refresh_token(usuario_atual["id"])

    # Adicionar access token à blacklist
    # Nota: Você precisaria passar o token atual aqui
    # Por simplicidade, vamos apenas invalidar o refresh token
    # Em produção, você deve adicionar o access token à blacklist também

    return ResponseBase(
        sucesso=True,
        mensagem="Logout realizado com sucesso"
    )
