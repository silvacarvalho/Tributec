"""
Serviço de Cálculo Tributário
Motor de cálculo para IPTU, ITBI e ISSQN
"""
from datetime import date
from decimal import Decimal
from typing import Dict, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.cadastro import Imovel, ImovelTerreno, ImovelEdificacao
from app.models.tributario import PlantaGenericaValor, TabelaPrecoConstrucao, Aliquota


class CalculadoraIPTU:
    """
    Calculadora de IPTU

    Fórmula:
    - VVT = Área_Terreno × VmTT × FCT
    - VVE = Área_Edificação × VmTE × FCE
    - VVI = VVT + VVE
    - IPTU = VVI × Alíquota_Progressiva

    Onde:
    - VVT: Valor Venal do Terreno
    - VVE: Valor Venal da Edificação
    - VVI: Valor Venal do Imóvel
    - VmTT: Valor do metro quadrado do terreno (Planta Genérica de Valores)
    - VmTE: Valor do metro quadrado da edificação (Tabela de Preços de Construção)
    - FCT: Fator de Correção do Terreno
    - FCE: Fator de Correção da Edificação
    """

    def __init__(self, db: Session, ano_exercicio: int):
        self.db = db
        self.ano_exercicio = ano_exercicio

    def calcular_fator_correcao_terreno(
        self,
        situacao_quadra: str,
        topografia: str,
        pedologia: str
    ) -> Tuple[Decimal, Dict]:
        """
        Calcula o Fator de Correção do Terreno (FCT)

        FCT = Fat_Situacao × Fat_Topografia × Fat_Pedologia
        """
        # Fator de situação na quadra
        fatores_situacao = {
            "MEIO": Decimal("1.00"),
            "ESQUINA": Decimal("1.15"),
            "DUAS_FRENTES": Decimal("1.20"),
            "TRES_FRENTES": Decimal("1.25"),
            "QUATRO_FRENTES": Decimal("1.30"),
            "ENCRAVADO": Decimal("0.80")
        }

        # Fator de topografia
        fatores_topografia = {
            "PLANO": Decimal("1.00"),
            "ACLIVE": Decimal("0.95"),
            "DECLIVE": Decimal("0.95"),
            "IRREGULAR": Decimal("0.85")
        }

        # Fator de pedologia (tipo de solo)
        fatores_pedologia = {
            "NORMAL": Decimal("1.00"),
            "ALAGADICO": Decimal("0.70"),
            "ROCHOSO": Decimal("0.85"),
            "SAIBRO": Decimal("0.90")
        }

        fat_situacao = fatores_situacao.get(situacao_quadra, Decimal("1.00"))
        fat_topografia = fatores_topografia.get(topografia, Decimal("1.00"))
        fat_pedologia = fatores_pedologia.get(pedologia, Decimal("1.00"))

        fct = fat_situacao * fat_topografia * fat_pedologia

        detalhamento = {
            "fator_situacao": float(fat_situacao),
            "fator_topografia": float(fat_topografia),
            "fator_pedologia": float(fat_pedologia),
            "fct_total": float(fct)
        }

        return fct, detalhamento

    def calcular_fator_correcao_edificacao(
        self,
        padrao_construtivo: str,
        tipo_estrutura: str,
        tipo_parede: str,
        estado_conservacao: str
    ) -> Tuple[Decimal, Dict]:
        """
        Calcula o Fator de Correção da Edificação (FCE)

        FCE = Fat_Padrao × Fat_Estrutura × Fat_Parede × Fat_Conservacao
        """
        # Fator de padrão construtivo
        fatores_padrao = {
            "ALTO": Decimal("1.30"),
            "MEDIO_ALTO": Decimal("1.15"),
            "MEDIO": Decimal("1.00"),
            "MEDIO_BAIXO": Decimal("0.85"),
            "BAIXO": Decimal("0.70")
        }

        # Fator de estrutura
        fatores_estrutura = {
            "CONCRETO": Decimal("1.00"),
            "METALICA": Decimal("0.95"),
            "MADEIRA": Decimal("0.80"),
            "ALVENARIA": Decimal("0.90"),
            "MISTA": Decimal("0.85")
        }

        # Fator de parede
        fatores_parede = {
            "ALVENARIA": Decimal("1.00"),
            "MADEIRA": Decimal("0.85"),
            "MISTA": Decimal("0.90"),
            "PRE_MOLDADA": Decimal("0.95")
        }

        # Fator de estado de conservação
        fatores_conservacao = {
            "OTIMO": Decimal("1.10"),
            "BOM": Decimal("1.00"),
            "REGULAR": Decimal("0.90"),
            "MAU": Decimal("0.80"),
            "PESSIMO": Decimal("0.70")
        }

        fat_padrao = fatores_padrao.get(padrao_construtivo, Decimal("1.00"))
        fat_estrutura = fatores_estrutura.get(tipo_estrutura, Decimal("1.00"))
        fat_parede = fatores_parede.get(tipo_parede, Decimal("1.00"))
        fat_conservacao = fatores_conservacao.get(estado_conservacao, Decimal("1.00"))

        fce = fat_padrao * fat_estrutura * fat_parede * fat_conservacao

        detalhamento = {
            "fator_padrao": float(fat_padrao),
            "fator_estrutura": float(fat_estrutura),
            "fator_parede": float(fat_parede),
            "fator_conservacao": float(fat_conservacao),
            "fce_total": float(fce)
        }

        return fce, detalhamento

    def obter_aliquota_iptu(
        self,
        valor_venal: Decimal,
        tipo_uso: str
    ) -> Decimal:
        """
        Obtém a alíquota progressiva de IPTU conforme faixa de valor e tipo de uso

        Alíquotas progressivas:
        - Residencial: 0,05% a 0,5% (7 faixas)
        - Misto: 0,10% a 0,5% (6 faixas)
        - Não residencial: 0,15% a 0,5% (4 faixas)
        - Territorial: 0,5% (terrenos não edificados)
        """
        # Buscar alíquota no banco de dados
        aliquota = self.db.query(Aliquota).filter(
            Aliquota.tipo_tributo == "IPTU",
            Aliquota.categoria == tipo_uso,
            Aliquota.ano_vigencia == self.ano_exercicio,
            Aliquota.ativa == True,
            Aliquota.valor_minimo <= valor_venal,
            (Aliquota.valor_maximo >= valor_venal) | (Aliquota.valor_maximo.is_(None))
        ).first()

        if aliquota:
            return aliquota.aliquota

        # Alíquotas padrão caso não encontre no banco
        if tipo_uso == "RESIDENCIAL":
            if valor_venal <= 50000:
                return Decimal("0.0005")  # 0,05%
            elif valor_venal <= 100000:
                return Decimal("0.0010")  # 0,10%
            elif valor_venal <= 200000:
                return Decimal("0.0020")  # 0,20%
            elif valor_venal <= 400000:
                return Decimal("0.0030")  # 0,30%
            elif valor_venal <= 800000:
                return Decimal("0.0040")  # 0,40%
            elif valor_venal <= 1500000:
                return Decimal("0.0045")  # 0,45%
            else:
                return Decimal("0.0050")  # 0,50%

        elif tipo_uso == "MISTO":
            if valor_venal <= 100000:
                return Decimal("0.0010")  # 0,10%
            elif valor_venal <= 200000:
                return Decimal("0.0020")  # 0,20%
            elif valor_venal <= 400000:
                return Decimal("0.0030")  # 0,30%
            elif valor_venal <= 800000:
                return Decimal("0.0040")  # 0,40%
            elif valor_venal <= 1500000:
                return Decimal("0.0045")  # 0,45%
            else:
                return Decimal("0.0050")  # 0,50%

        elif tipo_uso in ["COMERCIAL", "INDUSTRIAL", "NAO_RESIDENCIAL"]:
            if valor_venal <= 200000:
                return Decimal("0.0015")  # 0,15%
            elif valor_venal <= 500000:
                return Decimal("0.0030")  # 0,30%
            elif valor_venal <= 1000000:
                return Decimal("0.0040")  # 0,40%
            else:
                return Decimal("0.0050")  # 0,50%

        elif tipo_uso == "TERRITORIAL":
            return Decimal("0.0050")  # 0,50% (terrenos não edificados)

        return Decimal("0.0050")  # Padrão 0,50%

    def calcular(self, imovel_id: str) -> Dict:
        """
        Calcula o IPTU de um imóvel

        Returns:
            Dict com todos os valores e detalhamentos do cálculo
        """
        # Buscar imóvel
        imovel = self.db.query(Imovel).filter(Imovel.id == imovel_id).first()
        if not imovel:
            raise ValueError("Imóvel não encontrado")

        terreno = imovel.terreno
        if not terreno:
            raise ValueError("Dados do terreno não encontrados")

        # Buscar Planta Genérica de Valores
        pgv = self.db.query(PlantaGenericaValor).filter(
            PlantaGenericaValor.setor_fiscal_id == imovel.setor_fiscal_id,
            PlantaGenericaValor.ano_vigencia == self.ano_exercicio,
            PlantaGenericaValor.ativa == True
        ).first()

        if not pgv:
            raise ValueError(f"Planta Genérica de Valores não encontrada para o setor fiscal {imovel.setor_fiscal_id} no ano {self.ano_exercicio}")

        # Calcular VVT (Valor Venal do Terreno)
        area_terreno = terreno.area_terreno
        valor_m2_terreno = pgv.valor_m2_terreno

        fct, detalhamento_fct = self.calcular_fator_correcao_terreno(
            terreno.situacao_quadra or "MEIO",
            terreno.topografia or "PLANO",
            terreno.pedologia or "NORMAL"
        )

        vvt = area_terreno * valor_m2_terreno * fct

        # Calcular VVE (Valor Venal da Edificação)
        vve = Decimal("0.00")
        detalhamento_fce = {}

        if imovel.edificacoes:
            for edificacao in imovel.edificacoes:
                # Buscar Tabela de Preços de Construção
                tpc = self.db.query(TabelaPrecoConstrucao).filter(
                    TabelaPrecoConstrucao.ano_vigencia == self.ano_exercicio,
                    TabelaPrecoConstrucao.padrao_construtivo == edificacao.padrao_construtivo,
                    TabelaPrecoConstrucao.ativa == True
                ).first()

                if not tpc:
                    # Valor padrão caso não encontre na tabela
                    valor_m2_edificacao = Decimal("1500.00")
                else:
                    valor_m2_edificacao = tpc.valor_m2_edificacao

                area_edificacao = edificacao.area_construida

                fce, detalhamento_fce = self.calcular_fator_correcao_edificacao(
                    edificacao.padrao_construtivo,
                    edificacao.tipo_estrutura or "ALVENARIA",
                    edificacao.tipo_parede or "ALVENARIA",
                    edificacao.estado_conservacao or "BOM"
                )

                vve += area_edificacao * valor_m2_edificacao * fce

        # Calcular VVI (Valor Venal do Imóvel)
        vvi = vvt + vve

        # Determinar tipo de uso para alíquota
        tipo_uso = str(imovel.tipo_uso)
        if imovel.tipo_imovel == "TERRENO" or not imovel.edificacoes:
            tipo_uso = "TERRITORIAL"

        # Obter alíquota progressiva
        aliquota = self.obter_aliquota_iptu(vvi, tipo_uso)

        # Calcular IPTU
        valor_iptu = vvi * aliquota

        # Descontos
        desconto_pagamento_unico = valor_iptu * Decimal("0.10")  # 10%
        desconto_iptu_digital = valor_iptu * Decimal("0.02")  # 2%

        # Valor líquido com descontos
        valor_liquido = valor_iptu - desconto_pagamento_unico - desconto_iptu_digital

        return {
            "imovel_id": str(imovel_id),
            "inscricao_imobiliaria": imovel.inscricao_imobiliaria,
            "ano_exercicio": self.ano_exercicio,

            # Terreno
            "area_terreno": float(area_terreno),
            "valor_m2_terreno": float(valor_m2_terreno),
            "fator_correcao_terreno": float(fct),
            "detalhamento_fct": detalhamento_fct,
            "valor_venal_terreno": float(vvt),

            # Edificação
            "area_edificacao": float(sum(e.area_construida for e in imovel.edificacoes)) if imovel.edificacoes else 0.0,
            "fator_correcao_edificacao": float(fce) if imovel.edificacoes else 0.0,
            "detalhamento_fce": detalhamento_fce,
            "valor_venal_edificacao": float(vve),

            # Totais
            "valor_venal_total": float(vvi),
            "tipo_uso": tipo_uso,
            "aliquota_aplicada": float(aliquota),
            "valor_iptu": float(valor_iptu),

            # Descontos
            "desconto_pagamento_unico": float(desconto_pagamento_unico),
            "desconto_iptu_digital": float(desconto_iptu_digital),
            "descontos_total": float(desconto_pagamento_unico + desconto_iptu_digital),

            # Valor final
            "valor_liquido": float(valor_liquido)
        }


