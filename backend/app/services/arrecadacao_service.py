from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, extract, case
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import List, Optional, Dict
import base64
import qrcode
from io import BytesIO
import hashlib

from app.models.arrecadacao import Pagamento, PIXTransacao, BoletoRegistro
from app.schemas.arrecadacao import (
    DashboardArrecadacaoResponse,
    ArrecadacaoPorTributo,
    EvolucaoMensal,
    PagamentoCreate,
    PagamentoRegistro,
    PIXCreate,
    PIXResponse,
    BoletoCreate,
    BoletoResponse,
    RelatorioInadimplenciaResponse,
    InadimplenciaDetalhes,
    TipoTributo,
    StatusPagamento,
    MeioPagamento,
)
from app.utils.logging import logger

try:
    from app.utils.pdf_generator import BoletoPDFGenerator
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    logger.warning("PDF generator not available. Install reportlab: pip install reportlab")


class ArrecadacaoService:
    """Service para gerenciamento de arrecadação e pagamentos"""

    def __init__(self, db: Session):
        self.db = db

    # ==================== DASHBOARD ====================

    def get_dashboard_stats(
        self,
        data_inicio: Optional[date] = None,
        data_fim: Optional[date] = None
    ) -> DashboardArrecadacaoResponse:
        """
        Retorna estatísticas completas do dashboard de arrecadação
        """
        if not data_inicio:
            data_inicio = date.today().replace(day=1)  # Primeiro dia do mês
        if not data_fim:
            data_fim = date.today()

        # Total arrecadado
        total_arrecadado = self.db.query(
            func.sum(Pagamento.valor_pago)
        ).filter(
            Pagamento.status == StatusPagamento.PAGO,
            Pagamento.data_pagamento >= data_inicio,
            Pagamento.data_pagamento <= data_fim
        ).scalar() or Decimal(0)

        # Total previsto
        total_previsto = self.db.query(
            func.sum(Pagamento.valor_total)
        ).filter(
            Pagamento.data_vencimento >= data_inicio,
            Pagamento.data_vencimento <= data_fim
        ).scalar() or Decimal(0)

        # Taxa de arrecadação
        taxa_arrecadacao = float((total_arrecadado / total_previsto * 100) if total_previsto > 0 else 0)

        # Total pendente
        total_pendente = self.db.query(
            func.sum(Pagamento.valor_total)
        ).filter(
            Pagamento.status.in_([StatusPagamento.PENDENTE, StatusPagamento.PARCIAL])
        ).scalar() or Decimal(0)

        # Total vencido
        total_vencido = self.db.query(
            func.sum(Pagamento.valor_total)
        ).filter(
            Pagamento.status.in_([StatusPagamento.VENCIDO]),
            Pagamento.data_vencimento < date.today()
        ).scalar() or Decimal(0)

        # Inadimplência
        total_contribuintes = self.db.query(func.count(func.distinct(Pagamento.contribuinte_id))).scalar()
        inadimplentes = self.db.query(
            func.count(func.distinct(Pagamento.contribuinte_id))
        ).filter(
            Pagamento.status == StatusPagamento.VENCIDO
        ).scalar() or 0
        inadimplencia_percentual = float((inadimplentes / total_contribuintes * 100) if total_contribuintes > 0 else 0)

        # Arrecadação por tributo
        por_tributo = self._get_arrecadacao_por_tributo(data_inicio, data_fim)

        # Evolução mensal (últimos 12 meses)
        evolucao_mensal = self._get_evolucao_mensal()

        return DashboardArrecadacaoResponse(
            total_arrecadado=total_arrecadado,
            total_previsto=total_previsto,
            taxa_arrecadacao=taxa_arrecadacao,
            total_pendente=total_pendente,
            total_vencido=total_vencido,
            por_tributo=por_tributo,
            evolucao_mensal=evolucao_mensal,
            inadimplencia_percentual=inadimplencia_percentual,
            total_inadimplentes=inadimplentes
        )

    def _get_arrecadacao_por_tributo(
        self,
        data_inicio: date,
        data_fim: date
    ) -> List[ArrecadacaoPorTributo]:
        """Calcula arrecadação por tipo de tributo"""

        resultados = []
        for tipo in TipoTributo:
            arrecadado = self.db.query(
                func.sum(Pagamento.valor_pago)
            ).filter(
                Pagamento.tipo_tributo == tipo,
                Pagamento.status == StatusPagamento.PAGO,
                Pagamento.data_pagamento >= data_inicio,
                Pagamento.data_pagamento <= data_fim
            ).scalar() or Decimal(0)

            previsto = self.db.query(
                func.sum(Pagamento.valor_total)
            ).filter(
                Pagamento.tipo_tributo == tipo,
                Pagamento.data_vencimento >= data_inicio,
                Pagamento.data_vencimento <= data_fim
            ).scalar() or Decimal(0)

            quantidade = self.db.query(
                func.count(Pagamento.id)
            ).filter(
                Pagamento.tipo_tributo == tipo,
                Pagamento.status == StatusPagamento.PAGO,
                Pagamento.data_pagamento >= data_inicio,
                Pagamento.data_pagamento <= data_fim
            ).scalar() or 0

            percentual = float((arrecadado / previsto * 100) if previsto > 0 else 0)

            resultados.append(
                ArrecadacaoPorTributo(
                    tributo=tipo,
                    arrecadado=arrecadado,
                    previsto=previsto,
                    percentual=percentual,
                    quantidade_pagamentos=quantidade
                )
            )

        return resultados

    def _get_evolucao_mensal(self, meses: int = 12) -> List[EvolucaoMensal]:
        """Calcula evolução mensal dos últimos N meses"""

        meses_nomes = [
            '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ]

        resultados = []
        data_fim = date.today()

        for i in range(meses):
            data_ref = data_fim - timedelta(days=30 * i)
            mes = data_ref.month
            ano = data_ref.year

            arrecadado = self.db.query(
                func.sum(Pagamento.valor_pago)
            ).filter(
                Pagamento.status == StatusPagamento.PAGO,
                extract('month', Pagamento.data_pagamento) == mes,
                extract('year', Pagamento.data_pagamento) == ano
            ).scalar() or Decimal(0)

            previsto = self.db.query(
                func.sum(Pagamento.valor_total)
            ).filter(
                extract('month', Pagamento.data_vencimento) == mes,
                extract('year', Pagamento.data_vencimento) == ano
            ).scalar() or Decimal(0)

            # Variação em relação ao mês anterior
            if i < meses - 1:
                mes_anterior = data_fim - timedelta(days=30 * (i + 1))
                arrecadado_anterior = self.db.query(
                    func.sum(Pagamento.valor_pago)
                ).filter(
                    Pagamento.status == StatusPagamento.PAGO,
                    extract('month', Pagamento.data_pagamento) == mes_anterior.month,
                    extract('year', Pagamento.data_pagamento) == mes_anterior.year
                ).scalar() or Decimal(0)

                variacao = float(
                    ((arrecadado - arrecadado_anterior) / arrecadado_anterior * 100)
                    if arrecadado_anterior > 0 else 0
                )
            else:
                variacao = 0.0

            resultados.append(
                EvolucaoMensal(
                    mes=mes,
                    ano=ano,
                    mes_nome=meses_nomes[mes],
                    arrecadado=arrecadado,
                    previsto=previsto,
                    variacao_percentual=variacao
                )
            )

        return list(reversed(resultados))

    # ==================== PIX ====================

    def gerar_pix(self, pix_data: PIXCreate) -> PIXResponse:
        """
        Gera QR Code PIX para pagamento
        """
        logger.info(f"Gerando PIX para pagamento {pix_data.pagamento_id}")

        # Buscar pagamento
        pagamento = self.db.query(Pagamento).filter(
            Pagamento.id == pix_data.pagamento_id
        ).first()

        if not pagamento:
            raise ValueError("Pagamento não encontrado")

        if pagamento.status == StatusPagamento.PAGO:
            raise ValueError("Pagamento já foi efetuado")

        # Gerar TXID único
        txid = hashlib.md5(
            f"{pagamento.id}{datetime.now().isoformat()}".encode()
        ).hexdigest()[:32]

        # Chave PIX da prefeitura (em produção, vem de configuração)
        chave_pix = pix_data.chave_pix or "pix@prefeitura.gov.br"

        # Gerar texto PIX (formato BRCode simplificado)
        # Em produção, usar biblioteca apropriada (ex: pixqrcodegen)
        pix_texto = self._gerar_brcode(
            chave=chave_pix,
            valor=float(pix_data.valor),
            txid=txid,
            beneficiario="Prefeitura Municipal"
        )

        # Gerar QR Code
        qr_code_base64 = self._gerar_qrcode_image(pix_texto)

        # Data de expiração
        data_expiracao = datetime.now() + timedelta(minutes=pix_data.validade_minutos)

        # Salvar no banco
        pix_transacao = PIXTransacao(
            pagamento_id=pix_data.pagamento_id,
            txid=txid,
            qr_code_texto=pix_texto,
            qr_code_imagem=qr_code_base64,
            chave_pix=chave_pix,
            valor=pix_data.valor,
            data_expiracao=data_expiracao,
            status="ATIVO"
        )

        self.db.add(pix_transacao)
        self.db.commit()
        self.db.refresh(pix_transacao)

        return PIXResponse(
            id=pix_transacao.id,
            pagamento_id=pix_transacao.pagamento_id,
            qr_code=qr_code_base64,
            qr_code_texto=pix_texto,
            txid=txid,
            valor=pix_data.valor,
            data_criacao=pix_transacao.created_at,
            data_expiracao=data_expiracao,
            status="ATIVO",
            chave_pix=chave_pix
        )

    def _gerar_brcode(
        self,
        chave: str,
        valor: float,
        txid: str,
        beneficiario: str
    ) -> str:
        """Gera string BRCode (formato PIX)"""
        # Implementação simplificada
        # Em produção, usar biblioteca oficial (ex: python-qrcode-pix)
        return f"00020126{len(chave):02d}{chave}52040000530398654{len(str(valor)):02d}{valor}5802BR59{len(beneficiario):02d}{beneficiario}62{len(txid):02d}{txid}6304"

    def _gerar_qrcode_image(self, texto: str) -> str:
        """Gera imagem QR Code em base64"""
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(texto)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_base64 = base64.b64encode(buffer.getvalue()).decode()

        return img_base64

    def processar_webhook_pix(self, txid: str, data_pagamento: datetime, valor: Decimal):
        """
        Processa webhook de confirmação de pagamento PIX
        """
        logger.info(f"Processando webhook PIX para txid {txid}")

        # Buscar transação PIX
        pix = self.db.query(PIXTransacao).filter(
            PIXTransacao.txid == txid
        ).first()

        if not pix:
            logger.error(f"PIX não encontrado: {txid}")
            raise ValueError("Transação PIX não encontrada")

        # Atualizar pagamento
        pagamento = self.db.query(Pagamento).filter(
            Pagamento.id == pix.pagamento_id
        ).first()

        if pagamento:
            pagamento.status = StatusPagamento.PAGO
            pagamento.data_pagamento = data_pagamento
            pagamento.valor_pago = valor
            pagamento.meio_pagamento = MeioPagamento.PIX

        # Atualizar PIX
        pix.status = "CONCLUIDO"
        pix.data_pagamento = data_pagamento

        self.db.commit()

        logger.info(f"Pagamento {pix.pagamento_id} confirmado via PIX")

    # ==================== BOLETO ====================

    def gerar_boleto(self, boleto_data: BoletoCreate) -> BoletoResponse:
        """
        Gera boleto bancário
        """
        logger.info(f"Gerando boleto para pagamento {boleto_data.pagamento_id}")

        # Buscar pagamento
        pagamento = self.db.query(Pagamento).filter(
            Pagamento.id == boleto_data.pagamento_id
        ).first()

        if not pagamento:
            raise ValueError("Pagamento não encontrado")

        # Gerar nosso número (em produção, vem do banco)
        nosso_numero = self._gerar_nosso_numero()

        # Gerar código de barras e linha digitável
        codigo_barras = self._gerar_codigo_barras(nosso_numero, boleto_data.valor, boleto_data.data_vencimento)
        linha_digitavel = self._formatar_linha_digitavel(codigo_barras)

        # Salvar no banco
        boleto = BoletoRegistro(
            pagamento_id=boleto_data.pagamento_id,
            nosso_numero=nosso_numero,
            codigo_barras=codigo_barras,
            linha_digitavel=linha_digitavel,
            data_vencimento=boleto_data.data_vencimento,
            valor=boleto_data.valor,
            juros_dia=boleto_data.juros_dia or Decimal(0),
            multa_apos_vencimento=boleto_data.multa_apos_vencimento or Decimal(0),
            status="REGISTRADO"
        )

        self.db.add(boleto)
        self.db.commit()
        self.db.refresh(boleto)

        # Gerar PDF do boleto
        pdf_base64 = None
        if PDF_AVAILABLE:
            try:
                pdf_generator = BoletoPDFGenerator()
                pdf_base64 = pdf_generator.gerar_boleto(
                    nosso_numero=nosso_numero,
                    codigo_barras=codigo_barras,
                    linha_digitavel=linha_digitavel,
                    valor=boleto_data.valor,
                    data_vencimento=boleto_data.data_vencimento,
                    sacado_nome=pagamento.contribuinte.nome if pagamento.contribuinte else "",
                    sacado_cpf_cnpj=pagamento.contribuinte.cpf_cnpj if pagamento.contribuinte else "",
                    sacado_endereco="",  # Buscar do cadastro
                    instrucoes=boleto_data.instrucoes,
                    numero_documento=str(pagamento.id),
                    juros_mora=boleto_data.juros_dia,
                    multa=boleto_data.multa_apos_vencimento,
                )
                logger.info(f"PDF gerado para boleto {nosso_numero}")
            except Exception as e:
                logger.error(f"Erro ao gerar PDF do boleto: {str(e)}")

        return BoletoResponse(
            id=boleto.id,
            pagamento_id=boleto.pagamento_id,
            nosso_numero=nosso_numero,
            linha_digitavel=linha_digitavel,
            codigo_barras=codigo_barras,
            data_vencimento=boleto.data_vencimento,
            valor=boleto.valor,
            status="REGISTRADO",
            data_registro=boleto.created_at,
            pdf_base64=pdf_base64
        )

    def _gerar_nosso_numero(self) -> str:
        """Gera nosso número sequencial"""
        # Em produção, consultar sequência do banco
        ultimo = self.db.query(func.max(BoletoRegistro.nosso_numero)).scalar()
        if ultimo:
            return str(int(ultimo) + 1).zfill(11)
        return "00000000001"

    def _gerar_codigo_barras(self, nosso_numero: str, valor: Decimal, vencimento: date) -> str:
        """Gera código de barras do boleto"""
        # Implementação simplificada
        # Em produção, seguir padrão FEBRABAN
        banco = "001"  # Código do banco
        moeda = "9"  # Real
        fator_vencimento = (vencimento - date(1997, 10, 7)).days
        valor_str = str(int(valor * 100)).zfill(10)

        codigo = f"{banco}{moeda}0{fator_vencimento}{valor_str}000{nosso_numero}"
        return codigo

    def _formatar_linha_digitavel(self, codigo_barras: str) -> str:
        """Formata linha digitável a partir do código de barras"""
        # Implementação simplificada
        # Em produção, calcular dígitos verificadores corretos
        return f"{codigo_barras[0:5]}.{codigo_barras[5:10]} {codigo_barras[10:15]}.{codigo_barras[15:21]} {codigo_barras[21:26]}.{codigo_barras[26:32]} {codigo_barras[32:33]} {codigo_barras[33:]}"

    # ==================== RELATÓRIOS ====================

    def get_relatorio_inadimplencia(self) -> RelatorioInadimplenciaResponse:
        """
        Gera relatório de inadimplência
        """
        # Total inadimplentes
        inadimplentes = self.db.query(
            func.count(func.distinct(Pagamento.contribuinte_id))
        ).filter(
            Pagamento.status == StatusPagamento.VENCIDO
        ).scalar() or 0

        # Valor total
        valor_total = self.db.query(
            func.sum(Pagamento.valor_total)
        ).filter(
            Pagamento.status == StatusPagamento.VENCIDO
        ).scalar() or Decimal(0)

        # Por faixa de dias
        hoje = date.today()
        por_faixa_dias = {
            "0-30": 0,
            "31-60": 0,
            "61-90": 0,
            "91-180": 0,
            "181+": 0
        }

        # Devedores detalhados (top 100)
        devedores = []

        # Implementação simplificada
        # Em produção, fazer queries mais eficientes

        return RelatorioInadimplenciaResponse(
            total_inadimplentes=inadimplentes,
            valor_total=valor_total,
            por_faixa_dias=por_faixa_dias,
            por_score={"BAIXO": 0, "MEDIO": 0, "ALTO": 0, "CRITICO": 0},
            devedores=devedores
        )
