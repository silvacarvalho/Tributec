# PLANO DE IMPLEMENTAÇÃO DO FRONTEND TRIBUTEC

## RESUMO EXECUTIVO

**Status Atual**: Frontend está ~30% implementado (básicos de Pessoas, Imóveis, IPTU, ITBI e ISSQN)

**Objetivo**: Criar um frontend 100% funcional que integre com todos os 80+ endpoints do backend

**Arquitetura Frontend**:
- React 18 + TypeScript
- Material-UI (MUI) para componentes
- React Router para navegação
- TanStack React Query para gerenciamento de estado e cache
- Axios para requisições HTTP
- React Hook Form para formulários
- Zustand para auth store

---

## ANÁLISE ESTRUTURAL ATUAL

### Diretórios Existentes
```
frontend/src/
├── components/
│   ├── cadastro/
│   │   ├── PessoaFormDialog.tsx ✓
│   │   └── ImovelFormDialog.tsx ✓
│   ├── common/
│   │   └── Pagination.tsx ✓
│   └── layout/
│       └── Layout.tsx ✓
├── pages/
│   ├── auth/
│   │   └── LoginPage.tsx ✓
│   ├── cadastro/
│   │   ├── PessoasListPage.tsx ✓
│   │   └── ImoveisListPage.tsx ✓
│   ├── tributario/
│   │   ├── CalculoIPTUPage.tsx ✓
│   │   ├── ITBIPage.tsx ✓
│   │   └── ISSQNPage.tsx ✓
│   └── Dashboard.tsx ✓
├── services/
│   ├── api.ts ✓
│   ├── pessoaService.ts ✓
│   ├── imovelService.ts ✓
│   └── tributarioService.ts ✓
├── stores/
│   └── authStore.ts ✓
├── types/
│   ├── cadastro.ts ✓
│   └── tributario.ts ✓
├── App.tsx ✓
├── main.tsx ✓
└── theme.ts ✓
```

### Endpoints Implementados no Backend (82 total)

**Auth (7)**: 
- POST /login ✓
- POST /refresh ✓
- GET /me ✓
- POST /alterar-senha ✓
- POST /recuperar-senha ✓
- POST /redefinir-senha ✓
- POST /logout ✓

**Cadastro - Pessoas (7)**:
- POST /pessoas ✓
- GET /pessoas ✓
- GET /pessoas/{id} ✓
- PUT /pessoas/{id} ✓
- DELETE /pessoas/{id} ✓
- GET /pessoas/cpf/{cpf} ✓
- GET /pessoas/cnpj/{cnpj} ✓

**Cadastro - Imóveis (5)**:
- POST /imoveis ✓
- GET /imoveis ✓
- GET /imoveis/{id} ✓
- GET /imoveis/inscricao/{inscricao} ✓
- PUT /imoveis/{id} ✓

**Cadastro - Estabelecimentos (3)**:
- POST /estabelecimentos
- GET /estabelecimentos
- GET /estabelecimentos/{id}

**Cadastro - Logradouros (2)**:
- POST /logradouros
- GET /logradouros

**IPTU (8)**:
- POST /iptu/calcular ✓
- POST /iptu/lancar
- POST /iptu/lançamento-em-lote/{ano}
- GET /iptu/lancamentos
- GET /iptu/lancamentos/{id}
- GET /iptu/lancamentos/{id}/parcelas
- PUT /iptu/lancamentos/{id}/corrigir
- PUT /iptu/lancamentos/{id}/cancelar

**ITBI (8)**:
- POST /itbi/calcular ✓
- POST /itbi/guias / POST /itbi/emitir-guia
- GET /itbi/guias ✓
- GET /itbi/guias/{id} ✓
- PUT /itbi/guias/{id}/registrar-pagamento
- PUT /itbi/guias/{id}/cancelar
- PUT /itbi/guias/{id}/arbitrar
- GET /itbi/guias/{id}/pdf

**ISSQN (10)**:
- POST /issqn/calcular ✓
- POST /issqn/declaracoes / POST /issqn/declarar
- GET /issqn/declaracoes ✓
- PUT /issqn/declaracoes/{id}/registrar-pagamento
- PUT /issqn/declaracoes/{id}/retificar
- PUT /issqn/declaracoes/{id}/cancelar
- GET /issqn/declaracoes/{id}/pdf
- POST /issqn/retencoes
- GET /issqn/retencoes
- PUT /issqn/retencoes/{id}/recolher

