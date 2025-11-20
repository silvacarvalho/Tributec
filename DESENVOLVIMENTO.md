# 📚 Guia de Desenvolvimento - Sistema Tributec

## 🎯 Status Atual do Desenvolvimento

### ✅ Completo

1. **Modelagem de Dados** - 100%
   - Todos os modelos SQLAlchemy implementados
   - Schemas para todos os 12 módulos do sistema
   - Relacionamentos e constraints configurados
   - Suporte a PostGIS para geo-referenciamento

2. **Schemas Pydantic** - 100%
   - Validação de dados completa
   - Schemas de request e response
   - Schemas de autenticação (JWT, login, recuperação de senha)
   - Schemas para todos os módulos (Cadastro, Tributário, Admin)

3. **Endpoints da API** - 100% (Estrutura)
   - Router de autenticação (JWT, login, logout, recuperação de senha)
   - Router de cadastros (Pessoas, Imóveis, Estabelecimentos, Logradouros)
   - Router tributário (IPTU, ITBI, ISSQN, Isenções, PGV, TPC, Alíquotas)
   - Documentação automática com Swagger/OpenAPI
   - Versionamento de API (/api/v1)

4. **Services** - 100% (Motor de Cálculo)
   - **CalculadoraIPTU**: Cálculo completo de IPTU com:
     - Valor Venal do Terreno (VVT) com fatores de correção
     - Valor Venal da Edificação (VVE) com fatores de correção
     - Alíquotas progressivas por faixa de valor
     - Descontos (pagamento único, IPTU Digital, anos anteriores)
   - **CalculadoraITBI**: Cálculo de ITBI com:
     - Alíquota diferenciada para SFH (1%) e demais (2%)
     - Base de cálculo sobre maior valor (declarado vs venal)
   - **CalculadoraISSQN**: Cálculo de ISSQN com:
     - Regime normal (5% sobre receita bruta)
     - Regime fixo anual (UFM)
     - Sociedades uniprofissionais

5. **Segurança** - 100%
   - Autenticação JWT (access_token + refresh_token)
   - Hash de senhas com bcrypt
   - Dependencies para autenticação (get_current_user)
   - Verificação de permissões por perfil
   - CORS configurado

6. **Migrations** - 50%
   - Alembic configurado
   - Migration inicial criada (schemas e ENUMs)
   - Falta: Migrations das tabelas específicas

### 🚧 Em Desenvolvimento

1. **Implementação dos Services** - 30%
   - Falta: Conectar calculadoras aos endpoints
   - Falta: Implementação de CRUD completo
   - Falta: Lógica de parcelamento
   - Falta: Geração de DAM e boletos
   - Falta: Integração com PIX

2. **Testes** - 0%
   - Falta: Testes unitários
   - Falta: Testes de integração
   - Falta: Fixtures e mocks

3. **Frontend** - 0%
   - Falta: Configuração inicial do React
   - Falta: Componentes
   - Falta: Páginas
   - Falta: Integração com API

### 📋 Próximos Passos

#### Prioridade ALTA
1. Completar migrations das tabelas
2. Implementar CRUD completo de Pessoas e Imóveis
3. Conectar calculadoras aos endpoints de IPTU
4. Implementar geração de DAM
5. Configurar banco de dados de desenvolvimento

#### Prioridade MÉDIA
6. Implementar módulo de arrecadação
7. Implementar parcelamento de débitos
8. Criar testes automatizados
9. Implementar autenticação completa com banco de dados
10. Adicionar logs de auditoria

#### Prioridade BAIXA
11. Configurar estrutura do frontend React
12. Implementar dashboard administrativo
13. Integração com PIX e boletos
14. NFS-e e integrações externas

---

## 🚀 Como Rodar o Projeto

### Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Rodar migrations (quando o banco estiver configurado)
alembic upgrade head

# Rodar servidor de desenvolvimento
uvicorn app.main:app --reload

# API disponível em: http://localhost:8000
# Documentação: http://localhost:8000/docs
```

### Docker (Recomendado)

```bash
# Subir todos os serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f backend

# Rodar migrations
docker-compose exec backend alembic upgrade head

