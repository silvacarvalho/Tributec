# Changelog - Sistema Tributec

## [Implementações Recentes] - 2025-11-18

### ✅ Módulo de Autenticação - Backend (100% Completo)

#### Implementado:
- **Serviço de Autenticação Real** (`backend/app/services/auth_service.py`)
  - Autenticação de usuários com email e senha
  - Validação de refresh tokens
  - Bloqueio automático após 5 tentativas falhas de login
  - Alteração de senha
  - Redefinição de senha (recuperação)
  - Gerenciamento de perfis de usuário

- **Serviço de Email** (`backend/app/services/email_service.py`)
  - Envio de emails de recuperação de senha
  - Envio de confirmação de alteração de senha
  - Templates HTML profissionais
  - Geração de tokens JWT para recuperação
  - Suporte a SMTP configurável

- **Sistema de Blacklist de Tokens** (`backend/app/models/admin.py`)
  - Modelo `TokenBlacklist` para invalidação de tokens
  - Integrado com logout
  - Limpeza automática de tokens expirados

- **Endpoints de Autenticação** (`backend/app/api/auth.py`)
  - ✅ `POST /api/v1/auth/login` - Login com autenticação real
  - ✅ `POST /api/v1/auth/refresh` - Renovação de access token
  - ✅ `GET /api/v1/auth/me` - Dados do usuário autenticado
  - ✅ `POST /api/v1/auth/alterar-senha` - Alteração de senha
  - ✅ `POST /api/v1/auth/recuperar-senha` - Solicitação de recuperação
  - ✅ `POST /api/v1/auth/redefinir-senha` - Redefinição com token
  - ✅ `POST /api/v1/auth/logout` - Logout com invalidação de tokens

- **Segurança Melhorada** (`backend/app/core/security.py`)
  - Verificação de blacklist em todas as requisições
  - Validação de usuário ativo e não bloqueado
  - Retorno de dados completos do usuário com perfis
  - Hash de senhas com bcrypt

### ✅ Migrations - Database (100% Completo)

#### Criadas 4 Migrations:
1. **001_inicial** - Schemas e ENUMs do sistema
2. **002_criar_tabelas** - Tabelas do módulo Admin
   - admin.perfis
   - admin.usuarios
   - admin.usuarios_perfis (tabela associativa)
   - admin.token_blacklist
   - admin.parametros_fiscais
   - admin.auditoria_log

3. **003_cadastro** - Tabelas do módulo de Cadastro
   - cadastro.pessoas
   - cadastro.setores_fiscais
   - cadastro.logradouros
   - cadastro.enderecos
   - cadastro.loteamentos
   - cadastro.imoveis
   - cadastro.imoveis_terreno
   - cadastro.imoveis_edificacao
   - cadastro.estabelecimentos

4. **004_tributario** - Tabelas do módulo Tributário
   - tributario.planta_generica_valores
   - tributario.tabela_preco_construcao
   - tributario.aliquotas
   - tributario.iptu_lancamentos
   - tributario.iptu_parcelas
   - tributario.itbi_guias
   - tributario.issqn_declaracoes
   - tributario.issqn_retencoes
   - tributario.isencoes

#### Seed Data (`backend/scripts/seed_data.sql`):
- 5 Perfis padrão (ADMIN, FISCAL, ARRECADACAO, ATENDIMENTO, CONSULTA)
- Usuário administrador padrão:
  - Email: admin@tributec.com
  - Senha: admin123 (hash bcrypt)
  - Perfis: ADMIN, FISCAL, ARRECADACAO
- Parâmetros fiscais padrão (UFM, descontos, alíquotas)
- Alíquotas de IPTU, ITBI e ISSQN para 2024 e 2025

### ✅ Frontend - Melhorias (70% Completo)

#### Implementado:
- **Serviço de API Aprimorado** (`frontend/src/services/api.ts`)
  - Interceptor de requisições com token JWT
  - Renovação automática de tokens expirados
  - Tratamento de erros por código HTTP (400, 403, 404, 422, 500)
  - Timeout configurável (30 segundos)
  - Helper `getErrorMessage()` para extrair mensagens de erro
  - Suporte a variáveis de ambiente (VITE_API_URL)

