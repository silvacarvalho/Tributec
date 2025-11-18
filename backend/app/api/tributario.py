"""
Router do Módulo Tributário
IPTU, ITBI, ISSQN, Isenções, PGV, TPC, Alíquotas
"""
from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.core.security import get_current_user, verificar_permissoes
from app.schemas.tributario import (
    # IPTU
    IPTUCalculoRequest,
    IPTUCalculoResponse,
    IPTULancamentoCreate,
    IPTULancamentoResponse,
    IPTUParcelaResponse,
    # ITBI
    ITBICalculoRequest,
    ITBICalculoResponse,
    ITBIGuiaCreate,
    ITBIGuiaResponse,
    # ISSQN
    ISSQNCalculoRequest,
    ISSQNCalculoResponse,
    ISSQNDeclaracaoCreate,
    ISSQNDeclaracaoResponse,
    ISSQNRetencaoCreate,
    ISSQNRetencaoResponse,
    # Isenções
    IsencaoCreate,
    IsencaoUpdate,
    IsencaoResponse,
    # PGV e TPC
    PlantaGenericaValorCreate,
    PlantaGenericaValorResponse,
    TabelaPrecoConstrucaoCreate,
    TabelaPrecoConstrucaoResponse,
    # Alíquotas
    AliquotaCreate,
    AliquotaResponse,
)
from app.schemas.base import ResponseBase

router = APIRouter(prefix="/tributario", tags=["Tributário"])


# =====================================================
# IPTU - IMPOSTO PREDIAL E TERRITORIAL URBANO
# =====================================================

