"""
Service para Gestão de Nota Fiscal de Serviços Eletrônica (NFS-e)
Emissão, Cancelamento e Consulta de NFS-e
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.nfse import NotaFiscal, NotaFiscalItem, StatusNotaFiscal, TipoTributacao
from app.models.cadastro import Estabelecimento, Pessoa


class NFSeService:
    """Service para operações com NFS-e"""

    def __init__(self, db: Session):
        self.db = db

    def emitir_nfse(
        self,
        prestador_id: UUID,
        tomador_id: UUID,
        itens: List[Dict[str, Any]],
        dados_adicionais: Optional[Dict[str, Any]] = None
    ) -> NotaFiscal:
        """
        Emite uma Nota Fiscal de Serviços Eletrônica

        Args:
            prestador_id: ID do estabelecimento prestador
            tomador_id: ID da pessoa tomadora do serviço
            itens: Lista de itens/serviços da nota
            dados_adicionais: Dados adicionais (discriminação, observações)

        Returns:
            NotaFiscal emitida
        """
        # Validar prestador
        prestador = self.db.query(Estabelecimento).filter(
            Estabelecimento.id == prestador_id
        ).first()

        if not prestador:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estabelecimento prestador não encontrado"
            )

        if not prestador.emite_nfe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Estabelecimento não autorizado a emitir NFS-e"
            )

        # Validar tomador
        tomador = self.db.query(Pessoa).filter(Pessoa.id == tomador_id).first()

        if not tomador:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tomador não encontrado"
            )

        # Calcular valores
        valor_servicos = Decimal('0')
        valor_deducoes = Decimal('0')
        valor_pis = Decimal('0')
        valor_cofins = Decimal('0')
        valor_inss = Decimal('0')
        valor_ir = Decimal('0')
        valor_csll = Decimal('0')
        base_calculo = Decimal('0')
        aliquota_iss = prestador.aliquota_iss or Decimal('5')  # 5% padrão
        valor_iss = Decimal('0')
        valor_iss_retido = Decimal('0')

        for item_data in itens:
            valor_unitario = Decimal(str(item_data.get('valor_unitario', 0)))
            quantidade = Decimal(str(item_data.get('quantidade', 1)))
            valor_total_item = valor_unitario * quantidade

            valor_servicos += valor_total_item

            # Deduções (se houver)
            if 'valor_deducao' in item_data:
                valor_deducoes += Decimal(str(item_data['valor_deducao']))

        # Base de cálculo = Valor dos serviços - Deduções
        base_calculo = valor_servicos - valor_deducoes

        # Calcular ISS
        valor_iss = base_calculo * (aliquota_iss / 100)

        # Verificar retenção de ISS
        # ISS é retido pelo tomador se ele for pessoa jurídica e estiver no mesmo município
        retencao_iss = dados_adicionais.get('retencao_iss', False) if dados_adicionais else False
        if retencao_iss:
            valor_iss_retido = valor_iss
            valor_iss = Decimal('0')

        valor_liquido = valor_servicos - valor_deducoes - valor_iss_retido

        # Gerar número da nota
        ano_atual = datetime.now().year
        ultimo_numero = self.db.query(NotaFiscal).filter(
            NotaFiscal.prestador_id == prestador_id,
            NotaFiscal.numero.like(f"{ano_atual}%")
        ).count()
        numero_nota = f"{ano_atual}{(ultimo_numero + 1):08d}"

        # Criar nota fiscal
        nota = NotaFiscal(
            prestador_id=prestador_id,
            tomador_id=tomador_id,
            numero=numero_nota,
            data_emissao=datetime.now(),
            competencia=datetime.now().replace(day=1),
            natureza_operacao=dados_adicionais.get('natureza_operacao', 'TRIBUTACAO_NO_MUNICIPIO'),
            regime_especial_tributacao=dados_adicionais.get('regime_especial_tributacao'),
            optante_simples_nacional=prestador.optante_simples,
            incentivador_cultural=False,
            status=StatusNotaFiscal.EMITIDA,
            # Valores
            valor_servicos=valor_servicos,
            valor_deducoes=valor_deducoes,
            valor_pis=valor_pis,
            valor_cofins=valor_cofins,
            valor_inss=valor_inss,
            valor_ir=valor_ir,
            valor_csll=valor_csll,
            base_calculo=base_calculo,
            aliquota=aliquota_iss,
            valor_iss=valor_iss,
            valor_iss_retido=valor_iss_retido,
            valor_liquido=valor_liquido,
            # Discriminação
            discriminacao=dados_adicionais.get('discriminacao', ''),
            codigo_municipio=dados_adicionais.get('codigo_municipio', '3550308'),  # São Paulo
        )

        self.db.add(nota)
        self.db.flush()

        # Criar itens
        for idx, item_data in enumerate(itens, 1):
            item = NotaFiscalItem(
                nota_fiscal_id=nota.id,
                item_lista_servico=item_data.get('item_lista_servico', '01.01'),
                codigo_cnae=item_data.get('codigo_cnae', prestador.cnae_principal),
                codigo_tributacao_municipio=item_data.get('codigo_tributacao', '01'),
                discriminacao=item_data.get('discriminacao', ''),
                codigo_municipio=dados_adicionais.get('codigo_municipio', '3550308'),
                quantidade=Decimal(str(item_data.get('quantidade', 1))),
                valor_unitario=Decimal(str(item_data.get('valor_unitario', 0))),
                valor_total=Decimal(str(item_data.get('quantidade', 1))) * Decimal(str(item_data.get('valor_unitario', 0))),
            )
            self.db.add(item)

        self.db.commit()
        self.db.refresh(nota)

        return nota

    def cancelar_nfse(
        self,
        nota_id: UUID,
        codigo_cancelamento: str,
        motivo: str
    ) -> NotaFiscal:
        """
        Cancela uma NFS-e emitida

        Args:
            nota_id: ID da nota fiscal
            codigo_cancelamento: Código do motivo (ex: '1' - Erro de emissão)
            motivo: Descrição do motivo do cancelamento

        Returns:
            NotaFiscal cancelada
        """
        nota = self.db.query(NotaFiscal).filter(NotaFiscal.id == nota_id).first()

        if not nota:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nota fiscal não encontrada"
            )

        if nota.status == StatusNotaFiscal.CANCELADA:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nota fiscal já está cancelada"
            )

        # Verificar prazo para cancelamento (geralmente até o dia 10 do mês seguinte)
        data_limite = nota.data_emissao.replace(day=10, month=nota.data_emissao.month + 1)
        if datetime.now() > data_limite:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Prazo para cancelamento expirado. Limite: {data_limite.strftime('%d/%m/%Y')}"
            )

        # Cancelar nota
        nota.status = StatusNotaFiscal.CANCELADA
        nota.data_cancelamento = datetime.now()
        nota.motivo_cancelamento = f"{codigo_cancelamento} - {motivo}"

        self.db.commit()
        self.db.refresh(nota)

        return nota

    def consultar_nfse(
        self,
        numero: Optional[str] = None,
        prestador_id: Optional[UUID] = None,
        tomador_id: Optional[UUID] = None,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[List[NotaFiscal], int]:
        """
        Consulta notas fiscais com filtros

        Args:
            numero: Número da nota
            prestador_id: ID do prestador
            tomador_id: ID do tomador
            data_inicio: Data inicial de emissão
            data_fim: Data final de emissão
            skip: Paginação - registros a pular
            limit: Paginação - limite de registros

        Returns:
            Tupla (lista de notas, total)
        """
        query = self.db.query(NotaFiscal)

        if numero:
            query = query.filter(NotaFiscal.numero == numero)

        if prestador_id:
            query = query.filter(NotaFiscal.prestador_id == prestador_id)

        if tomador_id:
            query = query.filter(NotaFiscal.tomador_id == tomador_id)

        if data_inicio:
            query = query.filter(NotaFiscal.data_emissao >= data_inicio)

        if data_fim:
            query = query.filter(NotaFiscal.data_emissao <= data_fim)

        total = query.count()
        notas = query.order_by(NotaFiscal.data_emissao.desc()).offset(skip).limit(limit).all()

        return notas, total

    def gerar_livro_eletronico(
        self,
        prestador_id: UUID,
        mes: int,
        ano: int
    ) -> Dict[str, Any]:
        """
        Gera livro eletrônico de ISS para um período

        Args:
            prestador_id: ID do estabelecimento
            mes: Mês de referência
            ano: Ano de referência

        Returns:
            Dados do livro eletrônico
        """
        data_inicio = datetime(ano, mes, 1)
        if mes == 12:
            data_fim = datetime(ano + 1, 1, 1)
        else:
            data_fim = datetime(ano, mes + 1, 1)

        # Buscar notas do período
        notas = self.db.query(NotaFiscal).filter(
            NotaFiscal.prestador_id == prestador_id,
            NotaFiscal.data_emissao >= data_inicio,
            NotaFiscal.data_emissao < data_fim,
            NotaFiscal.status == StatusNotaFiscal.EMITIDA
        ).all()

        # Totalizar
        total_servicos = sum(n.valor_servicos for n in notas)
        total_base_calculo = sum(n.base_calculo for n in notas)
        total_iss = sum(n.valor_iss for n in notas)
        total_iss_retido = sum(n.valor_iss_retido for n in notas)

        return {
            "periodo": f"{mes:02d}/{ano}",
            "prestador_id": str(prestador_id),
            "quantidade_notas": len(notas),
            "total_servicos": float(total_servicos),
            "total_base_calculo": float(total_base_calculo),
            "total_iss": float(total_iss),
            "total_iss_retido": float(total_iss_retido),
            "notas": [
                {
                    "numero": n.numero,
                    "data_emissao": n.data_emissao.strftime("%d/%m/%Y"),
                    "tomador": n.tomador.nome if n.tomador.tipo_pessoa == 'F' else n.tomador.razao_social,
                    "valor_servicos": float(n.valor_servicos),
                    "base_calculo": float(n.base_calculo),
                    "aliquota": float(n.aliquota),
                    "valor_iss": float(n.valor_iss),
                    "valor_iss_retido": float(n.valor_iss_retido),
                }
                for n in notas
            ]
        }
