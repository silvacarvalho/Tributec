# RESUMO RÁPIDO - IMPLEMENTAÇÃO FRONTEND TRIBUTEC

## ESTATÍSTICAS ATUAIS

- **Cobertura**: 30% (20/82 endpoints)
- **Arquivos**: 9 criados, ~51 faltando
- **Estimativa**: 72-94 horas (2-3 semanas full-time)
- **Status**: Básicos de Pessoas, Imóveis, IPTU, ITBI e ISSQN implementados

---

## ARQUIVOS JÁ IMPLEMENTADOS

```
✓ App.tsx
✓ main.tsx
✓ theme.ts
✓ components/layout/Layout.tsx
✓ components/cadastro/PessoaFormDialog.tsx
✓ components/cadastro/ImovelFormDialog.tsx
✓ components/common/Pagination.tsx
✓ pages/auth/LoginPage.tsx
✓ pages/cadastro/PessoasListPage.tsx
✓ pages/cadastro/ImoveisListPage.tsx
✓ pages/tributario/CalculoIPTUPage.tsx
✓ pages/tributario/ITBIPage.tsx (incompleto)
✓ pages/tributario/ISSQNPage.tsx (incompleto)
✓ pages/Dashboard.tsx
✓ services/api.ts
✓ services/pessoaService.ts
✓ services/imovelService.ts
✓ services/tributarioService.ts (básico)
✓ stores/authStore.ts
✓ types/cadastro.ts (básico)
✓ types/tributario.ts (básico)
```

---

## 🔴 PRIORIDADE 1: CRÍTICA (1-2 dias)

### Tipos & Interfaces
```
tipos/cadastro.ts          - Adicionar: Estabelecimento, Logradouro
tipos/tributario.ts        - Adicionar: IPTU Lançamento, ITBI Guia, ISSQN, Isenção, PGV, TPC, Parcelamento
tipos/auth.ts              - CRIAR
tipos/index.ts             - CRIAR
```

### Services
```
services/authService.ts             - CRIAR (7 métodos)
services/estabelecimentoService.ts  - CRIAR (5 métodos)
services/logradouroService.ts       - CRIAR (4 métodos)
services/tributarioService.ts       - COMPLETAR (+45 métodos)
```

**Estimativa**: 12-16 horas

---

## 🟠 PRIORIDADE 2: ALTA (3-4 dias)

### Componentes Reutilizáveis
```
components/common/DataTable.tsx
components/common/FormDialog.tsx
components/common/ConfirmDialog.tsx
components/common/LoadingSpinner.tsx
components/common/ErrorAlert.tsx
```

### Componentes Específicos
```
components/cadastro/EstabelecimentoFormDialog.tsx
components/cadastro/LogradouroFormDialog.tsx
components/tributario/IPTULancamentoFormDialog.tsx
components/tributario/ITBIGuiaFormDialog.tsx
components/tributario/ISSQNDeclaracaoFormDialog.tsx
components/tributario/IsencaoFormDialog.tsx
components/tributario/AliquotaFormDialog.tsx
```

### Páginas de Cadastro
```
pages/cadastro/EstabelecimentosListPage.tsx
pages/cadastro/LogradourosListPage.tsx
pages/cadastro/TiposImovelListPage.tsx
pages/cadastro/SetoresFiscaisListPage.tsx
```

### Páginas Tributárias (Críticas)
```
pages/tributario/ITBIPage.tsx       - COMPLETAR (adicionar: formulário, lista, pagamento, cancelamento, arbitramento)
pages/tributario/ISSQNPage.tsx      - COMPLETAR (adicionar: formulário, lista, pagamento, retificação)
pages/tributario/CalculoIPTUPage.tsx - COMPLETAR (adicionar: botão de lançamento)
```

**Estimativa**: 16-20 horas

---

## 🟡 PRIORIDADE 3: MÉDIA (5-7 dias)

### Páginas Tributárias
```
pages/tributario/IPTULancamentoPage.tsx
pages/tributario/IPTUListPage.tsx
pages/tributario/ITBIGuiasPage.tsx
pages/tributario/ISSQNDeclaracoesPage.tsx
pages/tributario/ISSQNRetencoesPage.tsx
pages/tributario/IsencaoListPage.tsx
pages/tributario/AliquotasPage.tsx
pages/tributario/PGVPage.tsx
pages/tributario/TPCPage.tsx
pages/tributario/ParcelamentosPage.tsx
```

