"""
Testes de integração para endpoints de autenticação
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.admin import Usuario, TipoUsuario


@pytest.mark.integration
@pytest.mark.auth
class TestAuthAPI:
    """Testes para endpoints de autenticação"""

    def test_health_check(self, client: TestClient):
        """Testa endpoint de health check"""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_root_endpoint(self, client: TestClient):
        """Testa endpoint raiz"""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "aplicacao" in data
        assert data["status"] == "online"

    def test_login_sucesso(self, client: TestClient, db: Session):
        """Testa login com credenciais válidas"""
        # Criar usuário para teste
        usuario = Usuario(
            nome="Teste Admin",
            email="admin@teste.com",
            cpf="12345678901",
            senha_hash="$2b$12$KIXqhEpoFVBqZmNUqo2rOe1D5ItC6LzHYqR5vqgZmqN3xQqQqQqQq",
            tipo=TipoUsuario.ADMIN,
            ativo=True
        )
        db.add(usuario)
        db.commit()

        # Tentar fazer login
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "admin@teste.com",
                "senha": "senha123"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"

    def test_login_credenciais_invalidas(self, client: TestClient):
        """Testa login com credenciais inválidas"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "invalido@teste.com",
                "senha": "senhaerrada"
            }
        )

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    def test_login_senha_incorreta(self, client: TestClient, db: Session):
        """Testa login com senha incorreta"""
        # Criar usuário
        usuario = Usuario(
            nome="Teste Admin",
            email="admin@teste.com",
            cpf="12345678901",
            senha_hash="$2b$12$KIXqhEpoFVBqZmNUqo2rOe1D5ItC6LzHYqR5vqgZmqN3xQqQqQqQq",
            tipo=TipoUsuario.ADMIN,
            ativo=True
        )
        db.add(usuario)
        db.commit()

        # Tentar login com senha errada
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "admin@teste.com",
                "senha": "senhaerrada"
            }
        )

        assert response.status_code == 401

    def test_acesso_protegido_sem_token(self, client: TestClient):
        """Testa acesso a endpoint protegido sem token"""
        response = client.get("/api/v1/auth/me")

        assert response.status_code in [401, 403]

    def test_acesso_protegido_com_token(self, client: TestClient, auth_headers: dict):
        """Testa acesso a endpoint protegido com token válido"""
        response = client.get("/api/v1/auth/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "email" in data
