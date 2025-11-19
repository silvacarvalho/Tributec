"""
Testes unitários para o módulo de cadastro (Services)
"""
import pytest
from uuid import uuid4
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.services.cadastro_service import PessoaService, ImovelService, EstabelecimentoService
from app.models.cadastro import Pessoa, Imovel, Estabelecimento, SituacaoCadastral
from app.schemas.cadastro import PessoaCreate, ImovelCreate, EstabelecimentoCreate


@pytest.mark.unit
@pytest.mark.cadastro
class TestPessoaService:
    """Testes para PessoaService"""

    def test_criar_pessoa_fisica_valida(self, db: Session):
        """Testa criação de pessoa física com dados válidos"""
        service = PessoaService(db)

        pessoa_data = PessoaCreate(
            tipo_pessoa="F",
            nome="João da Silva",
            cpf="12345678901",
            email="joao@example.com"
        )

        pessoa = service.criar(pessoa_data)

        assert pessoa.id is not None
        assert pessoa.nome == "João da Silva"
        assert pessoa.cpf == "12345678901"
        assert pessoa.situacao_cadastral == SituacaoCadastral.ATIVO

    def test_criar_pessoa_fisica_sem_cpf(self, db: Session):
        """Testa que pessoa física sem CPF deve falhar"""
        service = PessoaService(db)

        pessoa_data = PessoaCreate(
            tipo_pessoa="F",
            nome="João da Silva",
            email="joao@example.com"
        )

        with pytest.raises(HTTPException) as exc_info:
            service.criar(pessoa_data)

        assert exc_info.value.status_code == 400
        assert "CPF é obrigatório" in exc_info.value.detail

    def test_criar_pessoa_fisica_cpf_invalido(self, db: Session):
        """Testa que CPF inválido deve falhar"""
        service = PessoaService(db)

        pessoa_data = PessoaCreate(
            tipo_pessoa="F",
            nome="João da Silva",
            cpf="11111111111",  # CPF inválido
            email="joao@example.com"
        )

        with pytest.raises(HTTPException) as exc_info:
            service.criar(pessoa_data)

        assert exc_info.value.status_code == 400
        assert "CPF inválido" in exc_info.value.detail

    def test_criar_pessoa_fisica_cpf_duplicado(self, db: Session):
        """Testa que CPF duplicado deve falhar"""
        service = PessoaService(db)

        # Criar primeira pessoa
        pessoa_data = PessoaCreate(
            tipo_pessoa="F",
            nome="João da Silva",
            cpf="12345678901",
            email="joao@example.com"
        )
        service.criar(pessoa_data)

        # Tentar criar segunda pessoa com mesmo CPF
        pessoa_data2 = PessoaCreate(
            tipo_pessoa="F",
            nome="Maria da Silva",
            cpf="12345678901",
            email="maria@example.com"
        )

        with pytest.raises(HTTPException) as exc_info:
            service.criar(pessoa_data2)

        assert exc_info.value.status_code == 409
        assert "CPF já cadastrado" in exc_info.value.detail

    def test_criar_pessoa_juridica_valida(self, db: Session):
        """Testa criação de pessoa jurídica com dados válidos"""
        service = PessoaService(db)

        pessoa_data = PessoaCreate(
            tipo_pessoa="J",
            razao_social="Empresa Teste LTDA",
            nome_fantasia="Empresa Teste",
            cnpj="12345678000190",
            email="contato@empresa.com"
        )

        pessoa = service.criar(pessoa_data)

        assert pessoa.id is not None
        assert pessoa.razao_social == "Empresa Teste LTDA"
        assert pessoa.cnpj == "12345678000190"
        assert pessoa.situacao_cadastral == SituacaoCadastral.ATIVO

    def test_criar_pessoa_juridica_sem_cnpj(self, db: Session):
        """Testa que pessoa jurídica sem CNPJ deve falhar"""
        service = PessoaService(db)

        pessoa_data = PessoaCreate(
            tipo_pessoa="J",
            razao_social="Empresa Teste LTDA",
            email="contato@empresa.com"
        )

        with pytest.raises(HTTPException) as exc_info:
            service.criar(pessoa_data)

        assert exc_info.value.status_code == 400
        assert "CNPJ é obrigatório" in exc_info.value.detail

    def test_criar_pessoa_juridica_cnpj_duplicado(self, db: Session):
        """Testa que CNPJ duplicado deve falhar"""
        service = PessoaService(db)

        # Criar primeira empresa
        pessoa_data = PessoaCreate(
            tipo_pessoa="J",
            razao_social="Empresa Teste LTDA",
            cnpj="12345678000190",
            email="contato@empresa.com"
        )
        service.criar(pessoa_data)

        # Tentar criar segunda empresa com mesmo CNPJ
        pessoa_data2 = PessoaCreate(
            tipo_pessoa="J",
            razao_social="Outra Empresa LTDA",
            cnpj="12345678000190",
            email="outra@empresa.com"
        )

        with pytest.raises(HTTPException) as exc_info:
            service.criar(pessoa_data2)

        assert exc_info.value.status_code == 409
        assert "CNPJ já cadastrado" in exc_info.value.detail

    def test_listar_pessoas(self, db: Session):
        """Testa listagem de pessoas"""
        service = PessoaService(db)

        # Criar algumas pessoas
        for i in range(3):
            pessoa_data = PessoaCreate(
                tipo_pessoa="F",
                nome=f"Pessoa {i}",
                cpf=f"1234567890{i}",
                email=f"pessoa{i}@example.com"
            )
            service.criar(pessoa_data)

        pessoas = service.listar(limit=10, offset=0)

        assert len(pessoas) == 3

    def test_buscar_por_cpf_existente(self, db: Session):
        """Testa busca de pessoa por CPF existente"""
        service = PessoaService(db)

        # Criar pessoa
        pessoa_data = PessoaCreate(
            tipo_pessoa="F",
            nome="João da Silva",
            cpf="12345678901",
            email="joao@example.com"
        )
        pessoa_criada = service.criar(pessoa_data)

        # Buscar por CPF
        pessoa_encontrada = service.buscar_por_cpf("12345678901")

        assert pessoa_encontrada is not None
        assert pessoa_encontrada.id == pessoa_criada.id
        assert pessoa_encontrada.cpf == "12345678901"

    def test_buscar_por_cpf_inexistente(self, db: Session):
        """Testa busca de pessoa por CPF inexistente"""
        service = PessoaService(db)

        pessoa = service.buscar_por_cpf("99999999999")

        assert pessoa is None

    def test_buscar_por_cnpj_existente(self, db: Session):
        """Testa busca de pessoa por CNPJ existente"""
        service = PessoaService(db)

        # Criar empresa
        pessoa_data = PessoaCreate(
            tipo_pessoa="J",
            razao_social="Empresa Teste LTDA",
            cnpj="12345678000190",
            email="contato@empresa.com"
        )
        empresa_criada = service.criar(pessoa_data)

        # Buscar por CNPJ
        empresa_encontrada = service.buscar_por_cnpj("12345678000190")

        assert empresa_encontrada is not None
        assert empresa_encontrada.id == empresa_criada.id
        assert empresa_encontrada.cnpj == "12345678000190"

    def test_obter_pessoa_por_id(self, db: Session):
        """Testa obtenção de pessoa por ID"""
        service = PessoaService(db)

        # Criar pessoa
        pessoa_data = PessoaCreate(
            tipo_pessoa="F",
            nome="João da Silva",
            cpf="12345678901",
            email="joao@example.com"
        )
        pessoa_criada = service.criar(pessoa_data)

        # Buscar por ID
        pessoa_encontrada = service.obter(pessoa_criada.id)

        assert pessoa_encontrada is not None
        assert pessoa_encontrada.id == pessoa_criada.id

    def test_obter_pessoa_id_invalido(self, db: Session):
        """Testa que buscar pessoa com ID inválido deve falhar"""
        service = PessoaService(db)

        id_invalido = uuid4()

        with pytest.raises(HTTPException) as exc_info:
            service.obter(id_invalido)

        assert exc_info.value.status_code == 404
        assert "Pessoa não encontrada" in exc_info.value.detail