### Navegação
```
App.tsx          - ATUALIZAR (adicionar todas as rotas)
Layout.tsx       - ATUALIZAR (expandir menu)
layout/Sidebar.tsx  - CRIAR
layout/Header.tsx   - CRIAR
```

**Estimativa**: 12-16 horas

---

## 🔵 PRIORIDADE 4: BAIXA (2-3 dias - OPCIONAL)

### Relatórios
```
pages/relatorios/ArrecadacaoPage.tsx
pages/relatorios/InadimplenciaPage.tsx
components/relatorios/ChartComponent.tsx
```

### Utilities
```
hooks/useApi.ts
hooks/useFetch.ts
hooks/useForm.ts
utils/formatters.ts
utils/validators.ts
utils/helpers.ts
utils/constants.ts
constants/menus.ts
constants/status.ts
```

**Estimativa**: 8-10 horas

---

## ENDPOINTS POR STATUS

### Implementados (20) ✓
- Auth: 7/7
- Pessoas: 7/7
- Imóveis: 5/5
- IPTU Cálculo: 1/8

### Faltando (62) ✗
- Estabelecimentos: 0/3
- Logradouros: 0/2
- IPTU Lançamento: 0/7
- ITBI: 0/8
- ISSQN: 0/10
- Isenções: 0/7
- Alíquotas: 0/5
- PGV: 0/5
- TPC: 0/5
- Parcelamentos: 0/4
- Relatórios: 0/2

---

## ESTRUTURA DE DIRETÓRIOS A CRIAR

```
frontend/src/
├── hooks/                    (3 arquivos)
│   ├── useApi.ts
│   ├── useFetch.ts
│   └── useForm.ts
├── utils/                    (4 arquivos)
│   ├── formatters.ts
│   ├── validators.ts
│   ├── helpers.ts
│   └── constants.ts
├── constants/                (2 arquivos)
│   ├── menus.ts
│   └── status.ts
├── components/
│   ├── common/               (5 novos)
│   ├── cadastro/             (2 novos)
│   ├── tributario/           (10 novos)
│   ├── relatorios/           (1 novo)
│   └── layout/               (2 novos)
├── pages/
│   ├── cadastro/             (4 novos)
│   ├── tributario/           (10 novos)
│   ├── relatorios/           (2 novos)
│   └── auth/                 (JÁ EXISTE)
├── services/
│   ├── authService.ts        (NOVO)
│   ├── estabelecimentoService.ts (NOVO)
│   ├── logradouroService.ts  (NOVO)
│   ├── tributarioService.ts  (COMPLETAR)
│   └── ...                   (JÁ EXISTEM)
└── types/
    ├── auth.ts               (NOVO)
    ├── index.ts              (NOVO)
    ├── cadastro.ts           (COMPLETAR)
    └── tributario.ts         (COMPLETAR)
```

---

## FLUXO DE IMPLEMENTAÇÃO RECOMENDADO

### DIA 1: Tipos & Interfaces
1. Completar `types/cadastro.ts`
2. Completar `types/tributario.ts`
3. Criar `types/auth.ts`
4. Criar `types/index.ts`

### DIAS 2-3: Services
1. Criar `authService.ts`
2. Criar `estabelecimentoService.ts`
3. Criar `logradouroService.ts`
4. Completar `tributarioService.ts`

### DIAS 4-5: Componentes
1. Criar componentes comuns (5)
2. Criar componentes de formulário (7)
3. Criar componentes específicos (3)

### DIAS 6-8: Páginas
1. Páginas de cadastro (4)
2. Completar páginas tributárias (3)
3. Criar páginas IPTU/ITBI/ISSQN/Isenção/Alíquota (5)

### DIAS 9-10: Layout & Navegação
1. Atualizar App.tsx
2. Atualizar Layout.tsx
3. Criar Sidebar.tsx
4. Criar Header.tsx

### DIAS 11-15: Complementar
1. Páginas complementares (PGV, TPC, Parcelamentos, Relatórios)
2. Hooks e utilities
3. Testes e correções

---

## CHECKLIST DE CODIFICAÇÃO

Antes de criar qualquer página:
- [ ] Tipo/Interface criado em `types/`
- [ ] Service criado em `services/`
- [ ] Component Form criado em `components/`
- [ ] Página List criada em `pages/`
- [ ] Rota adicionada em `App.tsx`
- [ ] Menu item adicionado em `Layout.tsx`

---

## PADRÕES DO PROJETO

