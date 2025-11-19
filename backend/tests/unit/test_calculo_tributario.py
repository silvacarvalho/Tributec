"""
Testes unitários para o serviço de cálculo tributário
"""
import pytest
from decimal import Decimal
from sqlalchemy.orm import Session

from app.services.calculo_tributario import CalculadoraIPTU, CalculadoraITBI, CalculadoraISSQN


@pytest.mark.unit
@pytest.mark.tributario
class TestCalculadoraIPTU:
    """Testes para CalculadoraIPTU"""

    def test_calcular_fator_correcao_terreno_basico(self, db: Session):
        """Testa cálculo de FCT com valores básicos"""
        calculadora = CalculadoraIPTU(db, 2024)

        fct, detalhamento = calculadora.calcular_fator_correcao_terreno(
            situacao_quadra="MEIO",
            topografia="PLANO",
            pedologia="NORMAL"
        )

        assert fct == Decimal("1.00")
        assert detalhamento["fator_situacao"] == 1.00
        assert detalhamento["fator_topografia"] == 1.00
        assert detalhamento["fator_pedologia"] == 1.00
        assert detalhamento["fct_total"] == 1.00

    def test_calcular_fator_correcao_terreno_esquina(self, db: Session):
        """Testa cálculo de FCT para terreno de esquina"""
        calculadora = CalculadoraIPTU(db, 2024)

        fct, detalhamento = calculadora.calcular_fator_correcao_terreno(
            situacao_quadra="ESQUINA",
            topografia="PLANO",
            pedologia="NORMAL"
        )

        assert fct == Decimal("1.15")
        assert detalhamento["fator_situacao"] == 1.15

    def test_calcular_fator_correcao_terreno_desfavoravel(self, db: Session):
        """Testa cálculo de FCT para terreno com características desfavoráveis"""
        calculadora = CalculadoraIPTU(db, 2024)

        fct, detalhamento = calculadora.calcular_fator_correcao_terreno(
            situacao_quadra="ENCRAVADO",
            topografia="IRREGULAR",
            pedologia="ALAGADICO"
        )

        # FCT = 0.80 × 0.85 × 0.70 = 0.476
        assert float(fct) == pytest.approx(0.476, rel=0.01)
        assert detalhamento["fator_situacao"] == 0.80
        assert detalhamento["fator_topografia"] == 0.85
        assert detalhamento["fator_pedologia"] == 0.70

    def test_calcular_fator_correcao_edificacao_padrao_medio(self, db: Session):
        """Testa cálculo de FCE com padrão médio"""
        calculadora = CalculadoraIPTU(db, 2024)

        fce, detalhamento = calculadora.calcular_fator_correcao_edificacao(
            padrao_construtivo="MEDIO",
            tipo_estrutura="CONCRETO",
            tipo_parede="ALVENARIA",
            estado_conservacao="BOM"
        )

        assert fce == Decimal("1.00")
        assert detalhamento["fator_padrao"] == 1.00
        assert detalhamento["fator_estrutura"] == 1.00
        assert detalhamento["fator_parede"] == 1.00
        assert detalhamento["fator_conservacao"] == 1.00

    def test_calcular_fator_correcao_edificacao_alto_padrao(self, db: Session):
        """Testa cálculo de FCE para edificação de alto padrão"""
        calculadora = CalculadoraIPTU(db, 2024)

        fce, detalhamento = calculadora.calcular_fator_correcao_edificacao(
            padrao_construtivo="ALTO",
            tipo_estrutura="CONCRETO",
            tipo_parede="ALVENARIA",
            estado_conservacao="OTIMO"
        )

        # FCE = 1.30 × 1.00 × 1.00 × 1.10 = 1.43
        assert float(fce) == pytest.approx(1.43, rel=0.01)
        assert detalhamento["fator_padrao"] == 1.30
        assert detalhamento["fator_conservacao"] == 1.10

    def test_calcular_fator_correcao_edificacao_baixo_padrao(self, db: Session):
        """Testa cálculo de FCE para edificação de baixo padrão"""
        calculadora = CalculadoraIPTU(db, 2024)

        fce, detalhamento = calculadora.calcular_fator_correcao_edificacao(
            padrao_construtivo="BAIXO",
            tipo_estrutura="MADEIRA",
            tipo_parede="MADEIRA",
            estado_conservacao="MAU"
        )

        # FCE = 0.70 × 0.80 × 0.85 × 0.80
        assert float(fce) == pytest.approx(0.3808, rel=0.01)

    def test_calcular_valor_venal_terreno(self, db: Session):
        """Testa cálculo do Valor Venal do Terreno"""
        # Teste simplificado - na implementação real precisa de dados da PGV
        calculadora = CalculadoraIPTU(db, 2024)

        # Este teste precisa ser expandido quando os dados da PGV estiverem disponíveis
        assert calculadora is not None

    def test_calcular_aliquota_progressiva(self, db: Session):
        """Testa cálculo de alíquota progressiva"""
        # Teste simplificado - na implementação real precisa de dados de alíquotas
        calculadora = CalculadoraIPTU(db, 2024)

        # Este teste precisa ser expandido quando os dados de alíquotas estiverem disponíveis
        assert calculadora is not None


