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
from app.schemas.base import ResponseBase, ResponsePaginado, criar_resposta_paginada

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


@router.get("/pessoas")
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
    pessoas, total = service.listar(
        skip=skip,
        limit=limit,
        tipo_pessoa=tipo_pessoa,
        situacao=situacao
    )

    pagina = (skip // limit) + 1 if limit > 0 else 1
    return criar_resposta_paginada(dados=pessoas, total=total, pagina=pagina, limite=limit)


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


@router.get("/imoveis")
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
    imoveis, total = service.listar(
        skip=skip,
        limit=limit,
        tipo_imovel=tipo_imovel,
        tipo_uso=tipo_uso,
        setor_fiscal_id=setor_fiscal_id
    )

    pagina = (skip // limit) + 1 if limit > 0 else 1
    return criar_resposta_paginada(dados=imoveis, total=total, pagina=pagina, limite=limit)


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


@router.delete("/imoveis/{imovel_id}", response_model=ResponseBase)
async def excluir_imovel(
    imovel_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Exclui (ou inativa) um imóvel
    """
    from app.services.cadastro_service import ImovelService

    service = ImovelService(db)
    service.inativar(imovel_id)

    return ResponseBase(
        sucesso=True,
        mensagem="Imóvel inativado com sucesso"
    )


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


@router.get("/estabelecimentos")
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
    estabelecimentos, total = service.listar(
        skip=skip,
        limit=limit,
        regime_issqn=regime_issqn
    )

    pagina = (skip // limit) + 1 if limit > 0 else 1
    return criar_resposta_paginada(dados=estabelecimentos, total=total, pagina=pagina, limite=limit)


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


@router.get("/estabelecimentos/ccm/{ccm}", response_model=EstabelecimentoResponse)
async def buscar_por_ccm(
    ccm: str,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Busca estabelecimento por CCM (Cadastro de Contribuintes Mobiliários)
    """
    from app.services.cadastro_service import EstabelecimentoService

    service = EstabelecimentoService(db)
    estabelecimento = service.obter_por_ccm(ccm)

    return estabelecimento


@router.put("/estabelecimentos/{estabelecimento_id}", response_model=EstabelecimentoResponse)
async def atualizar_estabelecimento(
    estabelecimento_id: UUID,
    estabelecimento_update: EstabelecimentoUpdate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Atualiza dados de um estabelecimento
    """
    from app.services.cadastro_service import EstabelecimentoService

    service = EstabelecimentoService(db)
    estabelecimento = service.atualizar(estabelecimento_id, estabelecimento_update)

    return estabelecimento


@router.delete("/estabelecimentos/{estabelecimento_id}", response_model=ResponseBase)
async def excluir_estabelecimento(
    estabelecimento_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Exclui (ou inativa) um estabelecimento
    """
    from app.services.cadastro_service import EstabelecimentoService

    service = EstabelecimentoService(db)
    service.inativar(estabelecimento_id)

    return ResponseBase(
        sucesso=True,
        mensagem="Estabelecimento inativado com sucesso"
    )


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


@router.get("/logradouros")
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
    logradouros, total = service.listar(
        skip=skip,
        limit=limit,
        nome=nome,
        bairro=bairro
    )

    pagina = (skip // limit) + 1 if limit > 0 else 1
    return criar_resposta_paginada(dados=logradouros, total=total, pagina=pagina, limite=limit)


@router.get("/logradouros/{logradouro_id}", response_model=LogradouroResponse)
async def obter_logradouro(
    logradouro_id: int,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Obtém detalhes de um logradouro
    """
    from app.services.cadastro_service import LogradouroService

    service = LogradouroService(db)
    logradouro = service.obter_por_id(logradouro_id)

    return logradouro


@router.get("/logradouros/codigo/{codigo}", response_model=LogradouroResponse)
async def buscar_logradouro_por_codigo(
    codigo: str,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Busca logradouro por código
    """
    from app.services.cadastro_service import LogradouroService

    service = LogradouroService(db)
    logradouro = service.obter_por_codigo(codigo)

    return logradouro


@router.put("/logradouros/{logradouro_id}", response_model=LogradouroResponse)
async def atualizar_logradouro(
    logradouro_id: int,
    logradouro_update: LogradouroCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Atualiza dados de um logradouro
    """
    from app.services.cadastro_service import LogradouroService

    service = LogradouroService(db)
    logradouro = service.atualizar(logradouro_id, logradouro_update)

    return logradouro


@router.delete("/logradouros/{logradouro_id}", response_model=ResponseBase)
async def excluir_logradouro(
    logradouro_id: int,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Exclui um logradouro
    """
    from app.services.cadastro_service import LogradouroService

    service = LogradouroService(db)
    service.excluir(logradouro_id)

    return ResponseBase(
        sucesso=True,
        mensagem="Logradouro excluído com sucesso"
    )


# =====================================================
# ENDEREÇOS
# =====================================================

@router.post("/pessoas/{pessoa_id}/enderecos", response_model=EnderecoResponse, status_code=status.HTTP_201_CREATED)
async def adicionar_endereco(
    pessoa_id: UUID,
    endereco: EnderecoCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Adiciona um novo endereço a uma pessoa
    """
    from app.services.cadastro_service import EnderecoService

    service = EnderecoService(db)
    novo_endereco = service.criar(pessoa_id, endereco)

    return novo_endereco


@router.put("/enderecos/{endereco_id}", response_model=EnderecoResponse)
async def atualizar_endereco(
    endereco_id: int,
    endereco_update: EnderecoCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Atualiza um endereço
    """
    from app.services.cadastro_service import EnderecoService

    service = EnderecoService(db)
    endereco = service.atualizar(endereco_id, endereco_update)

    return endereco


@router.delete("/enderecos/{endereco_id}", response_model=ResponseBase)
async def excluir_endereco(
    endereco_id: int,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Remove um endereço
    """
    from app.services.cadastro_service import EnderecoService

    service = EnderecoService(db)
    service.excluir(endereco_id)

    return ResponseBase(
        sucesso=True,
        mensagem="Endereço removido com sucesso"
    )


@router.put("/enderecos/{endereco_id}/principal", response_model=EnderecoResponse)
async def definir_endereco_principal(
    endereco_id: int,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Define um endereço como principal
    """
    from app.services.cadastro_service import EnderecoService

    service = EnderecoService(db)
    endereco = service.definir_principal(endereco_id)

    return endereco


# =====================================================
# VALIDAÇÕES
# =====================================================

@router.get("/validar/cpf/{cpf}")
async def validar_cpf(
    cpf: str,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Valida CPF e verifica se já existe no cadastro
    """
    from app.utils.cpf_validator import validar_cpf as validar_cpf_util
    from app.services.cadastro_service import PessoaService

    # Valida formato
    cpf_valido = validar_cpf_util(cpf)

    if not cpf_valido:
        return {
            "valido": False,
            "existe": False,
            "mensagem": "CPF inválido"
        }

    # Verifica se já existe
    service = PessoaService(db)
    try:
        pessoa = service.obter_por_cpf(cpf)
        existe = True
        pessoa_id = str(pessoa.id)
    except:
        existe = False
        pessoa_id = None

    return {
        "valido": True,
        "existe": existe,
        "pessoa_id": pessoa_id,
        "mensagem": "CPF válido" if not existe else "CPF já cadastrado"
    }


@router.get("/validar/cnpj/{cnpj}")
async def validar_cnpj(
    cnpj: str,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Valida CNPJ e verifica se já existe no cadastro
    """
    from app.utils.cnpj_validator import validar_cnpj as validar_cnpj_util
    from app.services.cadastro_service import PessoaService

    # Valida formato
    cnpj_valido = validar_cnpj_util(cnpj)

    if not cnpj_valido:
        return {
            "valido": False,
            "existe": False,
            "mensagem": "CNPJ inválido"
        }

    # Verifica se já existe
    service = PessoaService(db)
    try:
        pessoa = service.obter_por_cnpj(cnpj)
        existe = True
        pessoa_id = str(pessoa.id)
    except:
        existe = False
        pessoa_id = None

    return {
        "valido": True,
        "existe": existe,
        "pessoa_id": pessoa_id,
        "mensagem": "CNPJ válido" if not existe else "CNPJ já cadastrado"
    }


@router.get("/validar/inscricao/{inscricao}")
async def validar_inscricao_imobiliaria(
    inscricao: str,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Verifica se inscrição imobiliária já existe
    """
    from app.services.cadastro_service import ImovelService

    service = ImovelService(db)
    try:
        imovel = service.obter_por_inscricao(inscricao)
        return {
            "existe": True,
            "imovel_id": str(imovel.id),
            "mensagem": "Inscrição já cadastrada"
        }
    except:
        return {
            "existe": False,
            "imovel_id": None,
            "mensagem": "Inscrição disponível"
        }


@router.get("/validar/ccm/{ccm}")
async def validar_ccm(
    ccm: str,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Verifica se CCM já existe
    """
    from app.services.cadastro_service import EstabelecimentoService

    service = EstabelecimentoService(db)
    try:
        estabelecimento = service.obter_por_ccm(ccm)
        return {
            "existe": True,
            "estabelecimento_id": str(estabelecimento.id),
            "mensagem": "CCM já cadastrado"
        }
    except:
        return {
            "existe": False,
            "estabelecimento_id": None,
            "mensagem": "CCM disponível"
        }


# =====================================================
# CONSULTAS EXTERNAS
# =====================================================

@router.get("/cep/{cep}")
async def buscar_cep(
    cep: str,
    usuario: dict = Depends(get_current_user)
):
    """
    Consulta CEP no ViaCEP
    """
    from app.utils.viacep import buscar_cep as buscar_cep_util

    dados = await buscar_cep_util(cep)
    return dados