### Naming
- Arquivos: PascalCase (.tsx) ou camelCase (.ts)
- Funções/Variáveis: camelCase
- Types/Interfaces: PascalCase
- CSS Classes: não usar (usar sx em MUI)

### Imports
```typescript
// Sempre usar absolute paths
import { Button } from '@mui/material'
import { pessoaService } from '@/services/pessoaService'
import type { Pessoa } from '@/types/cadastro'
```

### Componentes Página
```typescript
export function EntityListPage() {
  // 1. State
  // 2. Queries (useQuery)
  // 3. Mutations (useMutation)
  // 4. Handlers
  // 5. JSX
}
```

### Componentes Formulário
```typescript
interface EntityFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: EntityCreate) => Promise<void>
  entity?: Entity
  isLoading?: boolean
}
```

### Services
```typescript
export const nomeService = {
  async listar(params?: Params): Promise<Response> { }
  async obter(id: string): Promise<Entity> { }
  async criar(data: Create): Promise<Entity> { }
  async atualizar(id: string, data: Update): Promise<Entity> { }
  async excluir(id: string): Promise<void> { }
  async buscarPor*(valor): Promise<Entity | null> { }
}
```

---

## ENDPOINTS CRÍTICOS

### Primeira Onda (11 endpoints)
```
POST   /cadastro/estabelecimentos
GET    /cadastro/estabelecimentos
GET    /cadastro/estabelecimentos/{id}
POST   /cadastro/logradouros
GET    /cadastro/logradouros
POST   /tributario/iptu/lancar
POST   /tributario/iptu/lançamento-em-lote/{ano}
GET    /tributario/iptu/lancamentos
GET    /tributario/iptu/lancamentos/{id}
GET    /tributario/iptu/lancamentos/{id}/parcelas
PUT    /tributario/iptu/lancamentos/{id}/cancelar
```

### Segunda Onda (16 endpoints)
```
POST   /tributario/itbi/guias
GET    /tributario/itbi/guias
GET    /tributario/itbi/guias/{id}
PUT    /tributario/itbi/guias/{id}/registrar-pagamento
PUT    /tributario/itbi/guias/{id}/cancelar
PUT    /tributario/itbi/guias/{id}/arbitrar
GET    /tributario/itbi/guias/{id}/pdf
POST   /tributario/issqn/declaracoes
GET    /tributario/issqn/declaracoes
PUT    /tributario/issqn/declaracoes/{id}/registrar-pagamento
PUT    /tributario/issqn/declaracoes/{id}/retificar
PUT    /tributario/issqn/declaracoes/{id}/cancelar
GET    /tributario/issqn/declaracoes/{id}/pdf
POST   /tributario/issqn/retencoes
GET    /tributario/issqn/retencoes
PUT    /tributario/issqn/retencoes/{id}/recolher
```

### Terceira Onda (Restante)
```
Isenções (7), Alíquotas (5), PGV (5), TPC (5), Parcelamentos (4), Relatórios (2)
```

---

## TESTES RÁPIDOS

Depois de implementar um serviço:
```typescript
// Testar no console
const pessoas = await pessoaService.listar()
console.log(pessoas)
```

Depois de implementar uma página:
- [ ] Listar funciona
- [ ] Criar abre dialog
- [ ] Editar preenche form
- [ ] Deletar pede confirmação
- [ ] Filtros funcionam
- [ ] Paginação funciona

---

## CHECKLIST DE DEPLOY

Antes de fazer merge/deploy:
- [ ] npm run build funciona
- [ ] Sem erros TypeScript (tsc --noEmit)
- [ ] Sem warnings no console
- [ ] Todas as rotas adicionadas
- [ ] Todos os endpoints com UI
- [ ] Responsive em mobile (teste com F12)
- [ ] Testes de integração passando

---

## LINKS ÚTEIS

- Material-UI Docs: https://mui.com/material-ui/getting-started/
- React Query Docs: https://tanstack.com/query/latest
- React Hook Form Docs: https://react-hook-form.com/
- TypeScript Handbook: https://www.typescriptlang.org/docs/

---

## CONTATO/SUPORTE

Dúvidas frequentes:
1. Como conectar novo endpoint? → Criar service.ts + type.ts + Page.tsx
2. Como reutilizar componente? → Usar DataTable.tsx ou FormDialog.tsx
3. Como validar input? → React Hook Form + validators.ts
4. Como tratar erro? → getErrorMessage() + toast.error()

---

*Atualizado: 18 de novembro de 2024*
*Referência rápida para desenvolvimento do Tributec Frontend*
