# Tributec API - Documentação Completa

Sistema de Gestão Tributária Municipal - Backend RESTful API

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Instalação e Configuração](#instalação-e-configuração)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
  - [Autenticação](#módulo-autenticação)
  - [Cadastros](#módulo-cadastros)
  - [Tributário](#módulo-tributário)
- [Exemplos de Requisições](#exemplos-de-requisições)
- [Códigos de Status HTTP](#códigos-de-status-http)
- [Erros Comuns](#erros-comuns)

---

## 🎯 Visão Geral

A **Tributec API** é uma plataforma completa para digitalização e automação de **TODOS** os processos tributários, fiscais, de arrecadação e contenciosos do município.

### Funcionalidades Principais

- **Gestão de Tributos**: IPTU, ITBI, ISSQN com cálculos automáticos
- **Cadastro**: Pessoas, Imóveis, Estabelecimentos, Logradouros
- **Isenções e Imunidades**: Sistema completo com workflow de aprovação
- **Configurações Tributárias**: Alíquotas progressivas, PGV, TPC
- **Arrecadação**: Parcelamentos, pagamentos, renegociação
- **Relatórios**: Arrecadação, inadimplência com aging buckets

### URLs Base

- **Desenvolvimento**: `http://localhost:8000`
- **Documentação Interativa (Swagger)**: `http://localhost:8000/docs`
- **Documentação Alternativa (ReDoc)**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/api/v1/openapi.json`

---

## 🛠️ Tecnologias

- **Framework**: FastAPI 0.104+
- **Linguagem**: Python 3.11+
- **Banco de Dados**: PostgreSQL 15+ com extensão PostGIS
- **ORM**: SQLAlchemy 2.0
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: Pydantic v2
- **PDF**: ReportLab
- **ASGI Server**: Uvicorn

---

## 🚀 Instalação e Configuração

### Pré-requisitos

```bash
# Python 3.11 ou superior
python --version

# PostgreSQL 15+ com PostGIS
psql --version
```

### Instalação

```bash
# Clone o repositório
git clone https://github.com/silvacarvalho/Tributec.git
cd Tributec/backend

# Crie o ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instale as dependências
pip install -r requirements.txt
```

### Configuração do Banco de Dados

```bash
# Crie o banco de dados PostgreSQL
createdb tributec

# Ative a extensão PostGIS
psql tributec -c "CREATE EXTENSION postgis;"
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto backend:

```env
# Aplicação
APP_NAME="Tributec API"
APP_VERSION="1.0.0"
ENVIRONMENT="development"
DEBUG=true

# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/tributec"

# Segurança
SECRET_KEY="sua-chave-secreta-muito-segura-aqui"
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASSWORD="sua-senha-app"
SMTP_FROM="noreply@tributec.gov.br"
```

### Executar Migrações

```bash
# Criar as tabelas no banco
alembic upgrade head
```

### Iniciar o Servidor

```bash
# Desenvolvimento (com hot-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Produção
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Tokens)** para autenticação.

### Fluxo de Autenticação

1. **Login**: Obter `access_token` e `refresh_token`
2. **Requisições**: Incluir `access_token` no header `Authorization`
3. **Renovação**: Usar `refresh_token` para obter novo `access_token`
4. **Logout**: Invalidar tokens

### Headers de Autenticação

Todas as requisições autenticadas devem incluir:

```http
Authorization: Bearer {access_token}
```

### Perfis de Acesso

- **ADMIN**: Acesso total ao sistema
- **FISCAL**: Acesso a cadastros e lançamentos tributários
- **ARRECADACAO**: Acesso a pagamentos e parcelamentos

---

## 📚 Endpoints

### Módulo: Autenticação

Base: `/api/v1/auth`

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/login` | Autentica usuário e retorna tokens | Não |
| POST | `/refresh` | Renova access token usando refresh token | Não |
| GET | `/me` | Retorna dados do usuário autenticado | Sim |
| POST | `/alterar-senha` | Altera senha do usuário autenticado | Sim |
| POST | `/recuperar-senha` | Solicita recuperação de senha por email | Não |
| POST | `/redefinir-senha` | Redefine senha usando token de email | Não |
| POST | `/logout` | Invalida tokens do usuário | Sim |

---

### Módulo: Cadastros

Base: `/api/v1/cadastro`

#### Pessoas (Físicas e Jurídicas)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/pessoas` | Cria nova pessoa | FISCAL, ADMIN |
| GET | `/pessoas` | Lista pessoas com filtros e paginação | Todas |
| GET | `/pessoas/{id}` | Obtém pessoa por ID com endereços | Todas |
| PUT | `/pessoas/{id}` | Atualiza dados da pessoa | FISCAL, ADMIN |
| DELETE | `/pessoas/{id}` | Remove pessoa (soft delete) | ADMIN |
| GET | `/pessoas/cpf/{cpf}` | Busca pessoa física por CPF | Todas |
| GET | `/pessoas/cnpj/{cnpj}` | Busca pessoa jurídica por CNPJ | Todas |

**Filtros disponíveis** (`/pessoas`):
- `tipo_pessoa`: F (Física) ou J (Jurídica)
- `situacao`: ATIVO, INATIVO
- `skip`: Paginação (padrão: 0)
- `limit`: Itens por página (padrão: 20, máx: 100)

#### Imóveis

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/imoveis` | Cadastra novo imóvel | FISCAL, ADMIN |
| GET | `/imoveis` | Lista imóveis com filtros | Todas |
| GET | `/imoveis/{id}` | Obtém imóvel completo por ID | Todas |
| GET | `/imoveis/inscricao/{inscricao}` | Busca por inscrição cadastral | Todas |
| PUT | `/imoveis/{id}` | Atualiza dados do imóvel | FISCAL, ADMIN |

**Filtros disponíveis** (`/imoveis`):
- `tipo_uso`: RESIDENCIAL, COMERCIAL, INDUSTRIAL, MISTO
- `situacao`: ATIVO, INATIVO
- `skip`, `limit`: Paginação

#### Estabelecimentos

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/estabelecimentos` | Cadastra estabelecimento comercial | FISCAL, ADMIN |
| GET | `/estabelecimentos` | Lista estabelecimentos | Todas |
| GET | `/estabelecimentos/{id}` | Obtém estabelecimento por ID | Todas |

#### Logradouros

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/logradouros` | Cadastra logradouro | FISCAL, ADMIN |
| GET | `/logradouros` | Lista logradouros | Todas |

---

### Módulo: Tributário

Base: `/api/v1/tributario`

#### IPTU - Imposto Predial e Territorial Urbano

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/iptu/calcular` | Calcula IPTU de um imóvel | FISCAL, ADMIN |
| POST | `/iptu/lancar` | Lança IPTU no exercício | FISCAL, ADMIN |
| POST | `/iptu/lançamento-em-lote/{ano}` | Lança IPTU em lote para todos os imóveis | ADMIN |
| GET | `/iptu/lancamentos` | Lista lançamentos de IPTU | Todas |
| GET | `/iptu/lancamentos/{id}` | Obtém lançamento específico | Todas |
| GET | `/iptu/lancamentos/{id}/parcelas` | Lista parcelas do lançamento | Todas |
| PUT | `/iptu/lancamentos/{id}/corrigir` | Corrige valores do lançamento | FISCAL, ADMIN |
| PUT | `/iptu/lancamentos/{id}/cancelar` | Cancela lançamento | ADMIN |

**Filtros** (`/iptu/lancamentos`):
- `ano_exercicio`: Ano fiscal
- `imovel_id`: ID do imóvel
- `status`: LANCADO, PAGO, CANCELADO, VENCIDO
- `skip`, `limit`: Paginação

#### ITBI - Imposto de Transmissão de Bens Imóveis

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/itbi/calcular` | Calcula ITBI para transação | FISCAL, ADMIN |
| POST | `/itbi/emitir-guia` | Emite guia de ITBI | FISCAL, ADMIN |
| GET | `/itbi/guias` | Lista guias de ITBI | Todas |
| GET | `/itbi/guias/{id}` | Obtém guia específica | Todas |
| GET | `/itbi/guias/{id}/pdf` | Gera PDF da guia | Todas |
| PUT | `/itbi/guias/{id}/registrar-pagamento` | Registra pagamento da guia | ARRECADACAO, ADMIN |
| PUT | `/itbi/guias/{id}/arbitrar` | Arbitra valor quando declarado é suspeito | FISCAL, ADMIN |
| PUT | `/itbi/guias/{id}/cancelar` | Cancela guia de ITBI | ADMIN |

**Filtros** (`/itbi/guias`):
- `imovel_id`: ID do imóvel
- `transmitente_id`: ID do vendedor/doador
- `adquirente_id`: ID do comprador
- `status`: EMITIDA, PAGA, CANCELADA
- `data_inicio`, `data_fim`: Período de emissão
- `skip`, `limit`: Paginação

#### ISSQN - Imposto Sobre Serviços de Qualquer Natureza

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/issqn/calcular` | Calcula ISSQN para declaração | FISCAL, ADMIN |
| POST | `/issqn/declarar` | Cria declaração de ISSQN | Contribuinte, ADMIN |
| GET | `/issqn/declaracoes` | Lista declarações | Todas |
| GET | `/issqn/declaracoes/{id}/pdf` | Gera PDF da declaração | Todas |
| PUT | `/issqn/declaracoes/{id}/registrar-pagamento` | Registra pagamento | ARRECADACAO, ADMIN |
| PUT | `/issqn/declaracoes/{id}/retificar` | Retifica declaração | Contribuinte, ADMIN |
| PUT | `/issqn/declaracoes/{id}/cancelar` | Cancela declaração | ADMIN |

**Filtros** (`/issqn/declaracoes`):
- `estabelecimento_id`: ID do estabelecimento
- `mes_competencia`: Mês (1-12)
- `ano_competencia`: Ano
- `regime_tributacao`: FIXO, ESTIMATIVA, VARIAVEL, SOCIEDADE_PROFISSIONAIS
- `status`: DECLARADA, PAGA, RETIFICADA, CANCELADA
- `skip`, `limit`: Paginação

##### ISSQN - Retenções na Fonte

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/issqn/retencoes` | Registra retenção de ISSQN | FISCAL, ADMIN |
| GET | `/issqn/retencoes` | Lista retenções | Todas |
| PUT | `/issqn/retencoes/{id}/recolher` | Registra recolhimento | ARRECADACAO, ADMIN |

**Filtros** (`/issqn/retencoes`):
- `tomador_id`: ID do responsável pela retenção
- `prestador_id`: ID do prestador de serviço
- `recolhido`: true/false
- `mes_competencia`, `ano_competencia`
- `skip`, `limit`: Paginação

#### Isenções e Imunidades

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/isencoes` | Solicita isenção tributária | Contribuinte, ADMIN |
| GET | `/isencoes` | Lista isenções | Todas |
| GET | `/isencoes/{id}` | Obtém isenção específica | Todas |
| PUT | `/isencoes/{id}/aprovar` | Aprova solicitação de isenção | FISCAL, ADMIN |
| PUT | `/isencoes/{id}/cancelar` | Cancela isenção ativa | FISCAL, ADMIN |
| PUT | `/isencoes/{id}` | Atualiza dados da isenção | FISCAL, ADMIN |
| DELETE | `/isencoes/{id}` | Remove isenção | ADMIN |

**Tipos de Isenção**:
- **Tributos**: IPTU, ITBI, ISSQN
- **Modalidade**: TOTAL (100%) ou PARCIAL (percentual)
- **Motivos**: IDOSO, DEFICIENTE, BAIXA_RENDA, FILANTROPIA, UTILIDADE_PUBLICA, OUTROS

**Filtros** (`/isencoes`):
- `beneficiario_id`: ID do beneficiário
- `tipo_tributo`: IPTU, ITBI, ISSQN
- `ativa`: true/false
- `motivo`: Conforme lista acima
- `skip`, `limit`: Paginação

#### Alíquotas Tributárias

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/aliquotas` | Cria nova alíquota | ADMIN |
| GET | `/aliquotas` | Lista alíquotas | Todas |
| GET | `/aliquotas/{id}` | Obtém alíquota específica | Todas |
| PUT | `/aliquotas/{id}` | Atualiza alíquota | ADMIN |
| DELETE | `/aliquotas/{id}` | Remove alíquota | ADMIN |

**Características**:
- **Progressividade**: Alíquotas por faixa de valor (valor_minimo/valor_maximo)
- **Categorias**: RESIDENCIAL, COMERCIAL, INDUSTRIAL, MISTO (IPTU), SFH, NORMAL (ITBI)
- **Vigência**: Controle por ano e período de validade

**Filtros** (`/aliquotas`):
- `tipo_tributo`: IPTU, ITBI, ISSQN
- `categoria`: Conforme tipo de tributo
- `ano_vigencia`: Ano
- `ativa`: true/false
- `skip`, `limit`: Paginação

#### PGV - Planta Genérica de Valores

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/pgv` | Cria valor de m² de terreno | ADMIN |
| GET | `/pgv` | Lista valores por setor fiscal | Todas |
| GET | `/pgv/{id}` | Obtém PGV específica | Todas |
| PUT | `/pgv/{id}` | Atualiza valor do m² | ADMIN |
| DELETE | `/pgv/{id}` | Remove PGV | ADMIN |

**Uso**: Define o valor do metro quadrado de terreno por setor fiscal, utilizado no cálculo:
```
VVT (Valor Venal do Terreno) = Área do Terreno × Vm²TT × FCT
```

**Filtros** (`/pgv`):
- `setor_fiscal_id`: ID do setor
- `ano_vigencia`: Ano
- `ativa`: true/false
- `skip`, `limit`: Paginação

#### TPC - Tabela de Preços de Construção

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/tpc` | Cria preço de m² de edificação | ADMIN |
| GET | `/tpc` | Lista preços por padrão construtivo | Todas |
| GET | `/tpc/{id}` | Obtém TPC específica | Todas |
| PUT | `/tpc/{id}` | Atualiza preço do m² | ADMIN |
| DELETE | `/tpc/{id}` | Remove TPC | ADMIN |

**Padrões Construtivos**:
- ALTO, MEDIO_ALTO, MEDIO, MEDIO_BAIXO, BAIXO

**Uso**: Define o valor do metro quadrado de edificação, utilizado no cálculo:
```
VVE (Valor Venal da Edificação) = Área Edificada × Vm²TE × FCE
```

**Filtros** (`/tpc`):
- `padrao_construtivo`: Conforme lista acima
- `ano_vigencia`, `mes_vigencia`
- `ativa`: true/false
- `skip`, `limit`: Paginação

#### Parcelamentos

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/parcelamentos` | Cria parcelamento de débitos | ARRECADACAO, ADMIN |
| GET | `/parcelamentos` | Lista parcelamentos | Todas |
| PUT | `/parcelamentos/{id}/parcela/{n}/pagar` | Registra pagamento de parcela | ARRECADACAO, ADMIN |
| PUT | `/parcelamentos/{id}/cancelar` | Cancela parcelamento | ARRECADACAO, ADMIN |

**Regras**:
- **Máximo**: 24 parcelas
- **Valor Mínimo** (parcela): 5 UFM (PF) ou 20 UFM (PJ)
- **Entrada**: Opcional
- **Cancelamento automático**: 2 parcelas em atraso OU 1 parcela > 90 dias

**Filtros** (`/parcelamentos`):
- `contribuinte_id`: ID do devedor
- `status`: ATIVO, QUITADO, CANCELADO
- `skip`, `limit`: Paginação

#### Relatórios

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/relatorios/arrecadacao` | Relatório de arrecadação por período | ARRECADACAO, ADMIN |
| GET | `/relatorios/inadimplencia` | Relatório de inadimplência com aging | ARRECADACAO, ADMIN |

**Parâmetros do Relatório de Arrecadação**:
- `data_inicio`, `data_fim`: Período (obrigatório)
- `tipo_tributo`: IPTU, ITBI, ISSQN (opcional)
- `formato`: json, csv, pdf (padrão: json)

**Parâmetros do Relatório de Inadimplência**:
- `data_referencia`: Data base para cálculo (padrão: hoje)
- `tipo_tributo`: Filtro por tributo (opcional)
- `aging_buckets`: true/false - Agrupa por faixa de atraso (0-30, 31-60, 61-90, 90+)

---

## 💡 Exemplos de Requisições

### 1. Login e Autenticação

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fiscal@tributec.gov.br",
    "senha": "senha123"
  }'

# Resposta
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### 2. Cadastrar Pessoa Física

```bash
curl -X POST http://localhost:8000/api/v1/cadastro/pessoas \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_pessoa": "F",
    "cpf": "12345678901",
    "nome_completo": "João da Silva",
    "data_nascimento": "1980-05-15",
    "email": "joao@email.com",
    "telefone": "(11) 98765-4321",
    "situacao": "ATIVO"
  }'

# Resposta
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tipo_pessoa": "F",
  "cpf": "12345678901",
  "nome_completo": "João da Silva",
  "data_nascimento": "1980-05-15",
  "email": "joao@email.com",
  "telefone": "(11) 98765-4321",
  "situacao": "ATIVO",
  "data_cadastro": "2025-11-18T10:30:00"
}
```

### 3. Cadastrar Imóvel

```bash
curl -X POST http://localhost:8000/api/v1/cadastro/imoveis \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "inscricao_cadastral": "12.34.567.0001-8",
    "proprietario_id": "550e8400-e29b-41d4-a716-446655440000",
    "logradouro_id": 1001,
    "numero": "100",
    "complemento": "Apto 501",
    "bairro": "Centro",
    "cep": "01310-100",
    "setor_fiscal": 12,
    "quadra_fiscal": "A",
    "lote": "10",
    "area_terreno": 250.00,
    "area_edificada": 180.00,
    "testada": 10.00,
    "tipo_uso": "RESIDENCIAL",
    "padrao_construtivo": "MEDIO",
    "ano_construcao": 2010,
    "situacao": "ATIVO"
  }'
```

### 4. Calcular IPTU

```bash
curl -X POST http://localhost:8000/api/v1/tributario/iptu/calcular \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "imovel_id": "550e8400-e29b-41d4-a716-446655440001",
    "ano_exercicio": 2025,
    "numero_parcelas": 10,
    "pagamento_unico": false,
    "iptu_digital": true
  }'

# Resposta
{
  "valor_venal_terreno": 125000.00,
  "valor_venal_edificacao": 180000.00,
  "valor_venal_total": 305000.00,
  "fator_correcao_terreno": 1.0000,
  "fator_correcao_edificacao": 1.0000,
  "aliquota_aplicada": 0.0100,
  "tipo_uso_calculo": "RESIDENCIAL",
  "valor_iptu": 3050.00,
  "desconto_pagamento_unico": 0.00,
  "desconto_iptu_digital": 61.00,
  "valor_liquido": 2989.00,
  "numero_parcelas": 10,
  "valor_parcela": 298.90
}
```

### 5. Lançar IPTU

```bash
curl -X POST http://localhost:8000/api/v1/tributario/iptu/lancar \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "imovel_id": "550e8400-e29b-41d4-a716-446655440001",
    "ano_exercicio": 2025,
    "numero_parcelas": 10,
    "pagamento_unico": false,
    "iptu_digital": true
  }'

# Resposta
{
  "id": "650e8400-e29b-41d4-a716-446655440000",
  "imovel_id": "550e8400-e29b-41d4-a716-446655440001",
  "ano_exercicio": 2025,
  "numero_lancamento": "IPTU-2025-00001",
  "data_lancamento": "2025-11-18",
  "valor_venal_terreno": 125000.00,
  "valor_venal_edificacao": 180000.00,
  "valor_venal_total": 305000.00,
  "aliquota_aplicada": 0.0100,
  "tipo_uso_calculo": "RESIDENCIAL",
  "valor_iptu": 3050.00,
  "valor_liquido": 2989.00,
  "numero_parcelas": 10,
  "valor_parcela": 298.90,
  "data_vencimento_primeira_parcela": "2025-03-10",
  "status": "LANCADO"
}
```

### 6. Emitir Guia de ITBI

```bash
curl -X POST http://localhost:8000/api/v1/tributario/itbi/emitir-guia \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "imovel_id": "550e8400-e29b-41d4-a716-446655440001",
    "transmitente_id": "550e8400-e29b-41d4-a716-446655440000",
    "adquirente_id": "650e8400-e29b-41d4-a716-446655440000",
    "tipo_transmissao": "COMPRA_VENDA",
    "valor_declarado": 450000.00,
    "valor_financiado_sfh": 350000.00
  }'

# Resposta
{
  "id": "750e8400-e29b-41d4-a716-446655440000",
  "numero_guia": "ITBI-2025-00001",
  "data_emissao": "2025-11-18",
  "imovel_id": "550e8400-e29b-41d4-a716-446655440001",
  "transmitente_id": "550e8400-e29b-41d4-a716-446655440000",
  "adquirente_id": "650e8400-e29b-41d4-a716-446655440000",
  "tipo_transmissao": "COMPRA_VENDA",
  "valor_declarado": 450000.00,
  "valor_venal": 305000.00,
  "valor_base_calculo": 450000.00,
  "valor_financiado_sfh": 350000.00,
  "valor_nao_financiado": 100000.00,
  "aliquota_sfh": 0.0000,
  "aliquota_normal": 0.0200,
  "valor_itbi_sfh": 0.00,
  "valor_itbi_normal": 2000.00,
  "valor_itbi_total": 2000.00,
  "valor_liquido": 2000.00,
  "data_vencimento": "2025-12-18",
  "pago": false,
  "status": "EMITIDA"
}
```

### 7. Criar Declaração de ISSQN

```bash
curl -X POST http://localhost:8000/api/v1/tributario/issqn/declarar \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "estabelecimento_id": "850e8400-e29b-41d4-a716-446655440000",
    "mes_competencia": 10,
    "ano_competencia": 2025,
    "regime_tributacao": "VARIAVEL",
    "receita_bruta_total": 50000.00,
    "deducoes_materiais": 5000.00,
    "outras_deducoes": 2000.00,
    "valor_retido_terceiros": 500.00
  }'

