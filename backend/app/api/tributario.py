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
    from app.services.lancamento_service import IPTULancamentoService

    service = IPTULancamentoService(db)
    lancamento_criado = service.lancar_iptu(
        imovel_id=lancamento.imovel_id,
        ano_exercicio=lancamento.ano_exercicio,
        numero_parcelas=lancamento.numero_parcelas or 10,
        pagamento_unico=lancamento.pagamento_unico or False,
        iptu_digital=lancamento.iptu_digital or False
    )

    return lancamento_criado


@router.post("/iptu/lançamento-em-lote/{ano_exercicio}", response_model=ResponseBase)
async def lancar_iptu_em_lote(
    ano_exercicio: int,
    setor_fiscal_id: int = Query(default=None, description="Filtrar por setor fiscal"),
    limite: int = Query(default=1000, le=5000, description="Limite de imóveis por vez"),
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN", "FISCAL"]))
):
    """
    Realiza o lançamento de IPTU em lote para um exercício
    Pode filtrar por setor fiscal
    """
    from app.services.lancamento_service import IPTULancamentoService

    service = IPTULancamentoService(db)
    resultado = service.lancar_iptu_em_lote(
        ano_exercicio=ano_exercicio,
        setor_fiscal_id=setor_fiscal_id,
        limite=limite
    )

    return ResponseBase(
        sucesso=True,
        mensagem=f"Lançamento em lote concluído. Processados: {resultado['total_processado']}, Sucessos: {resultado['sucessos']}, Erros: {resultado['erros']}",
        dados=resultado
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
    from app.services.lancamento_service import IPTULancamentoService

    service = IPTULancamentoService(db)
    lancamentos = service.listar_lancamentos(
        ano_exercicio=ano_exercicio,
        skip=skip,
        limit=limit,
        status=status
    )

    return lancamentos


@router.get("/iptu/lancamentos/{lancamento_id}", response_model=IPTULancamentoResponse)
async def obter_lancamento_iptu(
    lancamento_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Obtém detalhes de um lançamento de IPTU
    """
    from app.services.lancamento_service import IPTULancamentoService

    service = IPTULancamentoService(db)
    lancamento = service.obter_lancamento_por_id(lancamento_id)

    return lancamento


@router.get("/iptu/lancamentos/{lancamento_id}/parcelas", response_model=List[IPTUParcelaResponse])
async def listar_parcelas_iptu(
    lancamento_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista parcelas de um lançamento de IPTU
    """
    from app.services.lancamento_service import IPTULancamentoService

    service = IPTULancamentoService(db)
    parcelas = service.obter_parcelas(lancamento_id)

    return parcelas


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
@router.post("/itbi/emitir-guia", response_model=ITBIGuiaResponse, status_code=status.HTTP_201_CREATED)
async def emitir_guia_itbi(
    guia: ITBIGuiaCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Emite uma guia de ITBI para transmissão imobiliária
    """
    from app.models.tributario import ITBIGuia, StatusLancamento
    from app.services.calculo_tributario import CalculadoraITBI
    from app.services.cadastro_service import ImovelService
    from app.utils.generators import gerar_numero_lancamento
    from datetime import datetime, timedelta
    from decimal import Decimal

    # Buscar valor venal do imóvel
    imovel_service = ImovelService(db)
    imovel = imovel_service.obter_por_id(guia.imovel_id)

    # Buscar valor venal do último IPTU lançado para o imóvel
    from app.models.tributario import IPTULancamento

    ultimo_iptu = db.query(IPTULancamento).filter(
        IPTULancamento.imovel_id == guia.imovel_id
    ).order_by(
        IPTULancamento.ano_exercicio.desc(),
        IPTULancamento.data_lancamento.desc()
    ).first()

    if ultimo_iptu:
        # Usar valor venal do último IPTU lançado
        valor_venal = ultimo_iptu.valor_venal_total
    else:
        # Fallback: Se não houver IPTU lançado, usar o valor declarado como referência
        # Isso evita bloqueio da transação e permite que o fiscal arbitre depois se necessário
        valor_venal = guia.valor_declarado

    # Calcular ITBI
    calculadora = CalculadoraITBI()
    resultado = calculadora.calcular(
        valor_declarado=guia.valor_declarado,
        valor_venal=valor_venal,
        valor_financiado_sfh=guia.valor_financiado_sfh
    )

    # Gerar número da guia
    numero_guia = gerar_numero_lancamento(datetime.now().year, "ITBI")

    # Calcular data de vencimento (30 dias)
    data_vencimento = datetime.now().date() + timedelta(days=30)

    # Criar registro da guia
    nova_guia = ITBIGuia(
        numero_guia=numero_guia,
        data_emissao=datetime.now().date(),
        imovel_id=guia.imovel_id,
        transmitente_id=guia.transmitente_id,
        adquirente_id=guia.adquirente_id,
        tipo_transmissao=guia.tipo_transmissao,
        valor_declarado=guia.valor_declarado,
        valor_venal=valor_venal,
        valor_base_calculo=Decimal(str(resultado["base_calculo"])),
        valor_financiado_sfh=guia.valor_financiado_sfh,
        valor_nao_financiado=Decimal(str(resultado["valor_nao_financiado"])),
        aliquota_sfh=Decimal(str(resultado["aliquota_sfh"])),
        aliquota_normal=Decimal(str(resultado["aliquota_normal"])),
        valor_itbi_sfh=Decimal(str(resultado["itbi_sfh"])),
        valor_itbi_normal=Decimal(str(resultado["itbi_normal"])),
        valor_itbi_total=Decimal(str(resultado["itbi_total"])),
        valor_liquido=Decimal(str(resultado["itbi_total"])),
        data_vencimento=data_vencimento,
        pago=False,
        status=StatusLancamento.LANCADO
    )

    db.add(nova_guia)
    db.commit()
    db.refresh(nova_guia)

    return nova_guia


@router.get("/itbi/guias")
async def listar_guias_itbi(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    imovel_id: UUID = Query(default=None),
    pago: bool = Query(default=None),
    ano_emissao: int = Query(default=None),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista guias de ITBI com filtros e paginação
    """
    from app.models.tributario import ITBIGuia
    from app.schemas.base import criar_resposta_paginada
    from sqlalchemy import extract

    # Construir query com filtros
    query = db.query(ITBIGuia)

    if imovel_id:
        query = query.filter(ITBIGuia.imovel_id == imovel_id)

    if pago is not None:
        query = query.filter(ITBIGuia.pago == pago)

    if ano_emissao:
        query = query.filter(extract('year', ITBIGuia.data_emissao) == ano_emissao)

    # Ordenar por data de emissão (mais recentes primeiro)
    query = query.order_by(ITBIGuia.data_emissao.desc())

    # Contar total
    total = query.count()

    # Aplicar paginação
    guias = query.offset(skip).limit(limit).all()

    # Retornar resposta paginada
    pagina = (skip // limit) + 1 if limit > 0 else 1
    return criar_resposta_paginada(dados=guias, total=total, pagina=pagina, limite=limit)


@router.get("/itbi/guias/{guia_id}", response_model=ITBIGuiaResponse)
async def obter_guia_itbi(
    guia_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Obtém detalhes de uma guia de ITBI
    """
    from app.models.tributario import ITBIGuia

    guia = db.query(ITBIGuia).filter(ITBIGuia.id == guia_id).first()

    if not guia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guia de ITBI não encontrada"
        )

    return guia


@router.put("/itbi/guias/{guia_id}/registrar-pagamento", response_model=ITBIGuiaResponse)
async def registrar_pagamento_itbi(
    guia_id: UUID,
    valor_pago: Decimal = Query(..., description="Valor pago"),
    data_pagamento: date = Query(..., description="Data do pagamento"),
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN", "FISCAL", "ARRECADACAO"]))
):
    """
    Registra o pagamento de uma guia de ITBI
    """
    from app.models.tributario import ITBIGuia, StatusLancamento
    from datetime import date as date_type

    guia = db.query(ITBIGuia).filter(ITBIGuia.id == guia_id).first()

    if not guia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guia de ITBI não encontrada"
        )

    if guia.pago:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Guia já foi paga anteriormente"
        )

    # Registrar pagamento
    guia.pago = True
    guia.data_pagamento = data_pagamento
    guia.valor_pago = valor_pago
    guia.status = StatusLancamento.PAGO

    db.commit()
    db.refresh(guia)

    return guia


@router.get("/itbi/guias/{guia_id}/pdf")
async def gerar_pdf_itbi(
    guia_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Gera PDF da guia de ITBI
    """
    from app.models.tributario import ITBIGuia
    from app.services.pdf_service import PDFService
    from fastapi.responses import StreamingResponse

    guia = db.query(ITBIGuia).filter(ITBIGuia.id == guia_id).first()

    if not guia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guia de ITBI não encontrada"
        )

    # Buscar dados relacionados
    imovel = guia.imovel
    transmitente = guia.transmitente if hasattr(guia, 'transmitente') else None
    adquirente = guia.adquirente if hasattr(guia, 'adquirente') else None

    pdf_service = PDFService()

    try:
        pdf_buffer = pdf_service.gerar_guia_itbi(
            numero_guia=guia.numero_guia,
            data_emissao=guia.data_emissao,
            valor_itbi=guia.valor_itbi_total,
            valor_liquido=guia.valor_liquido,
            data_vencimento=guia.data_vencimento,
            tipo_transmissao=guia.tipo_transmissao,
            imovel_inscricao=imovel.inscricao_imobiliaria if imovel else "N/A",
            transmitente_nome=transmitente.nome_razao_social if transmitente else "N/A",
            transmitente_doc=transmitente.cpf or transmitente.cnpj if transmitente else "N/A",
            adquirente_nome=adquirente.nome_razao_social if adquirente else "N/A",
            adquirente_doc=adquirente.cpf or adquirente.cnpj if adquirente else "N/A",
            valor_declarado=guia.valor_declarado,
            valor_venal=guia.valor_venal,
            aliquota_normal=guia.aliquota_normal,
            aliquota_sfh=guia.aliquota_sfh if guia.valor_financiado_sfh > 0 else None,
            valor_financiado_sfh=guia.valor_financiado_sfh if guia.valor_financiado_sfh > 0 else None,
        )

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"inline; filename=guia_itbi_{guia.numero_guia}.pdf"
            }
        )
    except ImportError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
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
@router.post("/issqn/declarar", response_model=ISSQNDeclaracaoResponse, status_code=status.HTTP_201_CREATED)
async def criar_declaracao_issqn(
    declaracao: ISSQNDeclaracaoCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Cria uma declaração de ISSQN para um estabelecimento
    """
    from app.models.tributario import ISSQNDeclaracao, StatusLancamento
    from app.services.calculo_tributario import CalculadoraISSQN
    from app.services.cadastro_service import EstabelecimentoService
    from app.utils.generators import gerar_numero_lancamento
    from app.core.config import settings
    from datetime import datetime, timedelta
    from decimal import Decimal

    # Verificar se já existe declaração para o período
    declaracao_existente = db.query(ISSQNDeclaracao).filter(
        ISSQNDeclaracao.estabelecimento_id == declaracao.estabelecimento_id,
        ISSQNDeclaracao.mes_competencia == declaracao.mes_competencia,
        ISSQNDeclaracao.ano_competencia == declaracao.ano_competencia
    ).first()

    if declaracao_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma declaração para este período"
        )

    # Buscar estabelecimento
    estab_service = EstabelecimentoService(db)
    estabelecimento = estab_service.obter_por_id(declaracao.estabelecimento_id)

    # Calcular ISSQN baseado no regime
    calculadora = CalculadoraISSQN(valor_ufm=Decimal(str(settings.UFM_VALOR)))

    if declaracao.regime_tributacao == "VARIAVEL":
        # Regime normal (variável sobre receita)
        resultado = calculadora.calcular_regime_normal(
            receita_bruta=declaracao.receita_bruta_total,
            deducoes_permitidas=declaracao.deducoes_materiais + declaracao.outras_deducoes
        )
        base_calculo = Decimal(str(resultado["base_calculo"]))
        aliquota = Decimal(str(resultado["aliquota"]))
        valor_issqn = Decimal(str(resultado["issqn"]))

    elif declaracao.regime_tributacao == "FIXO":
        # Regime fixo (valor em UFM)
        if not declaracao.valor_fixo_ufm:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor fixo UFM é obrigatório para regime fixo"
            )
        resultado = calculadora.calcular_regime_fixo(declaracao.valor_fixo_ufm)
        base_calculo = Decimal("0.00")
        aliquota = Decimal("0.0000")
        valor_issqn = Decimal(str(resultado["issqn"]))

    elif declaracao.regime_tributacao == "SOCIEDADE_PROFISSIONAIS":
        # Sociedade de profissionais
        if not declaracao.quantidade_profissionais:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantidade de profissionais é obrigatória"
            )
        resultado = calculadora.calcular_sociedade_profissionais(
            declaracao.quantidade_profissionais
        )
        base_calculo = Decimal("0.00")
        aliquota = Decimal("0.0000")
        valor_issqn = Decimal(str(resultado["issqn"]))

    else:  # ESTIMATIVA
        # Usar cálculo normal como base
        resultado = calculadora.calcular_regime_normal(
            receita_bruta=declaracao.receita_bruta_total,
            deducoes_permitidas=declaracao.deducoes_materiais + declaracao.outras_deducoes
        )
        base_calculo = Decimal(str(resultado["base_calculo"]))
        aliquota = Decimal(str(resultado["aliquota"]))
        valor_issqn = Decimal(str(resultado["issqn"]))

    # Calcular valor a recolher
    valor_a_recolher = valor_issqn - declaracao.valor_retido_terceiros

    # Gerar número da declaração
    numero_declaracao = gerar_numero_lancamento(declaracao.ano_competencia, "ISSQN")

    # Calcular data de vencimento (dia 10 do mês seguinte)
    if declaracao.mes_competencia == 12:
        mes_vencimento = 1
        ano_vencimento = declaracao.ano_competencia + 1
    else:
        mes_vencimento = declaracao.mes_competencia + 1
        ano_vencimento = declaracao.ano_competencia

    data_vencimento = datetime(ano_vencimento, mes_vencimento, 10).date()

    # Criar declaração
    nova_declaracao = ISSQNDeclaracao(
        numero_declaracao=numero_declaracao,
        estabelecimento_id=declaracao.estabelecimento_id,
        mes_competencia=declaracao.mes_competencia,
        ano_competencia=declaracao.ano_competencia,
        data_declaracao=datetime.now().date(),
        regime_tributacao=declaracao.regime_tributacao,
        receita_bruta_total=declaracao.receita_bruta_total,
        deducoes_materiais=declaracao.deducoes_materiais,
        outras_deducoes=declaracao.outras_deducoes,
        base_calculo=base_calculo,
        aliquota=aliquota,
        valor_issqn=valor_issqn,
        valor_retido_terceiros=declaracao.valor_retido_terceiros,
        valor_a_recolher=valor_a_recolher,
        valor_fixo_ufm=declaracao.valor_fixo_ufm,
        quantidade_profissionais=declaracao.quantidade_profissionais,
        data_vencimento=data_vencimento,
        pago=False,
        status=StatusLancamento.LANCADO
    )

    db.add(nova_declaracao)
    db.commit()
    db.refresh(nova_declaracao)

    return nova_declaracao


@router.get("/issqn/declaracoes")
async def listar_declaracoes_issqn(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estabelecimento_id: UUID = Query(default=None),
    ano_competencia: int = Query(default=None),
    mes_competencia: int = Query(default=None),
    pago: bool = Query(default=None),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista declarações de ISSQN com filtros e paginação
    """
    from app.models.tributario import ISSQNDeclaracao
    from app.schemas.base import criar_resposta_paginada

    # Construir query com filtros
    query = db.query(ISSQNDeclaracao)

    if estabelecimento_id:
        query = query.filter(ISSQNDeclaracao.estabelecimento_id == estabelecimento_id)

    if ano_competencia:
        query = query.filter(ISSQNDeclaracao.ano_competencia == ano_competencia)

    if mes_competencia:
        query = query.filter(ISSQNDeclaracao.mes_competencia == mes_competencia)

    if pago is not None:
        query = query.filter(ISSQNDeclaracao.pago == pago)

    # Ordenar por competência (mais recentes primeiro)
    query = query.order_by(
        ISSQNDeclaracao.ano_competencia.desc(),
        ISSQNDeclaracao.mes_competencia.desc()
    )

    # Contar total
    total = query.count()

    # Aplicar paginação
    declaracoes = query.offset(skip).limit(limit).all()

    # Retornar resposta paginada
    pagina = (skip // limit) + 1 if limit > 0 else 1
    return criar_resposta_paginada(dados=declaracoes, total=total, pagina=pagina, limite=limit)


@router.put("/issqn/declaracoes/{declaracao_id}/registrar-pagamento", response_model=ISSQNDeclaracaoResponse)
async def registrar_pagamento_issqn(
    declaracao_id: UUID,
    valor_pago: Decimal = Query(..., description="Valor pago"),
    data_pagamento: date = Query(..., description="Data do pagamento"),
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN", "FISCAL", "ARRECADACAO"]))
):
    """
    Registra o pagamento de uma declaração de ISSQN
    """
    from app.models.tributario import ISSQNDeclaracao, StatusLancamento

    declaracao = db.query(ISSQNDeclaracao).filter(ISSQNDeclaracao.id == declaracao_id).first()

    if not declaracao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Declaração de ISSQN não encontrada"
        )

    if declaracao.pago:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Declaração já foi paga anteriormente"
        )

    # Registrar pagamento
    declaracao.pago = True
    declaracao.data_pagamento = data_pagamento
    declaracao.valor_pago = valor_pago
    declaracao.status = StatusLancamento.PAGO

    db.commit()
    db.refresh(declaracao)

    return declaracao


@router.get("/issqn/declaracoes/{declaracao_id}/pdf")
async def gerar_pdf_issqn(
    declaracao_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Gera PDF do DAM (Documento de Arrecadação Municipal) para ISSQN
    """
    from app.models.tributario import ISSQNDeclaracao
    from app.services.pdf_service import PDFService
    from fastapi.responses import StreamingResponse

    declaracao = db.query(ISSQNDeclaracao).filter(ISSQNDeclaracao.id == declaracao_id).first()

    if not declaracao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Declaração de ISSQN não encontrada"
        )

    # Buscar dados relacionados
    estabelecimento = declaracao.estabelecimento if hasattr(declaracao, 'estabelecimento') else None

    pdf_service = PDFService()

    try:
        pdf_buffer = pdf_service.gerar_dam_issqn(
            numero_declaracao=declaracao.numero_declaracao,
            estabelecimento_nome=estabelecimento.nome_fantasia or estabelecimento.razao_social if estabelecimento else "N/A",
            estabelecimento_ccm=estabelecimento.inscricao_municipal if estabelecimento else "N/A",
            mes_competencia=declaracao.mes_competencia,
            ano_competencia=declaracao.ano_competencia,
            receita_bruta=declaracao.receita_bruta_total,
            deducoes=declaracao.deducoes_materiais + declaracao.outras_deducoes,
            base_calculo=declaracao.base_calculo,
            aliquota=declaracao.aliquota,
            valor_issqn=declaracao.valor_issqn,
            valor_retido=declaracao.valor_retido_terceiros,
            valor_a_recolher=declaracao.valor_a_recolher,
            data_vencimento=declaracao.data_vencimento,
        )

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"inline; filename=dam_issqn_{declaracao.numero_declaracao}.pdf"
            }
        )
    except ImportError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


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
# RELATÓRIOS
# =====================================================

@router.get("/relatorios/arrecadacao")
async def relatorio_arrecadacao(
    tipo_tributo: str = Query(..., description="IPTU, ITBI ou ISSQN"),
    ano: int = Query(..., description="Ano de referência"),
    mes_inicio: int = Query(default=1, ge=1, le=12),
    mes_fim: int = Query(default=12, ge=1, le=12),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Relatório de arrecadação por tributo e período
    """
    from app.models.tributario import ITBIGuia, ISSQNDeclaracao, StatusLancamento
    from app.models.tributario import IPTULancamento
    from sqlalchemy import func, extract
    from decimal import Decimal

    resultado = {
        "tipo_tributo": tipo_tributo,
        "ano": ano,
        "periodo": f"{mes_inicio:02d}/{ano} a {mes_fim:02d}/{ano}",
        "total_lancado": Decimal("0.00"),
        "total_pago": Decimal("0.00"),
        "total_pendente": Decimal("0.00"),
        "quantidade_lancamentos": 0,
        "quantidade_pagos": 0,
        "quantidade_pendentes": 0,
        "por_mes": []
    }

    if tipo_tributo == "ITBI":
        # Arrecadação de ITBI
        query = db.query(ITBIGuia).filter(
            extract('year', ITBIGuia.data_emissao) == ano,
            extract('month', ITBIGuia.data_emissao) >= mes_inicio,
            extract('month', ITBIGuia.data_emissao) <= mes_fim
        )

        total_lancado = query.with_entities(func.sum(ITBIGuia.valor_liquido)).scalar() or Decimal("0.00")
        total_pago = query.filter(ITBIGuia.pago == True).with_entities(func.sum(ITBIGuia.valor_pago)).scalar() or Decimal("0.00")

        resultado["total_lancado"] = total_lancado
        resultado["total_pago"] = total_pago
        resultado["total_pendente"] = total_lancado - total_pago
        resultado["quantidade_lancamentos"] = query.count()
        resultado["quantidade_pagos"] = query.filter(ITBIGuia.pago == True).count()
        resultado["quantidade_pendentes"] = query.filter(ITBIGuia.pago == False).count()

        # Arrecadação por mês
        for mes in range(mes_inicio, mes_fim + 1):
            mes_query = query.filter(extract('month', ITBIGuia.data_emissao) == mes)
            mes_lancado = mes_query.with_entities(func.sum(ITBIGuia.valor_liquido)).scalar() or Decimal("0.00")
            mes_pago = mes_query.filter(ITBIGuia.pago == True).with_entities(func.sum(ITBIGuia.valor_pago)).scalar() or Decimal("0.00")

            resultado["por_mes"].append({
                "mes": mes,
                "mes_nome": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][mes-1],
                "total_lancado": float(mes_lancado),
                "total_pago": float(mes_pago),
                "quantidade": mes_query.count()
            })

    elif tipo_tributo == "ISSQN":
        # Arrecadação de ISSQN
        query = db.query(ISSQNDeclaracao).filter(
            ISSQNDeclaracao.ano_competencia == ano,
            ISSQNDeclaracao.mes_competencia >= mes_inicio,
            ISSQNDeclaracao.mes_competencia <= mes_fim
        )

        total_lancado = query.with_entities(func.sum(ISSQNDeclaracao.valor_a_recolher)).scalar() or Decimal("0.00")
        total_pago = query.filter(ISSQNDeclaracao.pago == True).with_entities(func.sum(ISSQNDeclaracao.valor_pago)).scalar() or Decimal("0.00")

        resultado["total_lancado"] = total_lancado
        resultado["total_pago"] = total_pago
        resultado["total_pendente"] = total_lancado - total_pago
        resultado["quantidade_lancamentos"] = query.count()
        resultado["quantidade_pagos"] = query.filter(ISSQNDeclaracao.pago == True).count()
        resultado["quantidade_pendentes"] = query.filter(ISSQNDeclaracao.pago == False).count()

        # Arrecadação por mês
        for mes in range(mes_inicio, mes_fim + 1):
            mes_query = query.filter(ISSQNDeclaracao.mes_competencia == mes)
            mes_lancado = mes_query.with_entities(func.sum(ISSQNDeclaracao.valor_a_recolher)).scalar() or Decimal("0.00")
            mes_pago = mes_query.filter(ISSQNDeclaracao.pago == True).with_entities(func.sum(ISSQNDeclaracao.valor_pago)).scalar() or Decimal("0.00")

            resultado["por_mes"].append({
                "mes": mes,
                "mes_nome": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][mes-1],
                "total_lancado": float(mes_lancado),
                "total_pago": float(mes_pago),
                "quantidade": mes_query.count()
            })

    return resultado


@router.get("/relatorios/inadimplencia")
async def relatorio_inadimplencia(
    tipo_tributo: str = Query(..., description="IPTU, ITBI ou ISSQN"),
    ano: int = Query(default=None),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Relatório de inadimplência por tributo
    """
    from app.models.tributario import ITBIGuia, ISSQNDeclaracao
    from sqlalchemy import func
    from decimal import Decimal
    from datetime import datetime

    resultado = {
        "tipo_tributo": tipo_tributo,
        "ano": ano,
        "total_inadimplente": Decimal("0.00"),
        "quantidade_inadimplente": 0,
        "vencidas": [],
        "resumo": {
            "ate_30_dias": {"quantidade": 0, "valor": Decimal("0.00")},
            "31_a_60_dias": {"quantidade": 0, "valor": Decimal("0.00")},
            "61_a_90_dias": {"quantidade": 0, "valor": Decimal("0.00")},
            "acima_90_dias": {"quantidade": 0, "valor": Decimal("0.00")}
        }
    }

    hoje = datetime.now().date()

    if tipo_tributo == "ITBI":
        query = db.query(ITBIGuia).filter(
            ITBIGuia.pago == False,
            ITBIGuia.data_vencimento < hoje
        )

        if ano:
            query = query.filter(extract('year', ITBIGuia.data_emissao) == ano)

        total = query.with_entities(func.sum(ITBIGuia.valor_liquido)).scalar() or Decimal("0.00")
        quantidade = query.count()

        resultado["total_inadimplente"] = total
        resultado["quantidade_inadimplente"] = quantidade

        # Classificar por dias de atraso
        for guia in query.all():
            dias_atraso = (hoje - guia.data_vencimento).days
            valor = guia.valor_liquido

            if dias_atraso <= 30:
                resultado["resumo"]["ate_30_dias"]["quantidade"] += 1
                resultado["resumo"]["ate_30_dias"]["valor"] += valor
            elif dias_atraso <= 60:
                resultado["resumo"]["31_a_60_dias"]["quantidade"] += 1
                resultado["resumo"]["31_a_60_dias"]["valor"] += valor
            elif dias_atraso <= 90:
                resultado["resumo"]["61_a_90_dias"]["quantidade"] += 1
                resultado["resumo"]["61_a_90_dias"]["valor"] += valor
            else:
                resultado["resumo"]["acima_90_dias"]["quantidade"] += 1
                resultado["resumo"]["acima_90_dias"]["valor"] += valor

    elif tipo_tributo == "ISSQN":
        query = db.query(ISSQNDeclaracao).filter(
            ISSQNDeclaracao.pago == False,
            ISSQNDeclaracao.data_vencimento < hoje
        )

        if ano:
            query = query.filter(ISSQNDeclaracao.ano_competencia == ano)

        total = query.with_entities(func.sum(ISSQNDeclaracao.valor_a_recolher)).scalar() or Decimal("0.00")
        quantidade = query.count()

        resultado["total_inadimplente"] = total
        resultado["quantidade_inadimplente"] = quantidade

        # Classificar por dias de atraso
        for declaracao in query.all():
            dias_atraso = (hoje - declaracao.data_vencimento).days
            valor = declaracao.valor_a_recolher

            if dias_atraso <= 30:
                resultado["resumo"]["ate_30_dias"]["quantidade"] += 1
                resultado["resumo"]["ate_30_dias"]["valor"] += valor
            elif dias_atraso <= 60:
                resultado["resumo"]["31_a_60_dias"]["quantidade"] += 1
                resultado["resumo"]["31_a_60_dias"]["valor"] += valor
            elif dias_atraso <= 90:
                resultado["resumo"]["61_a_90_dias"]["quantidade"] += 1
                resultado["resumo"]["61_a_90_dias"]["valor"] += valor
            else:
                resultado["resumo"]["acima_90_dias"]["quantidade"] += 1
                resultado["resumo"]["acima_90_dias"]["valor"] += valor

    # Converter Decimals para float para JSON
    resultado["total_inadimplente"] = float(resultado["total_inadimplente"])
    for faixa in resultado["resumo"].values():
        faixa["valor"] = float(faixa["valor"])

    return resultado


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

    Requer permissão ADMIN ou FISCAL
    """
    from app.models.tributario import Isencao, TipoTributo, TipoIsencao
    from app.models.cadastro import Pessoa, Imovel, Estabelecimento

    # Validar beneficiário
    beneficiario = db.query(Pessoa).filter(Pessoa.id == isencao.beneficiario_id).first()
    if not beneficiario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beneficiário não encontrado"
        )

    # Validar imóvel se IPTU ou ITBI
    if isencao.tipo_tributo in ["IPTU", "ITBI"]:
        if not isencao.imovel_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Imóvel é obrigatório para isenções de IPTU/ITBI"
            )
        imovel = db.query(Imovel).filter(Imovel.id == isencao.imovel_id).first()
        if not imovel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Imóvel não encontrado"
            )

    # Validar estabelecimento se ISSQN
    if isencao.tipo_tributo == "ISSQN":
        if not isencao.estabelecimento_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Estabelecimento é obrigatório para isenções de ISSQN"
            )
        estabelecimento = db.query(Estabelecimento).filter(
            Estabelecimento.id == isencao.estabelecimento_id
        ).first()
        if not estabelecimento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estabelecimento não encontrado"
            )

    # Gerar número do processo
    import datetime
    ano_atual = datetime.datetime.now().year
    count = db.query(Isencao).filter(
        Isencao.numero_processo.like(f"ISEN-{ano_atual}%")
    ).count()
    numero_processo = f"ISEN-{ano_atual}-{count + 1:05d}"

    # Criar isenção
    nova_isencao = Isencao(
        numero_processo=numero_processo,
        beneficiario_id=isencao.beneficiario_id,
        tipo_tributo=TipoTributo(isencao.tipo_tributo),
        tipo_isencao=TipoIsencao(isencao.tipo_isencao),
        percentual_isencao=isencao.percentual_isencao,
        fundamento_legal=isencao.fundamento_legal,
        artigo_lei=isencao.artigo_lei,
        motivo=isencao.motivo,
        descricao_motivo=isencao.descricao_motivo,
        data_inicio=isencao.data_inicio,
        data_fim=isencao.data_fim,
        imovel_id=isencao.imovel_id,
        estabelecimento_id=isencao.estabelecimento_id,
        data_solicitacao=date.today(),
        ativa=False,  # Inicia inativa, precisa de aprovação
        documentos_anexos=isencao.documentos_anexos
    )

    db.add(nova_isencao)
    db.commit()
    db.refresh(nova_isencao)

    return nova_isencao


