# CHECKLIST DE IMPLEMENTAÇÃO - FRONTEND TRIBUTEC

## STATUS GERAL: 30% COMPLETO
- Arquivos: 9/~60 criados
- Serviços: 3/9 completos
- Páginas: 6/16 completas
- Componentes: 4/20 completos

---

## PRIORIDADE 1: CRÍTICA (1-2 dias)

### TIPOS E INTERFACES
- [ ] Completar `/frontend/src/types/cadastro.ts`
  - [ ] Adicionar Estabelecimento
  - [ ] Adicionar Logradouro
- [ ] Completar `/frontend/src/types/tributario.ts`
  - [ ] Adicionar IPTULancamento
  - [ ] Adicionar ITBIGuia
  - [ ] Adicionar ISSQNDeclaracao
  - [ ] Adicionar ISSQNRetencao
  - [ ] Adicionar Isencao
  - [ ] Adicionar PGV
  - [ ] Adicionar TPC
  - [ ] Adicionar Parcelamento
- [ ] Criar `/frontend/src/types/auth.ts`
- [ ] Criar `/frontend/src/types/index.ts`

### SERVICES
- [ ] Criar `/frontend/src/services/authService.ts`
- [ ] Criar `/frontend/src/services/estabelecimentoService.ts`
- [ ] Criar `/frontend/src/services/logradouroService.ts`
- [ ] Completar `/frontend/src/services/tributarioService.ts`
  - [ ] Adicionar métodos IPTU Lançamento (7)
  - [ ] Completar métodos ITBI Guia (4)
  - [ ] Adicionar métodos ISSQN Declaração (4)
  - [ ] Adicionar métodos ISSQN Retenção (3)
  - [ ] Adicionar métodos Isenção (7)
  - [ ] Adicionar métodos Alíquota (5)
  - [ ] Adicionar métodos PGV (5)
  - [ ] Adicionar métodos TPC (5)
  - [ ] Adicionar métodos Parcelamento (4)
  - [ ] Adicionar métodos Relatórios (2)

---

## PRIORIDADE 2: ALTA (3-4 dias)

### COMPONENTES REUTILIZÁVEIS
- [ ] Criar `/frontend/src/components/common/DataTable.tsx`
- [ ] Criar `/frontend/src/components/common/FormDialog.tsx`
- [ ] Criar `/frontend/src/components/common/ConfirmDialog.tsx`
- [ ] Criar `/frontend/src/components/common/LoadingSpinner.tsx`
- [ ] Criar `/frontend/src/components/common/ErrorAlert.tsx`

### COMPONENTES ESPECÍFICOS
- [ ] Criar `/frontend/src/components/cadastro/EstabelecimentoFormDialog.tsx`
- [ ] Criar `/frontend/src/components/cadastro/LogradouroFormDialog.tsx`
- [ ] Criar `/frontend/src/components/tributario/IPTULancamentoFormDialog.tsx`
- [ ] Criar `/frontend/src/components/tributario/ITBIGuiaFormDialog.tsx`
- [ ] Criar `/frontend/src/components/tributario/ISSQNDeclaracaoFormDialog.tsx`
- [ ] Criar `/frontend/src/components/tributario/IsencaoFormDialog.tsx`
- [ ] Criar `/frontend/src/components/tributario/AliquotaFormDialog.tsx`

### PÁGINAS DE CADASTRO
- [ ] Criar `/frontend/src/pages/cadastro/EstabelecimentosListPage.tsx`
- [ ] Criar `/frontend/src/pages/cadastro/LogradourosListPage.tsx`
- [ ] Criar `/frontend/src/pages/cadastro/TiposImovelListPage.tsx`
- [ ] Criar `/frontend/src/pages/cadastro/SetoresFiscaisListPage.tsx`

### PÁGINAS TRIBUTÁRIAS CRÍTICAS
- [ ] Completar `/frontend/src/pages/tributario/ITBIPage.tsx`
  - [ ] Adicionar formulário completo
  - [ ] Adicionar lista de guias
  - [ ] Adicionar registro de pagamento
  - [ ] Adicionar cancelamento
  - [ ] Adicionar arbitramento
- [ ] Completar `/frontend/src/pages/tributario/ISSQNPage.tsx`
  - [ ] Adicionar formulário completo
  - [ ] Adicionar lista de declarações
  - [ ] Adicionar registro de pagamento
  - [ ] Adicionar retificação