**Isenções (7)**:
- POST /isencoes
- GET /isencoes
- GET /isencoes/{id}
- PUT /isencoes/{id}/aprovar
- PUT /isencoes/{id}/cancelar
- PUT /isencoes/{id}
- DELETE /isencoes/{id}

**Alíquotas (5)**:
- POST /aliquotas
- GET /aliquotas
- GET /aliquotas/{id}
- PUT /aliquotas/{id}
- DELETE /aliquotas/{id}

**PGV - Planta Genérica de Valores (5)**:
- POST /pgv
- GET /pgv
- GET /pgv/{id}
- PUT /pgv/{id}
- DELETE /pgv/{id}

**TPC - Tabela Preço Construção (5)**:
- POST /tpc
- GET /tpc
- GET /tpc/{id}
- PUT /tpc/{id}
- DELETE /tpc/{id}

**Parcelamentos (4)**:
- POST /parcelamentos
- GET /parcelamentos
- PUT /parcelamentos/{id}/parcela/{num}/pagar
- PUT /parcelamentos/{id}/cancelar

**Relatórios (2)**:
- GET /relatorios/arrecadacao
- GET /relatorios/inadimplencia

---

## PLANO DE IMPLEMENTAÇÃO

### FASE 1: TIPOS & INTERFACES (BASE)
**Prioridade**: CRÍTICA
**Dependência**: Nenhuma
**Estimativa**: 4-6 horas

#### Arquivos a Criar/Completar:

**1. `/frontend/src/types/index.ts` (CRIAR)**
- Exportar todos os tipos centralizadamente
- Facilitar imports

**2. `/frontend/src/types/cadastro.ts` (COMPLETAR)**
Status: Básico implementado
Faltam:
```typescript
// Estabelecimento
export interface Estabelecimento { }
export interface EstabelecimentoCreate { }
export interface EstabelecimentoUpdate { }

// Logradouro
export interface Logradouro { }
export interface LogradouroCreate { }

// Tipo Imovel (já existe básico)
// Setor Fiscal (já existe básico)
```

**3. `/frontend/src/types/tributario.ts` (COMPLETAR)**
Status: Básico implementado
Faltam:
```typescript
// IPTU Lançamento
export interface IPTULancamento { }
export interface IPTULancamentoCreate { }
export interface IPTULancamentoResponse { }
export interface IPTUParcela { }

// ITBI Guia
export interface ITBIGuia { }
export interface ITBIGuiaCreate { }
export interface ITBIGuiaResponse { }

// ISSQN Declaração
export interface ISSQNDeclaracao { }
export interface ISSQNDeclaracaoCreate { }
export interface ISSQNDeclaracaoResponse { }

// ISSQN Retenção
export interface ISSQNRetencao { }
export interface ISSQNRetencaoCreate { }
export interface ISSQNRetencaoResponse { }

// Isenção
export interface Isencao { }
export interface IsencaoCreate { }
export interface IsencaoUpdate { }
export interface IsencaoResponse { }

// Alíquota (já existe básico)
export interface AliquotaCreate { }
export interface AliquotaUpdate { }

// PGV
export interface PGV { }
export interface PGVCreate { }
export interface PGVUpdate { }

// TPC
export interface TPC { }
export interface TPCCreate { }
export interface TPCUpdate { }

// Parcelamento
export interface Parcelamento { }
export interface ParcelamentoCreate { }
export interface ParcelamentoUpdate { }

// Relatório
export interface RelatorioArrecadacao { }
export interface RelatorioInadimplencia { }
```

**4. `/frontend/src/types/auth.ts` (CRIAR)**
```typescript
export interface Usuario { }
export interface LoginRequest { }
export interface TokenResponse { }
export interface AlterarSenhaRequest { }
export interface RecuperarSenhaRequest { }
export interface RedefinirSenhaRequest { }
```

---

### FASE 2: SERVICES (INTEGRAÇÃO COM API)
**Prioridade**: CRÍTICA
**Dependência**: FASE 1
**Estimativa**: 8-10 horas

#### Arquivos a Criar/Completar:

