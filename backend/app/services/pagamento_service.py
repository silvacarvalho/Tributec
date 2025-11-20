"""
Service para Gestão de Pagamentos
Integração com PIX, Boleto e Conciliação Bancária
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from uuid import UUID
import qrcode
import io
import base64
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.arrecadacao import Pagamento, Debito, StatusPagamento, TipoPagamento
from app.models.cadastro import Pessoa
from app.services.parametro_service import ParametroService


class PagamentoService:
    """Service para operações com pagamentos"""

    def __init__(self, db: Session):
        self.db = db
        self.parametro_service = ParametroService(db)

    def gerar_pix(self, debito_id: UUID) -> Dict[str, Any]:
        """
        Gera QR Code PIX para pagamento de débito

        Args:
            debito_id: ID do débito a ser pago

        Returns:
            Dict com qr_code (base64), pix_copia_cola e dados do pagamento
        """
        # Buscar débito
        debito = self.db.query(Debito).filter(Debito.id == debito_id).first()
        if not debito:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Débito não encontrado"
            )

        # Verificar se já está pago
        if debito.status == "PAGO":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Débito já está pago"
            )

        # Obter chave PIX configurada (configurável)
        try:
            chave_pix = self.parametro_service.obter_parametro(
                "ARRECADACAO.PAGAMENTOS.CHAVE_PIX"
            )
            chave_pix = str(chave_pix) if chave_pix else "municipio@pix.gov.br"
        except ValueError:
            chave_pix = "municipio@pix.gov.br"

        valor = float(debito.valor_total)

        # Formato PIX Copia e Cola (EMV)
        # Este é um exemplo simplificado. Em produção, usar biblioteca específica
        pix_payload = self._gerar_pix_payload(
            chave=chave_pix,
            valor=valor,
            identificador=str(debito_id)[:25],
            descricao=f"Tributo Municipal - {debito.tipo_tributo}"
        )

        # Gerar QR Code
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(pix_payload)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()

        # Obter validade do PIX (configurável, em horas)
        try:
            validade_pix_horas = self.parametro_service.obter_parametro(
                "ARRECADACAO.PAGAMENTOS.VALIDADE_PIX_HORAS"
            )
            validade_horas = int(validade_pix_horas) if validade_pix_horas else 24
        except ValueError:
            validade_horas = 24

        # Criar registro de pagamento pendente
        pagamento = Pagamento(
            debito_id=debito_id,
            tipo_pagamento=TipoPagamento.PIX,
            valor_pago=valor,
            status=StatusPagamento.PENDENTE,
            pix_copia_cola=pix_payload,
            data_vencimento_pix=datetime.now() + timedelta(hours=validade_horas),
        )

        self.db.add(pagamento)
        self.db.commit()
        self.db.refresh(pagamento)

        return {
            "pagamento_id": str(pagamento.id),
            "qr_code": f"data:image/png;base64,{qr_code_base64}",
            "pix_copia_cola": pix_payload,
            "valor": valor,
            "data_vencimento": pagamento.data_vencimento_pix.isoformat(),
            "debito": {
                "id": str(debito.id),
                "tipo": debito.tipo_tributo,
                "valor": valor,
            }
        }

    def _gerar_pix_payload(
        self,
        chave: str,
        valor: float,
        identificador: str,
        descricao: str
    ) -> str:
        """
        Gera payload PIX no formato EMV (simplificado)

        Em produção, usar biblioteca como python-brcode ou similar
        """
        # Obter dados da prefeitura (configuráveis)
        try:
            nome_beneficiario = self.parametro_service.obter_parametro(
                "GERAL.MUNICIPIO.NOME_BENEFICIARIO"
            )
            nome_beneficiario = str(nome_beneficiario) if nome_beneficiario else "PREFEITURA MUNICIPAL"
        except ValueError:
            nome_beneficiario = "PREFEITURA MUNICIPAL"

        try:
            nome_cidade = self.parametro_service.obter_parametro(
                "GERAL.MUNICIPIO.NOME_CIDADE"
            )
            nome_cidade = str(nome_cidade) if nome_cidade else "CIDADE"
        except ValueError:
            nome_cidade = "CIDADE"

        # Formato EMV simplificado
        # ID 00: Payload Format Indicator
        # ID 26: Merchant Account Information (chave PIX)
        # ID 52: Merchant Category Code
        # ID 53: Transaction Currency (986 = BRL)
        # ID 54: Transaction Amount
        # ID 58: Country Code (BR)
        # ID 62: Additional Data Field Template
        # ID 63: CRC16

        payload = f"00020126{len(chave) + 14}0014BR.GOV.BCB.PIX01{len(chave)}{chave}"
        payload += f"5204000053039865802BR59{len(nome_beneficiario):02d}{nome_beneficiario}"
        payload += f"60{len(nome_cidade):02d}{nome_cidade}"
        payload += f"62{len(identificador) + 8}05{len(identificador)}{identificador}"
        payload += "6304"  # CRC placeholder

        # Calcular CRC16 (simplificado - em produção usar cálculo correto)
        crc = "ABCD"  # Em produção, calcular CRC16-CCITT
        payload += crc

        return payload

    def gerar_boleto(self, debito_id: UUID) -> Dict[str, Any]:
        """
        Gera boleto bancário para pagamento de débito

        Args:
            debito_id: ID do débito a ser pago

        Returns:
            Dict com dados do boleto (linha digitável, código de barras, etc)
        """
        # Buscar débito
        debito = self.db.query(Debito).filter(Debito.id == debito_id).first()
        if not debito:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Débito não encontrado"
            )

        # Verificar se já está pago
        if debito.status == "PAGO":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Débito já está pago"
            )

        # Buscar dados do contribuinte
        contribuinte = self.db.query(Pessoa).filter(
            Pessoa.id == debito.contribuinte_id
        ).first()

        # Obter código do banco (configurável)
        try:
            codigo_banco = self.parametro_service.obter_parametro(
                "ARRECADACAO.PAGAMENTOS.CODIGO_BANCO"
            )
            codigo_banco = str(codigo_banco) if codigo_banco else "001"
        except ValueError:
            codigo_banco = "001"  # Banco do Brasil (fallback)

        # Gerar boleto (integração com banco)
        # Em produção, integrar com API do banco (BB, Caixa, Sicoob, etc)

        # Dados do boleto (exemplo)
        nosso_numero = str(debito.id).replace('-', '')[:10]
        vencimento = debito.data_vencimento or (datetime.now() + timedelta(days=30))
        valor = float(debito.valor_total)

        # Linha digitável (exemplo simplificado)
        # Formato: AAABC.CCCCX DDDDD.DDDDDY EEEEE.EEEEEZ K UUUUVVVVVVVVVV
        moeda = "9"

        linha_digitavel = f"{codigo_banco}{moeda}.{nosso_numero[:5]} "
        linha_digitavel += f"{nosso_numero[5:10]}.{nosso_numero[10:15]} "
        linha_digitavel += f"{nosso_numero[15:20]}.{nosso_numero[20:25]} "
        linha_digitavel += f"K {int(valor * 100):014d}"

        # Criar registro de pagamento pendente
        pagamento = Pagamento(
            debito_id=debito_id,
            tipo_pagamento=TipoPagamento.BOLETO,
            valor_pago=valor,
            status=StatusPagamento.PENDENTE,
            nosso_numero=nosso_numero,
            linha_digitavel=linha_digitavel,
            data_vencimento=vencimento,
        )

        self.db.add(pagamento)
        self.db.commit()
        self.db.refresh(pagamento)

        # Obter dados do beneficiário (configuráveis)
        try:
            nome_beneficiario = self.parametro_service.obter_parametro(
                "GERAL.MUNICIPIO.NOME_BENEFICIARIO"
            )
            nome_beneficiario = str(nome_beneficiario) if nome_beneficiario else "PREFEITURA MUNICIPAL"
        except ValueError:
            nome_beneficiario = "PREFEITURA MUNICIPAL"

        try:
            cnpj_beneficiario = self.parametro_service.obter_parametro(
                "GERAL.MUNICIPIO.CNPJ"
            )
            cnpj_beneficiario = str(cnpj_beneficiario) if cnpj_beneficiario else "00.000.000/0001-00"
        except ValueError:
            cnpj_beneficiario = "00.000.000/0001-00"

        return {
            "pagamento_id": str(pagamento.id),
            "nosso_numero": nosso_numero,
            "linha_digitavel": linha_digitavel,
            "codigo_barras": linha_digitavel.replace(" ", "").replace(".", ""),
            "valor": valor,
            "data_vencimento": vencimento.strftime("%d/%m/%Y"),
            "beneficiario": {
                "nome": nome_beneficiario,
                "cnpj": cnpj_beneficiario,
            },
            "pagador": {
                "nome": contribuinte.nome if contribuinte.tipo_pessoa == 'F' else contribuinte.razao_social,
                "documento": contribuinte.cpf or contribuinte.cnpj,
            },
            "debito": {
                "id": str(debito.id),
                "tipo": debito.tipo_tributo,
                "valor": valor,
            }
        }

    def confirmar_pagamento(
        self,
        pagamento_id: UUID,
        dados_confirmacao: Dict[str, Any]
    ) -> Pagamento:
        """
        Confirma um pagamento (baixa manual ou via webhook)

        Args:
            pagamento_id: ID do pagamento
            dados_confirmacao: Dados da confirmação (txid, comprovante, etc)

        Returns:
            Pagamento atualizado
        """
        pagamento = self.db.query(Pagamento).filter(
            Pagamento.id == pagamento_id
        ).first()

        if not pagamento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pagamento não encontrado"
            )

        if pagamento.status == StatusPagamento.CONFIRMADO:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Pagamento já confirmado"
            )

        # Atualizar pagamento
        pagamento.status = StatusPagamento.CONFIRMADO
        pagamento.data_pagamento = dados_confirmacao.get('data_pagamento', datetime.now())
        pagamento.comprovante = dados_confirmacao.get('comprovante')
        pagamento.txid = dados_confirmacao.get('txid')

        # Atualizar débito
        debito = pagamento.debito
        debito.status = "PAGO"
        debito.data_pagamento = pagamento.data_pagamento

        self.db.commit()
        self.db.refresh(pagamento)

        return pagamento

    def cancelar_pagamento(self, pagamento_id: UUID, motivo: str) -> Pagamento:
        """
        Cancela um pagamento pendente

        Args:
            pagamento_id: ID do pagamento
            motivo: Motivo do cancelamento

        Returns:
            Pagamento cancelado
        """
        pagamento = self.db.query(Pagamento).filter(
            Pagamento.id == pagamento_id
        ).first()

        if not pagamento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pagamento não encontrado"
            )

        if pagamento.status == StatusPagamento.CONFIRMADO:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível cancelar pagamento já confirmado"
            )

        pagamento.status = StatusPagamento.CANCELADO
        pagamento.observacoes = motivo

        self.db.commit()
        self.db.refresh(pagamento)

        return pagamento

    def listar_pagamentos(
        self,
        contribuinte_id: Optional[UUID] = None,
        status: Optional[StatusPagamento] = None,
        tipo: Optional[TipoPagamento] = None,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[List[Pagamento], int]:
        """Lista pagamentos com filtros"""

        query = self.db.query(Pagamento)

        if contribuinte_id:
            query = query.join(Debito).filter(Debito.contribuinte_id == contribuinte_id)

        if status:
            query = query.filter(Pagamento.status == status)

        if tipo:
            query = query.filter(Pagamento.tipo_pagamento == tipo)

        if data_inicio:
            query = query.filter(Pagamento.data_pagamento >= data_inicio)

        if data_fim:
            query = query.filter(Pagamento.data_pagamento <= data_fim)

        total = query.count()
        pagamentos = query.order_by(Pagamento.data_criacao.desc()).offset(skip).limit(limit).all()

        return pagamentos, total