@router.get("/isencoes")
async def listar_isencoes(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    tipo_tributo: str = Query(default=None),
    ativa: bool = Query(default=None),
    beneficiario_id: UUID = Query(default=None),
    imovel_id: UUID = Query(default=None),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista isenções com filtros e paginação

    Filtros disponíveis:
    - tipo_tributo: IPTU, ITBI, ISSQN
    - ativa: true/false
    - beneficiario_id: ID do beneficiário
    - imovel_id: ID do imóvel
    """
    from app.models.tributario import Isencao
    from app.schemas.base import criar_resposta_paginada

    query = db.query(Isencao)

    # Aplicar filtros
    if tipo_tributo:
        query = query.filter(Isencao.tipo_tributo == tipo_tributo)
    if ativa is not None:
        query = query.filter(Isencao.ativa == ativa)
    if beneficiario_id:
        query = query.filter(Isencao.beneficiario_id == beneficiario_id)
    if imovel_id:
        query = query.filter(Isencao.imovel_id == imovel_id)

    # Ordenar por data de solicitação (mais recentes primeiro)
    query = query.order_by(Isencao.data_solicitacao.desc())

    # Contar total
    total = query.count()

    # Paginar
    isencoes = query.offset(skip).limit(limit).all()

    # Calcular página
    pagina = (skip // limit) + 1 if limit > 0 else 1

    return criar_resposta_paginada(dados=isencoes, total=total, pagina=pagina, limite=limit)


@router.get("/isencoes/{isencao_id}", response_model=IsencaoResponse)
async def obter_isencao(
    isencao_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Obtém detalhes de uma isenção específica
    """
    from app.models.tributario import Isencao

    isencao = db.query(Isencao).filter(Isencao.id == isencao_id).first()
    if not isencao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Isenção não encontrada"
        )

    return isencao


