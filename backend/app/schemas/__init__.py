"""
Schemas Pydantic para validação de dados
"""
# Base
from app.schemas.base import (
    SchemaBase,
    ResponseBase,
    PaginacaoParams,
    ResponsePaginado
)

# Auth
from app.schemas.auth import (
    UsuarioLogin,
    TokenResponse,
    TokenData,
    AlterarSenha,
    RecuperarSenha,
    RedefinirSenha
)

# Cadastro
from app.schemas.cadastro import (
    # Pessoa
    PessoaBase,
    PessoaCreate,
    PessoaUpdate,
    PessoaResponse,
    PessoaComEnderecos,
    # Endereço
    EnderecoBase,
    EnderecoCreate,
    EnderecoResponse,
    # Imóvel
    ImovelBase,
    ImovelCreate,
    ImovelUpdate,
    ImovelResponse,
    ImovelCompleto,
    ImovelTerrenoBase,
    ImovelTerrenoCreate,
    ImovelTerrenoResponse,
    ImovelEdificacaoBase,
    ImovelEdificacaoCreate,
    ImovelEdificacaoResponse,
    # Estabelecimento
    EstabelecimentoBase,
    EstabelecimentoCreate,
    EstabelecimentoUpdate,
    EstabelecimentoResponse,
    # Logradouro
    LogradouroBase,
    LogradouroCreate,
    LogradouroResponse,
)

# Tributário
from app.schemas.tributario import (
    # IPTU
    IPTULancamentoBase,
    IPTUCalculoRequest,
    IPTUCalculoResponse,
    IPTULancamentoCreate,
    IPTULancamentoResponse,
    IPTUParcelaResponse,
    # ITBI
    ITBIGuiaBase,
    ITBICalculoRequest,
    ITBICalculoResponse,
    ITBIGuiaCreate,
    ITBIGuiaResponse,
    # ISSQN
    ISSQNDeclaracaoBase,
    ISSQNDeclaracaoCreate,
    ISSQNCalculoRequest,
    ISSQNCalculoResponse,
    ISSQNDeclaracaoResponse,
    ISSQNRetencaoBase,
    ISSQNRetencaoCreate,
    ISSQNRetencaoResponse,
    # Isenções
    IsencaoBase,
    IsencaoCreate,
    IsencaoUpdate,
    IsencaoResponse,
    # PGV e TPC
    PlantaGenericaValorBase,
    PlantaGenericaValorCreate,
    PlantaGenericaValorResponse,
    TabelaPrecoConstrucaoBase,
    TabelaPrecoConstrucaoCreate,
    TabelaPrecoConstrucaoResponse,
    # Alíquotas
    AliquotaBase,
    AliquotaCreate,
    AliquotaResponse,
)

# Admin
from app.schemas.admin import (
    # Usuário
    UsuarioBase,
    UsuarioCreate,
    UsuarioUpdate,
    UsuarioResponse,
    # Perfil
    PerfilBase,
    PerfilCreate,
    PerfilUpdate,
    PerfilResponse,
    # Parâmetros
    ParametroSistemaBase,
    ParametroSistemaCreate,
    ParametroSistemaUpdate,
    ParametroSistemaResponse,
    # Auditoria
    AuditoriaResponse,
    # Certidões
    CertidaoSolicitacaoBase,
    CertidaoSolicitacaoCreate,
    CertidaoResponse,
)

__all__ = [
    # Base
    "SchemaBase",
    "ResponseBase",
    "PaginacaoParams",
    "ResponsePaginado",

    # Auth
    "UsuarioLogin",
    "TokenResponse",
    "TokenData",
    "AlterarSenha",
    "RecuperarSenha",
    "RedefinirSenha",

    # Cadastro
    "PessoaBase",
    "PessoaCreate",
    "PessoaUpdate",
    "PessoaResponse",
    "PessoaComEnderecos",
    "EnderecoBase",
    "EnderecoCreate",
    "EnderecoResponse",
    "ImovelBase",
    "ImovelCreate",
    "ImovelUpdate",
    "ImovelResponse",
    "ImovelCompleto",
    "ImovelTerrenoBase",
    "ImovelTerrenoCreate",
    "ImovelTerrenoResponse",
    "ImovelEdificacaoBase",
    "ImovelEdificacaoCreate",
    "ImovelEdificacaoResponse",
    "EstabelecimentoBase",
    "EstabelecimentoCreate",
    "EstabelecimentoUpdate",
    "EstabelecimentoResponse",
    "LogradouroBase",
    "LogradouroCreate",
    "LogradouroResponse",

    # Tributário
    "IPTULancamentoBase",
    "IPTUCalculoRequest",
    "IPTUCalculoResponse",
    "IPTULancamentoCreate",
    "IPTULancamentoResponse",
    "IPTUParcelaResponse",
    "ITBIGuiaBase",
    "ITBICalculoRequest",
    "ITBICalculoResponse",
    "ITBIGuiaCreate",
    "ITBIGuiaResponse",
    "ISSQNDeclaracaoBase",
    "ISSQNDeclaracaoCreate",
    "ISSQNCalculoRequest",
    "ISSQNCalculoResponse",
    "ISSQNDeclaracaoResponse",
    "ISSQNRetencaoBase",
    "ISSQNRetencaoCreate",
    "ISSQNRetencaoResponse",
    "IsencaoBase",
    "IsencaoCreate",
    "IsencaoUpdate",
    "IsencaoResponse",
    "PlantaGenericaValorBase",
    "PlantaGenericaValorCreate",
    "PlantaGenericaValorResponse",
    "TabelaPrecoConstrucaoBase",
    "TabelaPrecoConstrucaoCreate",
    "TabelaPrecoConstrucaoResponse",
    "AliquotaBase",
    "AliquotaCreate",
    "AliquotaResponse",

    # Admin
    "UsuarioBase",
    "UsuarioCreate",
    "UsuarioUpdate",
    "UsuarioResponse",
    "PerfilBase",
    "PerfilCreate",
    "PerfilUpdate",
    "PerfilResponse",
    "ParametroSistemaBase",
    "ParametroSistemaCreate",
    "ParametroSistemaUpdate",
    "ParametroSistemaResponse",
    "AuditoriaResponse",
    "CertidaoSolicitacaoBase",
    "CertidaoSolicitacaoCreate",
    "CertidaoResponse",
]