**1. `/frontend/src/services/authService.ts` (CRIAR)**
```typescript
export const authService = {
  async login(email: string, senha: string): Promise<TokenResponse>
  async refresh(refreshToken: string): Promise<TokenResponse>
  async getMe(): Promise<Usuario>
  async alterarSenha(senhaAtual: string, senhaNova: string): Promise<void>
  async recuperarSenha(email: string): Promise<void>
  async redefinirSenha(token: string, senhaNova: string): Promise<void>
  async logout(): Promise<void>
}
```

**2. `/frontend/src/services/estabelecimentoService.ts` (CRIAR)**
```typescript
export const estabelecimentoService = {
  async listar(params?: ListEstabelecimentosParams): Promise<ListEstabelecimentosResponse>
  async obter(id: string): Promise<Estabelecimento>
  async criar(data: EstabelecimentoCreate): Promise<Estabelecimento>
  async atualizar(id: string, data: EstabelecimentoUpdate): Promise<Estabelecimento>
  async excluir(id: string): Promise<void>
  async buscarPorCCM(ccm: string): Promise<Estabelecimento | null>
}
```

**3. `/frontend/src/services/logradouroService.ts` (CRIAR)**
```typescript
export const logradouroService = {
  async listar(params?: ListLogradourosParams): Promise<ListLogradourosResponse>
  async obter(id: string): Promise<Logradouro>
  async criar(data: LogradouroCreate): Promise<Logradouro>
  async buscarPorNome(nome: string): Promise<Logradouro[]>
}
```

**4. `/frontend/src/services/tributarioService.ts` (COMPLETAR)**
Status: Básico implementado
Faltam:

```typescript
// IPTU - Adicionar
async lancarIPTU(data: IPTULancamentoCreate): Promise<IPTULancamentoResponse>
async lancarIPTUEmLote(anoExercicio: number, setorFiscalId?: string): Promise<ResponsePaginada>
async listarLancamentosIPTU(params: ListLancamentosParams): Promise<ListLancamentosResponse>
async obterLancamentoIPTU(id: string): Promise<IPTULancamentoResponse>
async listarParcelasIPTU(lancamentoId: string): Promise<IPTUParcela[]>
async corrigirLancamentoIPTU(id: string, dados): Promise<IPTULancamentoResponse>
async cancelarLancamentoIPTU(id: string, motivo: string): Promise<IPTULancamentoResponse>

// ITBI - Completar
async emitirGuiaITBI(data: ITBIGuiaCreate): Promise<ITBIGuiaResponse>
async listarGuiasITBI(params): Promise<ListGuiasResponse>
async obterGuiaITBI(id: string): Promise<ITBIGuiaResponse>
async registrarPagamentoITBI(id: string, dados): Promise<ITBIGuiaResponse>
async cancelarGuiaITBI(id: string, motivo: string): Promise<ITBIGuiaResponse>
async arbitrarGuiaITBI(id: string, dados): Promise<ITBIGuiaResponse>
async gerarPdfITBI(id: string): Promise<Blob>

// ISSQN - Completar e adicionar
async declararISSQN(data: ISSQNDeclaracaoCreate): Promise<ISSQNDeclaracaoResponse>
async listarDeclaracoesISSQN(params): Promise<ListDeclaracoesResponse>
async registrarPagamentoISSQN(id: string, dados): Promise<ISSQNDeclaracaoResponse>
async retificarDeclaracaoISSQN(id: string, dados): Promise<ISSQNDeclaracaoResponse>
async cancelarDeclaracaoISSQN(id: string, motivo: string): Promise<ISSQNDeclaracaoResponse>
async gerarPdfDeclaracaoISSQN(id: string): Promise<Blob>
async criarRetencaoISSQN(data: ISSQNRetencaoCreate): Promise<ISSQNRetencaoResponse>
async listarRetencoesISSQN(params): Promise<ListRetencoesResponse>
async recolherRetencaoISSQN(id: string, dados): Promise<ISSQNRetencaoResponse>

// Isenções
async criarIsencao(data: IsencaoCreate): Promise<IsencaoResponse>
async listarIsencoes(params): Promise<ListIsencoes>
async obterIsencao(id: string): Promise<IsencaoResponse>
async aprovarIsencao(id: string): Promise<IsencaoResponse>
async cancelarIsencao(id: string, motivo: string): Promise<IsencaoResponse>
async atualizarIsencao(id: string, data: IsencaoUpdate): Promise<IsencaoResponse>
async deletarIsencao(id: string): Promise<void>

// Alíquotas
async listarAliquotas(tributo?: string, ano?: number): Promise<Aliquota[]>
async criarAliquota(data: AliquotaCreate): Promise<AliquotaResponse>
async obterAliquota(id: string): Promise<AliquotaResponse>
async atualizarAliquota(id: string, data: AliquotaUpdate): Promise<AliquotaResponse>
async deletarAliquota(id: string): Promise<void>

// PGV
async listarPGV(params): Promise<ListPGVResponse>
async criarPGV(data: PGVCreate): Promise<PGVResponse>
async obterPGV(id: string): Promise<PGVResponse>
async atualizarPGV(id: string, data: PGVUpdate): Promise<PGVResponse>
async deletarPGV(id: string): Promise<void>

// TPC
async listarTPC(params): Promise<ListTPCResponse>
async criarTPC(data: TPCCreate): Promise<TPCResponse>
async obterTPC(id: string): Promise<TPCResponse>
async atualizarTPC(id: string, data: TPCUpdate): Promise<TPCResponse>
async deletarTPC(id: string): Promise<void>

// Parcelamentos
async criarParcelamento(data: ParcelamentoCreate): Promise<ParcelamentoResponse>
async listarParcelamentos(params): Promise<ListParcelamentosResponse>
async pagarParcelaParcelamento(id: string, numero: number, dados): Promise<ParcelamentoResponse>
async cancelarParcelamento(id: string, motivo: string): Promise<ParcelamentoResponse>

// Relatórios
async obterRelatorioArrecadacao(params): Promise<RelatorioArrecadacao>
async obterRelatorioInadimplencia(params): Promise<RelatorioInadimplencia>
```