@pytest.mark.unit
@pytest.mark.cadastro
class TestImovelService:
    """Testes para ImovelService"""

    def test_criar_imovel_valido(self, db: Session):
        """Testa criação de imóvel com dados válidos"""
        service = ImovelService(db)

        imovel_data = ImovelCreate(
            inscricao_imobiliaria="12345678",
            area_terreno=250.00,
            area_construida=150.00,
            tipo_imovel="RESIDENCIAL",
            setor_fiscal="001",
            quadra="A",
            lote="10"
        )

        imovel = service.criar(imovel_data)

        assert imovel.id is not None
        assert imovel.inscricao_imobiliaria == "12345678"
        assert imovel.area_terreno == 250.00
        assert imovel.situacao_cadastral == SituacaoCadastral.ATIVO

    def test_criar_imovel_inscricao_duplicada(self, db: Session):
        """Testa que inscrição imobiliária duplicada deve falhar"""
        service = ImovelService(db)

        # Criar primeiro imóvel
        imovel_data = ImovelCreate(
            inscricao_imobiliaria="12345678",
            area_terreno=250.00,
            tipo_imovel="RESIDENCIAL"
        )
        service.criar(imovel_data)

        # Tentar criar segundo imóvel com mesma inscrição
        imovel_data2 = ImovelCreate(
            inscricao_imobiliaria="12345678",
            area_terreno=300.00,
            tipo_imovel="COMERCIAL"
        )

        with pytest.raises(HTTPException) as exc_info:
            service.criar(imovel_data2)

        assert exc_info.value.status_code == 409
        assert "Inscrição imobiliária já cadastrada" in exc_info.value.detail

    def test_buscar_imovel_por_inscricao(self, db: Session):
        """Testa busca de imóvel por inscrição"""
        service = ImovelService(db)

        # Criar imóvel
        imovel_data = ImovelCreate(
            inscricao_imobiliaria="12345678",
            area_terreno=250.00,
            tipo_imovel="RESIDENCIAL"
        )
        imovel_criado = service.criar(imovel_data)

        # Buscar por inscrição
        imovel_encontrado = service.buscar_por_inscricao("12345678")

        assert imovel_encontrado is not None
        assert imovel_encontrado.id == imovel_criado.id


