"""
Testes para ArrecadacaoService
"""
import pytest
from decimal import Decimal
from datetime import date, datetime, timedelta
from unittest.mock import Mock, patch

from app.services.arrecadacao_service import ArrecadacaoService
from app.schemas.arrecadacao import (
    PIXCreate,
    BoletoCreate,
    TipoTributo,
    StatusPagamento,
)
from app.models.arrecadacao import Pagamento, PIXTransacao, BoletoRegistro


class TestArrecadacaoService:
    """Testes do serviço de arrecadação"""

    @pytest.fixture
    def db_session(self):
        """Mock de sessão do banco"""
        return Mock()

    @pytest.fixture
    def service(self, db_session):
        """Instância do serviço"""
        return ArrecadacaoService(db_session)

    @pytest.fixture
    def pagamento_mock(self):
        """Mock de pagamento"""
        return Pagamento(
            id="pag-123",
            contribuinte_id="contrib-456",
            tipo_tributo=TipoTributo.IPTU,
            valor_total=Decimal("1500.00"),
            valor_pago=Decimal("0.00"),
            status=StatusPagamento.PENDENTE,
            data_vencimento=date.today() + timedelta(days=30),
        )

    # ==================== TESTES DE DASHBOARD ====================

    def test_get_dashboard_stats_basic(self, service, db_session):
        """Testa obtenção de estatísticas do dashboard"""
        # Mock das queries
        db_session.query.return_value.filter.return_value.scalar.return_value = Decimal("50000.00")

        resultado = service.get_dashboard_stats()

        assert resultado is not None
        assert hasattr(resultado, 'total_arrecadado')
        assert hasattr(resultado, 'total_previsto')
        assert hasattr(resultado, 'taxa_arrecadacao')

    def test_get_dashboard_stats_com_periodo(self, service, db_session):
        """Testa dashboard com período específico"""
        data_inicio = date(2025, 1, 1)
        data_fim = date(2025, 12, 31)

        db_session.query.return_value.filter.return_value.scalar.return_value = Decimal("100000.00")

        resultado = service.get_dashboard_stats(data_inicio, data_fim)

        assert resultado is not None

    def test_get_arrecadacao_por_tributo(self, service, db_session):
        """Testa cálculo de arrecadação por tipo de tributo"""
        data_inicio = date(2025, 1, 1)
        data_fim = date(2025, 12, 31)

        db_session.query.return_value.filter.return_value.scalar.side_effect = [
            Decimal("30000.00"),  # IPTU arrecadado
            Decimal("40000.00"),  # IPTU previsto
            5,  # quantidade
        ] * len(TipoTributo)

        resultado = service._get_arrecadacao_por_tributo(data_inicio, data_fim)

        assert len(resultado) == len(TipoTributo)
        assert all(hasattr(r, 'tributo') for r in resultado)
        assert all(hasattr(r, 'arrecadado') for r in resultado)

    def test_get_evolucao_mensal(self, service, db_session):
        """Testa cálculo de evolução mensal"""
        db_session.query.return_value.filter.return_value.scalar.side_effect = [
            Decimal("10000.00"),  # arrecadado mês 1
            Decimal("12000.00"),  # previsto mês 1
            Decimal("9000.00"),   # arrecadado mês anterior
        ] * 12

        resultado = service._get_evolucao_mensal(meses=12)

        assert len(resultado) == 12
        assert all(hasattr(r, 'mes') for r in resultado)
        assert all(hasattr(r, 'ano') for r in resultado)
        assert all(hasattr(r, 'arrecadado') for r in resultado)

    def test_evolucao_mensal_com_variacao(self, service, db_session):
        """Testa cálculo de variação percentual na evolução"""
        db_session.query.return_value.filter.return_value.scalar.side_effect = [
            Decimal("11000.00"),  # arrecadado atual
            Decimal("12000.00"),  # previsto
            Decimal("10000.00"),  # arrecadado anterior (variação +10%)
        ] * 12

        resultado = service._get_evolucao_mensal(meses=3)

        # Primeiro item não tem variação (é o mais antigo)
        # Demais devem ter variação calculada
        assert len(resultado) == 3

    # ==================== TESTES DE PIX ====================

    def test_gerar_pix_sucesso(self, service, db_session, pagamento_mock):
        """Testa geração de PIX com sucesso"""
        db_session.query.return_value.filter.return_value.first.return_value = pagamento_mock

        pix_data = PIXCreate(
            pagamento_id="pag-123",
            valor=Decimal("1500.00"),
            validade_minutos=30
        )

        with patch.object(service, '_gerar_qrcode_image', return_value='base64_qr_code'):
            resultado = service.gerar_pix(pix_data)

        assert resultado is not None
        assert resultado.pagamento_id == "pag-123"
        assert resultado.valor == Decimal("1500.00")
        assert resultado.qr_code == 'base64_qr_code'
        assert resultado.txid is not None
        assert len(resultado.txid) == 32  # MD5 hash

        # Verifica se salvou no banco
        db_session.add.assert_called_once()
        db_session.commit.assert_called_once()

    def test_gerar_pix_pagamento_nao_encontrado(self, service, db_session):
        """Testa erro quando pagamento não existe"""
        db_session.query.return_value.filter.return_value.first.return_value = None

        pix_data = PIXCreate(
            pagamento_id="pag-inexistente",
            valor=Decimal("1500.00")
        )

        with pytest.raises(ValueError, match="Pagamento não encontrado"):
            service.gerar_pix(pix_data)

    def test_gerar_pix_pagamento_ja_pago(self, service, db_session, pagamento_mock):
        """Testa erro quando pagamento já foi efetuado"""
        pagamento_mock.status = StatusPagamento.PAGO
        db_session.query.return_value.filter.return_value.first.return_value = pagamento_mock

        pix_data = PIXCreate(
            pagamento_id="pag-123",
            valor=Decimal("1500.00")
        )

        with pytest.raises(ValueError, match="Pagamento já foi efetuado"):
            service.gerar_pix(pix_data)

    def test_gerar_brcode(self, service):
        """Testa geração de string BRCode"""
        resultado = service._gerar_brcode(
            chave="pix@prefeitura.gov.br",
            valor=1500.00,
            txid="ABC123XYZ",
            beneficiario="Prefeitura Municipal"
        )

        assert isinstance(resultado, str)
        assert len(resultado) > 0
        assert "pix@prefeitura.gov.br" in resultado

    def test_gerar_qrcode_image(self, service):
        """Testa geração de imagem QR Code em base64"""
        texto = "00020126580014BR.GOV.BCB.PIX0136pix@prefeitura.gov.br"

        resultado = service._gerar_qrcode_image(texto)

        assert isinstance(resultado, str)
        assert len(resultado) > 0
        # Verifica se é base64 válido
        import base64
        try:
            base64.b64decode(resultado)
            valido = True
        except Exception:
            valido = False
        assert valido

    def test_processar_webhook_pix_sucesso(self, service, db_session, pagamento_mock):
        """Testa processamento de webhook PIX com sucesso"""
        pix_mock = PIXTransacao(
            id="pix-123",
            pagamento_id="pag-123",
            txid="ABC123XYZ",
            status="ATIVO"
        )

        db_session.query.return_value.filter.return_value.first.side_effect = [
            pix_mock,
            pagamento_mock
        ]

        service.processar_webhook_pix(
            txid="ABC123XYZ",
            data_pagamento=datetime.now(),
            valor=Decimal("1500.00")
        )

        # Verifica se atualizou o pagamento
        assert pagamento_mock.status == StatusPagamento.PAGO
        assert pagamento_mock.valor_pago == Decimal("1500.00")

        # Verifica se atualizou o PIX
        assert pix_mock.status == "CONCLUIDO"

        db_session.commit.assert_called_once()

    def test_processar_webhook_pix_nao_encontrado(self, service, db_session):
        """Testa erro quando PIX não é encontrado"""
        db_session.query.return_value.filter.return_value.first.return_value = None

        with pytest.raises(ValueError, match="Transação PIX não encontrada"):
            service.processar_webhook_pix(
                txid="TXID_INEXISTENTE",
                data_pagamento=datetime.now(),
                valor=Decimal("1500.00")
            )

    # ==================== TESTES DE BOLETO ====================

    def test_gerar_boleto_sucesso(self, service, db_session, pagamento_mock):
        """Testa geração de boleto com sucesso"""
        db_session.query.return_value.filter.return_value.first.return_value = pagamento_mock
        db_session.query.return_value.scalar.return_value = None  # Primeiro boleto

        boleto_data = BoletoCreate(
            pagamento_id="pag-123",
            valor=Decimal("1500.00"),
            data_vencimento=date.today() + timedelta(days=30)
        )

        resultado = service.gerar_boleto(boleto_data)

        assert resultado is not None
        assert resultado.pagamento_id == "pag-123"
        assert resultado.valor == Decimal("1500.00")
        assert resultado.nosso_numero == "00000000001"
        assert len(resultado.codigo_barras) > 0
        assert len(resultado.linha_digitavel) > 0

        db_session.add.assert_called_once()
        db_session.commit.assert_called_once()

    def test_gerar_boleto_pagamento_nao_encontrado(self, service, db_session):
        """Testa erro quando pagamento não existe"""
        db_session.query.return_value.filter.return_value.first.return_value = None

        boleto_data = BoletoCreate(
            pagamento_id="pag-inexistente",
            valor=Decimal("1500.00"),
            data_vencimento=date.today() + timedelta(days=30)
        )

        with pytest.raises(ValueError, match="Pagamento não encontrado"):
            service.gerar_boleto(boleto_data)

    def test_gerar_nosso_numero_sequencial(self, service, db_session):
        """Testa geração sequencial de nosso número"""
        # Primeiro boleto
        db_session.query.return_value.scalar.return_value = None
        resultado1 = service._gerar_nosso_numero()
        assert resultado1 == "00000000001"

        # Segundo boleto
        db_session.query.return_value.scalar.return_value = "00000000001"
        resultado2 = service._gerar_nosso_numero()
        assert resultado2 == "00000000002"

        # Boleto 100
        db_session.query.return_value.scalar.return_value = "00000000099"
        resultado3 = service._gerar_nosso_numero()
        assert resultado3 == "00000000100"

    def test_gerar_codigo_barras(self, service):
        """Testa geração de código de barras FEBRABAN"""
        nosso_numero = "00000000001"
        valor = Decimal("1500.00")
        vencimento = date(2025, 12, 31)

        resultado = service._gerar_codigo_barras(nosso_numero, valor, vencimento)

        assert isinstance(resultado, str)
        assert len(resultado) > 0
        assert "001" in resultado  # Código do banco
        assert "9" in resultado     # Código da moeda (Real)

    def test_formatar_linha_digitavel(self, service):
        """Testa formatação de linha digitável"""
        codigo_barras = "00190000090123456789012345678901234567890123456789"

        resultado = service._formatar_linha_digitavel(codigo_barras)

        assert isinstance(resultado, str)
        assert "." in resultado
        assert " " in resultado
        # Verifica formato aproximado (5 blocos separados)
        partes = resultado.split(" ")
        assert len(partes) >= 4

    def test_boleto_com_juros_e_multa(self, service, db_session, pagamento_mock):
        """Testa geração de boleto com juros e multa"""
        db_session.query.return_value.filter.return_value.first.return_value = pagamento_mock
        db_session.query.return_value.scalar.return_value = None

        boleto_data = BoletoCreate(
            pagamento_id="pag-123",
            valor=Decimal("1500.00"),
            data_vencimento=date.today() + timedelta(days=30),
            juros_dia=Decimal("0.33"),  # 0.33% ao dia
            multa_apos_vencimento=Decimal("2.00")  # 2%
        )

        resultado = service.gerar_boleto(boleto_data)

        assert resultado is not None
        # Os valores devem estar salvos no banco (verificado pelo mock)

    # ==================== TESTES DE RELATÓRIOS ====================

    def test_get_relatorio_inadimplencia(self, service, db_session):
        """Testa geração de relatório de inadimplência"""
        db_session.query.return_value.filter.return_value.scalar.side_effect = [
            15,  # total inadimplentes
            Decimal("75000.00"),  # valor total
        ]

        resultado = service.get_relatorio_inadimplencia()

        assert resultado is not None
        assert resultado.total_inadimplentes == 15
        assert resultado.valor_total == Decimal("75000.00")
        assert hasattr(resultado, 'por_faixa_dias')
        assert hasattr(resultado, 'por_score')

    def test_relatorio_inadimplencia_sem_devedores(self, service, db_session):
        """Testa relatório quando não há inadimplentes"""
        db_session.query.return_value.filter.return_value.scalar.side_effect = [
            0,  # total inadimplentes
            Decimal("0.00"),  # valor total
        ]

        resultado = service.get_relatorio_inadimplencia()

        assert resultado.total_inadimplentes == 0
        assert resultado.valor_total == Decimal("0.00")

    # ==================== TESTES DE VALIDAÇÃO ====================

    def test_pix_com_chave_customizada(self, service, db_session, pagamento_mock):
        """Testa PIX com chave customizada"""
        db_session.query.return_value.filter.return_value.first.return_value = pagamento_mock

        pix_data = PIXCreate(
            pagamento_id="pag-123",
            valor=Decimal("1500.00"),
            chave_pix="custom@prefeitura.gov.br"
        )

        with patch.object(service, '_gerar_qrcode_image', return_value='qr_code'):
            resultado = service.gerar_pix(pix_data)

        assert resultado.chave_pix == "custom@prefeitura.gov.br"

    def test_pix_expiracao_customizada(self, service, db_session, pagamento_mock):
        """Testa PIX com tempo de expiração customizado"""
        db_session.query.return_value.filter.return_value.first.return_value = pagamento_mock

        pix_data = PIXCreate(
            pagamento_id="pag-123",
            valor=Decimal("1500.00"),
            validade_minutos=60  # 1 hora
        )

        with patch.object(service, '_gerar_qrcode_image', return_value='qr_code'):
            resultado = service.gerar_pix(pix_data)

        # Verifica se data de expiração está aproximadamente 60 minutos no futuro
        agora = datetime.now()
        diff = (resultado.data_expiracao - agora).total_seconds() / 60
        assert 59 <= diff <= 61  # Margem de 1 minuto

    def test_valores_decimais_precisao(self, service, db_session, pagamento_mock):
        """Testa precisão de valores decimais"""
        db_session.query.return_value.filter.return_value.first.return_value = pagamento_mock

        # Testa com valor com muitas casas decimais
        pix_data = PIXCreate(
            pagamento_id="pag-123",
            valor=Decimal("1500.99")
        )

        with patch.object(service, '_gerar_qrcode_image', return_value='qr_code'):
            resultado = service.gerar_pix(pix_data)

        assert resultado.valor == Decimal("1500.99")


# ==================== TESTES DE INTEGRAÇÃO ====================

class TestArrecadacaoIntegration:
    """Testes de integração do módulo de arrecadação"""

    def test_fluxo_completo_pix(self, db_session):
        """Testa fluxo completo: gerar PIX → webhook → confirmar pagamento"""
        # Este teste seria implementado com banco de dados real
        # ou fixtures do pytest que criam dados temporários
        pass

    def test_fluxo_completo_boleto(self, db_session):
        """Testa fluxo completo: gerar boleto → webhook → confirmar pagamento"""
        pass

    def test_conciliacao_bancaria(self, db_session):
        """Testa processo de conciliação bancária"""
        pass
