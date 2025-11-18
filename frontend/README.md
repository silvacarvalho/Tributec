# Tributec Frontend

Frontend do Sistema de Gestão Tributária Municipal desenvolvido em React + TypeScript + Material-UI.

## 🛠️ Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Material-UI (MUI) 5** - Componentes visuais
- **React Router 6** - Roteamento
- **Zustand** - Gerenciamento de estado
- **TanStack Query** - Gerenciamento de dados assíncronos
- **Axios** - Cliente HTTP
- **React Hook Form + Zod** - Formulários e validação
- **Vite** - Build tool
- **React Toastify** - Notificações
- **date-fns** - Manipulação de datas
- **Recharts** - Gráficos e dashboards

## 📦 Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
│   └── layout/      # Layout principal (Header, Sidebar)
├── pages/           # Páginas da aplicação
│   ├── auth/        # Páginas de autenticação
│   ├── cadastro/    # Páginas de cadastros
│   └── tributario/  # Páginas de tributos
├── services/        # Serviços (API calls)
│   └── api.ts       # Configuração do Axios
├── stores/          # Stores do Zustand
│   └── authStore.ts # Store de autenticação
├── hooks/           # Custom hooks
├── types/           # Tipos TypeScript
├── utils/           # Utilitários
├── theme.ts         # Tema do Material-UI
├── App.tsx          # Componente principal
└── main.tsx         # Entry point
```

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

A aplicação estará disponível em `http://localhost:3000`

## 🔑 Login de Teste

```
Email: admin@tributec.com
Senha: admin123
```

## 📱 Páginas Implementadas

### ✅ Autenticação
- **Login** - `/login`
  - Formulário de login
  - Validação de credenciais
  - Armazenamento de token JWT
  - Renovação automática de token

### ✅ Dashboard
- **Dashboard** - `/`
  - Visão geral do sistema
  - Cards com estatísticas
  - Indicadores fiscais

### ✅ Cadastros
- **Pessoas** - `/cadastro/pessoas`
  - Lista de pessoas (em desenvolvimento)

- **Imóveis** - `/cadastro/imoveis`
  - Lista de imóveis (em desenvolvimento)

### ✅ Tributário
- **Cálculo de IPTU** - `/tributario/iptu/calcular`
  - Calculadora de IPTU (em desenvolvimento)

## 🎨 Tema

O sistema utiliza Material-UI com tema personalizado:
- Cores primárias: Azul (#1976d2)
- Cores secundárias: Rosa (#dc004e)
- Modo: Claro (suporte a modo escuro futuro)
- Tipografia: System fonts com fallback

## 🔐 Autenticação

- JWT armazenado em localStorage via Zustand persist
- Interceptor Axios para adicionar token nas requisições
- Renovação automática de token expirado
- Logout automático em caso de erro de autenticação
- Proteção de rotas privadas

## 📡 API

O frontend se comunica com o backend através da API REST:
- Base URL: `/api/v1`
- Formato: JSON
- Autenticação: Bearer Token (JWT)

## 🔧 Configuração do Vite

- Proxy para API: `/api` → `http://localhost:8000`
- Alias: `@` → `./src`
- Porta: 3000

## 📝 Scripts Disponíveis

```json
{
  "dev": "vite",                    // Servidor de desenvolvimento
  "build": "tsc && vite build",    // Build de produção
  "preview": "vite preview",        // Preview do build
  "lint": "eslint . --ext ts,tsx"  // Linter
}
```

## 🎯 Próximos Passos

- [ ] Implementar listagens com paginação
- [ ] Criar formulários de cadastro (Pessoas, Imóveis)
- [ ] Implementar calculadora de IPTU funcional
- [ ] Adicionar telas de ITBI e ISSQN
- [ ] Implementar dashboard com gráficos
- [ ] Adicionar relatórios em PDF
- [ ] Implementar busca avançada
- [ ] Adicionar filtros nas listagens
- [ ] Criar módulo de certidões
- [ ] Implementar modo escuro

## 🐛 Debug

Para debug, abra as ferramentas do desenvolvedor:
- **Redux DevTools** não é necessário (Zustand tem suporte nativo)
- **React Query DevTools** pode ser adicionado se necessário

## 📦 Build

Para build de produção:

```bash
npm run build
```

Os arquivos serão gerados em `dist/` e podem ser servidos por qualquer servidor HTTP estático.

## 🤝 Integração com Backend

O frontend espera que o backend esteja rodando em `http://localhost:8000`.

Endpoints usados:
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Renovar token
- `GET /api/v1/cadastro/*` - CRUD de cadastros
- `POST /api/v1/tributario/*/calcular` - Cálculos tributários

---

**Desenvolvido com ❤️ para modernização da gestão tributária municipal**
