"""
Ponto de entrada da aplicação FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Descrição detalhada da API
description = """
## Tributec - Sistema de Gestão Tributária Municipal 🏛️

Plataforma completa para digitalização e automação de **TODOS** os processos tributários,
fiscais, de arrecadação e contenciosos do município.

### Módulos Disponíveis

#### 🔐 Autenticação
* Login com JWT
* Refresh tokens
* Controle de permissões (ADMIN, FISCAL, ARRECADACAO)

#### 👥 Cadastro
* **Pessoas**: Física e Jurídica com validação de CPF/CNPJ
* **Imóveis**: Cadastro completo com geometria PostGIS
* **Logradouros**: Endereços e setores fiscais
* **Estabelecimentos**: Inscrição municipal e atividades

#### 💰 Tributos
* **IPTU**: Lançamento, cálculo com fatores de correção, parcelamento
* **ITBI**: Cálculo, emissão de guias, arbitramento de valores
* **ISSQN**: 4 regimes de tributação, retenção na fonte

#### 🎁 Isenções e Benefícios
* Isenções totais ou parciais
* Motivos: Idoso, Deficiente, Baixa Renda, Filantropia
* Workflow de aprovação

#### 📊 Configurações Tributárias
* **Alíquotas**: Configuráveis por faixa de valor e categoria
* **PGV**: Planta Genérica de Valores (m² terreno)
* **TPC**: Tabela de Preços de Construção (m² edificação)

#### 💳 Arrecadação
* Parcelamentos (até 24x)
* Renegociação de débitos
* Controle de pagamentos

#### 🚨 Fiscalização
* **Autos de Infração**: Lavratura automática com cálculo de multas
* **Catálogo de Infrações**: Infrações configuráveis por lei
* **Workflow Completo**: Notificação, defesa, julgamento, pagamento
* **Reincidência**: Cálculo automático de acréscimos
* **Intimações**: Prazos e formas de notificação

#### ⚙️ Parâmetros do Sistema
* **Configuração Centralizada**: UFM, prazos, multas, descontos
* **Multi-módulo**: FISCAL, TRIBUTARIO, ARRECADACAO, GERAL
* **Versionamento**: Parâmetros anuais com vigência
* **Base Legal**: Rastreabilidade de legislação
* **Validações**: Limites min/max, unidades, opções

#### 📈 Relatórios
* Arrecadação por período
* Inadimplência com aging buckets
* Estatísticas de fiscalização
* Exportação de dados

### Tecnologias

* **Backend**: FastAPI 0.104+ (Python 3.11+)
* **Banco de Dados**: PostgreSQL 15+ com PostGIS
* **ORM**: SQLAlchemy 2.0
* **Autenticação**: JWT (Bearer tokens)
* **Documentação**: OpenAPI 3.0 (Swagger)

### Ambientes

* **Desenvolvimento**: http://localhost:8000
* **Documentação Interativa**: http://localhost:8000/docs
* **Documentação ReDoc**: http://localhost:8000/redoc
"""

# Tags para organização da documentação
tags_metadata = [
    {
        "name": "Autenticação",
        "description": "Endpoints de autenticação e autorização (login, refresh token, permissões)",
    },
    {
        "name": "Cadastro - Pessoas",
        "description": "CRUD de pessoas físicas e jurídicas",
    },
    {
        "name": "Cadastro - Imóveis",
        "description": "CRUD de imóveis com suporte a geometria PostGIS",
    },
    {
        "name": "Cadastro - Logradouros",
        "description": "CRUD de logradouros e setores fiscais",
    },
    {
        "name": "Cadastro - Estabelecimentos",
        "description": "CRUD de estabelecimentos comerciais",
    },
    {
        "name": "Tributário - IPTU",
        "description": "Lançamento, cálculo, correção e cancelamento de IPTU",
    },
    {
        "name": "Tributário - ITBI",
        "description": "Cálculo, emissão de guias, arbitramento e cancelamento de ITBI",
    },
    {
        "name": "Tributário - ISSQN",
        "description": "Declarações, retenções e cálculos de ISSQN",
    },
    {
        "name": "Tributário - Isenções",
        "description": "Gestão de isenções e imunidades tributárias",
    },
    {
        "name": "Tributário - Alíquotas",
        "description": "Configuração de alíquotas progressivas",
    },
    {
        "name": "Tributário - PGV/TPC",
        "description": "Planta Genérica de Valores e Tabela de Preços de Construção",
    },
    {
        "name": "Arrecadação - Parcelamentos",
        "description": "Parcelamentos e renegociação de débitos",
    },
    {
        "name": "Arrecadação",
        "description": "Dashboard de arrecadação, pagamentos, PIX, boletos, relatórios e conciliação bancária",
    },
    {
        "name": "Fiscal",
        "description": "Autos de infração, catálogo de infrações, intimações e fiscalização tributária",
    },
    {
        "name": "Parâmetros",
        "description": "Configuração centralizada de parâmetros do sistema (UFM, prazos, multas, descontos, etc.)",
    },
    {
        "name": "Relatórios",
        "description": "Relatórios de arrecadação e inadimplência",
    },
    {
        "name": "DTD - Domicílio Tributário Digital",
        "description": "Caixa postal eletrônica do contribuinte para notificações oficiais",
    },
    {
        "name": "Portal do Contribuinte",
        "description": "Portal de autoatendimento para consulta de débitos, imóveis, parcelamentos e serviços",
    },
]

# Criação da aplicação FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=description,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=tags_metadata,
    contact={
        "name": "Equipe Tributec",
        "url": "https://github.com/silvacarvalho/Tributec",
        "email": "contato@tributec.gov.br",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_url="/api/v1/openapi.json",
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1,  # Ocultar schemas por padrão
        "syntaxHighlight.theme": "monokai",
    }
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """
    Endpoint raiz - Informações da API
    """
    return {
        "aplicacao": settings.APP_NAME,
        "versao": settings.APP_VERSION,
        "status": "online",
        "documentacao": "/docs"
    }


@app.get("/health")
async def health_check():
    """
    Health check da aplicação
    """
    return {
        "status": "healthy",
        "ambiente": settings.ENVIRONMENT
    }


# Importar routers
from app.api.auth import router as auth_router
from app.api.cadastro import router as cadastro_router
from app.api.tributario import router as tributario_router
from app.api.dtd import router as dtd_router
from app.api.portal import router as portal_router
from app.api.fiscal import router as fiscal_router
from app.api.parametros import router as parametros_router
from app.api.arrecadacao import router as arrecadacao_router
from app.api.pagamentos import router as pagamentos_router

# Incluir routers na aplicação
app.include_router(auth_router, prefix="/api/v1")
app.include_router(cadastro_router, prefix="/api/v1")
app.include_router(tributario_router, prefix="/api/v1")
app.include_router(dtd_router, prefix="/api/v1")
app.include_router(portal_router, prefix="/api/v1")
app.include_router(fiscal_router, prefix="/api/v1")
app.include_router(parametros_router, prefix="/api/v1")
app.include_router(arrecadacao_router, prefix="/api/v1")
app.include_router(pagamentos_router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