---

### FASE 3: COMPONENTES REUTILIZÁVEIS
**Prioridade**: ALTA
**Dependência**: FASE 1, FASE 2
**Estimativa**: 6-8 horas

#### Arquivos a Criar:

**1. `/frontend/src/components/common/DataTable.tsx` (CRIAR)**
- Tabela genérica com sort, filtro, paginação
- Substituir múltiplas implementações

**2. `/frontend/src/components/common/FormDialog.tsx` (CRIAR)**
- Dialog genérico para formulários (create/edit)
- Reduzir duplicação em PessoaFormDialog, ImovelFormDialog, etc.

**3. `/frontend/src/components/common/ConfirmDialog.tsx` (CRIAR)**
- Dialog de confirmação para ações destrutivas

**4. `/frontend/src/components/common/LoadingSpinner.tsx` (CRIAR)**
- Componente de loading unificado

**5. `/frontend/src/components/common/ErrorAlert.tsx` (CRIAR)**
- Componente de alerta de erro unificado

**6. `/frontend/src/components/common/SuccessAlert.tsx` (CRIAR)**
- Componente de sucesso unificado

**7. `/frontend/src/components/cadastro/EstabelecimentoFormDialog.tsx` (CRIAR)**
- Formulário para criar/editar estabelecimentos

**8. `/frontend/src/components/cadastro/LogradouroFormDialog.tsx` (CRIAR)**
- Formulário para criar logradouros

**9. `/frontend/src/components/tributario/IPTULancamentoFormDialog.tsx` (CRIAR)**
- Formulário para lançamentos de IPTU

**10. `/frontend/src/components/tributario/IPTUParcelasTable.tsx` (CRIAR)**
- Exibir parcelas de IPTU

**11. `/frontend/src/components/tributario/ITBIGuiaFormDialog.tsx` (CRIAR)**
- Formulário para emitir guia ITBI

**12. `/frontend/src/components/tributario/ISSQNDeclaracaoFormDialog.tsx` (CRIAR)**
- Formulário para declarar ISSQN

**13. `/frontend/src/components/tributario/IsencaoFormDialog.tsx` (CRIAR)**
- Formulário para criar/editar isenções

**14. `/frontend/src/components/tributario/AliquotaFormDialog.tsx` (CRIAR)**
- Formulário para criar/editar alíquotas

**15. `/frontend/src/components/tributario/PGVFormDialog.tsx` (CRIAR)**
- Formulário para criar/editar PGV

