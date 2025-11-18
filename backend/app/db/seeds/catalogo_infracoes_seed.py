"""
Seeds do Catálogo de Infrações Fiscais
Baseado na Legislação Municipal
"""
from decimal import Decimal
from datetime import date


CATALOGO_INFRACOES = [
    # ============ INFRAÇÕES IPTU ============
    {
        "codigo": "IPTU-001",
        "descricao": "Falta de inscrição do imóvel no cadastro imobiliário dentro do prazo legal",
        "artigo_lei": "CTM, Art. 87, I",
        "base_legal": "Deixar de inscrever imóvel no prazo de 30 dias após aquisição ou conclusão da obra",
        "tipo_multa": "FIXA_UFM",
        "valor_multa_ufm": Decimal("50.00"),
        "valor_minimo_ufm": Decimal("20.00"),
        "valor_maximo_ufm": Decimal("100.00"),
        "gravidade": "MEDIA",
        "permite_reincidencia": True,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },
    {
        "codigo": "IPTU-002",
        "descricao": "Prestação de informações falsas ou inexatas no cadastro imobiliário",
        "artigo_lei": "CTM, Art. 87, II",
        "base_legal": "Informar dados falsos ou omitir informações relevantes sobre o imóvel",
        "tipo_multa": "FIXA_UFM",
        "valor_multa_ufm": Decimal("100.00"),
        "valor_minimo_ufm": Decimal("50.00"),
        "valor_maximo_ufm": Decimal("200.00"),
        "gravidade": "GRAVE",
        "permite_reincidencia": True,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },
    {
        "codigo": "IPTU-003",
        "descricao": "Impedir ou dificultar a ação do fiscal na vistoria do imóvel",
        "artigo_lei": "CTM, Art. 87, III",
        "base_legal": "Negar acesso ao fiscal ou criar obstáculos à fiscalização",
        "tipo_multa": "FIXA_UFM",
        "valor_multa_ufm": Decimal("80.00"),
        "valor_minimo_ufm": Decimal("30.00"),
        "valor_maximo_ufm": Decimal("150.00"),
        "gravidade": "GRAVE",
        "permite_reincidencia": True,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },
    {
        "codigo": "IPTU-004",
        "descricao": "Deixar de comunicar alterações físicas do imóvel (reforma, ampliação, demolição)",
        "artigo_lei": "CTM, Art. 87, IV",
        "base_legal": "Não comunicar alterações no imóvel que modifiquem sua área ou características",
        "tipo_multa": "FIXA_UFM",
        "valor_multa_ufm": Decimal("60.00"),
        "valor_minimo_ufm": Decimal("25.00"),
        "valor_maximo_ufm": Decimal("120.00"),
        "gravidade": "MEDIA",
        "permite_reincidencia": True,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },

    # ============ INFRAÇÕES ISSQN ============
    {
        "codigo": "ISSQN-001",
        "descricao": "Falta de inscrição no cadastro de contribuintes do ISSQN",
        "artigo_lei": "CTM, Art. 92, I",
        "base_legal": "Iniciar atividade sujeita ao ISSQN sem inscrição municipal",
        "tipo_multa": "FIXA_UFM",
        "valor_multa_ufm": Decimal("100.00"),
        "valor_minimo_ufm": Decimal("50.00"),
        "valor_maximo_ufm": Decimal("200.00"),
        "gravidade": "GRAVE",
        "permite_reincidencia": True,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },
    {
        "codigo": "ISSQN-002",
        "descricao": "Emitir nota fiscal sem autorização municipal ou com numeração irregular",
        "artigo_lei": "CTM, Art. 92, II",
        "base_legal": "Emitir documentos fiscais sem AIDF (Autorização para Impressão de Documentos Fiscais)",
        "tipo_multa": "MISTA",
        "valor_multa_ufm": Decimal("50.00"),
        "percentual_multa": Decimal("10.00"),
        "valor_minimo_ufm": Decimal("50.00"),
        "valor_maximo_ufm": Decimal("500.00"),
        "gravidade": "GRAVISSIMA",
        "permite_reincidencia": True,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },
    {
        "codigo": "ISSQN-003",
        "descricao": "Deixar de apresentar declaração mensal de serviços prestados",
        "artigo_lei": "CTM, Art. 92, III",
        "base_legal": "Não entregar a declaração mensal ou entregá-la fora do prazo",
        "tipo_multa": "FIXA_UFM",
        "valor_multa_ufm": Decimal("30.00"),
        "valor_minimo_ufm": Decimal("15.00"),
        "valor_maximo_ufm": Decimal("100.00"),
        "gravidade": "MEDIA",
        "permite_reincidencia": True,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },
    {
        "codigo": "ISSQN-004",
        "descricao": "Omitir ou prestar informações falsas sobre serviços prestados",
        "artigo_lei": "CTM, Art. 92, IV",
        "base_legal": "Declarar valores menores ou omitir receitas de serviços",
        "tipo_multa": "PERCENTUAL",
        "percentual_multa": Decimal("75.00"),
        "valor_minimo_ufm": Decimal("50.00"),
        "valor_maximo_ufm": Decimal("1000.00"),
        "gravidade": "GRAVISSIMA",
        "permite_reincidencia": True,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },
    {
        "codigo": "ISSQN-005",
        "descricao": "Deixar de exibir livros e documentos fiscais quando solicitado",
        "artigo_lei": "CTM, Art. 92, V",
        "base_legal": "Não apresentar documentação fiscal ou contábil quando requisitado",
        "tipo_multa": "FIXA_UFM",
        "valor_multa_ufm": Decimal("70.00"),
        "valor_minimo_ufm": Decimal("30.00"),
        "valor_maximo_ufm": Decimal("150.00"),
        "gravidade": "GRAVE",
        "permite_reincidencia": True,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },
    {
        "codigo": "ISSQN-006",
        "descricao": "Não escriturar livros fiscais ou escriturá-los com vícios ou irregularidades",
        "artigo_lei": "CTM, Art. 92, VI",
        "base_legal": "Manter livros fiscais desatualizados, com rasuras ou adulterações",
        "tipo_multa": "FIXA_UFM",
        "valor_multa_ufm": Decimal("80.00"),
        "valor_minimo_ufm": Decimal("40.00"),
        "valor_maximo_ufm": Decimal("200.00"),
        "gravidade": "GRAVE",
        "permite_reincidencia": True,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },
    {
        "codigo": "ISSQN-007",
        "descricao": "Prestar serviço sem emissão de nota fiscal",
        "artigo_lei": "CTM, Art. 92, VII",
        "base_legal": "Deixar de emitir nota fiscal de serviço na prestação",
        "tipo_multa": "PERCENTUAL",
        "percentual_multa": Decimal("50.00"),
        "valor_minimo_ufm": Decimal("30.00"),
        "valor_maximo_ufm": Decimal("500.00"),
        "gravidade": "GRAVISSIMA",
        "permite_reincidencia": True,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },

    # ============ INFRAÇÕES ITBI ============
    {
        "codigo": "ITBI-001",
        "descricao": "Prestar declaração falsa sobre o valor da transação imobiliária",
        "artigo_lei": "CTM, Art. 95, I",
        "base_legal": "Declarar valor inferior ao real na compra/venda do imóvel",
        "tipo_multa": "PERCENTUAL",
        "percentual_multa": Decimal("100.00"),
        "valor_minimo_ufm": Decimal("100.00"),
        "valor_maximo_ufm": Decimal("1000.00"),
        "gravidade": "GRAVISSIMA",
        "permite_reincidencia": True,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },
    {
        "codigo": "ITBI-002",
        "descricao": "Registrar escritura sem comprovação de pagamento do ITBI",
        "artigo_lei": "CTM, Art. 95, II",
        "base_legal": "Tentar registrar transferência de imóvel sem quitação do ITBI",
        "tipo_multa": "FIXA_UFM",
        "valor_multa_ufm": Decimal("150.00"),
        "valor_minimo_ufm": Decimal("80.00"),
        "valor_maximo_ufm": Decimal("300.00"),
        "gravidade": "GRAVISSIMA",
        "permite_reincidencia": False,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },

    # ============ INFRAÇÕES GERAIS ============
    {
        "codigo": "GERAL-001",
        "descricao": "Descumprimento de intimação fiscal",
        "artigo_lei": "CTM, Art. 98, I",
        "base_legal": "Não atender intimação fiscal no prazo estabelecido",
        "tipo_multa": "FIXA_UFM",
        "valor_multa_ufm": Decimal("40.00"),
        "valor_minimo_ufm": Decimal("20.00"),
        "valor_maximo_ufm": Decimal("100.00"),
        "gravidade": "MEDIA",
        "permite_reincidencia": True,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },
    {
        "codigo": "GERAL-002",
        "descricao": "Embaraçar, impedir ou dificultar a ação da fiscalização",
        "artigo_lei": "CTM, Art. 98, II",
        "base_legal": "Criar obstáculos ou resistência à fiscalização tributária",
        "tipo_multa": "FIXA_UFM",
        "valor_multa_ufm": Decimal("120.00"),
        "valor_minimo_ufm": Decimal("60.00"),
        "valor_maximo_ufm": Decimal("250.00"),
        "gravidade": "GRAVISSIMA",
        "permite_reincidencia": True,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },
    {
        "codigo": "GERAL-003",
        "descricao": "Destruir, inutilizar ou extraviar livros ou documentos fiscais",
        "artigo_lei": "CTM, Art. 98, III",
        "base_legal": "Causar perda ou destruição de documentação fiscal obrigatória",
        "tipo_multa": "FIXA_UFM",
        "valor_multa_ufm": Decimal("200.00"),
        "valor_minimo_ufm": Decimal("100.00"),
        "valor_maximo_ufm": Decimal("500.00"),
        "gravidade": "GRAVISSIMA",
        "permite_reincidencia": True,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },
    {
        "codigo": "GERAL-004",
        "descricao": "Utilizar documentos fiscais falsos ou adulterados",
        "artigo_lei": "CTM, Art. 98, IV",
        "base_legal": "Fazer uso de notas fiscais falsificadas ou modificadas",
        "tipo_multa": "FIXA_UFM",
        "valor_multa_ufm": Decimal("300.00"),
        "valor_minimo_ufm": Decimal("200.00"),
        "valor_maximo_ufm": Decimal("1000.00"),
        "gravidade": "GRAVISSIMA",
        "permite_reincidencia": True,
        "data_inicio_vigencia": date(2024, 1, 1),
        "ativo": True
    },
]