@pytest.mark.unit
@pytest.mark.cadastro
class TestEstabelecimentoService:
    """Testes para EstabelecimentoService"""

    def test_criar_estabelecimento_valido(self, db: Session):
        """Testa criação de estabelecimento com dados válidos"""
        service = EstabelecimentoService(db)

        estabelecimento_data = EstabelecimentoCreate(
            inscricao_municipal="123456",
            razao_social="Empresa Teste LTDA",
            nome_fantasia="Empresa Teste",
            cnpj="12345678000190",
            atividade_principal="Comércio varejista"
        )

        estabelecimento = service.criar(estabelecimento_data)

        assert estabelecimento.id is not None
        assert estabelecimento.inscricao_municipal == "123456"
        assert estabelecimento.razao_social == "Empresa Teste LTDA"
        assert estabelecimento.situacao_cadastral == SituacaoCadastral.ATIVO

    def test_criar_estabelecimento_inscricao_duplicada(self, db: Session):
        """Testa que inscrição municipal duplicada deve falhar"""
        service = EstabelecimentoService(db)

        # Criar primeiro estabelecimento
        estabelecimento_data = EstabelecimentoCreate(
            inscricao_municipal="123456",
            razao_social="Empresa Teste LTDA",
            cnpj="12345678000190"
        )
        service.criar(estabelecimento_data)

        # Tentar criar segundo estabelecimento com mesma inscrição
        estabelecimento_data2 = EstabelecimentoCreate(
            inscricao_municipal="123456",
            razao_social="Outra Empresa LTDA",
            cnpj="98765432000100"
        )

        with pytest.raises(HTTPException) as exc_info:
            service.criar(estabelecimento_data2)

        assert exc_info.value.status_code == 409
        assert "Inscrição municipal já cadastrada" in exc_info.value.detail
