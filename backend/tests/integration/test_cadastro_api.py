"""
Testes de integração para endpoints de cadastro
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


@pytest.mark.integration
@pytest.mark.cadastro
class TestPessoasAPI:
    """Testes para endpoints de pessoas"""

    def test_criar_pessoa_fisica(
        self,
        client: TestClient,
        auth_headers: dict,
        pessoa_fisica_data: dict
    ):
        """Testa criação de pessoa física via API"""
        response = client.post(
            "/api/v1/cadastro/pessoas",
            json=pessoa_fisica_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert data["nome"] == pessoa_fisica_data["nome"]
        assert data["cpf"] == pessoa_fisica_data["cpf"]
        assert "id" in data

    def test_criar_pessoa_juridica(
        self,
        client: TestClient,
        auth_headers: dict,
        pessoa_juridica_data: dict
    ):
        """Testa criação de pessoa jurídica via API"""
        response = client.post(
            "/api/v1/cadastro/pessoas",
            json=pessoa_juridica_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert data["razao_social"] == pessoa_juridica_data["razao_social"]
        assert data["cnpj"] == pessoa_juridica_data["cnpj"]

    def test_listar_pessoas(self, client: TestClient, auth_headers: dict):
        """Testa listagem de pessoas via API"""
        response = client.get(
            "/api/v1/cadastro/pessoas",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data or isinstance(data, list)

    def test_obter_pessoa_por_id(
        self,
        client: TestClient,
        auth_headers: dict,
        pessoa_fisica_data: dict
    ):
        """Testa obtenção de pessoa por ID via API"""
        # Criar pessoa
        response_create = client.post(
            "/api/v1/cadastro/pessoas",
            json=pessoa_fisica_data,
            headers=auth_headers
        )
        pessoa_id = response_create.json()["id"]

        # Obter pessoa
        response = client.get(
            f"/api/v1/cadastro/pessoas/{pessoa_id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == pessoa_id

    def test_buscar_pessoa_por_cpf(
        self,
        client: TestClient,
        auth_headers: dict,
        pessoa_fisica_data: dict
    ):
        """Testa busca de pessoa por CPF via API"""
        # Criar pessoa
        client.post(
            "/api/v1/cadastro/pessoas",
            json=pessoa_fisica_data,
            headers=auth_headers
        )

        # Buscar por CPF
        response = client.get(
            f"/api/v1/cadastro/pessoas/cpf/{pessoa_fisica_data['cpf']}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["cpf"] == pessoa_fisica_data["cpf"]

    def test_criar_pessoa_cpf_duplicado(
        self,
        client: TestClient,
        auth_headers: dict,
        pessoa_fisica_data: dict
    ):
        """Testa que não é possível criar pessoa com CPF duplicado"""
        # Criar primeira pessoa
        client.post(
            "/api/v1/cadastro/pessoas",
            json=pessoa_fisica_data,
            headers=auth_headers
        )

        # Tentar criar segunda pessoa com mesmo CPF
        response = client.post(
            "/api/v1/cadastro/pessoas",
            json=pessoa_fisica_data,
            headers=auth_headers
        )

        assert response.status_code == 409
        data = response.json()
        assert "já cadastrado" in data["detail"]


@pytest.mark.integration
@pytest.mark.cadastro
class TestImoveisAPI:
    """Testes para endpoints de imóveis"""

    def test_criar_imovel(
        self,
        client: TestClient,
        auth_headers: dict,
        imovel_data: dict
    ):
        """Testa criação de imóvel via API"""
        response = client.post(
            "/api/v1/cadastro/imoveis",
            json=imovel_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert data["inscricao_imobiliaria"] == imovel_data["inscricao_imobiliaria"]
        assert "id" in data

    def test_listar_imoveis(self, client: TestClient, auth_headers: dict):
        """Testa listagem de imóveis via API"""
        response = client.get(
            "/api/v1/cadastro/imoveis",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data or isinstance(data, list)

    def test_buscar_imovel_por_inscricao(
        self,
        client: TestClient,
        auth_headers: dict,
        imovel_data: dict
    ):
        """Testa busca de imóvel por inscrição via API"""
        # Criar imóvel
        client.post(
            "/api/v1/cadastro/imoveis",
            json=imovel_data,
            headers=auth_headers
        )

        # Buscar por inscrição
        response = client.get(
            f"/api/v1/cadastro/imoveis/inscricao/{imovel_data['inscricao_imobiliaria']}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["inscricao_imobiliaria"] == imovel_data["inscricao_imobiliaria"]


@pytest.mark.integration
@pytest.mark.cadastro
class TestEstabelecimentosAPI:
    """Testes para endpoints de estabelecimentos"""

    def test_criar_estabelecimento(
        self,
        client: TestClient,
        auth_headers: dict,
        estabelecimento_data: dict
    ):
        """Testa criação de estabelecimento via API"""
        response = client.post(
            "/api/v1/cadastro/estabelecimentos",
            json=estabelecimento_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert data["inscricao_municipal"] == estabelecimento_data["inscricao_municipal"]
        assert "id" in data

    def test_listar_estabelecimentos(self, client: TestClient, auth_headers: dict):
        """Testa listagem de estabelecimentos via API"""
        response = client.get(
            "/api/v1/cadastro/estabelecimentos",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data or isinstance(data, list)
