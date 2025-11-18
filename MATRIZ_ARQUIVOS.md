# MATRIZ DE ARQUIVOS - TRIBUTEC FRONTEND

## RESUMO EXECUTIVO

| Métrica | Valor |
|---------|-------|
| Arquivos Existentes | 9 |
| Arquivos a Criar | 51 |
| Arquivos a Completar | 3 |
| **TOTAL** | **~63** |
| Cobertura Endpoints | 20/82 (24%) |
| Estimativa de Horas | 72-94 |
| Prazo (Full-Time) | 2-3 semanas |

---

## MATRIZ DE IMPLEMENTAÇÃO

### TIPOS E INTERFACES (4 arquivos)

| # | Arquivo | Status | Descrição | Deps | Horas |
|---|---------|--------|-----------|------|-------|
| 1 | `types/index.ts` | ❌ | Centralizar exports de tipos | - | 0.5 |
| 2 | `types/auth.ts` | ❌ | Tipos de autenticação | - | 1 |
| 3 | `types/cadastro.ts` | 🟡 | Completar Estabelecimento, Logradouro | - | 2 |
| 4 | `types/tributario.ts` | 🟡 | Completar 8 tipos tributários | - | 3 |

**Subtotal: 6.5 horas**

---

### SERVICES (5 arquivos)

| # | Arquivo | Status | Descrição | Deps | Horas | Endpoints |
|---|---------|--------|-----------|------|-------|-----------|
| 5 | `services/authService.ts` | ❌ | Login, refresh, recuperar senha | 1,2 | 2 | 7 |
| 6 | `services/estabelecimentoService.ts` | ❌ | CRUD Estabelecimentos | 1,3 | 1.5 | 3 |
| 7 | `services/logradouroService.ts` | ❌ | CRUD Logradouros | 1,3 | 1 | 2 |
| 8 | `services/tributarioService.ts` | 🟡 | Completar com 45+ métodos | 1,4 | 8 | 62+ |
| 9 | `services/pessoaService.ts` | ✅ | Já existe | - | - | 7 |

**Subtotal: 12.5 horas | Endpoints: 81/82**

---

### COMPONENTES - COMUNS (5 arquivos)

| # | Arquivo | Status | Descrição | Deps | Horas | Usado Em |
|---|---------|--------|-----------|------|-------|----------|
| 10 | `components/common/DataTable.tsx` | ❌ | Tabela genérica reutilizável | 1 | 2 | 15+ páginas |
| 11 | `components/common/FormDialog.tsx` | ❌ | Dialog genérico para forms | 1 | 1.5 | 8 componentes |
| 12 | `components/common/ConfirmDialog.tsx` | ❌ | Dialog de confirmação | 1 | 1 | 12+ ações |
| 13 | `components/common/LoadingSpinner.tsx` | ❌ | Spinner centralizado | - | 0.5 | 20+ componentes |
| 14 | `components/common/ErrorAlert.tsx` | ❌ | Alerta de erro | - | 0.5 | 20+ componentes |

**Subtotal: 5.5 horas**

---

### COMPONENTES - CADASTRO (2 arquivos)

| # | Arquivo | Status | Descrição | Deps | Horas | Endpoints |
|---|---------|--------|-----------|------|-------|-----------|
| 15 | `components/cadastro/EstabelecimentoFormDialog.tsx` | ❌ | Form Estabelecimento | 1,6,11 | 2 | 1 (POST) |
| 16 | `components/cadastro/LogradouroFormDialog.tsx` | ❌ | Form Logradouro | 1,7,11 | 1.5 | 1 (POST) |

**Subtotal: 3.5 horas**

---

### COMPONENTES - TRIBUTÁRIO (10 arquivos)