# Resposta
{
  "id": "950e8400-e29b-41d4-a716-446655440000",
  "numero_declaracao": "DMS-2025-00001",
  "data_declaracao": "2025-11-18",
  "estabelecimento_id": "850e8400-e29b-41d4-a716-446655440000",
  "mes_competencia": 10,
  "ano_competencia": 2025,
  "regime_tributacao": "VARIAVEL",
  "receita_bruta_total": 50000.00,
  "deducoes_materiais": 5000.00,
  "outras_deducoes": 2000.00,
  "base_calculo": 43000.00,
  "aliquota": 0.0500,
  "valor_issqn": 2150.00,
  "valor_retido_terceiros": 500.00,
  "valor_a_recolher": 1650.00,
  "data_vencimento": "2025-11-10",
  "pago": false,
  "status": "DECLARADA"
}
```

### 8. Solicitar Isenção

```bash
curl -X POST http://localhost:8000/api/v1/tributario/isencoes \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "beneficiario_id": "550e8400-e29b-41d4-a716-446655440000",
    "tipo_tributo": "IPTU",
    "tipo_isencao": "TOTAL",
    "percentual_isencao": 100.00,
    "fundamento_legal": "Lei Municipal 1234/2020",
    "artigo_lei": "Art. 15, inciso III",
    "motivo": "IDOSO",
    "descricao_motivo": "Contribuinte com mais de 65 anos",
    "data_inicio": "2025-01-01",
    "imovel_id": "550e8400-e29b-41d4-a716-446655440001"
  }'