@router.post("/iptu/calcular", response_model=IPTUCalculoResponse)
async def calcular_iptu(
    calculo: IPTUCalculoRequest,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Calcula o IPTU de um imóvel para um determinado exercício
    """
    from app.services.calculo_tributario import CalculadoraIPTU
    from decimal import Decimal

    # Criar calculadora
    calculadora = CalculadoraIPTU(db, calculo.ano_exercicio)

    # Calcular IPTU
    resultado = calculadora.calcular(str(calculo.imovel_id))

    # Aplicar descontos se solicitado
    valor_liquido = Decimal(str(resultado["valor_iptu"]))
    desconto_pagamento_unico = Decimal("0.00")
    desconto_iptu_digital = Decimal("0.00")

    if calculo.pagamento_unico:
        desconto_pagamento_unico = valor_liquido * Decimal("0.10")  # 10%

    if calculo.iptu_digital:
        desconto_iptu_digital = valor_liquido * Decimal("0.02")  # 2%

    valor_liquido = valor_liquido - desconto_pagamento_unico - desconto_iptu_digital

    # Calcular parcelas
    valor_parcela = valor_liquido / calculo.numero_parcelas

    return IPTUCalculoResponse(
        valor_venal_terreno=Decimal(str(resultado["valor_venal_terreno"])),
        valor_venal_edificacao=Decimal(str(resultado["valor_venal_edificacao"])),
        valor_venal_total=Decimal(str(resultado["valor_venal_total"])),
        fator_correcao_terreno=Decimal(str(resultado["fator_correcao_terreno"])),
        fator_correcao_edificacao=Decimal(str(resultado.get("fator_correcao_edificacao", 0.0))),
        fatores_aplicados=resultado.get("detalhamento_fct"),
        aliquota_aplicada=Decimal(str(resultado["aliquota_aplicada"])),
        tipo_uso_calculo=resultado["tipo_uso"],
        valor_iptu=Decimal(str(resultado["valor_iptu"])),
        desconto_pagamento_unico=desconto_pagamento_unico,
        desconto_iptu_digital=desconto_iptu_digital,
        desconto_anos_anteriores=Decimal("0.00"),
        percentual_desconto_anos=0,
        valor_liquido=valor_liquido,
        numero_parcelas=calculo.numero_parcelas,
        valor_parcela=valor_parcela
    )


@router.post("/iptu/lancar", response_model=IPTULancamentoResponse, status_code=status.HTTP_201_CREATED)
async def lancar_iptu(
    lancamento: IPTULancamentoCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN", "FISCAL", "ARRECADACAO"]))
):
    """
    Realiza o lançamento de IPTU de um imóvel
    """
    # TODO: Implementar lançamento de IPTU
    # from app.services.calculo_tributario import CalculadoraIPTU
    # from app.models.tributario import IPTULancamento
    # calculadora = CalculadoraIPTU(db)
    # lancamento_criado = calculadora.lancar_iptu(lancamento)
    # return lancamento_criado

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint em desenvolvimento"
    )


@router.post("/iptu/lançamento-em-lote/{ano_exercicio}", response_model=ResponseBase)
async def lancar_iptu_em_lote(
    ano_exercicio: int,
    setor_fiscal_id: int = Query(default=None, description="Filtrar por setor fiscal"),
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN", "FISCAL"]))
):
    """
    Realiza o lançamento de IPTU em lote para um exercício
    Pode filtrar por setor fiscal
    """
    # TODO: Implementar lançamento em lote (tarefa assíncrona com Celery)
    # from app.tasks.tributario import lancar_iptu_lote
    # task = lancar_iptu_lote.delay(ano_exercicio, setor_fiscal_id)

    return ResponseBase(
        sucesso=True,
        mensagem=f"Lançamento em lote de IPTU {ano_exercicio} iniciado. Acompanhe o progresso no painel."
    )


@router.get("/iptu/lancamentos", response_model=List[IPTULancamentoResponse])
async def listar_lancamentos_iptu(
    ano_exercicio: int = Query(..., description="Ano do exercício"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    status: str = Query(default=None),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista lançamentos de IPTU com filtros
    """
    # TODO: Implementar listagem
    return []


@router.get("/iptu/lancamentos/{lancamento_id}", response_model=IPTULancamentoResponse)
async def obter_lancamento_iptu(
    lancamento_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Obtém detalhes de um lançamento de IPTU
    """
    # TODO: Implementar busca
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint em desenvolvimento"
    )


@router.get("/iptu/lancamentos/{lancamento_id}/parcelas", response_model=List[IPTUParcelaResponse])
async def listar_parcelas_iptu(
    lancamento_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista parcelas de um lançamento de IPTU
    """
    # TODO: Implementar listagem de parcelas
    return []


# =====================================================
# ITBI - IMPOSTO SOBRE TRANSMISSÃO DE BENS IMÓVEIS
# =====================================================

@router.post("/itbi/calcular", response_model=ITBICalculoResponse)
async def calcular_itbi(
    calculo: ITBICalculoRequest,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Calcula o ITBI de uma transação imobiliária
    """
    from app.services.calculo_tributario import CalculadoraITBI
    from app.services.cadastro_service import ImovelService
    from decimal import Decimal

    # Buscar valor venal do imóvel (último IPTU lançado)
    imovel_service = ImovelService(db)
    imovel = imovel_service.obter_por_id(calculo.imovel_id)

    # TODO: Buscar valor venal do último IPTU
    # Por enquanto, usar um valor padrão ou calcular
    valor_venal = Decimal("100000.00")  # Temporário

    # Criar calculadora e calcular ITBI
    calculadora = CalculadoraITBI()
    resultado = calculadora.calcular(
        valor_declarado=calculo.valor_declarado,
        valor_venal=valor_venal,
        valor_financiado_sfh=calculo.valor_financiado_sfh
    )

    return ITBICalculoResponse(
        valor_declarado=Decimal(str(resultado["valor_declarado"])),
        valor_venal=Decimal(str(resultado["valor_venal"])),
        valor_base_calculo=Decimal(str(resultado["base_calculo"])),
        valor_financiado_sfh=Decimal(str(resultado["valor_financiado_sfh"])),
        valor_nao_financiado=Decimal(str(resultado["valor_nao_financiado"])),
        aliquota_sfh=Decimal(str(resultado["aliquota_sfh"])),
        aliquota_normal=Decimal(str(resultado["aliquota_normal"])),
        valor_itbi_sfh=Decimal(str(resultado["itbi_sfh"])),
        valor_itbi_normal=Decimal(str(resultado["itbi_normal"])),
        valor_itbi_total=Decimal(str(resultado["itbi_total"])),
        valor_isencao=Decimal("0.00"),
        valor_liquido=Decimal(str(resultado["itbi_total"]))
    )


@router.post("/itbi/guias", response_model=ITBIGuiaResponse, status_code=status.HTTP_201_CREATED)
async def emitir_guia_itbi(
    guia: ITBIGuiaCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Emite uma guia de ITBI
    """
    # TODO: Implementar emissão de guia
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint em desenvolvimento"
    )


@router.get("/itbi/guias", response_model=List[ITBIGuiaResponse])
async def listar_guias_itbi(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    imovel_id: UUID = Query(default=None),
    pago: bool = Query(default=None),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista guias de ITBI com filtros
    """
    # TODO: Implementar listagem
    return []


@router.get("/itbi/guias/{guia_id}", response_model=ITBIGuiaResponse)
async def obter_guia_itbi(
    guia_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Obtém detalhes de uma guia de ITBI
    """
    # TODO: Implementar busca
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint em desenvolvimento"
    )


# =====================================================
# ISSQN - IMPOSTO SOBRE SERVIÇOS
# =====================================================

@router.post("/issqn/calcular", response_model=ISSQNCalculoResponse)
async def calcular_issqn(
    calculo: ISSQNCalculoRequest,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Calcula o ISSQN de um período
    """
    from app.services.calculo_tributario import CalculadoraISSQN
    from app.core.config import settings
    from decimal import Decimal

    # Criar calculadora
    calculadora = CalculadoraISSQN(valor_ufm=Decimal(str(settings.UFM_VALOR)))

    # Calcular ISSQN no regime normal
    resultado = calculadora.calcular_regime_normal(
        receita_bruta=calculo.receita_bruta_total,
        deducoes_permitidas=calculo.deducoes_materiais + calculo.outras_deducoes
    )

    # Considerar retenções
    valor_a_recolher = Decimal(str(resultado["issqn"])) - calculo.valor_retido_terceiros

    return ISSQNCalculoResponse(
        receita_bruta_total=Decimal(str(resultado["receita_bruta"])),
        deducoes_materiais=calculo.deducoes_materiais,
        outras_deducoes=calculo.outras_deducoes,
        base_calculo=Decimal(str(resultado["base_calculo"])),
        aliquota=Decimal(str(resultado["aliquota"])),
        valor_issqn=Decimal(str(resultado["issqn"])),
        valor_retido_terceiros=calculo.valor_retido_terceiros,
        valor_a_recolher=valor_a_recolher
    )


@router.post("/issqn/declaracoes", response_model=ISSQNDeclaracaoResponse, status_code=status.HTTP_201_CREATED)
async def criar_declaracao_issqn(
    declaracao: ISSQNDeclaracaoCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Cria uma declaração de ISSQN
    """
    # TODO: Implementar criação de declaração
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint em desenvolvimento"
    )


@router.get("/issqn/declaracoes", response_model=List[ISSQNDeclaracaoResponse])
async def listar_declaracoes_issqn(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estabelecimento_id: UUID = Query(default=None),
    ano_competencia: int = Query(default=None),
    mes_competencia: int = Query(default=None),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista declarações de ISSQN com filtros
    """
    # TODO: Implementar listagem
    return []


@router.post("/issqn/retencoes", response_model=ISSQNRetencaoResponse, status_code=status.HTTP_201_CREATED)
async def registrar_retencao_issqn(
    retencao: ISSQNRetencaoCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Registra uma retenção de ISSQN na fonte
    """
    # TODO: Implementar registro de retenção
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint em desenvolvimento"
    )


# =====================================================
# ISENÇÕES
# =====================================================

@router.post("/isencoes", response_model=IsencaoResponse, status_code=status.HTTP_201_CREATED)
async def criar_isencao(
    isencao: IsencaoCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN", "FISCAL"]))
):
    """
    Cria uma solicitação de isenção tributária
    """
    # TODO: Implementar criação de isenção
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint em desenvolvimento"
    )


@router.get("/isencoes", response_model=List[IsencaoResponse])
async def listar_isencoes(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    tipo_tributo: str = Query(default=None),
    ativa: bool = Query(default=None),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista isenções com filtros
    """
    # TODO: Implementar listagem
    return []


@router.get("/isencoes/{isencao_id}", response_model=IsencaoResponse)
async def obter_isencao(
    isencao_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Obtém detalhes de uma isenção
    """
    # TODO: Implementar busca
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint em desenvolvimento"
    )


@router.put("/isencoes/{isencao_id}/aprovar", response_model=IsencaoResponse)
async def aprovar_isencao(
    isencao_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN", "FISCAL"]))
):
    """
    Aprova uma isenção tributária
    """
    # TODO: Implementar aprovação
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint em desenvolvimento"
    )