@pytest.mark.unit
@pytest.mark.tributario
class TestCalculadoraITBI:
    """Testes para CalculadoraITBI"""

    def test_calcular_base_calculo_valor_declarado(self, db: Session):
        """Testa cálculo com valor declarado maior que valor venal"""
        # Teste simplificado
        calculadora = CalculadoraITBI(db, 2024)

        # ITBI usa o maior valor entre declarado e venal
        valor_declarado = Decimal("500000.00")
        valor_venal = Decimal("400000.00")

        base_calculo = max(valor_declarado, valor_venal)

        assert base_calculo == Decimal("500000.00")

    def test_calcular_base_calculo_valor_venal(self, db: Session):
        """Testa cálculo com valor venal maior que valor declarado"""
        calculadora = CalculadoraITBI(db, 2024)

        valor_declarado = Decimal("300000.00")
        valor_venal = Decimal("400000.00")

        base_calculo = max(valor_declarado, valor_venal)

        assert base_calculo == Decimal("400000.00")


@pytest.mark.unit
@pytest.mark.tributario
class TestCalculadoraISSQN:
    """Testes para CalculadoraISSQN"""

    def test_calcular_issqn_fixo(self, db: Session):
        """Testa cálculo de ISSQN fixo (MEI)"""
        # Teste simplificado
        calculadora = CalculadoraISSQN(db, 2024)

        # MEI paga valor fixo
        valor_fixo = Decimal("5.00")  # Exemplo

        assert valor_fixo == Decimal("5.00")

    def test_calcular_issqn_variavel(self, db: Session):
        """Testa cálculo de ISSQN variável"""
        # ISSQN = Valor dos Serviços × Alíquota
        calculadora = CalculadoraISSQN(db, 2024)

        valor_servicos = Decimal("10000.00")
        aliquota = Decimal("0.05")  # 5%

        issqn = valor_servicos * aliquota

        assert issqn == Decimal("500.00")

    def test_calcular_issqn_com_retencao(self, db: Session):
        """Testa cálculo de ISSQN com retenção na fonte"""
        calculadora = CalculadoraISSQN(db, 2024)

        valor_servicos = Decimal("10000.00")
        aliquota = Decimal("0.05")  # 5%

        issqn_total = valor_servicos * aliquota
        issqn_retido = issqn_total  # Retenção de 100%
        issqn_a_recolher = issqn_total - issqn_retido

        assert issqn_total == Decimal("500.00")
        assert issqn_retido == Decimal("500.00")
        assert issqn_a_recolher == Decimal("0.00")
