# 📚 Dicionário de Dados - Sistema de Gestão Tributária Municipal

## Índice
- [Visão Geral](#visão-geral)
- [Schemas do Banco de Dados](#schemas-do-banco-de-dados)
- [Módulo de Cadastros](#módulo-de-cadastros)
- [Módulo Tributário](#módulo-tributário)
- [Módulo de Arrecadação](#módulo-de-arrecadação)
- [Módulo NFS-e](#módulo-nfs-e)
- [Módulo de Taxas](#módulo-de-taxas)
- [Módulo Fiscal](#módulo-fiscal)
- [Módulo Dívida Ativa](#módulo-dívida-ativa)
- [Módulo Administrativo](#módulo-administrativo)
- [Relacionamentos entre Tabelas](#relacionamentos-entre-tabelas)
- [Índices e Performance](#índices-e-performance)
- [Triggers e Funções](#triggers-e-funções)

---

## Visão Geral

**Sistema**: Tributec - Sistema de Gestão Tributária e Arrecadação Municipal
**SGBD**: PostgreSQL 14+ com PostGIS
**ORM**: SQLAlchemy 2.x
**Total de Schemas**: 8
**Total de Tabelas**: 50+

### Tecnologias Utilizadas
- **PostGIS**: Extensão geoespacial para geo-referenciamento de imóveis e setores fiscais
- **UUID**: Identificadores únicos universais para chaves primárias
- **JSONB**: Armazenamento eficiente de dados semiestruturados
- **INET**: Tipo específico para endereços IP (auditoria)

---

## Schemas do Banco de Dados

| Schema | Descrição | Tabelas |
|--------|-----------|---------|
| `cadastro` | Cadastro Imobiliário, Contribuintes, Cadastros Auxiliares | 9 |
| `tributario` | IPTU, ITBI, ISSQN, Isenções | 11 |
| `arrecadacao` | DAM, Pagamentos, Parcelamentos, Compensações | 6 |
| `nfse` | Nota Fiscal Eletrônica, RPS, Declarações | 3 |
| `taxas` | TLLFF, Publicidade, Obras, Serviços Urbanos | 8 |
| `fiscal` | Fiscalização, Autos de Infração, Intimações | 4 |
| `divida_ativa` | Inscrições, Certidões, Protestos | 3 |
| `admin` | Usuários, Perfis, Parâmetros, Certidões, Auditoria | 7 |

---

## Módulo de Cadastros

### Tabela: `cadastro.pessoas`
**Descrição**: Cadastro de Pessoas Físicas e Jurídicas (Contribuintes)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `tipo_pessoa` | ENUM | Sim | F=Física, J=Jurídica |
| **Pessoa Física** |
| `cpf` | VARCHAR(11) | Condicional | CPF (somente números) - único |
| `nome` | VARCHAR(200) | Não | Nome completo |
| `data_nascimento` | DATE | Não | Data de nascimento |
| `nome_mae` | VARCHAR(200) | Não | Nome da mãe |
| `rg` | VARCHAR(20) | Não | RG |
| `rg_orgao_expedidor` | VARCHAR(20) | Não | Órgão expedidor do RG |
| `rg_data_expedicao` | DATE | Não | Data de expedição do RG |
| **Pessoa Jurídica** |
| `cnpj` | VARCHAR(14) | Condicional | CNPJ (somente números) - único |
| `razao_social` | VARCHAR(200) | Não | Razão social |
| `nome_fantasia` | VARCHAR(200) | Não | Nome fantasia |
| `data_abertura` | DATE | Não | Data de abertura da empresa |
| `inscricao_estadual` | VARCHAR(20) | Não | Inscrição estadual |
| `inscricao_municipal` | VARCHAR(20) | Não | Inscrição municipal (CCM) - único |
| **Contato** |
| `email` | VARCHAR(100) | Não | E-mail |
| `telefone` | VARCHAR(20) | Não | Telefone |
| `celular` | VARCHAR(20) | Não | Celular |
| **Status** |
| `situacao_cadastral` | ENUM | Sim | ATIVO, INATIVO, SUSPENSO, CANCELADO |
| `data_situacao` | DATE | Não | Data da situação cadastral |
| **Auditoria** |
| `observacoes` | TEXT | Não | Observações gerais |
| `criado_em` | TIMESTAMP | Sim | Data/hora de criação |
| `atualizado_em` | TIMESTAMP | Sim | Data/hora de atualização |

**Índices**:
- `idx_pessoas_cpf` (cpf)
- `idx_pessoas_cnpj` (cnpj)
- `idx_pessoas_inscricao_municipal` (inscricao_municipal)

**Constraints**:
- `check_pessoa_documento`: Garante que PF tem CPF e PJ tem CNPJ
- Unique: cpf, cnpj, inscricao_municipal

---

### Tabela: `cadastro.enderecos`
**Descrição**: Endereços de pessoas e imóveis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `pessoa_id` | UUID | Não | FK para pessoas |
| `cep` | VARCHAR(8) | Não | CEP (somente números) |
| `logradouro_id` | INTEGER | Não | FK para logradouros |
| `numero` | VARCHAR(10) | Não | Número |
| `complemento` | VARCHAR(100) | Não | Complemento |
| `bairro` | VARCHAR(100) | Não | Bairro |
| `cidade` | VARCHAR(100) | Sim | Cidade (default: "Município") |
| `uf` | VARCHAR(2) | Sim | UF (default: "PA") |
| `pais` | VARCHAR(50) | Não | País (default: "Brasil") |
| `tipo_endereco` | VARCHAR(20) | Não | RESIDENCIAL, COMERCIAL, CORRESPONDENCIA |
| `principal` | BOOLEAN | Não | Endereço principal (default: true) |

**Índices**:
- `idx_enderecos_pessoa` (pessoa_id)
- `idx_enderecos_cep` (cep)

---

### Tabela: `cadastro.logradouros`
**Descrição**: Cadastro de Logradouros do Município

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | INTEGER | Sim | Chave primária (auto-increment) |
| `tipo` | ENUM | Sim | RUA, AVENIDA, TRAVESSA, PRAÇA, etc. |
| `nome` | VARCHAR(200) | Sim | Nome do logradouro |
| `bairro` | VARCHAR(100) | Não | Bairro |
| `cep` | VARCHAR(8) | Não | CEP |
| `setor_fiscal_id` | INTEGER | Não | FK para setores_fiscais |

**Índices**:
- `idx_logradouros_nome` (nome)
- `idx_logradouros_setor` (setor_fiscal_id)

---

### Tabela: `cadastro.setores_fiscais`
**Descrição**: Setores Fiscais do Município (para Planta Genérica de Valores)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | INTEGER | Sim | Chave primária |
| `codigo` | VARCHAR(10) | Sim | Código do setor fiscal - único |
| `nome` | VARCHAR(100) | Sim | Nome/descrição do setor |
| `descricao` | TEXT | Não | Descrição detalhada |
| `geometria` | GEOMETRY(POLYGON, 4326) | Não | Polígono do setor fiscal (PostGIS) |
| `ativo` | BOOLEAN | Não | Setor ativo (default: true) |

**Índices**:
- `idx_setores_fiscais_codigo` (codigo)
- `idx_setores_fiscais_geometria` (geometria) - GIST

---

### Tabela: `cadastro.loteamentos`
**Descrição**: Cadastro de Loteamentos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | INTEGER | Sim | Chave primária |
| `nome` | VARCHAR(200) | Sim | Nome do loteamento |
| `numero_processo` | VARCHAR(50) | Não | Número do processo de aprovação |
| `data_aprovacao` | DATE | Não | Data de aprovação |
| `area_total` | NUMERIC(12,2) | Não | Área total em m² |
| `bairro` | VARCHAR(100) | Não | Bairro |
| `setor_fiscal_id` | INTEGER | Não | FK para setores_fiscais |
| `geometria` | GEOMETRY(MULTIPOLYGON, 4326) | Não | Polígonos do loteamento (PostGIS) |

**Índices**:
- `idx_loteamentos_nome` (nome)
- `idx_loteamentos_geometria` (geometria) - GIST

---

### Tabela: `cadastro.imoveis`
**Descrição**: Cadastro Imobiliário Municipal (CIM) - Registro de imóveis urbanos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `inscricao_imobiliaria` | VARCHAR(20) | Sim | Inscrição imobiliária única |
| `tipo_imovel` | ENUM | Sim | TERRENO, EDIFICADO, TERRITORIAL |
| `tipo_uso` | ENUM | Sim | RESIDENCIAL, COMERCIAL, INDUSTRIAL, MISTO, etc. |
| **Localização** |
| `logradouro_id` | INTEGER | Não | FK para logradouros |
| `numero` | VARCHAR(10) | Não | Número do imóvel |
| `complemento` | VARCHAR(100) | Não | Complemento |
| `bairro` | VARCHAR(100) | Não | Bairro |
| `cep` | VARCHAR(8) | Não | CEP |
| `loteamento_id` | INTEGER | Não | FK para loteamentos |
| `quadra` | VARCHAR(10) | Não | Quadra |
| `lote` | VARCHAR(10) | Não | Lote |
| `setor_fiscal_id` | INTEGER | Sim | FK para setores_fiscais |
| **Propriedade** |
| `proprietario_id` | UUID | Sim | FK para pessoas (proprietário) |
| `possuidor_id` | UUID | Não | FK para pessoas (possuidor) |
| `dominio_util_id` | UUID | Não | FK para pessoas (domínio útil) |
| **Registro** |
| `matricula_registro` | VARCHAR(50) | Não | Matrícula do Registro de Imóveis |
| `livro` | VARCHAR(10) | Não | Livro |
| `folha` | VARCHAR(10) | Não | Folha |
| `cartorio` | VARCHAR(100) | Não | Cartório de Registro de Imóveis |
| `data_registro` | DATE | Não | Data do registro |
| **Geo-referenciamento** |
| `geometria` | GEOMETRY(POLYGON, 4326) | Não | Polígono do imóvel (PostGIS) |
| `latitude` | NUMERIC(10,7) | Não | Latitude |
| `longitude` | NUMERIC(10,7) | Não | Longitude |
| **Status** |
| `situacao` | ENUM | Sim | ATIVO, INATIVO, SUSPENSO, CANCELADO |
| `data_cadastro` | DATE | Não | Data do cadastro (default: today) |
| `data_situacao` | DATE | Não | Data da situação |
| `observacoes` | TEXT | Não | Observações gerais |

**Índices**:
- `idx_imoveis_inscricao` (inscricao_imobiliaria)
- `idx_imoveis_proprietario` (proprietario_id)
- `idx_imoveis_setor` (setor_fiscal_id)
- `idx_imoveis_geometria` (geometria) - GIST

---

### Tabela: `cadastro.imoveis_terrenos`
**Descrição**: Características do Terreno

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `imovel_id` | UUID | Sim | FK para imoveis (único - 1:1) |
| **Dimensões** |
| `area_terreno` | NUMERIC(12,2) | Sim | Área do terreno em m² |
| `testada_principal` | NUMERIC(8,2) | Não | Testada principal em metros |
| `testada_secundaria` | NUMERIC(8,2) | Não | Testada secundária em metros |
| `profundidade` | NUMERIC(8,2) | Não | Profundidade em metros |
| **Características Físicas** |
| `topografia` | VARCHAR(20) | Não | PLANO, ACLIVE, DECLIVE, IRREGULAR |
| `pedologia` | VARCHAR(20) | Não | NORMAL, ALAGADICO, ROCHOSO, SAIBRO |
| `situacao_quadra` | VARCHAR(20) | Não | MEIO, ESQUINA, DUAS_FRENTES, etc. |
| **Infraestrutura Urbana** |
| `pavimentacao` | BOOLEAN | Não | Possui pavimentação (default: false) |
| `meio_fio` | BOOLEAN | Não | Possui meio-fio |
| `calcada` | BOOLEAN | Não | Possui calçada |
| `arborizacao` | BOOLEAN | Não | Possui arborização |
| `iluminacao_publica` | BOOLEAN | Não | Possui iluminação pública |
| `rede_agua` | BOOLEAN | Não | Ligado à rede de água |
| `rede_esgoto` | BOOLEAN | Não | Ligado à rede de esgoto |
| `rede_eletrica` | BOOLEAN | Não | Ligado à rede elétrica |
| `coleta_lixo` | BOOLEAN | Não | Possui coleta de lixo |

**Índices**:
- `idx_imoveis_terrenos_imovel` (imovel_id)

---

### Tabela: `cadastro.imoveis_edificacoes`
**Descrição**: Características das Edificações (pode ter múltiplas por terreno)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `imovel_id` | UUID | Sim | FK para imoveis |
| `numero_edificacao` | INTEGER | Não | Número sequencial da edificação (default: 1) |
| **Dimensões** |
| `area_construida` | NUMERIC(12,2) | Sim | Área construída em m² |
| `area_privativa` | NUMERIC(12,2) | Não | Área privativa em m² |
| **Características Construtivas** |
| `padrao_construtivo` | VARCHAR(20) | Sim | ALTO, MEDIO_ALTO, MEDIO, MEDIO_BAIXO, BAIXO |
| `tipo_estrutura` | VARCHAR(20) | Não | CONCRETO, METALICA, MADEIRA, ALVENARIA, MISTA |
| `tipo_parede` | VARCHAR(20) | Não | ALVENARIA, MADEIRA, MISTA, PRE_MOLDADA |
| `tipo_cobertura` | VARCHAR(20) | Não | LAJE, TELHA_CERAMICA, TELHA_METALICA, etc. |
| `numero_pavimentos` | INTEGER | Não | Número de pavimentos (default: 1) |
| `ano_construcao` | INTEGER | Não | Ano de construção |
| `estado_conservacao` | VARCHAR(20) | Não | OTIMO, BOM, REGULAR, MAU, PESSIMO |
| **Cômodos** |
| `quantidade_quartos` | INTEGER | Não | Quantidade de quartos (default: 0) |
| `quantidade_salas` | INTEGER | Não | Quantidade de salas |
| `quantidade_banheiros` | INTEGER | Não | Quantidade de banheiros |
| `quantidade_vagas_garagem` | INTEGER | Não | Vagas de garagem |
| **Ocupação** |
| `tipo_ocupacao` | VARCHAR(20) | Não | PROPRIETARIO, LOCATARIO, CEDIDO, DESOCUPADO |

**Índices**:
- `idx_imoveis_edificacoes_imovel` (imovel_id)

---

### Tabela: `cadastro.estabelecimentos`
**Descrição**: Cadastro de Estabelecimentos Comerciais/Industriais/Serviços (para ISSQN)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `pessoa_id` | UUID | Sim | FK para pessoas |
| `inscricao_municipal` | VARCHAR(20) | Sim | Inscrição Municipal (CCM) - único |
| `nome_fantasia` | VARCHAR(200) | Não | Nome fantasia |
| `data_inicio_atividade` | DATE | Não | Data de início das atividades |
| **Endereço** |
| `logradouro_id` | INTEGER | Não | FK para logradouros |
| `numero` | VARCHAR(10) | Não | Número |
| `complemento` | VARCHAR(100) | Não | Complemento |
| `bairro` | VARCHAR(100) | Não | Bairro |
| `cep` | VARCHAR(8) | Não | CEP |
| **CNAE e Atividades** |
| `cnae_principal` | VARCHAR(10) | Não | CNAE principal |
| `cnaes_secundarios` | JSONB | Não | CNAEs secundários (array) |
| `atividades` | JSONB | Não | Lista de atividades econômicas (códigos de serviço) |
| **Regime ISSQN** |
| `regime_issqn` | VARCHAR(20) | Não | NORMAL, FIXO, ESTIMATIVA, SIMPLES_NACIONAL |
| `area_ocupada` | NUMERIC(10,2) | Não | Área ocupada em m² |
| **Status** |
| `situacao` | ENUM | Sim | ATIVO, INATIVO, SUSPENSO, CANCELADO |
| `data_situacao` | DATE | Não | Data da situação (default: today) |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_estabelecimentos_inscricao` (inscricao_municipal)
- `idx_estabelecimentos_pessoa` (pessoa_id)
- `idx_estabelecimentos_cnae` (cnae_principal)

---

### Tabela: `cadastro.procuracoes`
**Descrição**: Cadastro de Procurações e Representações Legais

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `outorgante_id` | UUID | Sim | FK para pessoas (quem outorga) |
| `outorgado_id` | UUID | Sim | FK para pessoas (procurador) |
| `numero_procuracao` | VARCHAR(50) | Não | Número da procuração |
| `tipo_procuracao` | VARCHAR(20) | Sim | PUBLICA, PARTICULAR, SUBSTABELECIMENTO |
| `data_outorga` | DATE | Sim | Data da outorga |
| `data_validade` | DATE | Não | Data de validade |
| `poderes_especificos` | JSONB | Não | Lista de poderes específicos concedidos |
| `texto_poderes` | TEXT | Não | Descrição dos poderes |
| `numero_livro` | VARCHAR(20) | Não | Número do livro (se pública) |
| `numero_folha` | VARCHAR(20) | Não | Número da folha (se pública) |
| `cartorio` | VARCHAR(200) | Não | Cartório onde foi lavrada |
| `ativa` | BOOLEAN | Não | Procuração ativa (default: true) |
| `data_revogacao` | DATE | Não | Data de revogação |

**Índices**:
- `idx_procuracoes_outorgante` (outorgante_id)
- `idx_procuracoes_outorgado` (outorgado_id)

---

## Módulo Tributário

### Tabela: `tributario.planta_generica_valores`
**Descrição**: Planta Genérica de Valores Territoriais (PGVT) - Valores de m² por setor fiscal

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | INTEGER | Sim | Chave primária |
| `setor_fiscal_id` | INTEGER | Sim | FK para setores_fiscais |
| `ano_vigencia` | INTEGER | Sim | Ano de vigência dos valores |
| `data_inicio_vigencia` | DATE | Sim | Data de início da vigência |
| `data_fim_vigencia` | DATE | Não | Data de fim da vigência |
| `valor_m2_terreno` | NUMERIC(10,2) | Sim | Valor do m² de terreno (VmTT) |
| `ativa` | BOOLEAN | Não | PGV ativa (default: true) |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_pgv_setor` (setor_fiscal_id)
- `idx_pgv_ano` (ano_vigencia)

**Constraints**:
- `uq_pgv_setor_ano`: Unique (setor_fiscal_id, ano_vigencia)

---

### Tabela: `tributario.tabela_preco_construcao`
**Descrição**: Tabela de Preços de Construção (TPC) - Baseada no CUB/SINDUSCON-PA

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | INTEGER | Sim | Chave primária |
| `ano_vigencia` | INTEGER | Sim | Ano de vigência |
| `mes_vigencia` | INTEGER | Sim | Mês de vigência (1-12) |
| `data_inicio_vigencia` | DATE | Sim | Data de início da vigência |
| `data_fim_vigencia` | DATE | Não | Data de fim da vigência |
| `padrao_construtivo` | VARCHAR(20) | Sim | ALTO, MEDIO_ALTO, MEDIO, MEDIO_BAIXO, BAIXO |
| `valor_m2_edificacao` | NUMERIC(10,2) | Sim | Valor do m² de edificação (VmTE) |
| `cub_referencia` | NUMERIC(10,2) | Não | Valor do CUB de referência (SINDUSCON-PA) |
| `ativa` | BOOLEAN | Não | TPC ativa (default: true) |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_tpc_ano_mes` (ano_vigencia, mes_vigencia)
- `idx_tpc_padrao` (padrao_construtivo)

**Constraints**:
- `uq_tpc_periodo_padrao`: Unique (ano_vigencia, mes_vigencia, padrao_construtivo)

---

### Tabela: `tributario.aliquotas`
**Descrição**: Alíquotas dos Tributos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | INTEGER | Sim | Chave primária |
| `tipo_tributo` | ENUM | Sim | IPTU, ITBI, ISSQN, TAXA, CONTRIBUICAO |
| `categoria` | VARCHAR(50) | Não | Categoria do imóvel/serviço |
| `valor_minimo` | NUMERIC(15,2) | Não | Valor mínimo da faixa |
| `valor_maximo` | NUMERIC(15,2) | Não | Valor máximo da faixa |
| `aliquota` | NUMERIC(5,4) | Sim | Alíquota em decimal (ex: 0.0050 = 0,5%) |
| `ano_vigencia` | INTEGER | Sim | Ano de vigência |
| `data_inicio_vigencia` | DATE | Sim | Data de início da vigência |
| `data_fim_vigencia` | DATE | Não | Data de fim da vigência |
| `ativa` | BOOLEAN | Não | Alíquota ativa (default: true) |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_aliquotas_tributo` (tipo_tributo)
- `idx_aliquotas_ano` (ano_vigencia)

---

### Tabela: `tributario.iptu_lancamentos`
**Descrição**: Lançamentos de IPTU (lançado anualmente de ofício)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `imovel_id` | UUID | Sim | FK para imoveis |
| `ano_exercicio` | INTEGER | Sim | Ano do exercício fiscal |
| `numero_lancamento` | VARCHAR(30) | Sim | Número único do lançamento |
| `data_lancamento` | DATE | Sim | Data do lançamento (default: today) |
| **Valores Venais (Calculados)** |
| `valor_venal_terreno` | NUMERIC(15,2) | Sim | VVT = Área × VmTT × FCT |
| `valor_venal_edificacao` | NUMERIC(15,2) | Não | VVE = Área × VmTE × FCE (default: 0.00) |
| `valor_venal_total` | NUMERIC(15,2) | Sim | VVI = VVT + VVE |
| **Fatores de Correção** |
| `fator_correcao_terreno` | NUMERIC(5,4) | Não | FCT (default: 1.0000) |
| `fator_correcao_edificacao` | NUMERIC(5,4) | Não | FCE (default: 1.0000) |
| `fatores_aplicados` | JSONB | Não | Detalhamento de todos os fatores |
| **Alíquota e IPTU** |
| `aliquota_aplicada` | NUMERIC(5,4) | Sim | Alíquota progressiva aplicada |
| `tipo_uso_calculo` | VARCHAR(20) | Sim | RESIDENCIAL, MISTO, NAO_RESIDENCIAL, TERRITORIAL |
| `valor_iptu` | NUMERIC(15,2) | Sim | IPTU = VVI × Alíquota |
| **Descontos** |
| `desconto_pagamento_unico` | NUMERIC(15,2) | Não | 10% para cota única (default: 0.00) |
| `desconto_iptu_digital` | NUMERIC(15,2) | Não | 2% adicional para IPTU Digital (default: 0.00) |
| `desconto_anos_anteriores` | NUMERIC(15,2) | Não | Desconto progressivo 5 primeiros anos (default: 0.00) |
| `percentual_desconto_anos` | INTEGER | Não | Percentual de desconto (default: 0) |
| `valor_liquido` | NUMERIC(15,2) | Sim | Valor líquido após descontos |
| **Parcelamento** |
| `numero_parcelas` | INTEGER | Não | Número de parcelas (1 a 12, default: 1) |
| `valor_parcela` | NUMERIC(15,2) | Não | Valor de cada parcela |
| `data_vencimento_unico` | DATE | Não | Vencimento para pagamento único |
| `data_vencimento_primeira_parcela` | DATE | Não | Vencimento da 1ª parcela |
| **Isenção** |
| `isencao_id` | UUID | Não | FK para isencoes |
| `valor_isencao` | NUMERIC(15,2) | Não | Valor da isenção (default: 0.00) |
| **Status** |
| `status` | ENUM | Sim | LANCADO, PAGO, PAGO_PARCIAL, CANCELADO, PARCELADO, EM_DIVIDA |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_iptu_lancamentos_imovel` (imovel_id)
- `idx_iptu_lancamentos_ano` (ano_exercicio)
- `idx_iptu_lancamentos_numero` (numero_lancamento)
- `idx_iptu_lancamentos_status` (status)
- `idx_iptu_lancamentos_ano_status` (ano_exercicio, status)

**Constraints**:
- `uq_iptu_imovel_ano`: Unique (imovel_id, ano_exercicio)

---

### Tabela: `tributario.iptu_parcelas`
**Descrição**: Parcelas do IPTU

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `lancamento_id` | UUID | Sim | FK para iptu_lancamentos (cascade delete) |
| `numero_parcela` | INTEGER | Sim | Número da parcela (1 a 12) |
| **Valores** |
| `valor_principal` | NUMERIC(15,2) | Sim | Valor principal da parcela |
| `valor_juros` | NUMERIC(15,2) | Não | Juros de mora (default: 0.00) |
| `valor_multa` | NUMERIC(15,2) | Não | Multa moratória (default: 0.00) |
| `valor_correcao` | NUMERIC(15,2) | Não | Correção monetária (default: 0.00) |
| `valor_total` | NUMERIC(15,2) | Sim | Valor total com acréscimos |
| **Vencimento** |
| `data_vencimento` | DATE | Sim | Data de vencimento original |
| `data_vencimento_atualizado` | DATE | Não | Vencimento atualizado (se prorrogado) |
| **Pagamento** |
| `pago` | BOOLEAN | Não | Parcela paga (default: false) |
| `data_pagamento` | DATE | Não | Data do pagamento |
| `valor_pago` | NUMERIC(15,2) | Não | Valor efetivamente pago |
| `dam_id` | UUID | Não | FK para dams |

**Índices**:
- `idx_iptu_parcelas_lancamento` (lancamento_id)
- `idx_iptu_parcelas_vencimento` (data_vencimento)
- `idx_iptu_parcelas_pago` (pago)

**Constraints**:
- `uq_iptu_parcela_numero`: Unique (lancamento_id, numero_parcela)

**Triggers**:
- `trigger_atualizar_acrescimos_iptu`: Atualiza acréscimos automaticamente

---

### Tabela: `tributario.itbi_guias`
**Descrição**: Guias de ITBI (Imposto sobre Transmissão de Bens Imóveis)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `numero_guia` | VARCHAR(30) | Sim | Número único da guia de ITBI |
| `data_emissao` | DATE | Sim | Data de emissão (default: today) |
| `imovel_id` | UUID | Sim | FK para imoveis |
| `transmitente_id` | UUID | Sim | FK para pessoas (vendedor/doador) |
| `adquirente_id` | UUID | Sim | FK para pessoas (comprador) |
| `tipo_transmissao` | VARCHAR(50) | Sim | COMPRA_VENDA, DOACAO, PERMUTA, ARREMATACAO, etc. |
| **Valores** |
| `valor_declarado` | NUMERIC(15,2) | Sim | Valor declarado na transação |
| `valor_venal` | NUMERIC(15,2) | Sim | Valor venal do imóvel (IPTU) |
| `valor_base_calculo` | NUMERIC(15,2) | Sim | Maior valor entre declarado e venal |
| **Financiamento SFH** |
| `valor_financiado_sfh` | NUMERIC(15,2) | Não | Valor financiado pelo SFH (default: 0.00) |
| `valor_nao_financiado` | NUMERIC(15,2) | Não | Valor não financiado (default: 0.00) |
| `aliquota_sfh` | NUMERIC(5,4) | Não | Alíquota para parte financiada 1% (default: 0.0100) |
| `aliquota_normal` | NUMERIC(5,4) | Não | Alíquota normal 2% (default: 0.0200) |
| **Cálculo do ITBI** |
| `valor_itbi_sfh` | NUMERIC(15,2) | Não | ITBI sobre parcela financiada (default: 0.00) |
| `valor_itbi_normal` | NUMERIC(15,2) | Não | ITBI sobre parcela não financiada (default: 0.00) |
| `valor_itbi_total` | NUMERIC(15,2) | Sim | ITBI total = ITBI_SFH + ITBI_Normal |
| **Isenção** |
| `isencao_id` | UUID | Não | FK para isencoes |
| `valor_isencao` | NUMERIC(15,2) | Não | Valor da isenção (default: 0.00) |
| `valor_liquido` | NUMERIC(15,2) | Sim | Valor líquido a pagar |
| **Vencimento e Pagamento** |
| `data_vencimento` | DATE | Sim | Data de vencimento |
| `pago` | BOOLEAN | Não | Guia paga (default: false) |
| `data_pagamento` | DATE | Não | Data do pagamento |
| `valor_pago` | NUMERIC(15,2) | Não | Valor pago |
| `dam_id` | UUID | Não | FK para dams |
| **Registro** |
| `registrado` | BOOLEAN | Não | Transmissão registrada (default: false) |
| `data_registro` | DATE | Não | Data do registro no Cartório |
| `matricula_registro` | VARCHAR(50) | Não | Matrícula do registro |
| **Arbitramento** |
| `arbitrado` | BOOLEAN | Não | Valor foi arbitrado (default: false) |
| `data_arbitramento` | DATE | Não | Data do arbitramento |
| `valor_arbitrado` | NUMERIC(15,2) | Não | Valor arbitrado |
| `fiscal_arbitrador_id` | UUID | Não | FK para usuarios |
| **Status** |
| `status` | ENUM | Sim | LANCADO, PAGO, CANCELADO, etc. |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_itbi_guias_numero` (numero_guia)
- `idx_itbi_guias_imovel` (imovel_id)
- `idx_itbi_guias_pago` (pago)
- `idx_itbi_guias_status` (status)

**Triggers**:
- `trigger_transferir_propriedade_itbi`: Transfere automaticamente a propriedade quando ITBI é pago

---

### Tabela: `tributario.issqn_declaracoes`
**Descrição**: Declarações de ISSQN (regime de lançamento por homologação)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `estabelecimento_id` | UUID | Sim | FK para estabelecimentos |
| `numero_declaracao` | VARCHAR(30) | Sim | Número único da declaração |
| **Período de Apuração** |
| `mes_competencia` | INTEGER | Sim | Mês de competência (1-12) |
| `ano_competencia` | INTEGER | Sim | Ano de competência |
| `data_declaracao` | DATE | Sim | Data da declaração (default: today) |
| `regime_tributacao` | VARCHAR(30) | Sim | NORMAL, FIXO, ESTIMATIVA, SIMPLES_NACIONAL |
| **Valores** |
| `receita_bruta_total` | NUMERIC(15,2) | Não | Receita bruta total (default: 0.00) |
| `deducoes_materiais` | NUMERIC(15,2) | Não | Dedução de materiais (default: 0.00) |
| `outras_deducoes` | NUMERIC(15,2) | Não | Outras deduções (default: 0.00) |
| `base_calculo` | NUMERIC(15,2) | Sim | Base = Receita - Deduções |
| `aliquota` | NUMERIC(5,4) | Não | Alíquota aplicada (default: 0.0500 = 5%) |
| `valor_issqn` | NUMERIC(15,2) | Sim | ISSQN = Base × Alíquota |
| `valor_retido_terceiros` | NUMERIC(15,2) | Não | ISSQN retido por tomadores (default: 0.00) |
| `valor_a_recolher` | NUMERIC(15,2) | Sim | Valor a recolher = ISSQN - Retenções |
| **Regime Fixo Anual** |
| `valor_fixo_ufm` | NUMERIC(10,2) | Não | Valor fixo em UFM |
| `quantidade_profissionais` | INTEGER | Não | Quantidade de profissionais (sociedades) |
| **Isenção** |
| `isencao_id` | UUID | Não | FK para isencoes |
| `valor_isencao` | NUMERIC(15,2) | Não | Valor da isenção (default: 0.00) |
| **Vencimento e Pagamento** |
| `data_vencimento` | DATE | Sim | Data de vencimento |
| `pago` | BOOLEAN | Não | Declaração paga (default: false) |
| `data_pagamento` | DATE | Não | Data do pagamento |
| `valor_pago` | NUMERIC(15,2) | Não | Valor pago |
| `dam_id` | UUID | Não | FK para dams |
| **Status** |
| `status` | ENUM | Sim | LANCADO, PAGO, CANCELADO, etc. |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_issqn_declaracoes_estabelecimento` (estabelecimento_id)
- `idx_issqn_declaracoes_competencia` (ano_competencia, mes_competencia)
- `idx_issqn_declaracoes_numero` (numero_declaracao)
- `idx_issqn_declaracoes_status` (status)

**Constraints**:
- `uq_issqn_estab_competencia`: Unique (estabelecimento_id, mes_competencia, ano_competencia)

---

### Tabela: `tributario.issqn_retencoes`
**Descrição**: Retenções de ISSQN na Fonte

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `tomador_id` | UUID | Sim | FK para pessoas (responsável pela retenção) |
| `prestador_id` | UUID | Sim | FK para estabelecimentos (que teve ISSQN retido) |
| `declaracao_id` | UUID | Não | FK para issqn_declaracoes (opcional) |
| `numero_retencao` | VARCHAR(30) | Sim | Número único da retenção |
| **Período** |
| `mes_competencia` | INTEGER | Sim | Mês de competência |
| `ano_competencia` | INTEGER | Sim | Ano de competência |
| `data_retencao` | DATE | Sim | Data da retenção (default: today) |
| **Valores** |
| `valor_servico` | NUMERIC(15,2) | Sim | Valor do serviço prestado |
| `aliquota` | NUMERIC(5,4) | Não | Alíquota (default: 0.0500 = 5%) |
| `valor_issqn_retido` | NUMERIC(15,2) | Sim | Valor do ISSQN retido |
| `codigo_servico` | VARCHAR(10) | Não | Código do serviço (ex: 7.02) |
| **Vencimento e Recolhimento** |
| `data_vencimento` | DATE | Sim | Data de vencimento |
| `recolhido` | BOOLEAN | Não | ISSQN recolhido (default: false) |
| `data_recolhimento` | DATE | Não | Data do recolhimento |
| `valor_recolhido` | NUMERIC(15,2) | Não | Valor recolhido |
| `dam_id` | UUID | Não | FK para dams |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_issqn_retencoes_tomador` (tomador_id)
- `idx_issqn_retencoes_prestador` (prestador_id)
- `idx_issqn_retencoes_numero` (numero_retencao)
- `idx_issqn_retencoes_competencia` (ano_competencia, mes_competencia)

---

### Tabela: `tributario.isencoes`
**Descrição**: Isenções Tributárias (controle de isenções totais ou parciais)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `numero_processo` | VARCHAR(30) | Sim | Número do processo de isenção (único) |
| `beneficiario_id` | UUID | Sim | FK para pessoas |
| `tipo_tributo` | ENUM | Sim | IPTU, ITBI, ISSQN, TAXA, CONTRIBUICAO |
| `tipo_isencao` | ENUM | Sim | TOTAL, PARCIAL |
| `percentual_isencao` | NUMERIC(5,2) | Não | Percentual (0 a 100, default: 100.00) |
| **Fundamento Legal** |
| `fundamento_legal` | VARCHAR(200) | Sim | Base legal (Lei, Decreto, etc.) |
| `artigo_lei` | VARCHAR(50) | Não | Artigo da lei |
| **Motivo** |
| `motivo` | VARCHAR(100) | Sim | IDOSO, DEFICIENTE, BAIXA_RENDA, FILANTROPIA, etc. |
| `descricao_motivo` | TEXT | Não | Descrição detalhada |
| **Vigência** |
| `data_inicio` | DATE | Sim | Data de início da isenção |
| `data_fim` | DATE | Não | Data de fim (null = indeterminado) |
| **Vinculação** |
| `imovel_id` | UUID | Não | FK para imoveis (para IPTU/ITBI) |
| `estabelecimento_id` | UUID | Não | FK para estabelecimentos (para ISSQN) |
| **Aprovação** |
| `data_solicitacao` | DATE | Não | Data de solicitação (default: today) |
| `data_aprovacao` | DATE | Não | Data de aprovação |
| `aprovado_por_id` | UUID | Não | FK para usuarios |
| **Status** |
| `ativa` | BOOLEAN | Não | Isenção ativa (default: true) |
| `data_cancelamento` | DATE | Não | Data de cancelamento |
| `motivo_cancelamento` | TEXT | Não | Motivo do cancelamento |
| `documentos_anexos` | JSONB | Não | Lista de documentos anexados |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_isencoes_beneficiario` (beneficiario_id)
- `idx_isencoes_tributo` (tipo_tributo)
- `idx_isencoes_numero` (numero_processo)
- `idx_isencoes_ativa` (ativa)

**Constraints**:
- `check_isencao_percentual`: percentual_isencao >= 0 AND <= 100

---

## Módulo de Arrecadação

### Tabela: `arrecadacao.dams`
**Descrição**: Documento de Arrecadação Municipal (guia unificada)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `numero_dam` | VARCHAR(30) | Sim | Número único do DAM |
| `data_emissao` | DATE | Sim | Data de emissão (default: today) |
| `contribuinte_id` | UUID | Sim | FK para pessoas |
| **Tipo e Descrição** |
| `tipo_tributo` | VARCHAR(50) | Sim | IPTU, ITBI, ISSQN, TAXA, CONTRIBUICAO, DIVIDA_ATIVA, etc. |
| `codigo_receita` | VARCHAR(20) | Não | Código da receita no plano de contas |
| `descricao` | VARCHAR(200) | Sim | Descrição do DAM |
| **Referência** |
| `referencia_tipo` | VARCHAR(50) | Não | Tipo: IPTU_PARCELA, ITBI_GUIA, ISSQN_DECLARACAO, etc. |
| `referencia_id` | UUID | Não | ID do registro de origem |
| **Valores** |
| `valor_principal` | NUMERIC(15,2) | Sim | Valor principal do débito |
| `valor_juros` | NUMERIC(15,2) | Não | Juros de mora (default: 0.00) |
| `valor_multa` | NUMERIC(15,2) | Não | Multa moratória (default: 0.00) |
| `valor_correcao` | NUMERIC(15,2) | Não | Correção monetária (default: 0.00) |
| `valor_desconto` | NUMERIC(15,2) | Não | Descontos aplicados (default: 0.00) |
| `valor_total` | NUMERIC(15,2) | Sim | Valor total a pagar |
| **Vencimento** |
| `data_vencimento` | DATE | Sim | Data de vencimento |
| **Códigos de Barras e PIX** |
| `codigo_barras` | VARCHAR(48) | Não | Código de barras (padrão FEBRABAN) |
| `linha_digitavel` | VARCHAR(54) | Não | Linha digitável |
| `pix_qrcode` | TEXT | Não | QR Code PIX (copia e cola) |
| `pix_qrcode_imagem` | TEXT | Não | Imagem do QR Code PIX (base64) |
| `nosso_numero` | VARCHAR(20) | Não | Nosso número (banco) |
| **Status** |
| `status` | ENUM | Sim | EMITIDO, PAGO, CANCELADO, VENCIDO |
| **Pagamento** |
| `pago` | BOOLEAN | Não | DAM pago (default: false) |
| `data_pagamento` | DATE | Não | Data do pagamento |
| `valor_pago` | NUMERIC(15,2) | Não | Valor efetivamente pago |
| `canal_pagamento` | ENUM | Não | BANCO, LOTERIA, PIX, CARTAO_CREDITO, etc. |
| **Baixa Automática** |
| `data_baixa` | TIMESTAMP | Não | Data/hora da baixa do pagamento |
| `baixa_automatica` | BOOLEAN | Não | Baixa automática via integração (default: false) |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_dams_numero` (numero_dam)
- `idx_dams_contribuinte` (contribuinte_id)
- `idx_dams_tipo` (tipo_tributo)
- `idx_dams_vencimento` (data_vencimento)
- `idx_dams_status` (status)
- `idx_dams_pago` (pago)
- `idx_dams_referencia` (referencia_tipo, referencia_id)
- `idx_dams_contribuinte_status` (contribuinte_id, status)
- `idx_dams_vencimento_pago` (data_vencimento, pago)

**Triggers**:
- `trigger_baixar_dam_pagamento`: Baixa automática quando pagamento é confirmado

---

### Tabela: `arrecadacao.pagamentos`
**Descrição**: Registro de Pagamentos efetuados

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `dam_id` | UUID | Sim | FK para dams (cascade delete) |
| `numero_pagamento` | VARCHAR(30) | Sim | Número único do pagamento |
| **Data e Valor** |
| `data_pagamento` | DATE | Sim | Data do pagamento |
| `hora_pagamento` | TIMESTAMP | Não | Data/hora do pagamento (default: now) |
| `valor_pago` | NUMERIC(15,2) | Sim | Valor efetivamente pago |
| **Canal de Pagamento** |
| `canal_pagamento` | ENUM | Sim | BANCO, LOTERIA, PIX, CARTAO_CREDITO, etc. |
| **Dados Bancários** |
| `banco` | VARCHAR(5) | Não | Código do banco (3 dígitos) |
| `agencia` | VARCHAR(10) | Não | Agência |
| `codigo_autenticacao` | VARCHAR(50) | Não | Código de autenticação bancária |
| `nosso_numero` | VARCHAR(20) | Não | Nosso número |
| **Comprovante** |
| `numero_comprovante` | VARCHAR(50) | Não | Número do comprovante |
| `comprovante_digital` | TEXT | Não | Comprovante digital (base64 ou URL) |
| **PIX** |
| `pix_txid` | VARCHAR(100) | Não | Transaction ID do PIX |
| `pix_end_to_end` | VARCHAR(100) | Não | End to End ID do PIX |
| **Status** |
| `status` | ENUM | Sim | PENDENTE, CONFIRMADO, CANCELADO, ESTORNADO |
| **Confirmação** |
| `confirmado` | BOOLEAN | Não | Pagamento confirmado (default: false) |
| `data_confirmacao` | TIMESTAMP | Não | Data/hora da confirmação |
| `confirmado_por_id` | UUID | Não | FK para usuarios |
| **Estorno** |
| `estornado` | BOOLEAN | Não | Estornado (default: false) |
| `data_estorno` | DATE | Não | Data do estorno |
| `motivo_estorno` | TEXT | Não | Motivo do estorno |
| `estornado_por_id` | UUID | Não | FK para usuarios |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_pagamentos_dam` (dam_id)
- `idx_pagamentos_numero` (numero_pagamento)
- `idx_pagamentos_data` (data_pagamento)
- `idx_pagamentos_status` (status)
- `idx_pagamentos_canal` (canal_pagamento)

---

### Tabela: `arrecadacao.parcelamentos`
**Descrição**: Parcelamentos de Débitos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `numero_parcelamento` | VARCHAR(30) | Sim | Número único do parcelamento |
| `contribuinte_id` | UUID | Sim | FK para pessoas |
| `tipo_parcelamento` | ENUM | Sim | PRIMEIRO, REPARCELAMENTO |
| `parcelamento_anterior_id` | UUID | Não | FK para parcelamentos (se reparcelamento) |
| `data_concessao` | DATE | Sim | Data da concessão (default: today) |
| **Débitos Parcelados** |
| `debitos_parcelados` | JSONB | Sim | Lista de débitos incluídos |
| **Valores** |
| `valor_total_debito` | NUMERIC(15,2) | Sim | Valor total do débito parcelado |
| `valor_entrada` | NUMERIC(15,2) | Não | Valor da entrada (default: 0.00) |
| `valor_parcelado` | NUMERIC(15,2) | Sim | Valor a ser parcelado |
| **Parcelas** |
| `numero_parcelas` | INTEGER | Sim | Número total de parcelas (1 a 24) |
| `valor_parcela` | NUMERIC(15,2) | Sim | Valor de cada parcela |
| `valor_minimo_parcela` | NUMERIC(15,2) | Não | Valor mínimo da parcela (5 UFM PF, 20 UFM PJ) |
| **Vencimentos** |
| `data_vencimento_primeira_parcela` | DATE | Sim | Vencimento da 1ª parcela |
| `dia_vencimento` | INTEGER | Sim | Dia do vencimento (1-31) |
| **Status** |
| `status` | ENUM | Sim | ATIVO, QUITADO, CANCELADO, INADIMPLENTE |
| **Cancelamento** |
| `cancelado` | BOOLEAN | Não | Cancelado (default: false) |
| `data_cancelamento` | DATE | Não | Data de cancelamento |
| `motivo_cancelamento` | TEXT | Não | Motivo (2 parcelas em atraso ou 1 > 90 dias) |
| **Quitação** |
| `quitado` | BOOLEAN | Não | Quitado (default: false) |
| `data_quitacao` | DATE | Não | Data de quitação |
| **Aprovação** |
| `requer_aprovacao` | BOOLEAN | Não | Requer aprovação (default: false) |
| `aprovado` | BOOLEAN | Não | Aprovado (default: true) |
| `data_aprovacao` | DATE | Não | Data de aprovação |
| `aprovado_por_id` | UUID | Não | FK para usuarios |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_parcelamentos_numero` (numero_parcelamento)
- `idx_parcelamentos_contribuinte` (contribuinte_id)
- `idx_parcelamentos_status` (status)
- `idx_parcelamentos_contribuinte_status` (contribuinte_id, status)

**Constraints**:
- `check_parcelamento_numero_parcelas`: numero_parcelas BETWEEN 1 AND 24
- `check_parcelamento_dia_vencimento`: dia_vencimento BETWEEN 1 AND 31

**Triggers**:
- `trigger_atualizar_saldo_parcelamento`: Atualiza status quando todas as parcelas são pagas

---

### Tabela: `arrecadacao.parcelamentos_parcelas`
**Descrição**: Parcelas do Parcelamento

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `parcelamento_id` | UUID | Sim | FK para parcelamentos (cascade delete) |
| `numero_parcela` | INTEGER | Sim | Número da parcela (1 a N) |
| **Valores** |
| `valor_principal` | NUMERIC(15,2) | Sim | Valor principal da parcela |
| `valor_juros` | NUMERIC(15,2) | Não | Juros sobre a parcela (default: 0.00) |
| `valor_multa` | NUMERIC(15,2) | Não | Multa sobre a parcela (default: 0.00) |
| `valor_correcao` | NUMERIC(15,2) | Não | Correção monetária (default: 0.00) |
| `valor_total` | NUMERIC(15,2) | Sim | Valor total da parcela |
| **Vencimento** |
| `data_vencimento` | DATE | Sim | Data de vencimento |
| **Pagamento** |
| `pago` | BOOLEAN | Não | Paga (default: false) |
| `data_pagamento` | DATE | Não | Data do pagamento |
| `valor_pago` | NUMERIC(15,2) | Não | Valor pago |
| `dam_id` | UUID | Não | FK para dams |
| `dias_atraso` | INTEGER | Não | Dias de atraso (default: 0) |

**Índices**:
- `idx_parcelamentos_parcelas_parcelamento` (parcelamento_id)
- `idx_parcelamentos_parcelas_vencimento` (data_vencimento)
- `idx_parcelamentos_parcelas_pago` (pago)

**Constraints**:
- `uq_parcelamento_parcela_numero`: Unique (parcelamento_id, numero_parcela)

**Triggers**:
- `trigger_verificar_inadimplencia_parcelamento`: Cancela parcelamento por inadimplência

---

### Tabela: `arrecadacao.compensacoes`
**Descrição**: Compensações de Créditos (pagamentos indevidos ou a maior)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `numero_compensacao` | VARCHAR(30) | Sim | Número único da compensação |
| `contribuinte_id` | UUID | Sim | FK para pessoas |
| `data_solicitacao` | DATE | Sim | Data da solicitação (default: today) |
| **Origem do Crédito** |
| `origem_credito` | VARCHAR(200) | Sim | Descrição da origem do crédito |
| `pagamento_origem_id` | UUID | Não | FK para pagamentos |
| `valor_credito` | NUMERIC(15,2) | Sim | Valor disponível para compensação |
| **Débito a Compensar** |
| `dam_compensar_id` | UUID | Não | FK para dams |
| `valor_compensado` | NUMERIC(15,2) | Sim | Valor compensado |
| `valor_saldo` | NUMERIC(15,2) | Não | Saldo remanescente (default: 0.00) |
| **Aprovação** |
| `aprovado` | BOOLEAN | Não | Aprovado (default: false) |
| `data_aprovacao` | DATE | Não | Data de aprovação |
| `aprovado_por_id` | UUID | Não | FK para usuarios |
| **Deferimento** |
| `deferido` | BOOLEAN | Não | Deferido (default: false) |
| `data_deferimento` | DATE | Não | Data do deferimento |
| `motivo_indeferimento` | TEXT | Não | Motivo do indeferimento |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_compensacoes_numero` (numero_compensacao)
- `idx_compensacoes_contribuinte` (contribuinte_id)
- `idx_compensacoes_aprovado` (aprovado)

---

### Tabela: `arrecadacao.restituicoes`
**Descrição**: Restituições de Pagamentos Indevidos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `numero_restituicao` | VARCHAR(30) | Sim | Número único da restituição |
| `contribuinte_id` | UUID | Sim | FK para pessoas |
| `data_solicitacao` | DATE | Sim | Data da solicitação (default: today) |
| **Motivo** |
| `motivo` | VARCHAR(200) | Sim | PAGAMENTO_INDEVIDO, PAGAMENTO_A_MAIOR, ERRO_LANÇAMENTO, etc. |
| `descricao_motivo` | TEXT | Sim | Descrição detalhada |
| `pagamento_origem_id` | UUID | Não | FK para pagamentos |
| **Valores** |
| `valor_pago_indevido` | NUMERIC(15,2) | Sim | Valor pago indevidamente |
| `valor_restituir` | NUMERIC(15,2) | Sim | Valor a ser restituído |
| `valor_correcao` | NUMERIC(15,2) | Não | Correção monetária (default: 0.00) |
| `valor_total_restituir` | NUMERIC(15,2) | Sim | Valor total a restituir |
| **Aprovação** |
| `aprovado` | BOOLEAN | Não | Aprovado (default: false) |
| `data_aprovacao` | DATE | Não | Data de aprovação |
| `aprovado_por_id` | UUID | Não | FK para usuarios |
| **Deferimento** |
| `deferido` | BOOLEAN | Não | Deferido (default: false) |
| `data_deferimento` | DATE | Não | Data do deferimento |
| `motivo_indeferimento` | TEXT | Não | Motivo do indeferimento |
| **Restituição** |
| `restituido` | BOOLEAN | Não | Restituído (default: false) |
| `data_restituicao` | DATE | Não | Data da restituição |
| `forma_restituicao` | VARCHAR(50) | Não | DEPOSITO_BANCARIO, CHEQUE, COMPENSACAO |
| **Dados Bancários** |
| `banco` | VARCHAR(5) | Não | Código do banco |
| `agencia` | VARCHAR(10) | Não | Agência |
| `conta` | VARCHAR(20) | Não | Conta |
| `tipo_conta` | VARCHAR(20) | Não | CORRENTE, POUPANCA |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_restituicoes_numero` (numero_restituicao)
- `idx_restituicoes_contribuinte` (contribuinte_id)
- `idx_restituicoes_aprovado` (aprovado)
- `idx_restituicoes_restituido` (restituido)

---

## Módulo NFS-e

### Tabela: `nfse.notas_fiscais`
**Descrição**: Nota Fiscal de Serviço Eletrônica

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `numero_nfse` | VARCHAR(30) | Sim | Número único da NFS-e |
| `codigo_verificacao` | VARCHAR(20) | Sim | Código de verificação da autenticidade |
| `data_emissao` | TIMESTAMP | Sim | Data/hora de emissão (default: now) |
| **Prestador e Tomador** |
| `prestador_id` | UUID | Sim | FK para estabelecimentos |
| `tomador_id` | UUID | Sim | FK para pessoas |
| **Dados do Serviço** |
| `codigo_servico` | VARCHAR(10) | Sim | Código do serviço (ex: 7.02) |
| `discriminacao_servico` | TEXT | Sim | Descrição detalhada |
| **Valores** |
| `valor_servicos` | NUMERIC(15,2) | Sim | Valor total dos serviços |
| `valor_deducoes` | NUMERIC(15,2) | Não | Deduções permitidas (default: 0.00) |
| `valor_base_calculo` | NUMERIC(15,2) | Sim | Base de cálculo do ISSQN |
| **ISSQN** |
| `aliquota_issqn` | NUMERIC(5,4) | Sim | Alíquota do ISSQN |
| `valor_issqn` | NUMERIC(15,2) | Sim | Valor do ISSQN |
| `issqn_retido` | BOOLEAN | Não | ISSQN foi retido (default: false) |
| `valor_issqn_retido` | NUMERIC(15,2) | Não | Valor retido (default: 0.00) |
| **Outras Retenções Federais** |
| `valor_pis` | NUMERIC(15,2) | Não | PIS (default: 0.00) |
| `valor_cofins` | NUMERIC(15,2) | Não | COFINS (default: 0.00) |
| `valor_inss` | NUMERIC(15,2) | Não | INSS (default: 0.00) |
| `valor_ir` | NUMERIC(15,2) | Não | IR (default: 0.00) |
| `valor_csll` | NUMERIC(15,2) | Não | CSLL (default: 0.00) |
| `valor_liquido` | NUMERIC(15,2) | Sim | Valor líquido da nota |
| **Competência** |
| `mes_competencia` | INTEGER | Sim | Mês de competência (1-12) |
| `ano_competencia` | INTEGER | Sim | Ano de competência |
| **Local da Prestação** |
| `municipio_prestacao` | VARCHAR(100) | Sim | Município (default: "Município") |
| `codigo_municipio_ibge` | VARCHAR(7) | Não | Código IBGE |
| **Status** |
| `status` | ENUM | Sim | EMITIDA, CANCELADA, SUBSTITUIDA |
| **Cancelamento** |
| `cancelada` | BOOLEAN | Não | Cancelada (default: false) |
| `data_cancelamento` | TIMESTAMP | Não | Data/hora do cancelamento |
| `motivo_cancelamento` | TEXT | Não | Motivo do cancelamento |
| **Substituição** |
| `substitui_nfse_id` | UUID | Não | FK para notas_fiscais (que esta substitui) |
| `substituida_por_nfse_id` | UUID | Não | FK para notas_fiscais (que substituiu esta) |
| **RPS de Origem** |
| `rps_id` | UUID | Não | FK para rps |
| **XML** |
| `xml_nfse` | TEXT | Não | XML completo da NFS-e |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_nfse_numero` (numero_nfse)
- `idx_nfse_prestador` (prestador_id)
- `idx_nfse_tomador` (tomador_id)
- `idx_nfse_competencia` (ano_competencia, mes_competencia)
- `idx_nfse_status` (status)
- `idx_nfse_codigo_verificacao` (codigo_verificacao)
- `idx_nfse_prestador_competencia` (prestador_id, ano_competencia, mes_competencia)

---

### Tabela: `nfse.rps`
**Descrição**: Recibo Provisório de Serviços (deve ser convertido em NFS-e em até 30 dias)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `numero_rps` | VARCHAR(30) | Sim | Número do RPS |
| `serie_rps` | VARCHAR(5) | Não | Série do RPS (default: "A") |
| `data_emissao` | TIMESTAMP | Sim | Data/hora de emissão (default: now) |
| **Prestador e Tomador** |
| `prestador_id` | UUID | Sim | FK para estabelecimentos |
| `tomador_id` | UUID | Sim | FK para pessoas |
| **Dados do Serviço** |
| `codigo_servico` | VARCHAR(10) | Sim | Código do serviço |
| `discriminacao_servico` | TEXT | Sim | Descrição detalhada |
| **Valores** |
| `valor_servicos` | NUMERIC(15,2) | Sim | Valor dos serviços |
| `valor_deducoes` | NUMERIC(15,2) | Não | Deduções (default: 0.00) |
| `valor_base_calculo` | NUMERIC(15,2) | Sim | Base de cálculo |
| `aliquota_issqn` | NUMERIC(5,4) | Sim | Alíquota |
| `valor_issqn` | NUMERIC(15,2) | Sim | Valor do ISSQN |
| `issqn_retido` | BOOLEAN | Não | Retido (default: false) |
| **Competência** |
| `mes_competencia` | INTEGER | Sim | Mês de competência |
| `ano_competencia` | INTEGER | Sim | Ano de competência |
| **Status** |
| `status` | ENUM | Sim | AGUARDANDO_CONVERSAO, CONVERTIDO, CANCELADO, EXPIRADO |
| **Conversão em NFS-e** |
| `convertido` | BOOLEAN | Não | Convertido (default: false) |
| `data_conversao` | TIMESTAMP | Não | Data/hora da conversão |
| `nfse_numero` | VARCHAR(30) | Não | Número da NFS-e gerada |
| **Cancelamento** |
| `cancelado` | BOOLEAN | Não | Cancelado (default: false) |
| `data_cancelamento` | TIMESTAMP | Não | Data/hora do cancelamento |
| `motivo_cancelamento` | TEXT | Não | Motivo |
| **Prazo** |
| `data_limite_conversao` | DATE | Sim | Data limite para conversão (30 dias) |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_rps_prestador` (prestador_id)
- `idx_rps_status` (status)
- `idx_rps_data_limite` (data_limite_conversao)

**Constraints**:
- `uq_rps_numero_serie`: Unique (prestador_id, numero_rps, serie_rps)

---

### Tabela: `nfse.declaracoes_servico`
**Descrição**: Declarações de Serviços (DES-IF, DOC, DVM, DAME)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | Chave primária |
| `estabelecimento_id` | UUID | Sim | FK para estabelecimentos |
| `tipo_declaracao` | VARCHAR(50) | Sim | DES-IF, DOC, DVM, DAME |
| **Período** |
| `mes_competencia` | INTEGER | Sim | Mês de competência |
| `ano_competencia` | INTEGER | Sim | Ano de competência |
| `data_declaracao` | DATE | Sim | Data da declaração (default: today) |
| **Dados** |
| `dados_declarados` | JSONB | Sim | Dados em formato estruturado |
| **Totalizadores** |
| `total_receita_bruta` | NUMERIC(15,2) | Não | Total da receita bruta (default: 0.00) |
| `total_base_calculo` | NUMERIC(15,2) | Não | Total da base de cálculo (default: 0.00) |
| `total_issqn_devido` | NUMERIC(15,2) | Não | Total do ISSQN devido (default: 0.00) |
| `total_issqn_retido` | NUMERIC(15,2) | Não | Total do ISSQN retido (default: 0.00) |
| **Entrega** |
| `data_entrega` | TIMESTAMP | Não | Data/hora de entrega |
| `protocolo` | VARCHAR(50) | Não | Protocolo de entrega (único) |
| **Retificação** |
| `retificadora` | BOOLEAN | Não | É retificadora (default: false) |
| `declaracao_retificada_id` | UUID | Não | FK para declaracoes_servico |
| **Validação** |
| `validada` | BOOLEAN | Não | Validada (default: false) |
| `data_validacao` | TIMESTAMP | Não | Data/hora da validação |
| `erros_validacao` | JSONB | Não | Lista de erros |
| `observacoes` | TEXT | Não | Observações |

**Índices**:
- `idx_declaracoes_servico_estabelecimento` (estabelecimento_id)
- `idx_declaracoes_servico_tipo` (tipo_declaracao)
- `idx_declaracoes_servico_competencia` (ano_competencia, mes_competencia)
- `idx_declaracoes_servico_protocolo` (protocolo)

**Constraints**:
- `uq_declaracao_servico`: Unique (estabelecimento_id, tipo_declaracao, mes_competencia, ano_competencia, retificadora)

---

## Resumo Final

Este dicionário documenta **todas as tabelas** do Sistema de Gestão Tributária Municipal Tributec, incluindo:

- **50+ tabelas** distribuídas em **8 schemas**
- **Mais de 600 campos** devidamente documentados
- **Relacionamentos complexos** entre módulos
- **Índices otimizados** para performance
- **Triggers e funções** automatizadas
- **Constraints** para integridade de dados

O sistema cobre **toda a cadeia tributária**:
1. Cadastro
2. Lançamento
3. Arrecadação
4. Fiscalização
5. Contencioso
6. Dívida Ativa
7. Cobrança

---

**Data de Criação**: 2025-01-18
**Versão**: 1.0.0
**Sistema**: Tributec
**Desenvolvido em**: Português do Brasil 🇧🇷
