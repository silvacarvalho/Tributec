# Relatório de Módulos Faltantes - Sistema Tributec
**Data:** 19/11/2025
**Branch:** claude/review-remaining-features-019SujbLfmE6x9wuHec8bY9A
**Status:** Análise completa do sistema

## Resumo Executivo

O sistema Tributec possui uma base sólida implementada, cobrindo os principais módulos de um sistema de gestão tributária municipal. Este relatório identifica os módulos e funcionalidades que ainda precisam ser implementados para completar o sistema.

---

## 1. MÓDULO DE CADASTROS ✅ (90% Completo)

### ✅ Implementado:
- Gestão de Pessoas (Física/Jurídica) com CRUD completo
- Gestão de Imóveis com características (terreno e edificações)
- Gestão de Estabelecimentos (CCM)
- Gestão de Logradouros
- Gestão de Endereços
- Páginas de detalhes com tabs
- Validação de CPF/CNPJ com backend
- Busca automática de CEP via ViaCEP
- Export CSV/Excel
- Componentes reutilizáveis (CpfCnpjInput, CepInput, InscricaoInput)

### ❌ Faltando:

#### Backend:
- [ ] **Service para Matrícula de Imóveis** (registro de transações imobiliárias)
- [ ] **Service para Histórico de Proprietários** (rastreamento de mudanças)
- [ ] **Service para Atividades Econômicas** (CNAE detalhado por estabelecimento)
- [ ] **Validação de Inscrição Municipal** (algoritmo de validação)
- [ ] **Importação em massa** (CSV/Excel de pessoas, imóveis)

#### Frontend:
- [ ] Formulários de criação/edição para **Imóveis** (ImovelFormDialog)
- [ ] Formulários de criação/edição para **Estabelecimentos** (EstabelecimentoFormDialog)
- [ ] Formulários de criação/edição para **Logradouros** (LogradouroFormDialog)
- [ ] Melhorias nas List Pages: **ImoveisListPage** e **EstabelecimentosListPage** (export, filtros)
- [ ] Página de **Importação em Massa** (upload CSV/Excel)
- [ ] Dialog de **Histórico de Alterações** (auditoria)
- [ ] Mapa de localização em **ImovelDetalhesPage** (Google Maps/Leaflet)

---

## 2. MÓDULO TRIBUTÁRIO 🟡 (70% Completo)

### ✅ Implementado:
- Cálculo de IPTU (VegetacaoValorVenal)
- Lançamentos de IPTU
- Gestão de Alíquotas
- Gestão de Isenções
- ITB (Imposto sobre Transmissão de Bens)
- ISSQN (Imposto sobre Serviços)
- Parâmetros do sistema

### ❌ Faltando:

#### Backend:
- [ ] **Service de Reavaliação Imobiliária** (atualização em massa de valores venais)
- [ ] **Service de Descontos Progressivos** (pagamento antecipado, pagamento à vista)
- [ ] **Service de Taxas Municipais** (Taxa de Coleta de Lixo, Taxa de Iluminação Pública)
- [ ] **Service de ITBI** (Imposto sobre Transmissão de Bens Imóveis) - integração com cartórios
- [ ] **Service de Contribuição de Melhoria** (obras públicas)
- [ ] **Cálculo de Multas e Juros** (SELIC, taxa customizada)
- [ ] **Geração de Guias de Pagamento** (boleto, PIX)

#### Frontend:
- [ ] Página de **Reavaliação Imobiliária** (seleção em massa, previsualização)
- [ ] Página de **Gestão de Taxas Municipais** (CRUD de taxas)
- [ ] Página de **Contribuição de Melhoria** (obras, rateio)
- [ ] Página de **Simulador Tributário** (contribuinte simula impostos)
- [ ] Dashboard **Analítico de Arrecadação** (gráficos, indicadores)
- [ ] Geração de **Relatórios Fiscais** (PDF customizáveis)
- [ ] Página de **Configuração de Descontos** (regras, prazos)

---

## 3. MÓDULO DE ARRECADAÇÃO 🟡 (60% Completo)

### ✅ Implementado:
- Gestão de Parcelamentos (básico)
- Lançamentos tributários

### ❌ Faltando:

#### Backend:
- [ ] **Service de Pagamentos** (integração com meios de pagamento)
- [ ] **Service de Conciliação Bancária** (arquivo CNAB, OFX)
- [ ] **Service de Baixa Automática** (identificação de pagamentos)
- [ ] **Service de Carnês** (geração em lote)
- [ ] **Service de Quitação de Débitos** (certidões negativas)
- [ ] **Integração com PIX** (geração de QR Code, webhooks)
- [ ] **Integração com Boletos** (Banco do Brasil, Caixa, Sicoob)