@router.put("/isencoes/{isencao_id}/aprovar", response_model=IsencaoResponse)
async def aprovar_isencao(
    isencao_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN", "FISCAL"]))
):
    """
    Aprova uma isenção tributária

    Requer permissão ADMIN ou FISCAL
    """
    from app.models.tributario import Isencao

    isencao = db.query(Isencao).filter(Isencao.id == isencao_id).first()
    if not isencao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Isenção não encontrada"
        )

    if isencao.ativa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Isenção já está ativa"
        )

    # Aprovar isenção
    isencao.ativa = True
    isencao.data_aprovacao = date.today()
    isencao.aprovado_por_id = usuario["id"]

    db.commit()
    db.refresh(isencao)

    return isencao


@router.put("/isencoes/{isencao_id}/cancelar", response_model=IsencaoResponse)
async def cancelar_isencao(
    isencao_id: UUID,
    motivo: str = Query(..., description="Motivo do cancelamento"),
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN", "FISCAL"]))
):
    """
    Cancela uma isenção tributária

    Requer permissão ADMIN ou FISCAL
    """
    from app.models.tributario import Isencao

    isencao = db.query(Isencao).filter(Isencao.id == isencao_id).first()
    if not isencao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Isenção não encontrada"
        )

    if not isencao.ativa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Isenção já está inativa"
        )

    # Cancelar isenção
    isencao.ativa = False
    isencao.data_cancelamento = date.today()
    isencao.motivo_cancelamento = motivo

    db.commit()
    db.refresh(isencao)

    return isencao