| # | Arquivo | Status | Descrição | Deps | Horas | Endpoints |
|---|---------|--------|-----------|------|-------|-----------|
| 17 | `components/tributario/IPTULancamentoFormDialog.tsx` | ❌ | Form IPTU Lançamento | 1,8,11 | 2 | 1 (POST) |
| 18 | `components/tributario/IPTUParcelasTable.tsx` | ❌ | Tabela de Parcelas IPTU | 1,10 | 1 | Ver parcelas |
| 19 | `components/tributario/ITBIGuiaFormDialog.tsx` | ❌ | Form Guia ITBI | 1,8,11 | 2.5 | 1 (POST) |
| 20 | `components/tributario/ISSQNDeclaracaoFormDialog.tsx` | ❌ | Form Declaração ISSQN | 1,8,11 | 2.5 | 1 (POST) |
| 21 | `components/tributario/ISSQNRetencaoFormDialog.tsx` | ❌ | Form Retenção ISSQN | 1,8,11 | 1.5 | 1 (POST) |
| 22 | `components/tributario/IsencaoFormDialog.tsx` | ❌ | Form Isenção | 1,8,11 | 2 | 1 (POST) |
| 23 | `components/tributario/AliquotaFormDialog.tsx` | ❌ | Form Alíquota | 1,8,11 | 1.5 | 1 (POST) |
| 24 | `components/tributario/PGVFormDialog.tsx` | ❌ | Form PGV | 1,8,11 | 1.5 | 1 (POST) |
| 25 | `components/tributario/TPCFormDialog.tsx` | ❌ | Form TPC | 1,8,11 | 1.5 | 1 (POST) |
| 26 | `components/tributario/ParcelamentoFormDialog.tsx` | ❌ | Form Parcelamento | 1,8,11 | 1.5 | 1 (POST) |

**Subtotal: 17.5 horas**

---

### COMPONENTES - LAYOUT (2 arquivos)

| # | Arquivo | Status | Descrição | Deps | Horas |
|---|---------|--------|-----------|------|-------|
| 27 | `components/layout/Sidebar.tsx` | ❌ | Sidebar separado | 1 | 1.5 |
| 28 | `components/layout/Header.tsx` | ❌ | Header separado | 1 | 1.5 |

**Subtotal: 3 horas**

---

### COMPONENTES - RELATÓRIOS (1 arquivo)

| # | Arquivo | Status | Descrição | Deps | Horas |
|---|---------|--------|-----------|------|-------|
| 29 | `components/relatorios/ChartComponent.tsx` | ❌ | Componente reutilizável para gráficos | 1 | 2 |

**Subtotal: 2 horas**

---

### PÁGINAS - CADASTRO (4 arquivos)

| # | Arquivo | Status | Descrição | Deps | Horas | Endpoints |
|---|---------|--------|-----------|------|-------|-----------|
| 30 | `pages/cadastro/EstabelecimentosListPage.tsx` | ❌ | Lista + CRUD Estabelecimentos | 1,6,15,10 | 3 | 3 |
| 31 | `pages/cadastro/LogradourosListPage.tsx` | ❌ | Lista Logradouros | 1,7,16,10 | 2 | 2 |
| 32 | `pages/cadastro/TiposImovelListPage.tsx` | ❌ | Lista Tipos de Imóvel | 1,6,10 | 1.5 | 1 (GET) |
| 33 | `pages/cadastro/SetoresFiscaisListPage.tsx` | ❌ | Lista Setores Fiscais | 1,6,10 | 1.5 | 1 (GET) |

**Subtotal: 8 horas | Endpoints: 8**

---

### PÁGINAS - TRIBUTÁRIO IPTU (2 arquivos)

| # | Arquivo | Status | Descrição | Deps | Horas | Endpoints |
|---|---------|--------|-----------|------|-------|-----------|
| 34 | `pages/tributario/IPTULancamentoPage.tsx` | ❌ | Lançar IPTU individual + lote | 1,8,17,18,10 | 3 | 2 |
| 35 | `pages/tributario/IPTUListPage.tsx` | ❌ | Lista Lançamentos IPTU | 1,8,17,18,10 | 3 | 4 |

**Subtotal: 6 horas | Endpoints: 6**

---

