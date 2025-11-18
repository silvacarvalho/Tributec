# 🏛️ Sistema de Gestão Tributária e Arrecadação Municipal - Tributec

## 📋 Descrição

Plataforma full-stack para digitalização e automação de **TODOS** os processos tributários, fiscais, de arrecadação e contenciosos do município.

## 🎯 Módulos do Sistema

1. **Módulo de Cadastros** - Cadastro Imobiliário, Contribuintes Mobiliários, Cadastros Auxiliares
2. **Módulo Tributário** - IPTU, ITBI, ISSQN, Motor de Isenções
3. **Módulo de Arrecadação** - Lançamentos, DAM, Parcelamentos, Acréscimos Legais
4. **Módulo NFS-e** - Nota Fiscal Eletrônica, RPS, Escrituração Digital
5. **Módulo de Taxas** - TLLFF, Publicidade, Obras, Serviços Urbanos
6. **Módulo de Contribuições** - Contribuição de Melhoria, CCIP
7. **Módulo Fiscal** - Fiscalização, Autos de Infração, Regime Especial
8. **Módulo de Protocolo e Processos** - PAF-d, Defesas, Recursos
9. **Módulo de Dívida Ativa** - Inscrição, Cobrança, Parcelamento
10. **Módulo Administrativo** - Usuários, Parâmetros, Certidões, DTD
11. **Módulo de Relatórios e BI** - Dashboards, Indicadores Fiscais
12. **Módulo de Integrações** - Cartórios, Bancos, Receita Federal

## 🛠️ Stack Tecnológica

### Backend
- **Python 3.10+**
- **FastAPI** - Framework web moderno e de alta performance
- **SQLAlchemy 2.x** - ORM
- **PostgreSQL 14+** com **PostGIS** - Banco de dados com suporte geoespacial
- **Alembic** - Migrações de banco de dados
- **PyTest** - Testes
- **JWT + OAuth2** - Autenticação e autorização
- **Celery** - Tarefas assíncronas

### Frontend
- **React 18+**
- **TypeScript 5+**
- **Material-UI / Chakra UI**
- **Zustand** - Gerenciamento de estado
- **React Router 6**
- **Axios**
- **Recharts / Chart.js** - Gráficos e BI

### Infraestrutura
- **Docker + Docker Compose**
- **Nginx** - Reverse proxy
- **Redis** - Cache
- **MinIO / S3** - Armazenamento de anexos

## 📦 Estrutura do Projeto

```
tributec/
├── backend/
│   ├── app/
│   │   ├── models/          # Modelos SQLAlchemy
│   │   ├── schemas/         # Schemas Pydantic
│   │   ├── api/             # Endpoints da API
│   │   ├── services/        # Lógica de negócio
│   │   ├── core/            # Configurações e segurança
│   │   ├── utils/           # Utilitários
│   │   └── db/              # Configuração do banco
│   ├── tests/               # Testes
│   ├── alembic/             # Migrações
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas
│   │   ├── services/        # Serviços (API calls)
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Utilitários
│   │   └── types/           # Tipos TypeScript
│   └── package.json
├── docs/                    # Documentação
├── scripts/                 # Scripts auxiliares
└── docker-compose.yml
```

## 🚀 Como Executar

### Pré-requisitos
- Docker e Docker Compose
- Python 3.10+
- Node.js 18+

### Usando Docker Compose

```bash
# Clonar o repositório
git clone https://github.com/silvacarvalho/Tributec.git
cd Tributec

# Iniciar todos os serviços
docker-compose up -d

# Acessar a aplicação
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Documentação da API: http://localhost:8000/docs
```

### Desenvolvimento Local

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## 📚 Documentação

A documentação completa está disponível em:
- [Dicionário de Dados](docs/DICIONARIO_DADOS.md)
- [Manual de Uso](docs/MANUAL.md)
- [API Documentation](http://localhost:8000/docs) (Swagger/OpenAPI)

## 🔐 Segurança

- Autenticação via JWT
- Certificado Digital ICP-Brasil (A1/A3)
- Criptografia de dados sensíveis
- Auditoria completa de operações

## 📄 Licença

Sistema desenvolvido para uso municipal.

## 👥 Contribuidores

Desenvolvido com ❤️ para modernização da gestão tributária municipal.
