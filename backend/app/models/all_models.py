"""
Importação de todos os modelos
Para facilitar o uso e migrações
"""

# Modelo base
from app.models.base import ModeloBase

# Módulo de Cadastros
from app.models.cadastro import (
    TipoPessoa, SituacaoCadastral, TipoImovel, TipoUso, TipoLogradouro,
    Pessoa, Endereco, Logradouro, SetorFiscal, Loteamento,
    Imovel, ImovelTerreno, ImovelEdificacao, Estabelecimento, Procuracao
)

# Módulo Tributário
from app.models.tributario import (
    TipoTributo, StatusLancamento, TipoIsencao,
    PlantaGenericaValor, TabelaPrecoConstrucao, Aliquota,
    IPTULancamento, IPTUParcela,
    ITBIGuia,
    ISSQNDeclaracao, ISSQNRetencao,
    Isencao
)

# Módulo de Arrecadação
from app.models.arrecadacao import (
    StatusDAM, StatusPagamento, TipoParcelamento, StatusParcelamento, TipoCanalPagamento,
    DAM, Pagamento, Parcelamento, ParcelamentoParcela, Compensacao, Restituicao
)

# Módulo NFS-e
from app.models.nfse import (
    StatusNFSe, StatusRPS,
    NFSe, RPS, DeclaracaoServico
)

# Módulo de Taxas
from app.models.taxas import (
    StatusTaxa,
    TaxaLFF, TaxaFuncionamentoEspecial, TaxaPublicidade, TaxaObra,
    TaxaResiduosSolidos, ContribuicaoMelhoria, ContribuicaoMelhoriaParcela,
    ContribuicaoIluminacaoPublica
)

# Módulo Fiscal
from app.models.fiscal import (
    StatusFiscalizacao, StatusAutoInfracao,
    OrdemFiscalizacao, AutoInfracao, Intimacao, RegimeEspecialFiscalizacao
)

# Módulo Dívida Ativa
from app.models.divida_ativa import (
    StatusDividaAtiva,
    DividaAtivaInscricao, DividaAtivaCertidao, DividaAtivaProtesto
)

# Módulo Administrativo
from app.models.admin import (
    TipoCertidao,
    Usuario, Perfil, TokenBlacklist, ParametroFiscal, Certidao,
    DomicilioTributarioDigital, DTDMensagem, AuditoriaLog
)


__all__ = [
    # Base
    "ModeloBase",

    # Cadastro - Enums
    "TipoPessoa", "SituacaoCadastral", "TipoImovel", "TipoUso", "TipoLogradouro",

    # Cadastro - Models
    "Pessoa", "Endereco", "Logradouro", "SetorFiscal", "Loteamento",
    "Imovel", "ImovelTerreno", "ImovelEdificacao", "Estabelecimento", "Procuracao",

    # Tributário - Enums
    "TipoTributo", "StatusLancamento", "TipoIsencao",

    # Tributário - Models
    "PlantaGenericaValor", "TabelaPrecoConstrucao", "Aliquota",
    "IPTULancamento", "IPTUParcela", "ITBIGuia",
    "ISSQNDeclaracao", "ISSQNRetencao", "Isencao",

    # Arrecadação - Enums
    "StatusDAM", "StatusPagamento", "TipoParcelamento", "StatusParcelamento", "TipoCanalPagamento",

    # Arrecadação - Models
    "DAM", "Pagamento", "Parcelamento", "ParcelamentoParcela", "Compensacao", "Restituicao",

    # NFS-e - Enums
    "StatusNFSe", "StatusRPS",

    # NFS-e - Models
    "NFSe", "RPS", "DeclaracaoServico",

    # Taxas - Enums
    "StatusTaxa",

    # Taxas - Models
    "TaxaLFF", "TaxaFuncionamentoEspecial", "TaxaPublicidade", "TaxaObra",
    "TaxaResiduosSolidos", "ContribuicaoMelhoria", "ContribuicaoMelhoriaParcela",
    "ContribuicaoIluminacaoPublica",

    # Fiscal - Enums
    "StatusFiscalizacao", "StatusAutoInfracao",

    # Fiscal - Models
    "OrdemFiscalizacao", "AutoInfracao", "Intimacao", "RegimeEspecialFiscalizacao",

    # Dívida Ativa - Enums
    "StatusDividaAtiva",

    # Dívida Ativa - Models
    "DividaAtivaInscricao", "DividaAtivaCertidao", "DividaAtivaProtesto",

    # Administrativo - Enums
    "TipoCertidao",

    # Administrativo - Models
    "Usuario", "Perfil", "TokenBlacklist", "ParametroFiscal", "Certidao",
    "DomicilioTributarioDigital", "DTDMensagem", "AuditoriaLog",
]