**16. `/frontend/src/components/tributario/TPCFormDialog.tsx` (CRIAR)**
- Formulário para criar/editar TPC

**17. `/frontend/src/components/tributario/ParcelamentoFormDialog.tsx` (CRIAR)**
- Formulário para criar parcelamentos

---

### FASE 4: PÁGINAS DE CADASTRO
**Prioridade**: ALTA
**Dependência**: FASE 1, FASE 2, FASE 3
**Estimativa**: 8-10 horas

#### Arquivos a Criar/Completar:

**1. `/frontend/src/pages/cadastro/EstabelecimentosListPage.tsx` (CRIAR)**
- Listar estabelecimentos
- Criar, editar, deletar
- Filtros: regime ISSQN, ativo, etc.
- Paginação

**2. `/frontend/src/pages/cadastro/LogradourosListPage.tsx` (CRIAR)**
- Listar logradouros
- Criar logradouros
- Filtros: nome, bairro
- Paginação

**3. `/frontend/src/pages/cadastro/TiposImovelListPage.tsx` (CRIAR)**
- Listar tipos de imóvel (preparar para futura edição)

**4. `/frontend/src/pages/cadastro/SetoresFiscaisListPage.tsx` (CRIAR)**
- Listar setores fiscais
- Preparar para futura edição de valores

---

### FASE 5: PÁGINAS TRIBUTÁRIAS
**Prioridade**: ALTA
**Dependência**: FASE 1, FASE 2, FASE 3
**Estimativa**: 16-20 horas

#### Arquivos a Criar/Completar:

**IPTU**

**1. `/frontend/src/pages/tributario/IPTULancamentoPage.tsx` (CRIAR)**
- Lançar IPTU individual
- Lançar em lote
- Filtros por exercício, setor fiscal
- Paginação

**2. `/frontend/src/pages/tributario/IPTUListPage.tsx` (CRIAR)**
- Listar lançamentos de IPTU
- Ver detalhes (valor, parcelas)
- Corrigir lançamento
- Cancelar lançamento
- Filtros: exercício, status, imovel
- Paginação

**ITBI**

**3. `/frontend/src/pages/tributario/ITBIPage.tsx` (COMPLETAR)**
Status: Básico implementado
Faltam:
- Formulário completo de emissão de guia
- Lista de guias com filtros
- Visualizar guia
- Registrar pagamento
- Cancelar guia
- Arbitrar valor
- Gerar PDF

**4. `/frontend/src/pages/tributario/ITBIGuiasPage.tsx` (CRIAR)**
- Listar guias de ITBI
- Emitir nova guia
- Ver detalhes
- Registrar pagamento
- Cancelar
- Arbitrar
- Gerar PDF
- Filtros: imovel, ano, pago
- Paginação

**ISSQN**

**5. `/frontend/src/pages/tributario/ISSQNPage.tsx` (COMPLETAR)**
Status: Básico implementado
Faltam:
- Formulário completo de declaração
- Lista de declarações com filtros
- Visualizar declaração
- Registrar pagamento
- Retificar declaração
- Cancelar declaração
- Gerar PDF

**6. `/frontend/src/pages/tributario/ISSQNDeclaracoesPage.tsx` (CRIAR)**
- Listar declarações de ISSQN
- Criar declaração
- Ver detalhes
- Registrar pagamento
- Retificar
- Cancelar
- Gerar PDF
- Filtros: estabelecimento, período, status
- Paginação

**7. `/frontend/src/pages/tributario/ISSQNRetencoesPage.tsx` (CRIAR)**
- Listar retenções de ISSQN
- Criar retenção
- Recolher retenção
- Filtros: estabelecimento, período
- Paginação

**Isenções**

**8. `/frontend/src/pages/tributario/IsencaoListPage.tsx` (CRIAR)**
- Listar isenções
- Criar isenção
- Ver detalhes
- Aprovar isenção
- Cancelar isenção
- Editar isenção
- Deletar isenção
- Filtros: tributo, imovel, status
- Paginação

**Alíquotas**

**9. `/frontend/src/pages/tributario/AliquotasPage.tsx` (CRIAR)**
- Listar alíquotas
- Criar alíquota
- Editar alíquota
- Deletar alíquota
- Filtros: tributo, ano
- Paginação

**PGV e TPC**