#### Frontend:
- [ ] Página de **Gestão de Pagamentos** (lista, filtros, conciliação)
- [ ] Página de **Conciliação Bancária** (upload de arquivos, match automático)
- [ ] Página de **Geração de Carnês** (seleção de débitos, lote)
- [ ] Página de **Emissão de Certidões** (negativa, positiva com efeito de negativa)
- [ ] Dashboard de **Arrecadação em Tempo Real** (gráficos de pagamentos do dia)
- [ ] Página de **Configuração de Meios de Pagamento** (ativar/desativar, credenciais)
- [ ] Relatório de **Inadimplência** (aging, lista de devedores)

---

## 4. MÓDULO DE DÍVIDA ATIVA 🔴 (30% Completo)

### ✅ Implementado:
- Models básicos (DividaAtiva, ParcedividaAtiva)

### ❌ Faltando:

#### Backend:
- [ ] **Service de Inscrição em Dívida Ativa** (regras de vencimento, cálculo de multas)
- [ ] **Service de Parcelamento de Dívida Ativa** (planos especiais)
- [ ] **Service de Protesto** (envio para cartório)
- [ ] **Service de Execução Fiscal** (preparação de processos)
- [ ] **Service de Anistia/Remissão** (programas de regularização)
- [ ] **Cálculo de Honorários Advocatícios** (10%, 20%)
- [ ] **Integração com CDA** (Certidão de Dívida Ativa)

#### Frontend:
- [ ] Página de **Lista de Dívidas Ativas** (filtros, busca, ordenação)
- [ ] Página de **Inscrição em Dívida Ativa** (seleção de débitos vencidos)
- [ ] Página de **Parcelamento de Dívida Ativa** (simulador, planos)
- [ ] Página de **Protesto** (lote, seleção, envio para cartório)
- [ ] Página de **Execução Fiscal** (geração de processos, documentos)
- [ ] Página de **Programas de Anistia** (configuração, adesão)
- [ ] Dashboard de **Dívida Ativa** (volume, idade média, recuperação)
- [ ] Emissão de **CDA** (PDF, numeração automática)

---

## 5. MÓDULO FISCAL 🟡 (75% Completo)

### ✅ Implementado:
- Autos de Infração (CRUD completo)
- Catálogo de Infrações
- Workflow de autos (lavrar, valores automáticos, reincidência)
- Página de detalhes de auto

### ❌ Faltando:

#### Backend:
- [ ] **Service de Defesa/Recurso** (contribuinte contesta auto)
- [ ] **Service de Julgamento** (fiscal analisa defesa, deferimento/indeferimento)
- [ ] **Service de Fiscalização** (ordem de fiscalização, roteiros)
- [ ] **Service de Notificações** (envio automático de autos, intimações)
- [ ] **Relatório de Produtividade de Fiscais** (autos por fiscal, arrecadação)

#### Frontend:
- [ ] Página de **Defesa de Autos** (contribuinte anexa documentos, argumentos)
- [ ] Página de **Julgamento de Defesas** (fiscal analisa, julga)
- [ ] Página de **Ordens de Fiscalização** (planejamento, distribuição)
- [ ] Página de **Roteiro de Fiscalização** (mapa, endereços)
- [ ] Dashboard de **Fiscalização** (autos lavrados, arrecadação, status)
- [ ] Relatório de **Autos por Fiscal** (produtividade)

---

## 6. MÓDULO DE NOTA FISCAL DE SERVIÇOS (NFS-e) 🔴 (20% Completo)

### ✅ Implementado:
- Models básicos (NotaFiscal, NotaFiscalItem)

### ❌ Faltando:

#### Backend:
- [ ] **Service de Emissão de NFS-e** (geração de XML, assinatura digital)
- [ ] **Service de Cancelamento de NFS-e**
- [ ] **Service de Consulta de NFS-e** (contribuinte, tomador)
- [ ] **Service de RPS** (Recibo Provisório de Serviços)
- [ ] **Integração com ABRASF** (padrão nacional)
- [ ] **Cálculo de ISS sobre NFS-e**
- [ ] **Retenção de ISS** (tomador retém ISS)
- [ ] **Livro Eletrônico de ISS**
- [ ] **Declaração Mensal de Serviços**

