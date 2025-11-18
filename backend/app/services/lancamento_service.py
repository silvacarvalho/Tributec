"""
Serviço de Lançamentos Tributários
IPTU, ITBI, ISSQN
"""
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional, Dict
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status

from app.models.tributario import (
    IPTULancamento, IPTUParcela, ITBIGuia, ISSQNDeclaracao,
    StatusLancamento
)
from app.models.cadastro import Imovel, Pessoa, Estabelecimento
from app.schemas.tributario import IPTULancamentoCreate
from app.services.calculo_tributario import CalculadoraIPTU
from app.utils.generators import gerar_numero_lancamento, gerar_numero_dam


class IPTULancamentoService:
    """Serviço para lançamentos de IPTU"""

    def __init__(self, db: Session):
        self.db = db

    def lancar_iptu(
        self,
        imovel_id: UUID,
        ano_exercicio: int,
        numero_parcelas: int = 10,
        pagamento_unico: bool = False,
        iptu_digital: bool = False
    ) -> IPTULancamento:
        """
        Realiza o lançamento de IPTU para um imóvel

        Args:
            imovel_id: ID do imóvel
            ano_exercicio: Ano do exercício
            numero_parcelas: Número de parcelas
            pagamento_unico: Se optou por pagamento único
            iptu_digital: Se aderiu ao IPTU digital

        Returns:
            Lançamento criado

        Raises:
            HTTPException: Se validação falhar ou imóvel já tiver lançamento
        """
        # Verificar se imóvel existe
        imovel = self.db.query(Imovel).filter(Imovel.id == imovel_id).first()
        if not imovel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Imóvel não encontrado"
            )

        # Verificar se já existe lançamento para este ano
        lancamento_existente = self.db.query(IPTULancamento).filter(
            and_(
                IPTULancamento.imovel_id == imovel_id,
                IPTULancamento.ano_exercicio == ano_exercicio
            )
        ).first()

        if lancamento_existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Já existe lançamento de IPTU para o ano {ano_exercicio}"
            )

        # Calcular IPTU
        calculadora = CalculadoraIPTU(self.db, ano_exercicio)
        calculo = calculadora.calcular(str(imovel_id))

        # Aplicar descontos
        valor_iptu = Decimal(str(calculo["valor_iptu"]))
        descontos = Decimal("0.00")

        if pagamento_unico:
            descontos += valor_iptu * Decimal("0.10")  # 10% de desconto

        if iptu_digital:
            descontos += valor_iptu * Decimal("0.02")  # 2% de desconto

        valor_liquido = valor_iptu - descontos

        # Criar lançamento
        lancamento = IPTULancamento(
            numero_lancamento=gerar_numero_lancamento(ano_exercicio, "IPTU"),
            imovel_id=imovel_id,
            contribuinte_id=imovel.proprietario_id,
            ano_exercicio=ano_exercicio,
            status=StatusLancamento.LANCADO,
            data_lancamento=date.today(),
            data_vencimento=date(ano_exercicio, 3, 31),  # Vencimento padrão: 31/03
            valor_venal_terreno=Decimal(str(calculo["valor_venal_terreno"])),
            valor_venal_edificacao=Decimal(str(calculo.get("valor_venal_edificacao", 0))),
            valor_venal_total=Decimal(str(calculo["valor_venal_total"])),
            aliquota_aplicada=Decimal(str(calculo["aliquota_aplicada"])),
            valor_iptu=valor_iptu,
            descontos=descontos,
            valor_liquido=valor_liquido,
            valor_pago=Decimal("0.00"),
            calculo_detalhado=calculo
        )

        self.db.add(lancamento)
        self.db.flush()

        # Criar parcelas
        self._criar_parcelas(lancamento.id, valor_liquido, numero_parcelas, ano_exercicio)

        self.db.commit()
        self.db.refresh(lancamento)

        return lancamento

    def _criar_parcelas(
        self,
        lancamento_id: UUID,
        valor_total: Decimal,
        numero_parcelas: int,
        ano: int
    ):
        """
        Cria as parcelas do lançamento de IPTU

        Args:
            lancamento_id: ID do lançamento
            valor_total: Valor total a parcelar
            numero_parcelas: Quantidade de parcelas
            ano: Ano do exercício
        """
        valor_parcela = valor_total / numero_parcelas
        valor_parcela = valor_parcela.quantize(Decimal("0.01"))

        # Ajustar última parcela para evitar diferenças de arredondamento
        valor_ultima_parcela = valor_total - (valor_parcela * (numero_parcelas - 1))

        for numero in range(1, numero_parcelas + 1):
            # Vencimento: parcelas vencem mensalmente a partir de março
            mes_vencimento = 2 + numero  # Março = 3, então começa em 2+1
            ano_vencimento = ano

            if mes_vencimento > 12:
                mes_vencimento -= 12
                ano_vencimento += 1

            parcela = IPTUParcela(
                lancamento_id=lancamento_id,
                numero_parcela=numero,
                data_vencimento=date(ano_vencimento, mes_vencimento, 10),  # Dia 10 de cada mês
                valor_parcela=valor_ultima_parcela if numero == numero_parcelas else valor_parcela,
                valor_pago=Decimal("0.00"),
                paga=False
            )

            self.db.add(parcela)

    def lancar_iptu_em_lote(
        self,
        ano_exercicio: int,
        setor_fiscal_id: Optional[int] = None,
        limite: int = 1000
    ) -> Dict:
        """
        Realiza lançamento de IPTU em lote

        Args:
            ano_exercicio: Ano do exercício
            setor_fiscal_id: Filtrar por setor fiscal (opcional)
            limite: Limite de imóveis por vez

        Returns:
            Dicionário com estatísticas do lançamento
        """
        # Buscar imóveis ativos que ainda não têm lançamento
        query = self.db.query(Imovel).filter(
            Imovel.situacao_cadastral == "ATIVO"
        )

        if setor_fiscal_id:
            query = query.filter(Imovel.setor_fiscal_id == setor_fiscal_id)

        # Excluir imóveis que já têm lançamento neste ano
        imoveis_com_lancamento = self.db.query(IPTULancamento.imovel_id).filter(
            IPTULancamento.ano_exercicio == ano_exercicio
        ).subquery()

        query = query.filter(~Imovel.id.in_(imoveis_com_lancamento))

        imoveis = query.limit(limite).all()

        sucessos = 0
        erros = []

        for imovel in imoveis:
            try:
                self.lancar_iptu(
                    imovel_id=imovel.id,
                    ano_exercicio=ano_exercicio,
                    numero_parcelas=10,
                    pagamento_unico=False,
                    iptu_digital=False
                )
                sucessos += 1
            except Exception as e:
                erros.append({
                    "imovel_id": str(imovel.id),
                    "inscricao": imovel.inscricao_municipal,
                    "erro": str(e)
                })

        return {
            "total_processado": len(imoveis),
            "sucessos": sucessos,
            "erros": len(erros),
            "detalhes_erros": erros
        }

    def obter_lancamento_por_id(self, lancamento_id: UUID) -> IPTULancamento:
        """
        Busca lançamento por ID

        Args:
            lancamento_id: ID do lançamento

        Returns:
            Lançamento encontrado

        Raises:
            HTTPException: Se não encontrado
        """
        lancamento = self.db.query(IPTULancamento).filter(
            IPTULancamento.id == lancamento_id
        ).first()

        if not lancamento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lançamento não encontrado"
            )

        return lancamento

    def listar_lancamentos(
        self,
        ano_exercicio: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        contribuinte_id: Optional[UUID] = None
    ) -> List[IPTULancamento]:
        """
        Lista lançamentos de IPTU com filtros

        Args:
            ano_exercicio: Ano do exercício
            skip: Offset para paginação
            limit: Limite de registros
            status: Filtrar por status
            contribuinte_id: Filtrar por contribuinte

        Returns:
            Lista de lançamentos
        """
        query = self.db.query(IPTULancamento).filter(
            IPTULancamento.ano_exercicio == ano_exercicio
        )

        if status:
            query = query.filter(IPTULancamento.status == status)

        if contribuinte_id:
            query = query.filter(IPTULancamento.contribuinte_id == contribuinte_id)

        return query.offset(skip).limit(limit).all()

    def obter_parcelas(self, lancamento_id: UUID) -> List[IPTUParcela]:
        """
        Obtém parcelas de um lançamento

        Args:
            lancamento_id: ID do lançamento

        Returns:
            Lista de parcelas
        """
        return self.db.query(IPTUParcela).filter(
            IPTUParcela.lancamento_id == lancamento_id
        ).order_by(IPTUParcela.numero_parcela).all()


class ITBIGuiaService:
    """Serviço para guias de ITBI"""

    def __init__(self, db: Session):
        self.db = db

    # TODO: Implementar serviço de ITBI


class ISSQNDeclaracaoService:
    """Serviço para declarações de ISSQN"""

    def __init__(self, db: Session):
        self.db = db

    # TODO: Implementar serviço de ISSQN