- [ ] Completar `/frontend/src/pages/tributario/CalculoIPTUPage.tsx`
  - [ ] Melhorar interface
  - [ ] Adicionar botão de lançamento

---

## PRIORIDADE 3: MÉDIA (5-7 dias)

### PÁGINAS TRIBUTÁRIAS COMPLEMENTARES
- [ ] Criar `/frontend/src/pages/tributario/IPTULancamentoPage.tsx`
- [ ] Criar `/frontend/src/pages/tributario/IPTUListPage.tsx`
- [ ] Criar `/frontend/src/pages/tributario/ITBIGuiasPage.tsx`
- [ ] Criar `/frontend/src/pages/tributario/ISSQNDeclaracoesPage.tsx`
- [ ] Criar `/frontend/src/pages/tributario/ISSQNRetencoesPage.tsx`
- [ ] Criar `/frontend/src/pages/tributario/IsencaoListPage.tsx`
- [ ] Criar `/frontend/src/pages/tributario/AliquotasPage.tsx`
- [ ] Criar `/frontend/src/pages/tributario/PGVPage.tsx`
- [ ] Criar `/frontend/src/pages/tributario/TPCPage.tsx`
- [ ] Criar `/frontend/src/pages/tributario/ParcelamentosPage.tsx`

### COMPONENTES TRIBUTÁRIOS
- [ ] Criar `/frontend/src/components/tributario/IPTUParcelasTable.tsx`
- [ ] Criar `/frontend/src/components/tributario/PGVFormDialog.tsx`
- [ ] Criar `/frontend/src/components/tributario/TPCFormDialog.tsx`
- [ ] Criar `/frontend/src/components/tributario/ParcelamentoFormDialog.tsx`

### NAVEGAÇÃO
- [ ] Atualizar `/frontend/src/App.tsx` com todas as rotas
- [ ] Atualizar `/frontend/src/components/layout/Layout.tsx` com menu expandido
- [ ] Criar `/frontend/src/components/layout/Sidebar.tsx`
- [ ] Criar `/frontend/src/components/layout/Header.tsx`

---

## PRIORIDADE 4: BAIXA/OPCIONAL (2-3 dias)

### RELATÓRIOS
- [ ] Criar `/frontend/src/pages/relatorios/ArrecadacaoPage.tsx`
- [ ] Criar `/frontend/src/pages/relatorios/InadimplenciaPage.tsx`
- [ ] Criar `/frontend/src/components/relatorios/ChartComponent.tsx`

### UTILITÁRIOS E HOOKS
- [ ] Criar `/frontend/src/hooks/useApi.ts`
- [ ] Criar `/frontend/src/hooks/useFetch.ts`
- [ ] Criar `/frontend/src/hooks/useForm.ts`
- [ ] Criar `/frontend/src/utils/formatters.ts`
- [ ] Criar `/frontend/src/utils/validators.ts`
- [ ] Criar `/frontend/src/utils/helpers.ts`
- [ ] Criar `/frontend/src/utils/constants.ts`
- [ ] Criar `/frontend/src/constants/menus.ts`
- [ ] Criar `/frontend/src/constants/status.ts`

---

## ORDEM RECOMENDADA DE IMPLEMENTAÇÃO

### Semana 1
**Segunda**: CRÍTICO - Tipos e Interfaces
- 2 horas: Completar tipos de Cadastro e Tributário
- 2 horas: Criar tipos de Auth
- 2 horas: Criar index.ts

**Terça-Quarta**: CRÍTICO - Services
- 4 horas: Completar tributarioService.ts
- 2 horas: Criar authService.ts
- 2 horas: Criar estabelecimentoService.ts
- 2 horas: Criar logradouroService.ts

**Quinta-Sexta**: ALTA - Componentes e Páginas
- 4 horas: Componentes reutilizáveis (DataTable, FormDialog, etc.)
- 4 horas: Páginas de cadastro (Estabelecimentos, Logradouros)
- 2 horas: Completar páginas ITBI/ISSQN básicas

### Semana 2
**Segunda-Quarta**: ALTA - Páginas Tributárias
- 6 horas: Páginas IPTU (Lançamento, Lista)
- 6 horas: Páginas ITBI/ISSQN completas
- 2 horas: Páginas Isenção/Alíquota básicas