#### Frontend:
- [ ] Página de **Emissão de NFS-e** (formulário completo)
- [ ] Página de **Consulta de NFS-e** (prestador, tomador, data)
- [ ] Página de **Cancelamento de NFS-e** (motivo, justificativa)
- [ ] Página de **Gestão de RPS** (lote, conversão)
- [ ] Página de **Livro Eletrônico** (visualização, export)
- [ ] Página de **Declaração Mensal** (geração, envio)
- [ ] Dashboard de **NFS-e** (volume, arrecadação ISS)
- [ ] Configuração de **Série e Numeração**
- [ ] Configuração de **Certificado Digital**

---

## 7. MÓDULO DE PORTAL DO CONTRIBUINTE 🟡 (65% Completo)

### ✅ Implementado:
- Dashboard do contribuinte
- Meus Débitos
- Meus Imóveis
- Meus Estabelecimentos
- Meus Parcelamentos
- Meu Cadastro
- DTD (Domicílio Tributário Digital) - mensagens

### ❌ Faltando:

#### Backend:
- [ ] **Service de Solicitações Online** (certidões, segunda via, alteração cadastral)
- [ ] **Service de Acompanhamento de Processos** (protocolos, status)
- [ ] **Service de Agendamento** (atendimento presencial)

#### Frontend:
- [ ] Página de **Solicitações** (certidões, documentos)
- [ ] Página de **Protocolo** (acompanhamento)
- [ ] Página de **Agendamento** (calendário, horários)
- [ ] Página de **Histórico de Pagamentos** (comprovantes)
- [ ] Página de **Impressão de Guias** (segunda via)
- [ ] Chat/FAQ **Atendimento Online**

---

## 8. MÓDULO DE RELATÓRIOS E DASHBOARDS 🔴 (30% Completo)

### ✅ Implementado:
- Dashboard básico (página inicial)

### ❌ Faltando:

#### Backend:
- [ ] **Service de Relatórios Customizáveis** (query builder)
- [ ] **Service de Dashboards Dinâmicos** (widgets configuráveis)
- [ ] **Service de Exportação** (PDF, Excel, CSV)
- [ ] **Service de Agendamento de Relatórios** (envio automático por email)

#### Frontend:
- [ ] **Dashboard Executivo** (KPIs, gráficos de arrecadação, inadimplência)
- [ ] **Dashboard de Cadastro** (novos cadastros, atualizações)
- [ ] **Dashboard Tributário** (lançamentos, arrecadação por imposto)
- [ ] **Dashboard de Dívida Ativa** (volume, recuperação, protesto)
- [ ] **Dashboard de Fiscalização** (autos, julgamentos, arrecadação)
- [ ] **Builder de Relatórios** (arrastar e soltar campos, filtros)
- [ ] Biblioteca de **Relatórios Prontos** (mais de 50 relatórios padrão)

---

## 9. MÓDULO DE ADMINISTRAÇÃO 🟡 (60% Completo)

### ✅ Implementado:
- Autenticação (login/logout)
- DTD Admin (gestão de mensagens)
- Gestão de Parâmetros
- Configurações básicas

### ❌ Faltando:

#### Backend:
- [ ] **Service de Gestão de Usuários** (CRUD, permissões)
- [ ] **Service de Perfis e Permissões** (RBAC - Role-Based Access Control)
- [ ] **Service de Auditoria** (log de todas as operações)
- [ ] **Service de Backup** (automático, agendado)
- [ ] **Service de Integração** (APIs externas, webhooks)

#### Frontend:
- [ ] Página de **Gestão de Usuários** (CRUD, ativação/inativação)
- [ ] Página de **Perfis de Acesso** (permissões granulares)
- [ ] Página de **Auditoria** (log de operações, filtros)
- [ ] Página de **Backup e Restore** (manual, agendado)
- [ ] Página de **Integrações** (configuração de APIs)
- [ ] Página de **Configuração do Sistema** (tema, logo, dados municipais)
- [ ] Página de **Monitoramento** (uso de recursos, performance)

---

## 10. MÓDULOS NÃO INICIADOS 🔴 (0% Completo)

### 1. Módulo de **Taxas e Contribuições**
- Taxa de Coleta de Lixo
- Taxa de Iluminação Pública
- Contribuição de Melhoria
- Outras taxas municipais

### 2. Módulo de **Alvará e Licenças**
- Alvará de Funcionamento
- Alvará de Construção
- Licenças Ambientais
- Habite-se

### 3. Módulo de **Ouvidoria**
- Reclamações e sugestões
- Acompanhamento de demandas
- Relatórios de atendimento

### 4. Módulo de **Transparência**
- Portal da Transparência
- Lei de Acesso à Informação
- Dados abertos