### PÁGINAS - TRIBUTÁRIO ITBI (2 arquivos)

| # | Arquivo | Status | Descrição | Deps | Horas | Endpoints |
|---|---------|--------|-----------|------|-------|-----------|
| 36 | `pages/tributario/ITBIPage.tsx` | 🟡 | Completar: formulário, lista, ações | 1,8,19,10 | 4 | 8 |
| 37 | `pages/tributario/ITBIGuiasPage.tsx` | ❌ | Alternativa: páginas separadas | 1,8,19,10 | 2 | 8 |

**Subtotal: 6 horas | Endpoints: 8**

---

### PÁGINAS - TRIBUTÁRIO ISSQN (2 arquivos)

| # | Arquivo | Status | Descrição | Deps | Horas | Endpoints |
|---|---------|--------|-----------|------|-------|-----------|
| 38 | `pages/tributario/ISSQNPage.tsx` | 🟡 | Completar: formulário, lista, ações | 1,8,20,10 | 4 | 7 |
| 39 | `pages/tributario/ISSQNRetencoesPage.tsx` | ❌ | Lista + CRUD Retenções | 1,8,21,10 | 2 | 3 |

**Subtotal: 6 horas | Endpoints: 10**

---

### PÁGINAS - TRIBUTÁRIO OUTROS (5 arquivos)

| # | Arquivo | Status | Descrição | Deps | Horas | Endpoints |
|---|---------|--------|-----------|------|-------|-----------|
| 40 | `pages/tributario/IsencaoListPage.tsx` | ❌ | Lista + CRUD Isenções | 1,8,22,10 | 3 | 7 |
| 41 | `pages/tributario/AliquotasPage.tsx` | ❌ | Lista + CRUD Alíquotas | 1,8,23,10 | 2 | 5 |
| 42 | `pages/tributario/PGVPage.tsx` | ❌ | Lista + CRUD PGV | 1,8,24,10 | 2 | 5 |
| 43 | `pages/tributario/TPCPage.tsx` | ❌ | Lista + CRUD TPC | 1,8,25,10 | 2 | 5 |
| 44 | `pages/tributario/ParcelamentosPage.tsx` | ❌ | Lista + CRUD Parcelamentos | 1,8,26,10 | 2 | 4 |

**Subtotal: 11 horas | Endpoints: 26**

---

### PÁGINAS - RELATÓRIOS (2 arquivos)

| # | Arquivo | Status | Descrição | Deps | Horas | Endpoints |
|---|---------|--------|-----------|------|-------|-----------|
| 45 | `pages/relatorios/ArrecadacaoPage.tsx` | ❌ | Relatório de Arrecadação | 1,8,29,10 | 3 | 1 |
| 46 | `pages/relatorios/InadimplenciaPage.tsx` | ❌ | Relatório de Inadimplência | 1,8,29,10 | 3 | 1 |

**Subtotal: 6 horas | Endpoints: 2**

---

### PÁGINAS - EXISTENTES (3 arquivos)

| # | Arquivo | Status | Ação Necessária |
|---|---------|--------|------------------|
| - | `pages/Dashboard.tsx` | ✅ | Pode melhorar com dados reais |
| - | `pages/auth/LoginPage.tsx` | ✅ | OK |
| - | `pages/cadastro/PessoasListPage.tsx` | ✅ | OK |
| - | `pages/cadastro/ImoveisListPage.tsx` | ✅ | OK |
| - | `pages/tributario/CalculoIPTUPage.tsx` | 🟡 | Adicionar botão de lançamento |

---

### ROUTING (2 arquivos)

| # | Arquivo | Status | Descrição | Deps | Horas |
|---|---------|--------|-----------|------|-------|
| 47 | `App.tsx` | 🟡 | Adicionar todas as rotas | 30-46 | 2 |
| 48 | `components/layout/Layout.tsx` | 🟡 | Expandir menu com todos itens | 27,28 | 1.5 |

**Subtotal: 3.5 horas**

---