**Quinta-Sexta**: MÉDIA - Layout e Navegação
- 2 horas: Completar App.tsx com todas as rotas
- 2 horas: Atualizar Layout.tsx e criar Sidebar.tsx
- 2 horas: Criar Header.tsx
- 2 horas: Testes e correções

### Semana 3
**Segunda-Quarta**: MÉDIA - Páginas Complementares
- 6 horas: Páginas PGV, TPC, Parcelamentos, Relatórios

**Quinta-Sexta**: Refinamentos e Testes
- 4 horas: Hooks e utilitários
- 4 horas: Testes e correções finais

---

## ENDPOINTS COM COBERTURA

### IMPLEMENTADO (20 endpoints)
- [ ] POST /auth/login
- [ ] POST /auth/refresh
- [ ] GET /auth/me
- [ ] POST /auth/logout
- [ ] POST /auth/alterar-senha
- [ ] POST /auth/recuperar-senha
- [ ] POST /auth/redefinir-senha
- [ ] POST /cadastro/pessoas
- [ ] GET /cadastro/pessoas
- [ ] GET /cadastro/pessoas/{id}
- [ ] PUT /cadastro/pessoas/{id}
- [ ] DELETE /cadastro/pessoas/{id}
- [ ] GET /cadastro/pessoas/cpf/{cpf}
- [ ] GET /cadastro/pessoas/cnpj/{cnpj}
- [ ] POST /cadastro/imoveis
- [ ] GET /cadastro/imoveis
- [ ] GET /cadastro/imoveis/{id}
- [ ] GET /cadastro/imoveis/inscricao/{inscricao}
- [ ] PUT /cadastro/imoveis/{id}
- [ ] POST /tributario/iptu/calcular

### A IMPLEMENTAR (62 endpoints)

#### Cadastro - Estabelecimentos (3)
- [ ] POST /cadastro/estabelecimentos
- [ ] GET /cadastro/estabelecimentos
- [ ] GET /cadastro/estabelecimentos/{id}

#### Cadastro - Logradouros (2)
- [ ] POST /cadastro/logradouros
- [ ] GET /cadastro/logradouros

#### IPTU Lançamento (7)
- [ ] POST /tributario/iptu/lancar
- [ ] POST /tributario/iptu/lançamento-em-lote/{ano}
- [ ] GET /tributario/iptu/lancamentos
- [ ] GET /tributario/iptu/lancamentos/{id}
- [ ] GET /tributario/iptu/lancamentos/{id}/parcelas
- [ ] PUT /tributario/iptu/lancamentos/{id}/corrigir
- [ ] PUT /tributario/iptu/lancamentos/{id}/cancelar

#### ITBI (7)
- [ ] POST /tributario/itbi/guias
- [ ] POST /tributario/itbi/emitir-guia
- [ ] GET /tributario/itbi/guias
- [ ] GET /tributario/itbi/guias/{id}
- [ ] PUT /tributario/itbi/guias/{id}/registrar-pagamento
- [ ] PUT /tributario/itbi/guias/{id}/cancelar
- [ ] PUT /tributario/itbi/guias/{id}/arbitrar
- [ ] GET /tributario/itbi/guias/{id}/pdf

#### ISSQN (10)
- [ ] POST /tributario/issqn/declaracoes
- [ ] GET /tributario/issqn/declaracoes
- [ ] PUT /tributario/issqn/declaracoes/{id}/registrar-pagamento
- [ ] PUT /tributario/issqn/declaracoes/{id}/retificar
- [ ] PUT /tributario/issqn/declaracoes/{id}/cancelar
- [ ] GET /tributario/issqn/declaracoes/{id}/pdf
- [ ] POST /tributario/issqn/retencoes
- [ ] GET /tributario/issqn/retencoes
- [ ] PUT /tributario/issqn/retencoes/{id}/recolher

#### Isenções (7)
- [ ] POST /tributario/isencoes
- [ ] GET /tributario/isencoes
- [ ] GET /tributario/isencoes/{id}
- [ ] PUT /tributario/isencoes/{id}/aprovar
- [ ] PUT /tributario/isencoes/{id}/cancelar
- [ ] PUT /tributario/isencoes/{id}
- [ ] DELETE /tributario/isencoes/{id}