# Resposta
{
  "id": "a50e8400-e29b-41d4-a716-446655440000",
  "numero_processo": "ISEN-2025-00001",
  "data_solicitacao": "2025-11-18",
  "beneficiario_id": "550e8400-e29b-41d4-a716-446655440000",
  "tipo_tributo": "IPTU",
  "tipo_isencao": "TOTAL",
  "percentual_isencao": 100.00,
  "fundamento_legal": "Lei Municipal 1234/2020",
  "artigo_lei": "Art. 15, inciso III",
  "motivo": "IDOSO",
  "descricao_motivo": "Contribuinte com mais de 65 anos",
  "data_inicio": "2025-01-01",
  "data_fim": null,
  "imovel_id": "550e8400-e29b-41d4-a716-446655440001",
  "ativa": false,
  "data_aprovacao": null
}
```

### 9. Configurar Alíquota Progressiva

```bash
curl -X POST http://localhost:8000/api/v1/tributario/aliquotas \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_tributo": "IPTU",
    "categoria": "RESIDENCIAL",
    "valor_minimo": 0.00,
    "valor_maximo": 100000.00,
    "aliquota": 0.0050,
    "ano_vigencia": 2025,
    "data_inicio_vigencia": "2025-01-01",
    "ativa": true,
    "observacoes": "Alíquota básica para imóveis residenciais de baixo valor"
  }'

