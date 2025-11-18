"""
Service para gerenciar Parâmetros do Sistema
"""
from typing import Any, Optional, List
from decimal import Decimal
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.admin import ParametroSistema


class ParametroService:
    """Service para buscar e gerenciar parâmetros configuráveis do sistema"""

    def __init__(self, db: Session):
        self.db = db

    def obter_parametro(
        self,
        chave: str,
        ano: Optional[int] = None
    ) -> Optional[Any]:
        """
        Busca valor de um parâmetro pela chave

        Args:
            chave: Chave do parâmetro (ex: FISCAL.VALORES.UFM_VALOR_ATUAL)
            ano: Ano de vigência (usa ano atual se None)

        Returns:
            Valor do parâmetro no tipo correto

        Raises:
            ValueError: Se o parâmetro não for encontrado
        """
        if ano is None:
            ano = date.today().year

        # Busca primeiro por ano específico, depois por geral (ano_vigencia=None)
        param = self.db.query(ParametroSistema).filter(
            ParametroSistema.chave == chave,
            ParametroSistema.ano_vigencia == ano
        ).first()

        if not param:
            param = self.db.query(ParametroSistema).filter(
                ParametroSistema.chave == chave,
                ParametroSistema.ano_vigencia.is_(None)
            ).first()

        if not param:
            raise ValueError(f"Parâmetro '{chave}' não encontrado")

        # Retorna valor conforme o tipo
        tipo_mapa = {
            "STRING": param.valor_string,
            "INTEGER": param.valor_inteiro,
            "DECIMAL": param.valor_decimal,
            "BOOLEAN": param.valor_booleano,
            "DATE": param.valor_data,
            "JSON": param.valor_json,
            "PERCENT": param.valor_decimal
        }

        return tipo_mapa.get(param.tipo_valor)

    def obter_parametro_completo(
        self,
        chave: str,
        ano: Optional[int] = None
    ) -> Optional[ParametroSistema]:
        """
        Busca o objeto completo do parâmetro (não apenas o valor)

        Args:
            chave: Chave do parâmetro
            ano: Ano de vigência

        Returns:
            Objeto ParametroSistema completo
        """
        if ano is None:
            ano = date.today().year

        param = self.db.query(ParametroSistema).filter(
            ParametroSistema.chave == chave,
            ParametroSistema.ano_vigencia == ano
        ).first()

        if not param:
            param = self.db.query(ParametroSistema).filter(
                ParametroSistema.chave == chave,
                ParametroSistema.ano_vigencia.is_(None)
            ).first()

        return param

    # ============ ATALHOS PARA PARÂMETROS FISCAIS ============

    def obter_ufm_atual(self, ano: Optional[int] = None) -> Decimal:
        """Atalho para obter valor atual da UFM"""
        valor = self.obter_parametro("FISCAL.VALORES.UFM_VALOR_ATUAL", ano)
        return Decimal(str(valor)) if valor else Decimal("0")

    def obter_prazo_defesa(self) -> int:
        """Atalho para obter prazo de defesa do auto de infração"""
        valor = self.obter_parametro("FISCAL.PRAZOS.DEFESA_AUTO_DIAS")
        return int(valor) if valor else 30

    def obter_prazo_recurso(self) -> int:
        """Atalho para obter prazo de recurso"""
        valor = self.obter_parametro("FISCAL.PRAZOS.RECURSO_DIAS")
        return int(valor) if valor else 15

    def obter_multa_minima_ufm(self) -> Decimal:
        """Atalho para obter multa mínima em UFM"""
        valor = self.obter_parametro("FISCAL.MULTAS.MINIMA_UFM")
        return Decimal(str(valor)) if valor else Decimal("5.0")

    def obter_multa_maxima_ufm(self) -> Decimal:
        """Atalho para obter multa máxima em UFM"""
        valor = self.obter_parametro("FISCAL.MULTAS.MAXIMA_UFM")
        return Decimal(str(valor)) if valor else Decimal("1000.0")

    def obter_formas_notificacao(self) -> List[str]:
        """Atalho para obter formas válidas de notificação"""
        valor = self.obter_parametro("FISCAL.NOTIFICACAO.FORMAS_VALIDAS")
        return valor if valor else ["PESSOAL", "CORREIOS", "EDITAL", "EMAIL", "DTD"]

    # ============ ATALHOS PARA PARÂMETROS IPTU ============

    def obter_desconto_cota_unica_iptu(self) -> Decimal:
        """Atalho para obter desconto de cota única do IPTU"""
        valor = self.obter_parametro("TRIBUTARIO.IPTU.DESCONTO_COTA_UNICA_PCT")
        return Decimal(str(valor)) if valor else Decimal("10.0")

    def obter_vencimento_cota_unica_iptu(self) -> int:
        """Atalho para obter dia de vencimento da cota única do IPTU"""
        valor = self.obter_parametro("TRIBUTARIO.IPTU.VENCIMENTO_COTA_UNICA_DIA")
        return int(valor) if valor else 10

    # ============ ATALHOS PARA PARÂMETROS ITBI ============

    def obter_aliquota_itbi(self) -> Decimal:
        """Atalho para obter alíquota padrão do ITBI"""
        valor = self.obter_parametro("TRIBUTARIO.ITBI.ALIQUOTA_PADRAO")
        return Decimal(str(valor)) if valor else Decimal("2.0")

    def obter_itbi_minimo_ufm(self) -> Decimal:
        """Atalho para obter valor mínimo do ITBI em UFM"""
        valor = self.obter_parametro("TRIBUTARIO.ITBI.VALOR_MINIMO_UFM")
        return Decimal(str(valor)) if valor else Decimal("10.0")

    # ============ LISTAGEM E BUSCA ============

    def listar_por_modulo(
        self,
        modulo: str,
        categoria: Optional[str] = None,
        ano: Optional[int] = None
    ) -> List[ParametroSistema]:
        """
        Lista todos os parâmetros de um módulo/categoria

        Args:
            modulo: Nome do módulo (FISCAL, TRIBUTARIO, etc.)
            categoria: Categoria específica (opcional)
            ano: Ano de vigência (opcional)

        Returns:
            Lista de parâmetros ordenados
        """
        query = self.db.query(ParametroSistema).filter(
            ParametroSistema.modulo == modulo
        )

        if categoria:
            query = query.filter(ParametroSistema.categoria == categoria)

        if ano:
            query = query.filter(
                or_(
                    ParametroSistema.ano_vigencia == ano,
                    ParametroSistema.ano_vigencia.is_(None)
                )
            )

        return query.order_by(
            ParametroSistema.categoria,
            ParametroSistema.ordem_exibicao,
            ParametroSistema.nome_exibicao
        ).all()

    def atualizar_parametro(
        self,
        chave: str,
        novo_valor: Any,
        ano: Optional[int] = None
    ) -> ParametroSistema:
        """
        Atualiza o valor de um parâmetro

        Args:
            chave: Chave do parâmetro
            novo_valor: Novo valor
            ano: Ano de vigência

        Returns:
            Parâmetro atualizado

        Raises:
            ValueError: Se parâmetro não encontrado ou não editável
        """
        if ano is None:
            ano = date.today().year

        param = self.obter_parametro_completo(chave, ano)

        if not param:
            raise ValueError(f"Parâmetro '{chave}' não encontrado")

        if not param.editavel:
            raise ValueError(f"Parâmetro '{chave}' não é editável")

        # Atualiza o valor conforme o tipo
        tipo_campo = {
            "STRING": "valor_string",
            "INTEGER": "valor_inteiro",
            "DECIMAL": "valor_decimal",
            "BOOLEAN": "valor_booleano",
            "DATE": "valor_data",
            "JSON": "valor_json",
            "PERCENT": "valor_decimal"
        }

        campo = tipo_campo.get(param.tipo_valor)
        if campo:
            setattr(param, campo, novo_valor)

        self.db.commit()
        self.db.refresh(param)

        return param

    def criar_parametro(self, dados: dict) -> ParametroSistema:
        """
        Cria um novo parâmetro

        Args:
            dados: Dicionário com dados do parâmetro

        Returns:
            Parâmetro criado
        """
        param = ParametroSistema(**dados)
        self.db.add(param)
        self.db.commit()
        self.db.refresh(param)
        return param

    def buscar_por_id(self, param_id: int) -> Optional[ParametroSistema]:
        """Busca parâmetro por ID"""
        return self.db.query(ParametroSistema).filter(
            ParametroSistema.id == param_id
        ).first()

    def listar_todos(self) -> List[ParametroSistema]:
        """Lista todos os parâmetros do sistema"""
        return self.db.query(ParametroSistema).order_by(
            ParametroSistema.modulo,
            ParametroSistema.categoria,
            ParametroSistema.ordem_exibicao
        ).all()
