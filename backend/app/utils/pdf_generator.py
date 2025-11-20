"""
Gerador de PDFs para boletos bancários
"""
from io import BytesIO
from datetime import date
from decimal import Decimal
from typing import Optional
import base64

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        SimpleDocTemplate, Table, TableStyle, Paragraph,
        Spacer, Image as RLImage
    )
    from reportlab.pdfgen import canvas
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


class BoletoPDFGenerator:
    """Gerador de PDF para boletos bancários"""

    def __init__(self):
        if not REPORTLAB_AVAILABLE:
            raise ImportError(
                "ReportLab não está instalado. "
                "Instale com: pip install reportlab"
            )

        self.width, self.height = A4
        self.styles = getSampleStyleSheet()

        # Estilo customizado para título
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#1976d2'),
            spaceAfter=20,
        )

    def gerar_boleto(
        self,
        nosso_numero: str,
        codigo_barras: str,
        linha_digitavel: str,
        valor: Decimal,
        data_vencimento: date,
        cedente: str = "Prefeitura Municipal",
        sacado_nome: str = "",
        sacado_cpf_cnpj: str = "",
        sacado_endereco: str = "",
        instrucoes: Optional[list[str]] = None,
        numero_documento: str = "",
        data_documento: Optional[date] = None,
        especie_doc: str = "DM",
        aceite: str = "N",
        data_processamento: Optional[date] = None,
        carteira: str = "18",
        uso_banco: str = "",
        juros_mora: Optional[Decimal] = None,
        multa: Optional[Decimal] = None,
        desconto: Optional[Decimal] = None,
    ) -> str:
        """
        Gera PDF do boleto bancário

        Returns:
            PDF em base64
        """
        buffer = BytesIO()

        # Criar documento
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=10*mm,
            leftMargin=10*mm,
            topMargin=10*mm,
            bottomMargin=10*mm,
        )

        # Container para elementos
        elements = []

        # Data de processamento padrão é hoje
        if not data_processamento:
            data_processamento = date.today()
        if not data_documento:
            data_documento = date.today()

        # Instruções padrão
        if not instrucoes:
            instrucoes = [
                "- Não receber após o vencimento",
                f"- Multa de {multa or Decimal('2.00')}% após vencimento",
                f"- Juros de mora de {juros_mora or Decimal('0.33')}% ao dia",
            ]

        # ==================== CABEÇALHO ====================

        # Banco (simulado - 001 = Banco do Brasil)
        banco_info = Table(
            [
                ["001-9", "", ""],
                ["BANCO DO BRASIL S.A.", "", ""],
            ],
            colWidths=[40*mm, 80*mm, 60*mm],
        )
        banco_info.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(banco_info)
        elements.append(Spacer(1, 5*mm))

        # ==================== LINHA DIGITÁVEL ====================

        linha_para = Paragraph(
            f"<b>{linha_digitavel}</b>",
            ParagraphStyle(
                'LinhaDigitavel',
                parent=self.styles['Normal'],
                fontSize=12,
                alignment=1,  # Center
                spaceAfter=10,
            )
        )
        elements.append(linha_para)
        elements.append(Spacer(1, 5*mm))

        # ==================== DADOS DO BOLETO ====================

        dados_boleto = [
            ["Local de Pagamento", "PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO"],
            ["Cedente", cedente],
            ["Data do Documento", data_documento.strftime("%d/%m/%Y")],
            ["Número do Documento", numero_documento or nosso_numero],
            ["Espécie Doc.", especie_doc],
            ["Aceite", aceite],
            ["Data Processamento", data_processamento.strftime("%d/%m/%Y")],
            ["Nosso Número", nosso_numero],
            ["Uso do Banco", uso_banco],
            ["Carteira", carteira],
            ["Espécie", "R$"],
            ["Quantidade", ""],
            ["Valor", ""],
            ["Instruções", ""],
        ]

        # Adiciona instruções
        for instrucao in instrucoes[:5]:  # Máximo 5 instruções
            dados_boleto.append(["", instrucao])

        # Dados da direita (valor e vencimento)
        dados_valor = [
            ["Vencimento", data_vencimento.strftime("%d/%m/%Y")],
            ["Agência/Código Cedente", "0000-0 / 0000000-0"],
            ["Valor Documento", f"R$ {valor:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')],
            ["(-) Desconto/Abatimento", f"R$ {desconto or Decimal('0.00'):,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')],
            ["(-) Outras Deduções", ""],
            ["(+) Mora/Multa", f"{juros_mora or Decimal('0.00')}% / {multa or Decimal('0.00')}%"],
            ["(+) Outros Acréscimos", ""],
            ["(=) Valor Cobrado", ""],
        ]

        # Tabela de dados do boleto
        table_data = []
        for i, (label, valor_campo) in enumerate(dados_boleto):
            if i < len(dados_valor):
                label_dir, valor_dir = dados_valor[i]
                table_data.append([
                    label, valor_campo,
                    label_dir, valor_dir
                ])
            else:
                table_data.append([label, valor_campo, "", ""])

        dados_table = Table(
            table_data,
            colWidths=[35*mm, 65*mm, 40*mm, 40*mm],
        )
        dados_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
            ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#f0f0f0')),
        ]))
        elements.append(dados_table)
        elements.append(Spacer(1, 5*mm))

        # ==================== DADOS DO SACADO ====================

        sacado_info = [
            ["Sacado", f"{sacado_nome} - CPF/CNPJ: {sacado_cpf_cnpj}"],
            ["Endereço", sacado_endereco],
        ]

        sacado_table = Table(
            sacado_info,
            colWidths=[30*mm, 150*mm],
        )
        sacado_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
        ]))
        elements.append(sacado_table)
        elements.append(Spacer(1, 5*mm))

        # ==================== CÓDIGO DE BARRAS ====================

        # Criar representação visual do código de barras
        # (Em produção, usar biblioteca específica como python-barcode)
        codigo_barras_para = Paragraph(
            f"<font name='Courier' size='10'>{codigo_barras}</font>",
            ParagraphStyle(
                'CodigoBarras',
                parent=self.styles['Normal'],
                fontSize=10,
                fontName='Courier',
                alignment=1,  # Center
                spaceAfter=5,
            )
        )
        elements.append(codigo_barras_para)

        # Linha de corte
        elements.append(Spacer(1, 10*mm))
        corte_para = Paragraph(
            "✂ - - - - - - - - - - - - - - - - - CORTE AQUI - - - - - - - - - - - - - - - - -",
            ParagraphStyle(
                'Corte',
                parent=self.styles['Normal'],
                fontSize=8,
                alignment=1,
                textColor=colors.grey,
            )
        )
        elements.append(corte_para)

        # Rodapé
        elements.append(Spacer(1, 5*mm))
        rodape = Paragraph(
            "<i>Documento gerado automaticamente pelo Sistema Tributec</i>",
            ParagraphStyle(
                'Rodape',
                parent=self.styles['Normal'],
                fontSize=7,
                alignment=1,
                textColor=colors.grey,
            )
        )
        elements.append(rodape)

        # Gerar PDF
        doc.build(elements)

        # Converter para base64
        pdf_bytes = buffer.getvalue()
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')

        buffer.close()

        return pdf_base64

    def gerar_recibo_simples(
        self,
        titulo: str,
        valor: Decimal,
        data: date,
        descricao: str,
        pagador: str,
        recebedor: str = "Prefeitura Municipal",
    ) -> str:
        """
        Gera PDF de recibo simples

        Returns:
            PDF em base64
        """
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Título
        c.setFont("Helvetica-Bold", 18)
        c.drawCentredString(width/2, height - 50, titulo)

        # Linha separadora
        c.setLineWidth(1)
        c.line(50, height - 70, width - 50, height - 70)

        # Informações
        c.setFont("Helvetica", 12)
        y = height - 110

        c.drawString(50, y, f"Valor: R$ {valor:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'))
        y -= 30

        c.drawString(50, y, f"Data: {data.strftime('%d/%m/%Y')}")
        y -= 30

        c.drawString(50, y, f"Pagador: {pagador}")
        y -= 30

        c.drawString(50, y, f"Recebedor: {recebedor}")
        y -= 50

        c.drawString(50, y, "Descrição:")
        y -= 20
        c.setFont("Helvetica", 10)
        c.drawString(70, y, descricao[:100])

        # Rodapé
        c.setFont("Helvetica-Oblique", 8)
        c.drawCentredString(width/2, 50, "Documento gerado automaticamente")

        c.save()

        pdf_bytes = buffer.getvalue()
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')

        buffer.close()

        return pdf_base64