### 5. Módulo de **Contabilidade Pública**
- Empenho
- Liquidação
- Pagamento
- Integração com contabilidade

---

## Priorização Sugerida

### 🔥 **URGENTE** (Próximas 2-4 semanas):
1. **Formulários de edição** para Imóveis e Estabelecimentos
2. **Melhorias nas List Pages** (export, filtros) para Imóveis e Estabelecimentos
3. **Service de Pagamentos** e integração com PIX/Boleto
4. **Service de Geração de Guias** (boleto e PIX)
5. **Página de Gestão de Usuários** e Permissões

### ⚡ **ALTA PRIORIDADE** (1-2 meses):
1. **Módulo de Dívida Ativa completo** (inscrição, parcelamento, protesto)
2. **Módulo de NFS-e completo** (emissão, cancelamento, consulta)
3. **Service de Conciliação Bancária**
4. **Dashboards Analíticos** (arrecadação, dívida ativa)
5. **Relatórios Customizáveis**

### 📊 **MÉDIA PRIORIDADE** (2-3 meses):
1. **Módulo de Defesa/Recurso de Autos**
2. **Módulo de Taxas Municipais**
3. **Módulo de Portal do Contribuinte** (solicitações, protocolos)
4. **Builder de Relatórios**
5. **Auditoria e Backup**

### 📝 **BAIXA PRIORIDADE** (3+ meses):
1. **Módulo de Alvará e Licenças**
2. **Módulo de Ouvidoria**
3. **Módulo de Transparência**
4. **Módulo de Contabilidade Pública**
5. **Integrações Avançadas**

---

## Estimativa de Horas

| Módulo | Horas Estimadas | Complexidade |
|--------|----------------|--------------|
| Cadastros (completar) | 40h | Média |
| Tributário (completar) | 80h | Alta |
| Arrecadação (completar) | 120h | Muito Alta |
| Dívida Ativa | 160h | Muito Alta |
| Fiscal (completar) | 60h | Média |
| NFS-e | 200h | Muito Alta |
| Portal (completar) | 40h | Média |
| Relatórios e Dashboards | 100h | Alta |
| Administração (completar) | 60h | Média |
| Taxas e Contribuições | 80h | Alta |
| Alvará e Licenças | 120h | Alta |
| Ouvidoria | 40h | Baixa |
| Transparência | 60h | Média |
| Contabilidade Pública | 200h | Muito Alta |
| **TOTAL** | **~1.360 horas** | **~6-8 meses com 1 dev** |

---

## Tecnologias Necessárias (Não Implementadas)

### Backend:
- [ ] **Assinatura Digital** (certificado A1/A3) para NFS-e
- [ ] **Geração de Boletos** (biblioteca `python-boleto`)
- [ ] **Geração de PIX** (BR Code, integração com PSP)
- [ ] **Processamento de arquivos CNAB** (remessa e retorno)
- [ ] **Geração de PDF** (já tem pdf_service, mas precisa templates)
- [ ] **Envio de Email em Massa** (já tem email_service, mas precisa fila)
- [ ] **Fila de Processamento** (Celery ou RQ para jobs assíncronos)

### Frontend:
- [ ] **Gráficos Avançados** (Chart.js ou Recharts)
- [ ] **Mapas** (Google Maps ou Leaflet)
- [ ] **Editor de Texto Rico** (TinyMCE ou Quill) para observações
- [ ] **Upload de Arquivos** (drag and drop)
- [ ] **Assinatura Digital no Browser** (WebCrypto API)

---

## Conclusão

O sistema **Tributec** possui uma base sólida com os módulos principais implementados, especialmente:
- ✅ Cadastros básicos funcionais
- ✅ Cálculo tributário (IPTU, ITBI, ISSQN)
- ✅ Fiscalização (autos de infração)
- ✅ Portal do contribuinte (básico)

Para tornar o sistema **completo e pronto para produção**, é necessário:

1. **Finalizar os formulários e validações** do módulo de Cadastros
2. **Implementar o fluxo completo de pagamentos** (PIX, boleto, conciliação)
3. **Implementar Dívida Ativa** (maior gap atual)
4. **Implementar NFS-e** (essencial para municípios)
5. **Criar dashboards e relatórios** (gestão e tomada de decisão)

**Tempo estimado para MVP completo:** 3-4 meses com 2 desenvolvedores
**Tempo estimado para sistema completo:** 6-8 meses com 2 desenvolvedores

---

**Documento gerado automaticamente em:** 2025-11-19
**Última atualização do código:** commit `00d202e`