# Resposta
{
  "id": 1,
  "tipo_tributo": "IPTU",
  "categoria": "RESIDENCIAL",
  "valor_minimo": 0.00,
  "valor_maximo": 100000.00,
  "aliquota": 0.0050,
  "ano_vigencia": 2025,
  "data_inicio_vigencia": "2025-01-01",
  "data_fim_vigencia": null,
  "ativa": true,
  "observacoes": "Alíquota básica para imóveis residenciais de baixo valor"
}
```

### 10. Criar Parcelamento

```bash
curl -X POST http://localhost:8000/api/v1/tributario/parcelamentos \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "contribuinte_id": "550e8400-e29b-41d4-a716-446655440000",
    "debitos_ids": [
      "650e8400-e29b-41d4-a716-446655440000",
      "650e8400-e29b-41d4-a716-446655440001"
    ],
    "numero_parcelas": 12,
    "valor_entrada": 500.00,
    "dia_vencimento": 10,
    "observacoes": "Renegociação de débitos de IPTU 2023 e 2024"
  }'

# Resposta
{
  "id": "b50e8400-e29b-41d4-a716-446655440000",
  "numero_parcelamento": "PARC-2025-00001",
  "contribuinte_id": "550e8400-e29b-41d4-a716-446655440000",
  "valor_original": 6000.00,
  "valor_entrada": 500.00,
  "valor_parcelado": 5500.00,
  "numero_parcelas": 12,
  "valor_parcela": 458.33,
  "data_primeira_parcela": "2025-12-10",
  "status": "ATIVO",
  "debitos_ids": [
    "650e8400-e29b-41d4-a716-446655440000",
    "650e8400-e29b-41d4-a716-446655440001"
  ]
}
```

### 11. Listar com Paginação

```bash
# Listar pessoas com filtros
curl -X GET "http://localhost:8000/api/v1/cadastro/pessoas?tipo_pessoa=F&situacao=ATIVO&skip=0&limit=20" \
  -H "Authorization: Bearer {access_token}"

