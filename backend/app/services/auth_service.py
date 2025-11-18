"""
Serviço de Autenticação e Gerenciamento de Usuários
"""
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status

from app.models.admin import Usuario, Perfil
from app.core.security import verificar_senha, gerar_hash_senha
from app.core.config import settings


class AuthService:
    """Serviço de autenticação de usuários"""

    def __init__(self, db: Session):
        self.db = db

    def autenticar_usuario(self, email: str, senha: str) -> Optional[Usuario]:
        """
        Autentica um usuário com email e senha

        Args:
            email: Email do usuário
            senha: Senha em texto plano

        Returns:
            Usuario se autenticado com sucesso, None caso contrário

        Raises:
            HTTPException: Se usuário bloqueado ou inativo
        """
        # Buscar usuário por email
        usuario = self.db.query(Usuario).filter(Usuario.email == email).first()

        if not usuario:
            return None

        # Verificar se está bloqueado
        if usuario.bloqueado:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Usuário bloqueado. Motivo: {usuario.motivo_bloqueio}"
            )

        # Verificar se está ativo
        if not usuario.ativo:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuário inativo. Entre em contato com o administrador."
            )

        # Verificar senha
        if not verificar_senha(senha, usuario.senha_hash):
            # Incrementar tentativas de login falhas
            usuario.tentativas_login_falhas += 1
            usuario.data_ultima_tentativa = datetime.utcnow()

            # Bloquear após 5 tentativas falhas
            if usuario.tentativas_login_falhas >= 5:
                usuario.bloqueado = True
                usuario.data_bloqueio = datetime.utcnow()
                usuario.motivo_bloqueio = "Bloqueio automático por excesso de tentativas de login"

            self.db.commit()
            return None

        # Login bem-sucedido - resetar tentativas
        usuario.tentativas_login_falhas = 0
        usuario.data_ultimo_acesso = datetime.utcnow()
        # IP será atualizado no endpoint
        self.db.commit()

        return usuario

    def registrar_refresh_token(
        self,
        usuario_id: UUID,
        refresh_token: str,
        expira_em_dias: int = None
    ):
        """
        Registra um refresh token para o usuário

        Args:
            usuario_id: ID do usuário
            refresh_token: Token de refresh
            expira_em_dias: Dias até expiração (padrão: settings.REFRESH_TOKEN_EXPIRE_DAYS)
        """
        usuario = self.db.query(Usuario).filter(Usuario.id == usuario_id).first()

        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )

        dias = expira_em_dias or settings.REFRESH_TOKEN_EXPIRE_DAYS
        usuario.refresh_token = refresh_token
        usuario.refresh_token_expira_em = datetime.utcnow() + timedelta(days=dias)

        self.db.commit()

    def validar_refresh_token(self, usuario_id: UUID, refresh_token: str) -> bool:
        """
        Valida se o refresh token é válido para o usuário

        Args:
            usuario_id: ID do usuário
            refresh_token: Token a ser validado

        Returns:
            True se válido, False caso contrário
        """
        usuario = self.db.query(Usuario).filter(
            and_(
                Usuario.id == usuario_id,
                Usuario.refresh_token == refresh_token,
                Usuario.refresh_token_expira_em > datetime.utcnow()
            )
        ).first()

        return usuario is not None

    def invalidar_refresh_token(self, usuario_id: UUID):
        """
        Invalida o refresh token do usuário (logout)

        Args:
            usuario_id: ID do usuário
        """
        usuario = self.db.query(Usuario).filter(Usuario.id == usuario_id).first()

        if usuario:
            usuario.refresh_token = None
            usuario.refresh_token_expira_em = None
            self.db.commit()

    def alterar_senha(
        self,
        usuario_id: UUID,
        senha_atual: str,
        senha_nova: str
    ):
        """
        Altera a senha do usuário

        Args:
            usuario_id: ID do usuário
            senha_atual: Senha atual
            senha_nova: Nova senha

        Raises:
            HTTPException: Se senha atual incorreta ou usuário não encontrado
        """
        usuario = self.db.query(Usuario).filter(Usuario.id == usuario_id).first()

        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )

        # Verificar senha atual
        if not verificar_senha(senha_atual, usuario.senha_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Senha atual incorreta"
            )

        # Atualizar senha
        usuario.senha_hash = gerar_hash_senha(senha_nova)
        self.db.commit()

    def redefinir_senha(self, email: str, nova_senha: str):
        """
        Redefine a senha do usuário (recuperação de senha)

        Args:
            email: Email do usuário
            nova_senha: Nova senha

        Raises:
            HTTPException: Se usuário não encontrado
        """
        usuario = self.db.query(Usuario).filter(Usuario.email == email).first()

        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )

        usuario.senha_hash = gerar_hash_senha(nova_senha)
        self.db.commit()

    def obter_usuario_por_id(self, usuario_id: UUID) -> Optional[Usuario]:
        """
        Busca usuário por ID

        Args:
            usuario_id: ID do usuário

        Returns:
            Usuario se encontrado, None caso contrário
        """
        return self.db.query(Usuario).filter(Usuario.id == usuario_id).first()

    def obter_usuario_por_email(self, email: str) -> Optional[Usuario]:
        """
        Busca usuário por email

        Args:
            email: Email do usuário

        Returns:
            Usuario se encontrado, None caso contrário
        """
        return self.db.query(Usuario).filter(Usuario.email == email).first()

    def obter_perfis_usuario(self, usuario_id: UUID) -> list[str]:
        """
        Retorna a lista de perfis (slugs) do usuário

        Args:
            usuario_id: ID do usuário

        Returns:
            Lista de slugs dos perfis
        """
        usuario = self.db.query(Usuario).filter(Usuario.id == usuario_id).first()

        if not usuario:
            return []

        return [perfil.slug for perfil in usuario.perfis]


class TokenBlacklistService:
    """Serviço para gerenciar blacklist de tokens (logout)"""

    def __init__(self, db: Session):
        self.db = db

    def adicionar_token(self, token: str, expira_em: datetime):
        """
        Adiciona um token à blacklist

        Args:
            token: Token JWT
            expira_em: Data de expiração do token
        """
        from app.models.admin import TokenBlacklist

        token_bl = TokenBlacklist(
            token=token,
            expira_em=expira_em
        )
        self.db.add(token_bl)
        self.db.commit()

    def token_esta_na_blacklist(self, token: str) -> bool:
        """
        Verifica se um token está na blacklist

        Args:
            token: Token JWT

        Returns:
            True se está na blacklist, False caso contrário
        """
        from app.models.admin import TokenBlacklist

        token_bl = self.db.query(TokenBlacklist).filter(
            and_(
                TokenBlacklist.token == token,
                TokenBlacklist.expira_em > datetime.utcnow()
            )
        ).first()

        return token_bl is not None

    def limpar_tokens_expirados(self):
        """
        Remove tokens expirados da blacklist (manutenção)
        """
        from app.models.admin import TokenBlacklist

        self.db.query(TokenBlacklist).filter(
            TokenBlacklist.expira_em <= datetime.utcnow()
        ).delete()
        self.db.commit()