@router.put("/isencoes/{isencao_id}", response_model=IsencaoResponse)
async def atualizar_isencao(
    isencao_id: UUID,
    atualizacao: IsencaoUpdate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN", "FISCAL"]))
):
    """
    Atualiza dados de uma isenção

    Permite atualizar:
    - data_fim: Data de fim da isenção
    - ativa: Status da isenção
    - motivo_cancelamento: Motivo do cancelamento

    Requer permissão ADMIN ou FISCAL
    """
    from app.models.tributario import Isencao

    isencao = db.query(Isencao).filter(Isencao.id == isencao_id).first()
    if not isencao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Isenção não encontrada"
        )

    # Aplicar atualizações
    if atualizacao.data_fim is not None:
        isencao.data_fim = atualizacao.data_fim

    if atualizacao.ativa is not None:
        isencao.ativa = atualizacao.ativa
        if not atualizacao.ativa and not isencao.data_cancelamento:
            isencao.data_cancelamento = date.today()

    if atualizacao.motivo_cancelamento is not None:
        isencao.motivo_cancelamento = atualizacao.motivo_cancelamento

    db.commit()
    db.refresh(isencao)

    return isencao


@router.delete("/isencoes/{isencao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def excluir_isencao(
    isencao_id: UUID,
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN"]))
):
    """
    Exclui uma isenção tributária

    ATENÇÃO: Esta operação é irreversível!
    Requer permissão ADMIN
    """
    from app.models.tributario import Isencao, IPTULancamento, ITBIGuia, ISSQNDeclaracao

    isencao = db.query(Isencao).filter(Isencao.id == isencao_id).first()
    if not isencao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Isenção não encontrada"
        )

    # Verificar se a isenção está sendo utilizada
    iptu_usando = db.query(IPTULancamento).filter(
        IPTULancamento.isencao_id == isencao_id
    ).count()
    itbi_usando = db.query(ITBIGuia).filter(
        ITBIGuia.isencao_id == isencao_id
    ).count()
    issqn_usando = db.query(ISSQNDeclaracao).filter(
        ISSQNDeclaracao.isencao_id == isencao_id
    ).count()

    if iptu_usando > 0 or itbi_usando > 0 or issqn_usando > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível excluir isenção que está sendo utilizada em lançamentos. Cancele-a em vez de excluir."
        )

    db.delete(isencao)
    db.commit()

    return None


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
    Cria uma alíquota tributária configurável

    Permite definir:
    - Alíquotas por tipo de tributo (IPTU, ITBI, ISSQN)
    - Alíquotas progressivas com faixas de valor
    - Alíquotas por categoria (RESIDENCIAL, COMERCIAL, etc.)
    - Vigência temporal

    Requer permissão ADMIN
    """
    from app.models.tributario import Aliquota, TipoTributo

    # Validar faixas de valor
    if aliquota.valor_minimo is not None and aliquota.valor_maximo is not None:
        if aliquota.valor_minimo >= aliquota.valor_maximo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor mínimo deve ser menor que valor máximo"
            )

    # Verificar conflito de alíquotas na mesma vigência
    query = db.query(Aliquota).filter(
        Aliquota.tipo_tributo == aliquota.tipo_tributo,
        Aliquota.ano_vigencia == aliquota.ano_vigencia,
        Aliquota.ativa == True
    )

    if aliquota.categoria:
        query = query.filter(Aliquota.categoria == aliquota.categoria)

    # Verificar sobreposição de faixas
    if aliquota.valor_minimo is not None or aliquota.valor_maximo is not None:
        aliquotas_existentes = query.all()
        for ali in aliquotas_existentes:
            # Se a nova alíquota tem faixas
            if aliquota.valor_minimo is not None and aliquota.valor_maximo is not None:
                # E a existente também tem faixas
                if ali.valor_minimo is not None and ali.valor_maximo is not None:
                    # Verificar sobreposição
                    if not (aliquota.valor_maximo <= ali.valor_minimo or
                            aliquota.valor_minimo >= ali.valor_maximo):
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Faixa de valores conflita com alíquota existente (ID: {ali.id})"
                        )

    # Criar alíquota
    nova_aliquota = Aliquota(
        tipo_tributo=TipoTributo(aliquota.tipo_tributo),
        categoria=aliquota.categoria,
        valor_minimo=aliquota.valor_minimo,
        valor_maximo=aliquota.valor_maximo,
        aliquota=aliquota.aliquota,
        ano_vigencia=aliquota.ano_vigencia,
        data_inicio_vigencia=aliquota.data_inicio_vigencia,
        data_fim_vigencia=aliquota.data_fim_vigencia,
        ativa=aliquota.ativa,
        observacoes=aliquota.observacoes
    )

    db.add(nova_aliquota)
    db.commit()
    db.refresh(nova_aliquota)

    return nova_aliquota


@router.get("/aliquotas")
async def listar_aliquotas(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    tipo_tributo: str = Query(default=None, description="Tipo de tributo"),
    ano_vigencia: int = Query(default=None, description="Ano de vigência"),
    categoria: str = Query(default=None, description="Categoria"),
    ativa: bool = Query(default=None, description="Apenas ativas"),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Lista alíquotas com filtros e paginação

    Filtros disponíveis:
    - tipo_tributo: IPTU, ITBI, ISSQN
    - ano_vigencia: Ano de vigência
    - categoria: RESIDENCIAL, COMERCIAL, etc.
    - ativa: true/false
    """
    from app.models.tributario import Aliquota
    from app.schemas.base import criar_resposta_paginada

    query = db.query(Aliquota)

    # Aplicar filtros
    if tipo_tributo:
        query = query.filter(Aliquota.tipo_tributo == tipo_tributo)
    if ano_vigencia:
        query = query.filter(Aliquota.ano_vigencia == ano_vigencia)
    if categoria:
        query = query.filter(Aliquota.categoria == categoria)
    if ativa is not None:
        query = query.filter(Aliquota.ativa == ativa)

    # Ordenar por tipo, categoria e faixa de valor
    query = query.order_by(
        Aliquota.tipo_tributo,
        Aliquota.categoria,
        Aliquota.valor_minimo.nullslast()
    )

    # Contar total
    total = query.count()

    # Paginar
    aliquotas = query.offset(skip).limit(limit).all()

    # Calcular página
    pagina = (skip // limit) + 1 if limit > 0 else 1

    return criar_resposta_paginada(dados=aliquotas, total=total, pagina=pagina, limite=limit)


@router.get("/aliquotas/{aliquota_id}", response_model=AliquotaResponse)
async def obter_aliquota(
    aliquota_id: int,
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user)
):
    """
    Obtém detalhes de uma alíquota específica
    """
    from app.models.tributario import Aliquota

    aliquota = db.query(Aliquota).filter(Aliquota.id == aliquota_id).first()
    if not aliquota:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alíquota não encontrada"
        )

    return aliquota