# Resposta
{
  "sucesso": true,
  "dados": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "tipo_pessoa": "F",
      "cpf": "12345678901",
      "nome_completo": "João da Silva",
      ...
    }
  ],
  "paginacao": {
    "total": 150,
    "pagina": 1,
    "limite": 20,
    "total_paginas": 8,
    "tem_proxima": true,
    "tem_anterior": false
  }
}
```

### 12. Relatório de Arrecadação

```bash
curl -X GET "http://localhost:8000/api/v1/tributario/relatorios/arrecadacao?data_inicio=2025-01-01&data_fim=2025-11-18&tipo_tributo=IPTU" \
  -H "Authorization: Bearer {access_token}"

# Resposta
{
  "periodo": {
    "data_inicio": "2025-01-01",
    "data_fim": "2025-11-18"
  },
  "totais": {
    "iptu": 1250000.00,
    "itbi": 350000.00,
    "issqn": 780000.00,
    "total_geral": 2380000.00
  },
  "por_mes": [
    {
      "mes": "01/2025",
      "valor": 150000.00
    },
    ...
  ],
  "por_status": {
    "pago": 2100000.00,
    "pendente": 280000.00
  }
}
```

---

## 📊 Códigos de Status HTTP

| Código | Descrição | Uso |
|--------|-----------|-----|
| 200 | OK | Requisição bem-sucedida (GET, PUT) |
| 201 | Created | Recurso criado com sucesso (POST) |
| 204 | No Content | Recurso deletado com sucesso (DELETE) |
| 400 | Bad Request | Dados inválidos na requisição |
| 401 | Unauthorized | Token ausente ou inválido |
| 403 | Forbidden | Usuário sem permissão para a operação |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (CPF/CNPJ duplicado, etc.) |
| 422 | Unprocessable Entity | Validação de dados falhou |
| 500 | Internal Server Error | Erro interno do servidor |

---

## ⚠️ Erros Comuns

### 1. Token Inválido ou Expirado

```json
{
  "detail": "Could not validate credentials"
}
```

**Solução**: Faça login novamente ou renove o token usando `/auth/refresh`.

---

### 2. Permissão Negada

```json
{
  "detail": "Você não tem permissão para acessar este recurso. Necessário: ['ADMIN']"
}
```

**Solução**: Verifique se seu usuário possui o perfil necessário.

---

### 3. CPF/CNPJ Duplicado

```json
{
  "detail": "Já existe uma pessoa cadastrada com este CPF/CNPJ"
}
```

**Solução**: Use o endpoint de busca para encontrar o cadastro existente.

---

### 4. Validação de Dados

```json
{
  "detail": [
    {
      "loc": ["body", "cpf"],
      "msg": "CPF inválido",
      "type": "value_error"
    }
  ]
}
```

**Solução**: Corrija os campos indicados no array `detail`.

---

### 5. Recurso Não Encontrado

```json
{
  "detail": "Imóvel não encontrado"
}
```

**Solução**: Verifique se o ID está correto e se o recurso existe.

---

### 6. Cálculo Impossível

```json
{
  "detail": "Não foi possível calcular IPTU: PGV não configurada para o setor fiscal 12"
}
```

**Solução**: Configure a PGV/TPC necessária antes de calcular tributos.

---

### 7. Operação Não Permitida

```json
{
  "detail": "Não é possível corrigir um lançamento já pago"
}
```

**Solução**: Verifique o status do recurso antes de tentar a operação.

---

## 🔧 Boas Práticas

### 1. Sempre Use HTTPS em Produção

```python
# Em produção, configure SSL/TLS
uvicorn app.main:app --host 0.0.0.0 --port 443 --ssl-keyfile key.pem --ssl-certfile cert.pem
```

### 2. Renove Tokens Antes de Expirar

```javascript
// Frontend: Renovar automaticamente
setInterval(async () => {
  const response = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  const { access_token } = await response.json();
  localStorage.setItem('access_token', access_token);
}, 25 * 60 * 1000); // 25 minutos (antes dos 30)
```

### 3. Trate Erros Adequadamente

```javascript
try {
  const response = await fetch('/api/v1/cadastro/pessoas', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Erro:', error.detail);
    // Exibir mensagem amigável para o usuário
  }

  const pessoa = await response.json();
  console.log('Pessoa criada:', pessoa);
} catch (error) {
  console.error('Erro de rede:', error);
}
```

### 4. Use Paginação em Listagens

```python
# Sempre use limit para evitar sobrecarga
GET /api/v1/cadastro/pessoas?skip=0&limit=50
```

### 5. Filtros para Performance

```python
# Filtre no backend em vez de buscar tudo
GET /api/v1/tributario/iptu/lancamentos?ano_exercicio=2025&status=LANCADO
```

---

## 📝 Notas de Versão

### v1.0.0 (2025-11-18)

**Recursos Implementados**:
- ✅ Sistema completo de autenticação JWT
- ✅ CRUD de Pessoas, Imóveis, Estabelecimentos, Logradouros
- ✅ Cálculo e lançamento de IPTU com parcelamento
- ✅ Emissão de guias de ITBI com SFH
- ✅ Declarações de ISSQN (4 regimes)
- ✅ Sistema de isenções e imunidades
- ✅ Alíquotas progressivas configuráveis
- ✅ PGV e TPC por setor/padrão
- ✅ Retenção de ISSQN na fonte
- ✅ Parcelamento de débitos (até 24x)
- ✅ Relatórios de arrecadação e inadimplência
- ✅ Geração de PDF para guias e declarações
- ✅ Correção e cancelamento de lançamentos

---

## 📞 Suporte

- **Documentação Interativa**: http://localhost:8000/docs
- **Repositório**: https://github.com/silvacarvalho/Tributec
- **Email**: contato@tributec.gov.br

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License**.

---

**Desenvolvido com ❤️ pela Equipe Tributec**
