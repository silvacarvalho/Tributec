"""
Serviço de Geração de PDFs
Guias de ITBI, DAM de ISSQN, Carnês de IPTU
"""
from typing import Optional
from decimal import Decimal
from datetime import date
from io import BytesIO


class PDFService:
    """
    Serviço base para geração de PDFs
    Usa HTML + CSS para gerar PDFs via biblioteca reportlab ou WeasyPrint
    """

    def __init__(self):
        # Importação lazy para evitar erro se bibliotecas não estiverem instaladas
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.lib import colors
            from reportlab.lib.units import cm
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

            self.reportlab_available = True
            self.A4 = A4
            self.colors = colors
            self.cm = cm
            self.SimpleDocTemplate = SimpleDocTemplate
            self.Table = Table
            self.TableStyle = TableStyle
            self.Paragraph = Paragraph
            self.Spacer = Spacer
            self.getSampleStyleSheet = getSampleStyleSheet
            self.ParagraphStyle = ParagraphStyle
            self.TA_CENTER = TA_CENTER
            self.TA_RIGHT = TA_RIGHT
            self.TA_LEFT = TA_LEFT
        except ImportError:
            self.reportlab_available = False

    def gerar_guia_itbi(
        self,
        numero_guia: str,
        data_emissao: date,
        valor_itbi: Decimal,
        valor_liquido: Decimal,
        data_vencimento: date,
        tipo_transmissao: str,
        imovel_inscricao: str,
        transmitente_nome: str,
        transmitente_doc: str,
        adquirente_nome: str,
        adquirente_doc: str,
        valor_declarado: Decimal,
        valor_venal: Decimal,
        aliquota_normal: Decimal,
        aliquota_sfh: Optional[Decimal] = None,
        valor_financiado_sfh: Optional[Decimal] = None,
    ) -> BytesIO:
        """
        Gera PDF da Guia de ITBI
        """
        if not self.reportlab_available:
            raise ImportError("reportlab não está instalado. Execute: pip install reportlab")

        buffer = BytesIO()
        doc = self.SimpleDocTemplate(buffer, pagesize=self.A4)
        story = []
        styles = self.getSampleStyleSheet()

        # Estilo customizado
        title_style = self.ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=self.colors.HexColor('#1a237e'),
            spaceAfter=30,
            alignment=self.TA_CENTER,
            fontName='Helvetica-Bold'
        )

        subtitle_style = self.ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontSize=12,
            textColor=self.colors.HexColor('#424242'),
            spaceAfter=12,
            alignment=self.TA_CENTER
        )

        # Cabeçalho
        story.append(self.Paragraph("PREFEITURA MUNICIPAL", title_style))
        story.append(self.Paragraph("GUIA DE RECOLHIMENTO - ITBI", subtitle_style))
        story.append(self.Paragraph(
            f"<b>Número da Guia:</b> {numero_guia}",
            subtitle_style
        ))
        story.append(self.Spacer(1, 0.5*self.cm))

        # Dados da Transmissão
        transmissao_data = [
            ['DADOS DA TRANSMISSÃO'],
            ['Tipo de Transmissão:', tipo_transmissao.replace('_', ' ')],
            ['Inscrição Imobiliária:', imovel_inscricao],
            ['Data de Emissão:', data_emissao.strftime('%d/%m/%Y')],
            ['Data de Vencimento:', data_vencimento.strftime('%d/%m/%Y')],
        ]

        transmissao_table = self.Table(transmissao_data, colWidths=[8*self.cm, 10*self.cm])
        transmissao_table.setStyle(self.TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.colors.HexColor('#1a237e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), self.colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('SPAN', (0, 0), (-1, 0)),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), self.colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, self.colors.black),
        ]))
        story.append(transmissao_table)
        story.append(self.Spacer(1, 0.5*self.cm))

        # Transmitente e Adquirente
        partes_data = [
            ['TRANSMITENTE E ADQUIRENTE'],
            ['Transmitente:', transmitente_nome],
            ['CPF/CNPJ:', transmitente_doc],
            ['Adquirente:', adquirente_nome],
            ['CPF/CNPJ:', adquirente_doc],
        ]

        partes_table = self.Table(partes_data, colWidths=[8*self.cm, 10*self.cm])
        partes_table.setStyle(self.TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.colors.HexColor('#1a237e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), self.colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('SPAN', (0, 0), (-1, 0)),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), self.colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, self.colors.black),
        ]))
        story.append(partes_table)
        story.append(self.Spacer(1, 0.5*self.cm))

        # Cálculo do ITBI
        calculo_data = [
            ['CÁLCULO DO ITBI'],
            ['Valor Declarado:', f'R$ {valor_declarado:,.2f}'],
            ['Valor Venal (IPTU):', f'R$ {valor_venal:,.2f}'],
        ]

        if valor_financiado_sfh and valor_financiado_sfh > 0:
            calculo_data.extend([
                ['Valor Financiado SFH:', f'R$ {valor_financiado_sfh:,.2f}'],
                ['Alíquota SFH:', f'{aliquota_sfh * 100:.2f}%'],
                ['Valor Não Financiado:', f'R$ {valor_declarado - valor_financiado_sfh:,.2f}'],
                ['Alíquota Normal:', f'{aliquota_normal * 100:.2f}%'],
            ])

        calculo_data.append(['VALOR DO ITBI:', f'R$ {valor_itbi:,.2f}'])

        calculo_table = self.Table(calculo_data, colWidths=[10*self.cm, 8*self.cm])
        calculo_table.setStyle(self.TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.colors.HexColor('#1a237e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), self.colors.whitesmoke),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('SPAN', (0, 0), (-1, 0)),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -2), self.colors.beige),
            ('BACKGROUND', (0, -1), (-1, -1), self.colors.HexColor('#4caf50')),
            ('TEXTCOLOR', (0, -1), (-1, -1), self.colors.whitesmoke),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 14),
            ('GRID', (0, 0), (-1, -1), 1, self.colors.black),
        ]))
        story.append(calculo_table)
        story.append(self.Spacer(1, 1*self.cm))

        # Instruções de Pagamento
        instrucoes_style = self.ParagraphStyle(
            'Instrucoes',
            parent=styles['Normal'],
            fontSize=9,
            textColor=self.colors.HexColor('#616161')
        )

        story.append(self.Paragraph("<b>INSTRUÇÕES:</b>", instrucoes_style))
        story.append(self.Paragraph(
            "1. Esta guia deve ser paga até a data de vencimento em qualquer agência bancária.",
            instrucoes_style
        ))
        story.append(self.Paragraph(
            "2. Após o pagamento, apresentar o comprovante no setor de fiscalização para liberação do registro.",
            instrucoes_style
        ))
        story.append(self.Paragraph(
            "3. O não pagamento até o vencimento implicará em multa e juros conforme legislação municipal.",
            instrucoes_style
        ))

        # Gerar PDF
        doc.build(story)
        buffer.seek(0)
        return buffer

    def gerar_dam_issqn(
        self,
        numero_declaracao: str,
        estabelecimento_nome: str,
        estabelecimento_ccm: str,
        mes_competencia: int,
        ano_competencia: int,
        receita_bruta: Decimal,
        deducoes: Decimal,
        base_calculo: Decimal,
        aliquota: Decimal,
        valor_issqn: Decimal,
        valor_retido: Decimal,
        valor_a_recolher: Decimal,
        data_vencimento: date,
    ) -> BytesIO:
        """
        Gera PDF do DAM (Documento de Arrecadação Municipal) para ISSQN
        """
        if not self.reportlab_available:
            raise ImportError("reportlab não está instalado. Execute: pip install reportlab")

        buffer = BytesIO()
        doc = self.SimpleDocTemplate(buffer, pagesize=self.A4)
        story = []
        styles = self.getSampleStyleSheet()

        # Estilo customizado
        title_style = self.ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=self.colors.HexColor('#1a237e'),
            spaceAfter=30,
            alignment=self.TA_CENTER,
            fontName='Helvetica-Bold'
        )

        subtitle_style = self.ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontSize=12,
            textColor=self.colors.HexColor('#424242'),
            spaceAfter=12,
            alignment=self.TA_CENTER
        )

        meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

        # Cabeçalho
        story.append(self.Paragraph("PREFEITURA MUNICIPAL", title_style))
        story.append(self.Paragraph("DAM - DOCUMENTO DE ARRECADAÇÃO MUNICIPAL", subtitle_style))
        story.append(self.Paragraph("ISSQN - IMPOSTO SOBRE SERVIÇOS", subtitle_style))
        story.append(self.Paragraph(
            f"<b>Declaração Nº:</b> {numero_declaracao}",
            subtitle_style
        ))
        story.append(self.Spacer(1, 0.5*self.cm))

        # Dados do Estabelecimento
        estab_data = [
            ['DADOS DO ESTABELECIMENTO'],
            ['Razão Social:', estabelecimento_nome],
            ['CCM (Inscrição Municipal):', estabelecimento_ccm],
            ['Competência:', f'{meses[mes_competencia-1]}/{ano_competencia}'],
            ['Vencimento:', data_vencimento.strftime('%d/%m/%Y')],
        ]

        estab_table = self.Table(estab_data, colWidths=[8*self.cm, 10*self.cm])
        estab_table.setStyle(self.TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.colors.HexColor('#1a237e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), self.colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('SPAN', (0, 0), (-1, 0)),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), self.colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, self.colors.black),
        ]))
        story.append(estab_table)
        story.append(self.Spacer(1, 0.5*self.cm))

        # Cálculo do ISSQN
        calculo_data = [
            ['CÁLCULO DO ISSQN'],
            ['Receita Bruta Total:', f'R$ {receita_bruta:,.2f}'],
            ['(-) Deduções Permitidas:', f'R$ {deducoes:,.2f}'],
            ['(=) Base de Cálculo:', f'R$ {base_calculo:,.2f}'],
            ['Alíquota:', f'{aliquota * 100:.2f}%'],
            ['(=) ISSQN Calculado:', f'R$ {valor_issqn:,.2f}'],
        ]

        if valor_retido > 0:
            calculo_data.append(['(-) Retenções de Terceiros:', f'R$ {valor_retido:,.2f}'])

        calculo_data.append(['VALOR A RECOLHER:', f'R$ {valor_a_recolher:,.2f}'])

        calculo_table = self.Table(calculo_data, colWidths=[10*self.cm, 8*self.cm])
        calculo_table.setStyle(self.TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.colors.HexColor('#1a237e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), self.colors.whitesmoke),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('SPAN', (0, 0), (-1, 0)),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -2), self.colors.beige),
            ('BACKGROUND', (0, -1), (-1, -1), self.colors.HexColor('#4caf50')),
            ('TEXTCOLOR', (0, -1), (-1, -1), self.colors.whitesmoke),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 14),
            ('GRID', (0, 0), (-1, -1), 1, self.colors.black),
        ]))
        story.append(calculo_table)
        story.append(self.Spacer(1, 1*self.cm))

        # Instruções
        instrucoes_style = self.ParagraphStyle(
            'Instrucoes',
            parent=styles['Normal'],
            fontSize=9,
            textColor=self.colors.HexColor('#616161')
        )

        story.append(self.Paragraph("<b>INSTRUÇÕES:</b>", instrucoes_style))
        story.append(self.Paragraph(
            "1. Pagar até o dia 10 do mês seguinte ao da prestação do serviço.",
            instrucoes_style
        ))
        story.append(self.Paragraph(
            "2. Pagamento pode ser feito em qualquer agência bancária ou via PIX.",
            instrucoes_style
        ))
        story.append(self.Paragraph(
            "3. Atraso no pagamento implica multa de 2% + juros de 1% ao mês + atualização monetária.",
            instrucoes_style
        ))

        # Gerar PDF
        doc.build(story)
        buffer.seek(0)
        return buffer