**10. `/frontend/src/pages/tributario/PGVPage.tsx` (CRIAR)**
- Listar PGV
- Criar PGV
- Editar PGV
- Deletar PGV
- Filtros: tipo, ativo
- Paginação

**11. `/frontend/src/pages/tributario/TPCPage.tsx` (CRIAR)**
- Listar TPC
- Criar TPC
- Editar TPC
- Deletar TPC
- Filtros: tipo, ano
- Paginação

**Parcelamentos**

**12. `/frontend/src/pages/tributario/ParcelamentosPage.tsx` (CRIAR)**
- Listar parcelamentos
- Criar parcelamento
- Ver detalhes
- Pagar parcela
- Cancelar parcelamento
- Filtros: imovel, status, tributo
- Paginação

---

### FASE 6: RELATÓRIOS
**Prioridade**: MÉDIA
**Dependência**: FASE 1, FASE 2, FASE 3
**Estimativa**: 6-8 horas

#### Arquivos a Criar:

**1. `/frontend/src/pages/relatorios/ArrecadacaoPage.tsx` (CRIAR)**
- Relatório de arrecadação
- Filtros: período, tributo, setor fiscal
- Gráficos: por tributo, por período
- Exportar em Excel/PDF

**2. `/frontend/src/pages/relatorios/InadimplenciaPage.tsx` (CRIAR)**
- Relatório de inadimplência
- Filtros: período, tributo, imovel
- Gráficos: análise por tributo
- Exportar em Excel/PDF

**3. `/frontend/src/components/relatorios/ChartComponent.tsx` (CRIAR)**
- Componente reutilizável para gráficos

---

### FASE 7: NAVEGAÇÃO E LAYOUT
**Prioridade**: MÉDIA
**Dependência**: FASE 1 a 6
**Estimativa**: 4-6 horas

#### Arquivos a Atualizar:

**1. `/frontend/src/App.tsx` (ATUALIZAR)**
- Adicionar todas as novas rotas
- Organizar por módulos
- Proteger rotas por permissão (se necessário)

**2. `/frontend/src/components/layout/Layout.tsx` (ATUALIZAR)**
- Expandir menu lateral com todos os módulos
- Adicionar ícones apropriados
- Organizar hierarquicamente
- Adicionar collapseável para submenus

**3. `/frontend/src/components/layout/Sidebar.tsx` (CRIAR)**
- Separar sidebar em componente
- Melhorar organização

**4. `/frontend/src/components/layout/Header.tsx` (CRIAR)**
- Separar header em componente
- Adicionar notificações, perfil, etc.

---

### FASE 8: MELHORIAS E REFINAMENTOS
**Prioridade**: MÉDIA
**Dependência**: FASE 1 a 7
**Estimativa**: 8-10 horas

#### Arquivos a Criar/Atualizar:

**1. `/frontend/src/hooks/` (CRIAR DIRETÓRIO)**

**2. `/frontend/src/hooks/useApi.ts` (CRIAR)**
- Hook customizado para chamadas de API
- Tratamento de erro centralizado
- Loading state

**3. `/frontend/src/hooks/useFetch.ts` (CRIAR)**
- Hook para fetch com query parameters
- Paginação automática

**4. `/frontend/src/hooks/useForm.ts` (CRIAR)**
- Hook customizado para formulários
- Validação, reset, etc.

**5. `/frontend/src/utils/` (CRIAR DIRETÓRIO)**

**6. `/frontend/src/utils/formatters.ts` (CRIAR)**
- Formatadores: moeda, data, CPF/CNPJ, etc.

**7. `/frontend/src/utils/validators.ts` (CRIAR)**
- Validadores: CPF, CNPJ, email, etc.

**8. `/frontend/src/utils/constants.ts` (CRIAR)**
- Constantes: tributos, status, etc.

**9. `/frontend/src/utils/helpers.ts` (CRIAR)**
- Funções auxiliares gerais

**10. `/frontend/src/constants/` (CRIAR DIRETÓRIO)**

**11. `/frontend/src/constants/menus.ts` (CRIAR)**
- Estrutura de menu centralizada

**12. `/frontend/src/constants/status.ts` (CRIAR)**
- Mapeamento de status e cores

---

### FASE 9: TESTES (OPCIONAL)
**Prioridade**: BAIXA
**Dependência**: FASE 1 a 8
**Estimativa**: 12-16 horas