@router.put("/aliquotas/{aliquota_id}", response_model=AliquotaResponse)
async def atualizar_aliquota(
    aliquota_id: int,
    atualizacao: AliquotaCreate,
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN"]))
):
    """
    Atualiza uma alíquota existente

    Requer permissão ADMIN
    """
    from app.models.tributario import Aliquota, TipoTributo

    aliquota = db.query(Aliquota).filter(Aliquota.id == aliquota_id).first()
    if not aliquota:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alíquota não encontrada"
        )

    # Validar faixas de valor
    if atualizacao.valor_minimo is not None and atualizacao.valor_maximo is not None:
        if atualizacao.valor_minimo >= atualizacao.valor_maximo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Valor mínimo deve ser menor que valor máximo"
            )

    # Atualizar campos
    aliquota.tipo_tributo = TipoTributo(atualizacao.tipo_tributo)
    aliquota.categoria = atualizacao.categoria
    aliquota.valor_minimo = atualizacao.valor_minimo
    aliquota.valor_maximo = atualizacao.valor_maximo
    aliquota.aliquota = atualizacao.aliquota
    aliquota.ano_vigencia = atualizacao.ano_vigencia
    aliquota.data_inicio_vigencia = atualizacao.data_inicio_vigencia
    aliquota.data_fim_vigencia = atualizacao.data_fim_vigencia
    aliquota.ativa = atualizacao.ativa
    aliquota.observacoes = atualizacao.observacoes

    db.commit()
    db.refresh(aliquota)

    return aliquota


@router.delete("/aliquotas/{aliquota_id}", status_code=status.HTTP_204_NO_CONTENT)
async def excluir_aliquota(
    aliquota_id: int,
    db: Session = Depends(get_db),
    usuario: dict = Depends(verificar_permissoes(["ADMIN"]))
):
    """
    Exclui uma alíquota

    Recomenda-se desativar em vez de excluir para manter histórico.
    Requer permissão ADMIN
    """
    from app.models.tributario import Aliquota

    aliquota = db.query(Aliquota).filter(Aliquota.id == aliquota_id).first()
    if not aliquota:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alíquota não encontrada"
        )

    db.delete(aliquota)
    db.commit()

    return None