- **AuthStore Melhorado** (`frontend/src/stores/authStore.ts`)
  - Método `updateRefreshToken()` adicionado
  - Persistência com Zustand
  - Gerenciamento completo de autenticação

- **Login com API Real** (`frontend/src/pages/auth/LoginPage.tsx`)
  - Integração completa com backend
  - Busca dados reais do usuário após login
  - Tratamento de erros melhorado
  - Feedback visual (loading, erros, sucesso)

- **Variáveis de Ambiente** (frontend/.env.example`)
  - VITE_API_URL configurável
  - Documentação de variáveis

## 📊 Status Geral do Sistema

### Backend
| Módulo | Status | Completude |
|--------|--------|-----------|
| **Autenticação** | ✅ Completo | 100% |
| **Modelos de Dados** | ✅ Completo | 100% |
| **Schemas Pydantic** | ✅ Completo | 100% |
| **Migrations** | ✅ Completo | 100% |
| **Serviços** | 🟡 Parcial | 40% |
| **Endpoints API** | 🟡 Parcial | 45% |
| **Testes** | 🔴 Pendente | 0% |

### Frontend
| Módulo | Status | Completude |
|--------|--------|-----------|
| **Autenticação** | ✅ Completo | 95% |
| **Serviços API** | ✅ Completo | 90% |
| **Componentes Base** | 🟡 Parcial | 40% |
| **Páginas** | 🟡 Parcial | 35% |
| **Formulários** | 🟡 Parcial | 30% |
| **Paginação/Filtros** | 🔴 Pendente | 0% |

### DevOps/Infraestrutura
| Item | Status | Completude |
|------|--------|-----------|
| **Docker Compose** | ✅ Completo | 100% |
| **Migrations** | ✅ Completo | 100% |
| **Seed Data** | ✅ Completo | 100% |
| **SSL/HTTPS** | 🔴 Pendente | 0% |
| **CI/CD** | 🔴 Pendente | 0% |

## 🎯 Próximos Passos

### Prioridade ALTA
1. ✅ ~~Implementar autenticação real~~ (COMPLETO)
2. ✅ ~~Criar migrations completas~~ (COMPLETO)
3. ⏳ Implementar CRUD completo de Pessoas e Imóveis
4. ⏳ Implementar paginação no frontend
5. ⏳ Criar telas de ITBI e ISSQN
6. ⏳ Implementar lançamento de IPTU

### Prioridade MÉDIA
7. Criar testes unitários e de integração
8. Implementar sistema de certidões
9. Adicionar logs de auditoria
10. Configurar SSL/HTTPS

### Prioridade BAIXA
11. Implementar módulos avançados (NFS-e, Fiscal, Dívida Ativa)
12. Criar dashboards de BI
13. Integração com bancos (PIX, boletos)

## 🔧 Como Rodar o Sistema

### Backend

```bash
cd backend

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Instalar dependências
pip install -r requirements.txt

# Rodar migrations
alembic upgrade head

# Popular dados iniciais
psql -d tributec_db -f scripts/seed_data.sql

# Rodar servidor
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env se necessário

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

### Docker (Recomendado)

```bash
# Subir todos os serviços
docker-compose up -d

# Rodar migrations
docker-compose exec backend alembic upgrade head

# Popular dados
docker-compose exec backend psql -U tributec -d tributec_db -f /app/scripts/seed_data.sql

# Acessar:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Docs API: http://localhost:8000/docs
```

## 📧 Credenciais Padrão

**⚠️ IMPORTANTE: Altere as credenciais após o primeiro acesso!**

- **Email**: admin@tributec.com
- **Senha**: admin123
- **Perfis**: ADMIN, FISCAL, ARRECADACAO

## 📝 Notas de Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ JWT com access token (30 min) e refresh token (7 dias)
- ✅ Blacklist de tokens para logout
- ✅ Bloqueio automático após 5 tentativas falhas
- ✅ Validação de usuário ativo/bloqueado em toda requisição
- ⚠️ SMTP não configurado (emails apenas logados no console)
- ⚠️ SSL/HTTPS pendente de configuração

## 🐛 Problemas Conhecidos

Nenhum problema crítico identificado no momento.

## 📄 Licença

Sistema desenvolvido para uso municipal.