@router.put("/isencoes/{isencao_id}/cancelar", response_model=IsencaoResponse)
async def cancelar_isencao(
    isencao_id: UUID,
    motivo: str,
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN", "FISCAL"]))
):
    """
    Cancela uma isenção tributária
    """
    # TODO: Implementar cancelamento
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint em desenvolvimento"
    )


# =====================================================
# PLANTA GENÉRICA DE VALORES (PGV)
# =====================================================

@router.post("/pgv", response_model=PlantaGenericaValorResponse, status_code=status.HTTP_201_CREATED)
async def criar_pgv(
    pgv: PlantaGenericaValorCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN", "FISCAL"]))
):
    """
    Cria um registro de Planta Genérica de Valores
    """
    # TODO: Implementar criação de PGV
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint em desenvolvimento"
    )


@router.get("/pgv", response_model=List[PlantaGenericaValorResponse])
async def listar_pgv(
    ano_vigencia: int = Query(..., description="Ano de vigência"),
    setor_fiscal_id: int = Query(default=None),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista valores da Planta Genérica de Valores
    """
    # TODO: Implementar listagem
    return []


# =====================================================
# TABELA DE PREÇO DE CONSTRUÇÃO (TPC)
# =====================================================

@router.post("/tpc", response_model=TabelaPrecoConstrucaoResponse, status_code=status.HTTP_201_CREATED)
async def criar_tpc(
    tpc: TabelaPrecoConstrucaoCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN", "FISCAL"]))
):
    """
    Cria um registro de Tabela de Preço de Construção
    """
    # TODO: Implementar criação de TPC
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint em desenvolvimento"
    )


@router.get("/tpc", response_model=List[TabelaPrecoConstrucaoResponse])
async def listar_tpc(
    ano_vigencia: int = Query(..., description="Ano de vigência"),
    mes_vigencia: int = Query(default=None),
    padrao_construtivo: str = Query(default=None),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista valores da Tabela de Preço de Construção
    """
    # TODO: Implementar listagem
    return []


# =====================================================
# ALÍQUOTAS
# =====================================================

@router.post("/aliquotas", response_model=AliquotaResponse, status_code=status.HTTP_201_CREATED)
async def criar_aliquota(
    aliquota: AliquotaCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN"]))
):
    """
    Cria uma alíquota tributária
    """
    # TODO: Implementar criação de alíquota
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint em desenvolvimento"
    )


@router.get("/aliquotas", response_model=List[AliquotaResponse])
async def listar_aliquotas(
    tipo_tributo: str = Query(..., description="Tipo de tributo"),
    ano_vigencia: int = Query(..., description="Ano de vigência"),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista alíquotas por tributo e vigência
    """
    # TODO: Implementar listagem
    return []