#### Arquivos a Criar:

**1. `/frontend/src/__tests__/` (CRIAR DIRETÓRIO)**

**2. `/frontend/src/__tests__/services/` (CRIAR)**
- Testes de serviços

**3. `/frontend/src/__tests__/components/` (CRIAR)**
- Testes de componentes

**4. `/frontend/src/__tests__/hooks/` (CRIAR)**
- Testes de hooks

---

## RESUMO DE ARQUIVOS POR CRIAR

### Tipos & Interfaces (4 arquivos)
1. `/frontend/src/types/index.ts`
2. `/frontend/src/types/auth.ts`
3. `/frontend/src/types/cadastro.ts` (COMPLETAR)
4. `/frontend/src/types/tributario.ts` (COMPLETAR)

### Services (5 arquivos)
1. `/frontend/src/services/authService.ts`
2. `/frontend/src/services/estabelecimentoService.ts`
3. `/frontend/src/services/logradouroService.ts`
4. `/frontend/src/services/tributarioService.ts` (COMPLETAR)
5. `/frontend/src/services/pessoaService.ts` (JÁ EXISTE)

### Componentes (17 arquivos)
1. `/frontend/src/components/common/DataTable.tsx`
2. `/frontend/src/components/common/FormDialog.tsx`
3. `/frontend/src/components/common/ConfirmDialog.tsx`
4. `/frontend/src/components/common/LoadingSpinner.tsx`
5. `/frontend/src/components/common/ErrorAlert.tsx`
6. `/frontend/src/components/common/SuccessAlert.tsx`
7. `/frontend/src/components/cadastro/EstabelecimentoFormDialog.tsx`
8. `/frontend/src/components/cadastro/LogradouroFormDialog.tsx`
9. `/frontend/src/components/tributario/IPTULancamentoFormDialog.tsx`
10. `/frontend/src/components/tributario/IPTUParcelasTable.tsx`
11. `/frontend/src/components/tributario/ITBIGuiaFormDialog.tsx`
12. `/frontend/src/components/tributario/ISSQNDeclaracaoFormDialog.tsx`
13. `/frontend/src/components/tributario/IsencaoFormDialog.tsx`
14. `/frontend/src/components/tributario/AliquotaFormDialog.tsx`
15. `/frontend/src/components/tributario/PGVFormDialog.tsx`
16. `/frontend/src/components/tributario/TPCFormDialog.tsx`
17. `/frontend/src/components/tributario/ParcelamentoFormDialog.tsx`

### Páginas (12 arquivos)
1. `/frontend/src/pages/cadastro/EstabelecimentosListPage.tsx`
2. `/frontend/src/pages/cadastro/LogradourosListPage.tsx`
3. `/frontend/src/pages/cadastro/TiposImovelListPage.tsx`
4. `/frontend/src/pages/cadastro/SetoresFiscaisListPage.tsx`
5. `/frontend/src/pages/tributario/IPTULancamentoPage.tsx`
6. `/frontend/src/pages/tributario/IPTUListPage.tsx`
7. `/frontend/src/pages/tributario/ITBIGuiasPage.tsx`
8. `/frontend/src/pages/tributario/ISSQNDeclaracoesPage.tsx`
9. `/frontend/src/pages/tributario/ISSQNRetencoesPage.tsx`
10. `/frontend/src/pages/tributario/IsencaoListPage.tsx`
11. `/frontend/src/pages/tributario/AliquotasPage.tsx`
12. `/frontend/src/pages/tributario/PGVPage.tsx`
13. `/frontend/src/pages/tributario/TPCPage.tsx`
14. `/frontend/src/pages/tributario/ParcelamentosPage.tsx`
15. `/frontend/src/pages/relatorios/ArrecadacaoPage.tsx`
16. `/frontend/src/pages/relatorios/InadimplenciaPage.tsx`

### Relatórios (1 arquivo)
1. `/frontend/src/components/relatorios/ChartComponent.tsx`

### Hooks (3 arquivos)
1. `/frontend/src/hooks/useApi.ts`
2. `/frontend/src/hooks/useFetch.ts`
3. `/frontend/src/hooks/useForm.ts`

### Utilities (3 arquivos)
1. `/frontend/src/utils/formatters.ts`
2. `/frontend/src/utils/validators.ts`
3. `/frontend/src/utils/helpers.ts`