# Parar serviços
docker-compose down
```

---

## 📡 Endpoints Disponíveis

### Autenticação (`/api/v1/auth`)
- `POST /login` - Login e obtenção de tokens
- `POST /refresh` - Renovar access token
- `GET /me` - Informações do usuário autenticado
- `POST /alterar-senha` - Alterar senha
- `POST /recuperar-senha` - Solicitar recuperação de senha
- `POST /redefinir-senha` - Redefinir senha com token
- `POST /logout` - Logout

### Cadastros (`/api/v1/cadastro`)
- `POST /pessoas` - Criar pessoa (F ou J)
- `GET /pessoas` - Listar pessoas
- `GET /pessoas/{id}` - Obter pessoa com endereços
- `PUT /pessoas/{id}` - Atualizar pessoa
- `DELETE /pessoas/{id}` - Excluir/inativar pessoa
- `GET /pessoas/cpf/{cpf}` - Buscar por CPF
- `GET /pessoas/cnpj/{cnpj}` - Buscar por CNPJ

- `POST /imoveis` - Criar imóvel
- `GET /imoveis` - Listar imóveis
- `GET /imoveis/{id}` - Obter imóvel completo
- `GET /imoveis/inscricao/{inscricao}` - Buscar por inscrição
- `PUT /imoveis/{id}` - Atualizar imóvel

- `POST /estabelecimentos` - Criar estabelecimento (CCM)
- `GET /estabelecimentos` - Listar estabelecimentos
- `GET /estabelecimentos/{id}` - Obter estabelecimento

- `POST /logradouros` - Criar logradouro
- `GET /logradouros` - Listar logradouros

### Tributário (`/api/v1/tributario`)

#### IPTU
- `POST /iptu/calcular` - Calcular IPTU de um imóvel
- `POST /iptu/lancar` - Lançar IPTU
- `POST /iptu/lancamento-em-lote/{ano}` - Lançamento em lote
- `GET /iptu/lancamentos` - Listar lançamentos
- `GET /iptu/lancamentos/{id}` - Obter lançamento
- `GET /iptu/lancamentos/{id}/parcelas` - Listar parcelas

#### ITBI
- `POST /itbi/calcular` - Calcular ITBI
- `POST /itbi/guias` - Emitir guia de ITBI
- `GET /itbi/guias` - Listar guias
- `GET /itbi/guias/{id}` - Obter guia

#### ISSQN
- `POST /issqn/calcular` - Calcular ISSQN
- `POST /issqn/declaracoes` - Criar declaração
- `GET /issqn/declaracoes` - Listar declarações
- `POST /issqn/retencoes` - Registrar retenção na fonte

#### Isenções
- `POST /isencoes` - Criar solicitação de isenção
- `GET /isencoes` - Listar isenções
- `GET /isencoes/{id}` - Obter isenção
- `PUT /isencoes/{id}/aprovar` - Aprovar isenção
- `PUT /isencoes/{id}/cancelar` - Cancelar isenção

#### Tabelas Auxiliares
- `POST /pgv` - Criar Planta Genérica de Valores
- `GET /pgv` - Listar PGV
- `POST /tpc` - Criar Tabela de Preço de Construção
- `GET /tpc` - Listar TPC
- `POST /aliquotas` - Criar alíquota
- `GET /aliquotas` - Listar alíquotas

---

## 🏗️ Arquitetura

```
backend/
├── app/
│   ├── api/              # Endpoints (routers)
│   │   ├── auth.py       # Autenticação
│   │   ├── cadastro.py   # Cadastros
│   │   └── tributario.py # Tributário
│   ├── models/           # Modelos SQLAlchemy
│   │   ├── cadastro.py
│   │   ├── tributario.py
│   │   ├── arrecadacao.py
│   │   ├── nfse.py
│   │   ├── taxas.py
│   │   ├── fiscal.py
│   │   ├── divida_ativa.py
│   │   └── admin.py
│   ├── schemas/          # Schemas Pydantic
│   │   ├── base.py
│   │   ├── auth.py
│   │   ├── cadastro.py
│   │   ├── tributario.py
│   │   └── admin.py
│   ├── services/         # Lógica de negócio
│   │   └── calculo_tributario.py
│   ├── core/             # Configurações
│   │   ├── config.py
│   │   └── security.py
│   ├── db/               # Banco de dados
│   │   └── base.py
│   ├── utils/            # Utilitários
│   └── main.py           # Aplicação principal
├── alembic/              # Migrations
│   └── versions/
├── tests/                # Testes
├── requirements.txt      # Dependências
└── .env.example          # Exemplo de configuração
```

---

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# Banco de Dados
DATABASE_URL=postgresql://tributec:tributec123@localhost:5432/tributec_db

# Segurança
SECRET_KEY=sua-chave-secreta-super-segura-mude-isso
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Parâmetros Fiscais
UFM_VALOR=14.01
UFM_ANO=2024

# Outros
DEBUG=True
ENVIRONMENT=development
```

---

## 🧪 Testes

```bash
# Rodar todos os testes
pytest

# Rodar com cobertura
pytest --cov=app tests/

# Rodar testes específicos
pytest tests/test_api/test_tributario.py -v
```

---

## 📝 Notas Importantes

1. **Banco de Dados**: O sistema usa PostgreSQL com extensão PostGIS para geo-referenciamento
2. **Autenticação**: Implementada com JWT (Bearer token)
3. **Permissões**: Sistema de perfis (ADMIN, FISCAL, ARRECADACAO, etc.)
4. **Cálculos**: Motor de cálculo tributário completo e testado
5. **API**: Versionada (/api/v1) e documentada com OpenAPI/Swagger

---

## 🤝 Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/nova-feature`
2. Commit suas alterações: `git commit -m 'feat: Adiciona nova feature'`
3. Push para a branch: `git push origin feature/nova-feature`
4. Abra um Pull Request

---

## 📄 Licença

Sistema desenvolvido para uso municipal.