class CalculadoraITBI:
    """
    Calculadora de ITBI

    Fórmula:
    - Base de Cálculo = MAIOR(Valor_Declarado, Valor_Venal)
    - Se financiamento SFH:
        - ITBI_SFH = Valor_Financiado × 1%
        - ITBI_Normal = (Base - Valor_Financiado) × 2%
    - Senão:
        - ITBI = Base × 2%
    """

    def calcular(
        self,
        valor_declarado: Decimal,
        valor_venal: Decimal,
        valor_financiado_sfh: Decimal = Decimal("0.00")
    ) -> Dict:
        """
        Calcula o ITBI

        Args:
            valor_declarado: Valor declarado na transação
            valor_venal: Valor venal do imóvel (IPTU)
            valor_financiado_sfh: Valor financiado pelo SFH

        Returns:
            Dict com valores e detalhamento do cálculo
        """
        # Base de cálculo: maior valor entre declarado e venal
        base_calculo = max(valor_declarado, valor_venal)

        # Alíquotas
        aliquota_sfh = Decimal("0.01")  # 1% para parcela financiada SFH
        aliquota_normal = Decimal("0.02")  # 2% para demais

        # Cálculo
        if valor_financiado_sfh > 0:
            # Parte financiada pelo SFH (1%)
            itbi_sfh = valor_financiado_sfh * aliquota_sfh

            # Parte não financiada (2%)
            valor_nao_financiado = base_calculo - valor_financiado_sfh
            itbi_normal = valor_nao_financiado * aliquota_normal

            itbi_total = itbi_sfh + itbi_normal
        else:
            # Sem financiamento SFH (2% sobre tudo)
            itbi_sfh = Decimal("0.00")
            itbi_normal = base_calculo * aliquota_normal
            itbi_total = itbi_normal

        return {
            "valor_declarado": float(valor_declarado),
            "valor_venal": float(valor_venal),
            "base_calculo": float(base_calculo),

            # Financiamento SFH
            "valor_financiado_sfh": float(valor_financiado_sfh),
            "valor_nao_financiado": float(base_calculo - valor_financiado_sfh),

            # Alíquotas
            "aliquota_sfh": float(aliquota_sfh),
            "aliquota_normal": float(aliquota_normal),

            # ITBI
            "itbi_sfh": float(itbi_sfh),
            "itbi_normal": float(itbi_normal),
            "itbi_total": float(itbi_total)
        }