### Constants (2 arquivos)
1. `/frontend/src/constants/menus.ts`
2. `/frontend/src/constants/status.ts`

### Layout (2 arquivos)
1. `/frontend/src/components/layout/Sidebar.tsx`
2. `/frontend/src/components/layout/Header.tsx`

**TOTAL: ~60 arquivos a criar/completar**

---

## CRONOGRAMA ESTIMADO

| Fase | Descrição | Horas | Dias | Prioridade |
|------|-----------|-------|------|-----------|
| 1 | Tipos & Interfaces | 4-6 | 1 | CRÍTICA |
| 2 | Services | 8-10 | 1-2 | CRÍTICA |
| 3 | Componentes | 6-8 | 1 | ALTA |
| 4 | Páginas de Cadastro | 8-10 | 1-2 | ALTA |
| 5 | Páginas Tributárias | 16-20 | 2-3 | ALTA |
| 6 | Relatórios | 6-8 | 1 | MÉDIA |
| 7 | Navegação | 4-6 | 1 | MÉDIA |
| 8 | Refinamentos | 8-10 | 1-2 | MÉDIA |
| 9 | Testes | 12-16 | 2-3 | BAIXA |

**Total: 72-94 horas = 2-3 semanas de desenvolvimento full-time**

---

## PADRÕES E CONVENÇÕES

### Estrutura de Serviço
```typescript
export const nomeService = {
  async listar(params?: ListParams): Promise<ListResponse> { }
  async obter(id: string): Promise<Entity> { }
  async criar(data: EntityCreate): Promise<Entity> { }
  async atualizar(id: string, data: EntityUpdate): Promise<Entity> { }
  async excluir(id: string): Promise<void> { }
  async buscarPor*(valor: string): Promise<Entity | null> { }
}
```

### Estrutura de Página
```typescript
export function EntityListPage() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({})
  
  // Query hook
  const { data, isLoading, error } = useQuery({
    queryKey: ['entities', page, rowsPerPage, filters],
    queryFn: () => service.listar({ pagina: page + 1, limite: rowsPerPage, ...filters })
  })
  
  // Mutations
  const createMutation = useMutation({...})
  const updateMutation = useMutation({...})
  const deleteMutation = useMutation({...})
  
  // Handlers
  const handleCreate = () => { }
  const handleUpdate = () => { }
  const handleDelete = () => { }
  
  return (
    <Box>
      {/* Header */}
      {/* Filtros */}
      {/* Tabela */}
      {/* Paginação */}
      {/* Dialog */}
    </Box>
  )
}
```

### Estrutura de Componente de Formulário
```typescript
interface EntityFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: EntityCreate) => Promise<void>
  entity?: Entity
  isLoading?: boolean
}

export function EntityFormDialog({
  open, onClose, onSubmit, entity, isLoading
}: EntityFormDialogProps) {
  const { control, handleSubmit, reset } = useForm<EntityCreate>({
    defaultValues: entity || { }
  })
  
  useEffect(() => {
    reset(entity || { })
  }, [entity, reset])
  
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {entity ? 'Editar' : 'Criar'} Entity
      </DialogTitle>
      <DialogContent>
        {/* Formulário */}
      </DialogContent>
      <DialogActions>
        {/* Botões */}
      </DialogActions>
    </Dialog>
  )
}
```

---

## PRÓXIMOS PASSOS

1. **Criar arquivo de tipos completo** (FASE 1)
2. **Implementar todos os services** (FASE 2)
3. **Criar componentes reutilizáveis** (FASE 3)
4. **Implementar páginas de cadastro** (FASE 4)
5. **Implementar páginas tributárias** (FASE 5)
6. **Testar integração com backend**
7. **Refinar UI/UX**
8. **Deploy**

---

## NOTAS IMPORTANTES

- Todas as requisições já têm suporte a token JWT via interceptor
- Tratamento de erro centralizado via helper `getErrorMessage()`
- Paginação padronizada em todo o aplicativo
- Usar React Query para cache e sincronização automática
- Validação de formulários com React Hook Form
- Feedback visual com toast notifications
- Componentes Material-UI para consistência visual

---

*Documento gerado em 18 de novembro de 2024*
*Autor: Análise Automatizada do Sistema Tributec*