### HOOKS (3 arquivos)

| # | Arquivo | Status | Descrição | Deps | Horas |
|---|---------|--------|-----------|------|-------|
| 49 | `hooks/useApi.ts` | ❌ | Hook para chamadas de API | 5 | 1 |
| 50 | `hooks/useFetch.ts` | ❌ | Hook para fetch com paginação | 5 | 1 |
| 51 | `hooks/useForm.ts` | ❌ | Hook para formulários | - | 1 |

**Subtotal: 3 horas**

---

### UTILITIES (4 arquivos)

| # | Arquivo | Status | Descrição | Deps | Horas |
|---|---------|--------|-----------|------|-------|
| 52 | `utils/formatters.ts` | ❌ | Formatadores (moeda, data, etc) | - | 1.5 |
| 53 | `utils/validators.ts` | ❌ | Validadores (CPF, CNPJ, etc) | - | 1.5 |
| 54 | `utils/helpers.ts` | ❌ | Funções auxiliares | - | 1 |
| 55 | `utils/constants.ts` | ❌ | Constantes (tributos, status) | - | 1 |

**Subtotal: 5 horas**

---

### CONSTANTS (2 arquivos)

| # | Arquivo | Status | Descrição | Deps | Horas |
|---|---------|--------|-----------|------|-------|
| 56 | `constants/menus.ts` | ❌ | Estrutura de menu centralizada | - | 1 |
| 57 | `constants/status.ts` | ❌ | Mapeamento status/cores | - | 1 |

**Subtotal: 2 horas**

---

## RESUMO GERAL

### Por Categoria

| Categoria | Criar | Completar | Horas | Endpoints |
|-----------|-------|-----------|-------|-----------|
| Tipos | 4 | 0 | 6.5 | 0 |
| Services | 4 | 1 | 12.5 | 81 |
| Componentes | 18 | 0 | 28 | 0 |
| Páginas | 16 | 3 | 37 | 81 |
| Routing | 0 | 2 | 3.5 | 0 |
| Hooks | 3 | 0 | 3 | 0 |
| Utilities | 6 | 0 | 7 | 0 |
| **TOTAL** | **51** | **6** | **97.5** | **82** |

---

### Por Prioridade

| Prioridade | Arquivos | Horas | Dias |
|------------|----------|-------|------|
| 🔴 CRÍTICA | 8 | 19 | 1-2 |
| 🟠 ALTA | 24 | 38 | 3-4 |
| 🟡 MÉDIA | 12 | 25 | 5-7 |
| 🔵 BAIXA | 13 | 15 | 2-3 |

---

### Timeline Estimado

```
SEMANA 1:
  Seg   → Terça-Quarta → Quinta-Sexta
  6.5h  → 12.5h        → 13h (componentes + páginas básicas)
  
SEMANA 2:
  Seg-Quarta → Quinta-Sexta
  20h        → 10h (páginas + routing)
  
SEMANA 3:
  Seg-Quarta → Quinta-Sexta
  15h        → 10h (complementação + testes)

Total: ~100-110 horas = 2.5-3 semanas
```

---

## DEPENDÊNCIAS ENTRE ARQUIVOS

```
Tipos (1-4)
    ↓
Services (5-9)
    ↓
Componentes (10-29)
    ↓
Páginas (30-46)
    ↓
Routing (47-48)
    ↓
Hooks/Utils (49-57) [Paralelo]
```

---

## CHECKLIST FINAL

- [ ] Criar lista em GitHub Issues/Project para tracking
- [ ] Distribuir tarefas por desenvolvedor
- [ ] Estabelecer branch strategy (feature branches)
- [ ] Configurar pre-commit hooks para testes
- [ ] Revisar tipos com time antes de implementar
- [ ] Revisar serviços com QA antes de páginas
- [ ] Fazer PR review antes de merge
- [ ] Testar em staging antes de production

---

*Matriz gerada em 18 de novembro de 2024*
*Referência para gerenciamento de projeto*