#### Alíquotas (5)
- [ ] POST /tributario/aliquotas
- [ ] GET /tributario/aliquotas
- [ ] GET /tributario/aliquotas/{id}
- [ ] PUT /tributario/aliquotas/{id}
- [ ] DELETE /tributario/aliquotas/{id}

#### PGV (5)
- [ ] POST /tributario/pgv
- [ ] GET /tributario/pgv
- [ ] GET /tributario/pgv/{id}
- [ ] PUT /tributario/pgv/{id}
- [ ] DELETE /tributario/pgv/{id}

#### TPC (5)
- [ ] POST /tributario/tpc
- [ ] GET /tributario/tpc
- [ ] GET /tributario/tpc/{id}
- [ ] PUT /tributario/tpc/{id}
- [ ] DELETE /tributario/tpc/{id}

#### Parcelamentos (4)
- [ ] POST /tributario/parcelamentos
- [ ] GET /tributario/parcelamentos
- [ ] PUT /tributario/parcelamentos/{id}/parcela/{num}/pagar
- [ ] PUT /tributario/parcelamentos/{id}/cancelar

#### Relatórios (2)
- [ ] GET /tributario/relatorios/arrecadacao
- [ ] GET /tributario/relatorios/inadimplencia

---

## MÉTRICAS DE SUCESSO

### Fase 1 (Tipos & Services)
- [x] Todos os tipos criados
- [x] Todos os services implementados
- [x] Nenhum erro de compilação TypeScript
- [x] Testes de API passando

### Fase 2 (Componentes)
- [ ] 80% de reutilização de componentes
- [ ] Sem duplicação de código em formulários
- [ ] Validação centralizada

### Fase 3 (Páginas)
- [ ] 100% dos endpoints mapeados
- [ ] CRUD completo para cada entidade
- [ ] Filtros funcionando
- [ ] Paginação funcionando
- [ ] Erros tratados gracefully

### Fase 4 (Layout)
- [ ] Menu lateral com todas as páginas
- [ ] Navegação funcionando
- [ ] Rotas protegidas (opcional)

### Fase 5 (Relatórios)
- [ ] Gráficos renderizando
- [ ] Exportação funcionando
- [ ] Filtros aplicando

### Geral
- [ ] 100% dos endpoints com cobertura frontend
- [ ] Sem warnings no console
- [ ] Performance aceitável (< 3s de carga)
- [ ] Responsivo em mobile

---

## NOTAS IMPORTANTES

### Padrões a Seguir
1. Sempre criar tipos antes de serviços
2. Sempre criar serviços antes de componentes
3. Reutilizar componentes o máximo possível
4. Manter nomes em português (padrão do projeto)
5. Usar query string para filtros em URLs
6. Validar entrada no frontend (não confiar no backend)

### Dependências Já Instaladas
- react 18+
- typescript
- @mui/material
- react-router-dom
- @tanstack/react-query
- axios
- react-hook-form
- zustand
- react-toastify

### Plugins/Bibliotecas Sugeridas Para Adicionar
Se necessário:
- `recharts` ou `chart.js` para gráficos
- `xlsx` ou `csv-export` para exportação
- `jsPDF` para geração de PDFs
- `date-fns` para manipulação de datas
- `react-mask-input` para máscaras de CPF/CNPJ

---

## PROBLEMAS CONHECIDOS A RESOLVER

1. **tipos/tributario.ts**: Tipos incompletos para lançamentos
2. **ITBIPage.tsx**: Faltam funcionalidades (pagamento, arbitramento)
3. **ISSQNPage.tsx**: Faltam funcionalidades completas
4. **tributarioService.ts**: Apenas 3 métodos implementados
5. **Layout.tsx**: Menu não tem todas as páginas
6. **App.tsx**: Rotas não mapeadas completamente

---

## PRÓXIMAS AÇÕES

1. Priorizar Fase 1 (tipos e services) - HOJE
2. Criar plano de testes unitários para serviços
3. Testar integração com backend antes de criar UI
4. Definir padrão de cores/ícones para tributários
5. Criar guia de uso para novo desenvolvedor

---

*Documento gerado em 18 de novembro de 2024*
*Atualizar este checklist conforme progresso*
