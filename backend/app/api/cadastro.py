"""
Router do Módulo de Cadastros
Pessoas, Imóveis, Estabelecimentos, Logradouros
"""
from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.core.security import get_current_user
from app.schemas.cadastro import (
    # Pessoa
    PessoaCreate,
    PessoaUpdate,
    PessoaResponse,
    PessoaComEnderecos,
    # Endereço
    EnderecoCreate,
    EnderecoResponse,
    # Imóvel
    ImovelCreate,
    ImovelUpdate,
    ImovelResponse,
    ImovelCompleto,
    # Estabelecimento
    EstabelecimentoCreate,
    EstabelecimentoUpdate,
    EstabelecimentoResponse,
    # Logradouro
    LogradouroCreate,
    LogradouroResponse,
)
from app.schemas.base import ResponseBase, ResponsePaginado

router = APIRouter(prefix="/cadastro", tags=["Cadastros"])


# =====================================================
# PESSOAS
# =====================================================

@router.post("/pessoas", response_model=PessoaResponse, status_code=status.HTTP_201_CREATED)
async def criar_pessoa(
    pessoa: PessoaCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Cria um novo cadastro de pessoa (física ou jurídica)
    """
    from app.services.cadastro_service import PessoaService

    service = PessoaService(db)
    nova_pessoa = service.criar(pessoa)

    return nova_pessoa


@router.get("/pessoas", response_model=List[PessoaResponse])
async def listar_pessoas(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    tipo_pessoa: str = Query(default=None, description="F ou J"),
    situacao: str = Query(default=None),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista pessoas cadastradas com filtros e paginação
    """
    from app.services.cadastro_service import PessoaService

    service = PessoaService(db)
    pessoas = service.listar(
        skip=skip,
        limit=limit,
        tipo_pessoa=tipo_pessoa,
        situacao=situacao
    )

    return pessoas


@router.get("/pessoas/{pessoa_id}", response_model=PessoaComEnderecos)
async def obter_pessoa(
    pessoa_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Obtém detalhes de uma pessoa específica com seus endereços
    """
    from app.services.cadastro_service import PessoaService

    service = PessoaService(db)
    pessoa = service.obter_por_id(pessoa_id)

    return pessoa


@router.put("/pessoas/{pessoa_id}", response_model=PessoaResponse)
async def atualizar_pessoa(
    pessoa_id: UUID,
    pessoa_update: PessoaUpdate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Atualiza dados de uma pessoa
    """
    from app.services.cadastro_service import PessoaService

    service = PessoaService(db)
    pessoa = service.atualizar(pessoa_id, pessoa_update)

    return pessoa


@router.delete("/pessoas/{pessoa_id}", response_model=ResponseBase)
async def excluir_pessoa(
    pessoa_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Exclui (ou inativa) uma pessoa
    """
    from app.services.cadastro_service import PessoaService

    service = PessoaService(db)
    service.inativar(pessoa_id)

    return ResponseBase(
        sucesso=True,
        mensagem="Pessoa inativada com sucesso"
    )


@router.get("/pessoas/cpf/{cpf}", response_model=PessoaResponse)
async def buscar_por_cpf(
    cpf: str,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Busca pessoa por CPF
    """
    from app.services.cadastro_service import PessoaService

    service = PessoaService(db)
    pessoa = service.obter_por_cpf(cpf)

    return pessoa


@router.get("/pessoas/cnpj/{cnpj}", response_model=PessoaResponse)
async def buscar_por_cnpj(
    cnpj: str,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Busca pessoa por CNPJ
    """
    from app.services.cadastro_service import PessoaService

    service = PessoaService(db)
    pessoa = service.obter_por_cnpj(cnpj)

    return pessoa


# =====================================================
# IMÓVEIS
# =====================================================

@router.post("/imoveis", response_model=ImovelResponse, status_code=status.HTTP_201_CREATED)
async def criar_imovel(
    imovel: ImovelCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Cria um novo cadastro imobiliário
    """
    from app.services.cadastro_service import ImovelService

    service = ImovelService(db)
    novo_imovel = service.criar(imovel)

    return novo_imovel


@router.get("/imoveis", response_model=List[ImovelResponse])
async def listar_imoveis(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    tipo_imovel: str = Query(default=None),
    tipo_uso: str = Query(default=None),
    setor_fiscal_id: int = Query(default=None),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista imóveis cadastrados com filtros
    """
    from app.services.cadastro_service import ImovelService

    service = ImovelService(db)
    imoveis = service.listar(
        skip=skip,
        limit=limit,
        tipo_imovel=tipo_imovel,
        tipo_uso=tipo_uso,
        setor_fiscal_id=setor_fiscal_id
    )

    return imoveis


@router.get("/imoveis/{imovel_id}", response_model=ImovelCompleto)
async def obter_imovel(
    imovel_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Obtém detalhes completos de um imóvel
    """
    from app.services.cadastro_service import ImovelService

    service = ImovelService(db)
    imovel = service.obter_por_id(imovel_id)

    return imovel


@router.get("/imoveis/inscricao/{inscricao}", response_model=ImovelCompleto)
async def buscar_por_inscricao(
    inscricao: str,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Busca imóvel por inscrição imobiliária
    """
    from app.services.cadastro_service import ImovelService

    service = ImovelService(db)
    imovel = service.obter_por_inscricao(inscricao)

    return imovel


@router.put("/imoveis/{imovel_id}", response_model=ImovelResponse)
async def atualizar_imovel(
    imovel_id: UUID,
    imovel_update: ImovelUpdate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Atualiza dados de um imóvel
    """
    from app.services.cadastro_service import ImovelService

    service = ImovelService(db)
    imovel = service.atualizar(imovel_id, imovel_update)

    return imovel


# =====================================================
# ESTABELECIMENTOS
# =====================================================

@router.post("/estabelecimentos", response_model=EstabelecimentoResponse, status_code=status.HTTP_201_CREATED)
async def criar_estabelecimento(
    estabelecimento: EstabelecimentoCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Cria um novo cadastro de estabelecimento (CCM)
    """
    from app.services.cadastro_service import EstabelecimentoService

    service = EstabelecimentoService(db)
    novo_estabelecimento = service.criar(estabelecimento)

    return novo_estabelecimento


@router.get("/estabelecimentos", response_model=List[EstabelecimentoResponse])
async def listar_estabelecimentos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    regime_issqn: str = Query(default=None),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista estabelecimentos cadastrados
    """
    from app.services.cadastro_service import EstabelecimentoService

    service = EstabelecimentoService(db)
    estabelecimentos = service.listar(
        skip=skip,
        limit=limit,
        regime_issqn=regime_issqn
    )

    return estabelecimentos


@router.get("/estabelecimentos/{estabelecimento_id}", response_model=EstabelecimentoResponse)
async def obter_estabelecimento(
    estabelecimento_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Obtém detalhes de um estabelecimento
    """
    from app.services.cadastro_service import EstabelecimentoService

    service = EstabelecimentoService(db)
    estabelecimento = service.obter_por_id(estabelecimento_id)

    return estabelecimento


# =====================================================
# LOGRADOUROS
# =====================================================

@router.post("/logradouros", response_model=LogradouroResponse, status_code=status.HTTP_201_CREATED)
async def criar_logradouro(
    logradouro: LogradouroCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Cria um novo logradouro
    """
    from app.services.cadastro_service import LogradouroService

    service = LogradouroService(db)
    novo_logradouro = service.criar(logradouro)

    return novo_logradouro


@router.get("/logradouros", response_model=List[LogradouroResponse])
async def listar_logradouros(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    nome: str = Query(default=None),
    bairro: str = Query(default=None),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista logradouros cadastrados
    """
    from app.services.cadastro_service import LogradouroService

    service = LogradouroService(db)
    logradouros = service.listar(
        skip=skip,
        limit=limit,
        nome=nome,
        bairro=bairro
    )

    return logradouros