class CalculadoraISSQN:
    """
    Calculadora de ISSQN

    Fórmulas:
    - Regime Normal: ISSQN = Receita_Bruta × 5%
    - Regime Fixo Anual:
        - Nível superior: 30 UFM/ano
        - Nível médio: 10 UFM/ano
        - Outros: 5 UFM/ano
    - Sociedades Uniprofissionais: Valor_Fixo × Nº_Profissionais
    """

    def __init__(self, valor_ufm: Decimal = Decimal("14.01")):
        self.valor_ufm = valor_ufm

    def calcular_regime_normal(
        self,
        receita_bruta: Decimal,
        deducoes_permitidas: Decimal = Decimal("0.00"),
        aliquota: Decimal = Decimal("0.05")
    ) -> Dict:
        """
        Calcula ISSQN no regime normal
        """
        base_calculo = receita_bruta - deducoes_permitidas
        issqn = base_calculo * aliquota

        return {
            "receita_bruta": float(receita_bruta),
            "deducoes_permitidas": float(deducoes_permitidas),
            "base_calculo": float(base_calculo),
            "aliquota": float(aliquota),
            "issqn": float(issqn)
        }

    def calcular_regime_fixo(
        self,
        nivel_profissional: str
    ) -> Dict:
        """
        Calcula ISSQN no regime fixo anual

        Args:
            nivel_profissional: SUPERIOR, MEDIO, OUTROS
        """
        ufm_valores = {
            "SUPERIOR": Decimal("30.00"),
            "MEDIO": Decimal("10.00"),
            "OUTROS": Decimal("5.00")
        }

        ufm_quantidade = ufm_valores.get(nivel_profissional, Decimal("5.00"))
        valor_anual = ufm_quantidade * self.valor_ufm

        return {
            "nivel_profissional": nivel_profissional,
            "ufm_quantidade": float(ufm_quantidade),
            "valor_ufm": float(self.valor_ufm),
            "valor_anual": float(valor_anual)
        }

    def calcular_sociedade_uniprofissional(
        self,
        nivel_profissional: str,
        numero_profissionais: int
    ) -> Dict:
        """
        Calcula ISSQN para sociedade uniprofissional
        """
        base = self.calcular_regime_fixo(nivel_profissional)
        valor_anual_total = Decimal(str(base["valor_anual"])) * numero_profissionais

        return {
            **base,
            "numero_profissionais": numero_profissionais,
            "valor_anual_total": float(valor_anual_total)
        }
