"""
Testes de integração para endpoints tributários
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


@pytest.mark.integration
@pytest.mark.tributario
class TestIPTUAPI:
    """Testes para endpoints de IPTU"""

    def test_calcular_iptu(
        self,
        client: TestClient,
        auth_headers: dict,
        imovel_data: dict
    ):
        """Testa cálculo de IPTU via API"""
        # Primeiro criar um imóvel
        response_imovel = client.post(
            "/api/v1/cadastro/imoveis",
            json=imovel_data,
            headers=auth_headers
        )
        imovel_id = response_imovel.json()["id"]

        # Calcular IPTU
        response = client.post(
            "/api/v1/tributario/iptu/calcular",
            json={
                "imovel_id": imovel_id,
                "ano_exercicio": 2024
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "valor_venal_total" in data
        assert "valor_iptu" in data

    def test_lancar_iptu(
        self,
        client: TestClient,
        auth_headers: dict,
        imovel_data: dict
    ):
        """Testa lançamento de IPTU via API"""
        # Criar imóvel
        response_imovel = client.post(
            "/api/v1/cadastro/imoveis",
            json=imovel_data,
            headers=auth_headers
        )
        imovel_id = response_imovel.json()["id"]

        # Lançar IPTU
        response = client.post(
            "/api/v1/tributario/iptu/lancar",
            json={
                "imovel_id": imovel_id,
                "ano_exercicio": 2024,
                "numero_parcelas": 10
            },
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["ano_exercicio"] == 2024
        assert data["numero_parcelas"] == 10

    def test_listar_lancamentos_iptu(self, client: TestClient, auth_headers: dict):
        """Testa listagem de lançamentos de IPTU"""
        response = client.get(
            "/api/v1/tributario/iptu/lancamentos",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data or isinstance(data, list)

    def test_obter_parcelas_iptu(
        self,
        client: TestClient,
        auth_headers: dict,
        imovel_data: dict
    ):
        """Testa obtenção de parcelas de um lançamento"""
        # Criar imóvel
        response_imovel = client.post(
            "/api/v1/cadastro/imoveis",
            json=imovel_data,
            headers=auth_headers
        )
        imovel_id = response_imovel.json()["id"]

        # Lançar IPTU
        response_lancamento = client.post(
            "/api/v1/tributario/iptu/lancar",
            json={
                "imovel_id": imovel_id,
                "ano_exercicio": 2024,
                "numero_parcelas": 10
            },
            headers=auth_headers
        )
        lancamento_id = response_lancamento.json()["id"]

        # Obter parcelas
        response = client.get(
            f"/api/v1/tributario/iptu/lancamentos/{lancamento_id}/parcelas",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 10


@pytest.mark.integration
@pytest.mark.tributario
class TestITBIAPI:
    """Testes para endpoints de ITBI"""

    def test_emitir_guia_itbi(
        self,
        client: TestClient,
        auth_headers: dict,
        imovel_data: dict,
        pessoa_fisica_data: dict
    ):
        """Testa emissão de guia de ITBI"""
        # Criar imóvel
        response_imovel = client.post(
            "/api/v1/cadastro/imoveis",
            json=imovel_data,
            headers=auth_headers
        )
        imovel_id = response_imovel.json()["id"]

        # Criar pessoa (adquirente)
        response_pessoa = client.post(
            "/api/v1/cadastro/pessoas",
            json=pessoa_fisica_data,
            headers=auth_headers
        )
        pessoa_id = response_pessoa.json()["id"]

        # Emitir guia ITBI
        response = client.post(
            "/api/v1/tributario/itbi/emitir-guia",
            json={
                "imovel_id": imovel_id,
                "adquirente_id": pessoa_id,
                "valor_transacao": 500000.00,
                "tipo_transacao": "COMPRA_VENDA"
            },
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert "numero_guia" in data
        assert "valor_itbi" in data

    def test_listar_guias_itbi(self, client: TestClient, auth_headers: dict):
        """Testa listagem de guias ITBI"""
        response = client.get(
            "/api/v1/tributario/itbi/guias",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data or isinstance(data, list)


@pytest.mark.integration
@pytest.mark.tributario
class TestISSQNAPI:
    """Testes para endpoints de ISSQN"""

    def test_criar_declaracao_issqn(
        self,
        client: TestClient,
        auth_headers: dict,
        estabelecimento_data: dict
    ):
        """Testa criação de declaração de ISSQN"""
        # Criar estabelecimento
        response_estab = client.post(
            "/api/v1/cadastro/estabelecimentos",
            json=estabelecimento_data,
            headers=auth_headers
        )
        estabelecimento_id = response_estab.json()["id"]

        # Criar declaração
        response = client.post(
            "/api/v1/tributario/issqn/declaracoes",
            json={
                "estabelecimento_id": estabelecimento_id,
                "competencia": "2024-01",
                "valor_servicos": 10000.00,
                "aliquota": 5.0
            },
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert "valor_issqn" in data

    def test_listar_declaracoes_issqn(self, client: TestClient, auth_headers: dict):
        """Testa listagem de declarações ISSQN"""
        response = client.get(
            "/api/v1/tributario/issqn/declaracoes",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data or isinstance(data, list)


@pytest.mark.integration
@pytest.mark.tributario
class TestIsencoesAPI:
    """Testes para endpoints de isenções"""

    def test_criar_isencao(
        self,
        client: TestClient,
        auth_headers: dict,
        imovel_data: dict,
        pessoa_fisica_data: dict
    ):
        """Testa criação de solicitação de isenção"""
        # Criar imóvel
        response_imovel = client.post(
            "/api/v1/cadastro/imoveis",
            json=imovel_data,
            headers=auth_headers
        )
        imovel_id = response_imovel.json()["id"]

        # Criar pessoa
        response_pessoa = client.post(
            "/api/v1/cadastro/pessoas",
            json=pessoa_fisica_data,
            headers=auth_headers
        )
        pessoa_id = response_pessoa.json()["id"]

        # Criar solicitação de isenção
        response = client.post(
            "/api/v1/tributario/isencoes",
            json={
                "imovel_id": imovel_id,
                "requerente_id": pessoa_id,
                "motivo": "IDOSO",
                "percentual": 100.0,
                "ano_inicial": 2024
            },
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["motivo"] == "IDOSO"

    def test_listar_isencoes(self, client: TestClient, auth_headers: dict):
        """Testa listagem de isenções"""
        response = client.get(
            "/api/v1/tributario/isencoes",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data or isinstance(data, list)
