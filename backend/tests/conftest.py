"""
Configurações compartilhadas para testes (fixtures)
"""
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.core.security import create_access_token
from app.models.admin import Usuario, TipoUsuario


# Banco de dados em memória para testes
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """
    Fixture que cria e fornece uma sessão de banco de dados para testes.
    Cria todas as tabelas antes do teste e faz rollback após.
    """
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """
    Fixture que fornece um cliente HTTP para testar os endpoints.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(db: Session) -> dict:
    """
    Fixture que cria um usuário admin e retorna headers de autenticação.
    """
    # Criar usuário admin para testes
    usuario = Usuario(
        nome="Admin Teste",
        email="admin@teste.com",
        cpf="12345678901",
        senha_hash="$2b$12$KIXqhEpoFVBqZmNUqo2rOe1D5ItC6LzHYqR5vqgZmqN3xQqQqQqQq",  # senha123
        tipo=TipoUsuario.ADMIN,
        ativo=True
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    # Criar token
    access_token = create_access_token(data={"sub": str(usuario.id)})

    return {
        "Authorization": f"Bearer {access_token}"
    }


@pytest.fixture
def usuario_admin(db: Session) -> Usuario:
    """
    Fixture que cria e retorna um usuário admin.
    """
    usuario = Usuario(
        nome="Admin Teste",
        email="admin@teste.com",
        cpf="12345678901",
        senha_hash="$2b$12$KIXqhEpoFVBqZmNUqo2rOe1D5ItC6LzHYqR5vqgZmqN3xQqQqQqQq",
        tipo=TipoUsuario.ADMIN,
        ativo=True
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@pytest.fixture
def usuario_fiscal(db: Session) -> Usuario:
    """
    Fixture que cria e retorna um usuário fiscal.
    """
    usuario = Usuario(
        nome="Fiscal Teste",
        email="fiscal@teste.com",
        cpf="98765432109",
        senha_hash="$2b$12$KIXqhEpoFVBqZmNUqo2rOe1D5ItC6LzHYqR5vqgZmqN3xQqQqQqQq",
        tipo=TipoUsuario.FISCAL,
        ativo=True
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


# Fixtures de dados de teste

@pytest.fixture
def pessoa_fisica_data() -> dict:
    """Dados de exemplo para pessoa física"""
    return {
        "tipo_pessoa": "F",
        "nome": "João da Silva",
        "cpf": "12345678901",
        "rg": "1234567",
        "data_nascimento": "1980-01-01",
        "telefone": "(11) 98765-4321",
        "email": "joao@example.com"
    }


@pytest.fixture
def pessoa_juridica_data() -> dict:
    """Dados de exemplo para pessoa jurídica"""
    return {
        "tipo_pessoa": "J",
        "razao_social": "Empresa Teste LTDA",
        "nome_fantasia": "Empresa Teste",
        "cnpj": "12345678000190",
        "inscricao_estadual": "123456789",
        "telefone": "(11) 3456-7890",
        "email": "contato@empresa.com"
    }


@pytest.fixture
def imovel_data() -> dict:
    """Dados de exemplo para imóvel"""
    return {
        "inscricao_imobiliaria": "12345678",
        "area_terreno": 250.00,
        "area_construida": 150.00,
        "tipo_imovel": "RESIDENCIAL",
        "setor_fiscal": "001",
        "quadra": "A",
        "lote": "10",
        "logradouro": "Rua Teste",
        "numero": "100",
        "bairro": "Centro",
        "cep": "12345-678"
    }


@pytest.fixture
def estabelecimento_data() -> dict:
    """Dados de exemplo para estabelecimento"""
    return {
        "inscricao_municipal": "123456",
        "razao_social": "Empresa Teste LTDA",
        "nome_fantasia": "Empresa Teste",
        "cnpj": "12345678000190",
        "atividade_principal": "Comércio varejista",
        "logradouro": "Rua Comercial",
        "numero": "200",
        "bairro": "Centro",
        "cep": "12345-678"
    }
