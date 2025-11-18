"""
Service para gerenciar Autos de Infração e Fiscalização
"""
from typing import List, Optional
from decimal import Decimal
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from uuid import UUID

from app.models.fiscal import (
    AutoInfracao, CatalogoInfracao, OrdemFiscalizacao,
    Intimacao, StatusAutoInfracao, TipoMulta
)
from app.models.cadastro import Pessoa
from app.models.admin import Usuario
from app.services.parametro_service import ParametroService


class FiscalService:
    """Service para gerenciar autos de infração e fiscalização"""

    def __init__(self, db: Session):
        self.db = db
        self.parametro_service = ParametroService(db)

    # =====================================================
    # CATÁLOGO DE INFRAÇÕES
    # =====================================================

    def criar_catalogo_infracao(self, dados: dict) -> CatalogoInfracao:
        """Cria uma nova infração no catálogo"""
        infracao = CatalogoInfracao(**dados)
        self.db.add(infracao)
        self.db.commit()
        self.db.refresh(infracao)
        return infracao

    def buscar_catalogo_por_codigo(self, codigo: str) -> Optional[CatalogoInfracao]:
        """Busca infração por código"""
        return self.db.query(CatalogoInfracao).filter(
            CatalogoInfracao.codigo == codigo,
            CatalogoInfracao.ativo == True
        ).first()

    def listar_catalogo_infracoes(
        self,
        ativo: Optional[bool] = None,
        gravidade: Optional[str] = None
    ) -> List[CatalogoInfracao]:
        """Lista infrações do catálogo"""
        query = self.db.query(CatalogoInfracao)

        if ativo is not None:
            query = query.filter(CatalogoInfracao.ativo == ativo)

        if gravidade:
            query = query.filter(CatalogoInfracao.gravidade == gravidade)

        return query.order_by(CatalogoInfracao.codigo).all()

    def atualizar_catalogo_infracao(
        self,
        infracao_id: int,
        dados: dict
    ) -> CatalogoInfracao:
        """Atualiza infração do catálogo"""
        infracao = self.db.query(CatalogoInfracao).filter(
            CatalogoInfracao.id == infracao_id
        ).first()

        if not infracao:
            raise ValueError(f"Infração ID {infracao_id} não encontrada")

        for campo, valor in dados.items():
            if valor is not None:
                setattr(infracao, campo, valor)

        self.db.commit()
        self.db.refresh(infracao)
        return infracao

    # =====================================================
    # VERIFICAÇÃO DE REINCIDÊNCIA
    # =====================================================

    def verificar_reincidencia(
        self,
        contribuinte_id: UUID,
        codigo_infracao: str,
        data_atual: date
    ) -> tuple[bool, int]:
        """
        Verifica se há reincidência

        Returns:
            tuple: (é_reincidente, quantidade_reincidencias)
        """
        # Busca parâmetro de prazo entre infrações
        config_reincidencia = self.parametro_service.obter_parametro(
            "FISCAL.MULTAS.REINCIDENCIA_ACRESCIMO"
        )

        prazo_entre_infracoes = config_reincidencia.get("prazo_entre_infracoes_dias", 365)
        data_limite = data_atual - timedelta(days=prazo_entre_infracoes)

        # Busca autos anteriores da mesma infração
        autos_anteriores = self.db.query(AutoInfracao).filter(
            and_(
                AutoInfracao.autuado_id == contribuinte_id,
                AutoInfracao.codigo_infracao == codigo_infracao,
                AutoInfracao.data_lavratura >= data_limite,
                AutoInfracao.data_lavratura < data_atual,
                AutoInfracao.status != StatusAutoInfracao.CANCELADO,
                AutoInfracao.cancelado == False
            )
        ).all()

        quantidade = len(autos_anteriores)
        return (quantidade > 0, quantidade)

    # =====================================================
    # CÁLCULO DE MULTA
    # =====================================================

    def calcular_multa(
        self,
        catalogo_infracao: CatalogoInfracao,
        valor_base_calculo: Optional[Decimal],
        reincidente: bool,
        quantidade_reincidencias: int,
        ano: Optional[int] = None
    ) -> dict:
        """
        Calcula valor da multa com base no catálogo e parâmetros

        Returns:
            dict com: valor_multa_ufm, valor_multa_reais, acrescimo_reincidencia, valor_total
        """
        if ano is None:
            ano = date.today().year

        # Busca UFM atual
        ufm_valor = self.parametro_service.obter_ufm_atual(ano)

        # Busca multa mínima e máxima
        multa_minima_ufm = self.parametro_service.obter_multa_minima_ufm()
        multa_maxima_ufm = self.parametro_service.obter_multa_maxima_ufm()

        # Calcula valor base da multa em UFM
        valor_multa_ufm = Decimal("0.00")

        if catalogo_infracao.tipo_multa == TipoMulta.FIXA_UFM:
            valor_multa_ufm = catalogo_infracao.valor_multa_ufm or Decimal("0.00")

        elif catalogo_infracao.tipo_multa == TipoMulta.PERCENTUAL:
            if not valor_base_calculo:
                raise ValueError("Valor base de cálculo é obrigatório para multa percentual")

            percentual = catalogo_infracao.percentual_multa or Decimal("0.00")
            valor_multa_reais = (valor_base_calculo * percentual) / Decimal("100")
            valor_multa_ufm = valor_multa_reais / ufm_valor

        elif catalogo_infracao.tipo_multa == TipoMulta.MISTA:
            # Parte fixa em UFM
            parte_fixa = catalogo_infracao.valor_multa_ufm or Decimal("0.00")

            # Parte percentual
            if valor_base_calculo and catalogo_infracao.percentual_multa:
                percentual = catalogo_infracao.percentual_multa
                valor_percentual_reais = (valor_base_calculo * percentual) / Decimal("100")
                parte_percentual_ufm = valor_percentual_reais / ufm_valor
            else:
                parte_percentual_ufm = Decimal("0.00")

            valor_multa_ufm = parte_fixa + parte_percentual_ufm

        # Aplica limites do catálogo
        if catalogo_infracao.valor_minimo_ufm:
            valor_multa_ufm = max(valor_multa_ufm, catalogo_infracao.valor_minimo_ufm)

        if catalogo_infracao.valor_maximo_ufm:
            valor_multa_ufm = min(valor_multa_ufm, catalogo_infracao.valor_maximo_ufm)

        # Aplica limites gerais do sistema
        valor_multa_ufm = max(valor_multa_ufm, multa_minima_ufm)
        valor_multa_ufm = min(valor_multa_ufm, multa_maxima_ufm)

        # Converte para reais
        valor_multa_reais = valor_multa_ufm * ufm_valor

        # Calcula acréscimo por reincidência
        acrescimo_reincidencia = Decimal("0.00")
        if reincidente and catalogo_infracao.permite_reincidencia:
            config_reincidencia = self.parametro_service.obter_parametro(
                "FISCAL.MULTAS.REINCIDENCIA_ACRESCIMO"
            )

            if quantidade_reincidencias == 1:
                # Primeira reincidência: dobro
                if config_reincidencia.get("primeira_reincidencia") == "DOBRO":
                    acrescimo_reincidencia = valor_multa_reais
            else:
                # Demais reincidências: acréscimo de 30% a cada vez
                if config_reincidencia.get("demais_reincidencias") == "ACRESCIMO_30_PCT":
                    # Calcula acréscimo acumulado
                    for i in range(quantidade_reincidencias):
                        if i == 0:
                            acrescimo_reincidencia = valor_multa_reais  # Dobro na primeira
                        else:
                            # 30% a mais sobre o valor anterior
                            acrescimo_reincidencia = acrescimo_reincidencia * Decimal("1.30")

        valor_total = valor_multa_reais + acrescimo_reincidencia

        return {
            "valor_multa_ufm": valor_multa_ufm,
            "ufm_valor_referencia": ufm_valor,
            "valor_multa_reais": valor_multa_reais,
            "acrescimo_reincidencia": acrescimo_reincidencia,
            "valor_total": valor_total
        }

    # =====================================================
    # AUTO DE INFRAÇÃO
    # =====================================================

    def gerar_numero_auto(self, ano: Optional[int] = None) -> str:
        """Gera número sequencial do auto de infração"""
        if ano is None:
            ano = date.today().year

        # Busca último número do ano
        ultimo = self.db.query(AutoInfracao).filter(
            AutoInfracao.numero_auto.like(f"{ano}%")
        ).order_by(AutoInfracao.numero_auto.desc()).first()

        if ultimo:
            ultimo_numero = int(ultimo.numero_auto.split("/")[1])
            novo_numero = ultimo_numero + 1
        else:
            novo_numero = 1

        return f"{ano}/{novo_numero:06d}"

    def lavrar_auto_infracao(self, dados: dict) -> AutoInfracao:
        """
        Lavra um auto de infração com cálculo automático da multa

        Args:
            dados: Dicionário com dados do auto
                - codigo_infracao: Código da infração do catálogo
                - autuado_id: ID do autuado
                - fiscal_autuante_id: ID do fiscal
                - local_infracao: Local da infração
                - valor_base_calculo: Valor base (se percentual)
                - observacoes: Observações

        Returns:
            AutoInfracao criado
        """
        # Busca infração do catálogo
        catalogo = self.buscar_catalogo_por_codigo(dados["codigo_infracao"])
        if not catalogo:
            raise ValueError(f"Infração {dados['codigo_infracao']} não encontrada no catálogo")

        # Busca dados do autuado
        autuado = self.db.query(Pessoa).filter(Pessoa.id == dados["autuado_id"]).first()
        if not autuado:
            raise ValueError("Autuado não encontrado")

        # Busca dados do fiscal
        fiscal = self.db.query(Usuario).filter(Usuario.id == dados["fiscal_autuante_id"]).first()
        if not fiscal:
            raise ValueError("Fiscal não encontrado")

        # Verifica reincidência
        data_lavratura = dados.get("data_lavratura", date.today())
        reincidente, qtd_reincidencias = self.verificar_reincidencia(
            autuado.id,
            dados["codigo_infracao"],
            data_lavratura
        )

        # Calcula multa
        calculo = self.calcular_multa(
            catalogo,
            dados.get("valor_base_calculo"),
            reincidente,
            qtd_reincidencias
        )

        # Gera número do auto
        numero_auto = dados.get("numero_auto") or self.gerar_numero_auto()

        # Cria auto de infração
        auto = AutoInfracao(
            ordem_fiscalizacao_id=dados.get("ordem_fiscalizacao_id"),
            numero_auto=numero_auto,
            data_lavratura=data_lavratura,
            codigo_infracao=catalogo.codigo,
            descricao_infracao=catalogo.descricao,
            artigo_lei=catalogo.artigo_lei or "",
            local_infracao=dados.get("local_infracao"),
            autuado_id=autuado.id,
            autuado_nome=autuado.nome_razao_social,
            autuado_cpf_cnpj=autuado.cpf or autuado.cnpj,
            fiscal_autuante_id=fiscal.id,
            fiscal_nome=fiscal.nome_completo,
            fiscal_matricula=fiscal.matricula or "",
            tipo_multa=catalogo.tipo_multa.value,
            valor_base_calculo=dados.get("valor_base_calculo"),
            valor_multa_ufm=calculo["valor_multa_ufm"],
            ufm_valor_referencia=calculo["ufm_valor_referencia"],
            valor_multa=calculo["valor_multa_reais"],
            reincidente=reincidente,
            quantidade_reincidencias=qtd_reincidencias,
            acrescimo_reincidencia=calculo["acrescimo_reincidencia"],
            valor_total=calculo["valor_total"],
            status=StatusAutoInfracao.LAVRADO,
            observacoes=dados.get("observacoes")
        )

        self.db.add(auto)
        self.db.commit()
        self.db.refresh(auto)
        return auto

    def notificar_auto(
        self,
        auto_id: UUID,
        forma_notificacao: str,
        data_notificacao: Optional[date] = None
    ) -> AutoInfracao:
        """
        Registra notificação do auto de infração

        Args:
            auto_id: ID do auto
            forma_notificacao: PESSOAL, CORREIOS, EDITAL, EMAIL, DTD
            data_notificacao: Data da notificação (hoje se None)

        Returns:
            Auto atualizado
        """
        auto = self.db.query(AutoInfracao).filter(AutoInfracao.id == auto_id).first()
        if not auto:
            raise ValueError("Auto de infração não encontrado")

        if auto.status != StatusAutoInfracao.LAVRADO:
            raise ValueError("Auto já foi notificado ou está em outro status")

        # Verifica se forma de notificação é válida
        formas_validas = self.parametro_service.obter_formas_notificacao()
        if forma_notificacao not in formas_validas:
            raise ValueError(f"Forma de notificação inválida. Válidas: {formas_validas}")

        if data_notificacao is None:
            data_notificacao = date.today()

        # Calcula data limite para defesa
        prazo_defesa = self.parametro_service.obter_prazo_defesa()
        data_limite_defesa = data_notificacao + timedelta(days=prazo_defesa)

        auto.data_notificacao = data_notificacao
        auto.forma_notificacao = forma_notificacao
        auto.data_limite_defesa = data_limite_defesa
        auto.status = StatusAutoInfracao.NOTIFICADO

        self.db.commit()
        self.db.refresh(auto)
        return auto

    def registrar_defesa(
        self,
        auto_id: UUID,
        argumentacao: str,
        data_defesa: Optional[date] = None
    ) -> AutoInfracao:
        """Registra apresentação de defesa"""
        auto = self.db.query(AutoInfracao).filter(AutoInfracao.id == auto_id).first()
        if not auto:
            raise ValueError("Auto de infração não encontrado")

        if auto.status not in [StatusAutoInfracao.NOTIFICADO, StatusAutoInfracao.EM_DEFESA]:
            raise ValueError("Auto não está em situação de receber defesa")

        if data_defesa is None:
            data_defesa = date.today()

        # Verifica se está dentro do prazo
        if auto.data_limite_defesa and data_defesa > auto.data_limite_defesa:
            raise ValueError("Defesa apresentada fora do prazo")

        auto.data_defesa = data_defesa
        auto.argumentacao_defesa = argumentacao
        auto.status = StatusAutoInfracao.EM_DEFESA

        self.db.commit()
        self.db.refresh(auto)
        return auto

    def julgar_defesa(
        self,
        auto_id: UUID,
        decisao: str,
        motivo: str,
        data_decisao: Optional[date] = None
    ) -> AutoInfracao:
        """
        Julga defesa apresentada

        Args:
            auto_id: ID do auto
            decisao: DEFERIDO ou INDEFERIDO
            motivo: Motivação da decisão
            data_decisao: Data da decisão (hoje se None)

        Returns:
            Auto atualizado
        """
        auto = self.db.query(AutoInfracao).filter(AutoInfracao.id == auto_id).first()
        if not auto:
            raise ValueError("Auto de infração não encontrado")

        if auto.status != StatusAutoInfracao.EM_DEFESA:
            raise ValueError("Auto não está em fase de julgamento de defesa")

        if decisao not in ["DEFERIDO", "INDEFERIDO"]:
            raise ValueError("Decisão deve ser DEFERIDO ou INDEFERIDO")

        if data_decisao is None:
            data_decisao = date.today()

        auto.data_decisao_defesa = data_decisao
        auto.decisao_defesa = decisao
        auto.motivo_decisao = motivo

        if decisao == "DEFERIDO":
            auto.status = StatusAutoInfracao.DEFERIDO
        else:
            auto.status = StatusAutoInfracao.INDEFERIDO

        self.db.commit()
        self.db.refresh(auto)
        return auto

    def registrar_pagamento(
        self,
        auto_id: UUID,
        valor_pago: Decimal,
        data_pagamento: Optional[date] = None
    ) -> AutoInfracao:
        """Registra pagamento do auto"""
        auto = self.db.query(AutoInfracao).filter(AutoInfracao.id == auto_id).first()
        if not auto:
            raise ValueError("Auto de infração não encontrado")

        if auto.status == StatusAutoInfracao.PAGO:
            raise ValueError("Auto já está pago")

        if data_pagamento is None:
            data_pagamento = date.today()

        auto.data_pagamento = data_pagamento
        auto.valor_pago = valor_pago
        auto.status = StatusAutoInfracao.PAGO

        self.db.commit()
        self.db.refresh(auto)
        return auto

    def cancelar_auto(
        self,
        auto_id: UUID,
        motivo: str
    ) -> AutoInfracao:
        """Cancela auto de infração"""
        auto = self.db.query(AutoInfracao).filter(AutoInfracao.id == auto_id).first()
        if not auto:
            raise ValueError("Auto de infração não encontrado")

        if auto.status == StatusAutoInfracao.PAGO:
            raise ValueError("Auto já pago não pode ser cancelado")

        auto.cancelado = True
        auto.data_cancelamento = date.today()
        auto.motivo_cancelamento = motivo
        auto.status = StatusAutoInfracao.CANCELADO

        self.db.commit()
        self.db.refresh(auto)
        return auto

    def listar_autos(
        self,
        status: Optional[str] = None,
        autuado_id: Optional[UUID] = None,
        fiscal_id: Optional[UUID] = None,
        data_inicio: Optional[date] = None,
        data_fim: Optional[date] = None
    ) -> List[AutoInfracao]:
        """Lista autos de infração com filtros"""
        query = self.db.query(AutoInfracao)

        if status:
            query = query.filter(AutoInfracao.status == status)

        if autuado_id:
            query = query.filter(AutoInfracao.autuado_id == autuado_id)

        if fiscal_id:
            query = query.filter(AutoInfracao.fiscal_autuante_id == fiscal_id)

        if data_inicio:
            query = query.filter(AutoInfracao.data_lavratura >= data_inicio)

        if data_fim:
            query = query.filter(AutoInfracao.data_lavratura <= data_fim)

        return query.order_by(AutoInfracao.data_lavratura.desc()).all()

    def buscar_auto_por_id(self, auto_id: UUID) -> Optional[AutoInfracao]:
        """Busca auto por ID"""
        return self.db.query(AutoInfracao).filter(AutoInfracao.id == auto_id).first()

    def buscar_auto_por_numero(self, numero_auto: str) -> Optional[AutoInfracao]:
        """Busca auto por número"""
        return self.db.query(AutoInfracao).filter(
            AutoInfracao.numero_auto == numero_auto
        ).first()
