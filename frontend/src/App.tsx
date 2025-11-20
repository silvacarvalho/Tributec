import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'

import { Layout } from './components/layout/Layout'
import { useAuthStore } from './stores/authStore'
import { useSessionTimeout } from './hooks/useSessionTimeout'

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage'
import { RecuperarSenhaPage } from './pages/auth/RecuperarSenhaPage'
import { RedefinirSenhaPage } from './pages/auth/RedefinirSenhaPage'
import { AlterarSenhaPage } from './pages/auth/AlterarSenhaPage'
import { Configurar2FAPage } from './pages/auth/Configurar2FAPage'
import { HistoricoLoginsPage } from './pages/auth/HistoricoLoginsPage'

// Other Pages
import { Dashboard } from './pages/Dashboard'
import { PessoasListPage } from './pages/cadastro/PessoasListPage'
import { PessoaDetalhesPage } from './pages/cadastro/PessoaDetalhesPage'
import { ImoveisListPage } from './pages/cadastro/ImoveisListPage'
import { ImovelDetalhesPage } from './pages/cadastro/ImovelDetalhesPage'
import { LogradourosListPage } from './pages/cadastro/LogradourosListPage'
import { EstabelecimentosListPage } from './pages/cadastro/EstabelecimentosListPage'
import { EstabelecimentoDetalhesPage } from './pages/cadastro/EstabelecimentoDetalhesPage'
import { CalculoIPTUPage } from './pages/tributario/CalculoIPTUPage'
import { IPTULancamentosPage } from './pages/tributario/IPTULancamentosPage'
import { ITBIPage } from './pages/tributario/ITBIPage'
import { ISSQNPage } from './pages/tributario/ISSQNPage'
import { AliquotasPage } from './pages/configuracoes/AliquotasPage'
import { IsencoesPage } from './pages/configuracoes/IsencoesPage'
import { ParcelamentosPage } from './pages/arrecadacao/ParcelamentosPage'
import { DashboardArrecadacaoPage } from './pages/arrecadacao/DashboardArrecadacaoPage'
import { DebitosPage } from './pages/arrecadacao/DebitosPage'
import { InadimplenciaPage } from './pages/arrecadacao/InadimplenciaPage'
import { RelatoriosArrecadacaoPage } from './pages/arrecadacao/RelatoriosArrecadacaoPage'
import { DTDListPage } from './pages/admin/DTDListPage'
import { DTDMensagensPage } from './pages/contribuinte/DTDMensagensPage'
import { DashboardContribuinte } from './pages/portal/DashboardContribuinte'
import { MeusDebitosPage } from './pages/portal/MeusDebitosPage'
import { MeusImoveisPage } from './pages/portal/MeusImoveisPage'
import { MeusEstabelecimentosPage } from './pages/portal/MeusEstabelecimentosPage'
import { MeusParcelamentosPage } from './pages/portal/MeusParcelamentosPage'
import { MeuCadastroPage } from './pages/portal/MeuCadastroPage'
import { AutosInfracaoPage } from './pages/fiscal/AutosInfracaoPage'
import { DetalhesAutoPage } from './pages/fiscal/DetalhesAutoPage'
import { CatalogoInfracoesPage } from './pages/fiscal/CatalogoInfracoesPage'
import { AutoDetalhesPage } from './pages/fiscal/AutoDetalhesPage'
import { DashboardFiscalPage } from './pages/fiscal/DashboardFiscalPage'

        
import { RelatoriosFiscaisPage } from './pages/fiscal/RelatoriosFiscaisPage'
import { ImportacaoDadosPage } from './pages/fiscal/ImportacaoDadosPage'
import { NotificacoesFiscaisPage } from './pages/fiscal/NotificacoesFiscaisPage'
import { ProcessosFiscaisPage } from './pages/fiscal/ProcessosFiscaisPage'

        

  
import { ParametrosPage } from './pages/configuracoes/ParametrosPage'
import { DashboardAdminPage } from './pages/admin/DashboardAdminPage'
import { UsuariosPage } from './pages/admin/UsuariosPage'
import { LogsAuditoriaPage } from './pages/admin/LogsAuditoriaPage'
import { PapeisPermissoesPage } from './pages/admin/PapeisPermissoesPage'
import { ConfiguracoesSistemaPage } from './pages/admin/ConfiguracoesSistemaPage'

function App() {
  const { isAuthenticated } = useAuthStore()

  // Habilitar timeout de sessão (30 minutos de inatividade)
  useSessionTimeout({
    timeout: 30 * 60 * 1000, // 30 minutos
    warningTime: 2 * 60 * 1000, // Avisar 2 minutos antes
    enabled: isAuthenticated,
  })

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
        <Route path="/redefinir-senha/:token" element={<RedefinirSenhaPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          {/* Auth (Rotas protegidas) */}
          <Route path="/auth/alterar-senha" element={<AlterarSenhaPage />} />
          <Route path="/auth/configurar-2fa" element={<Configurar2FAPage />} />
          <Route path="/auth/historico-logins" element={<HistoricoLoginsPage />} />

          {/* Cadastros */}
          <Route path="/cadastro/pessoas" element={<PessoasListPage />} />
          <Route path="/cadastro/pessoas/:id" element={<PessoaDetalhesPage />} />
          <Route path="/cadastro/imoveis" element={<ImoveisListPage />} />
          <Route path="/cadastro/imoveis/:id" element={<ImovelDetalhesPage />} />
          <Route path="/cadastro/logradouros" element={<LogradourosListPage />} />
          <Route path="/cadastro/estabelecimentos" element={<EstabelecimentosListPage />} />
          <Route path="/cadastro/estabelecimentos/:id" element={<EstabelecimentoDetalhesPage />} />

          {/* Tributário */}
          <Route path="/tributario/iptu/calcular" element={<CalculoIPTUPage />} />
          <Route path="/tributario/iptu/lancamentos" element={<IPTULancamentosPage />} />
          <Route path="/tributario/itbi" element={<ITBIPage />} />
          <Route path="/tributario/issqn" element={<ISSQNPage />} />

          {/* Arrecadação */}
          <Route path="/arrecadacao/dashboard" element={<DashboardArrecadacaoPage />} />
          <Route path="/arrecadacao/debitos" element={<DebitosPage />} />
          <Route path="/arrecadacao/inadimplencia" element={<InadimplenciaPage />} />
          <Route path="/arrecadacao/parcelamentos" element={<ParcelamentosPage />} />
          <Route path="/arrecadacao/relatorios" element={<RelatoriosArrecadacaoPage />} />

          {/* Fiscal */}
          <Route path="/fiscal/autos-infracao" element={<AutosInfracaoPage />} />
          <Route path="/fiscal/autos-infracao/:autoId" element={<DetalhesAutoPage />} />
          <Route path="/fiscal/catalogo-infracoes" element={<CatalogoInfracoesPage />} />
          <Route path="/fiscal/dashboard" element={<DashboardFiscalPage />} />
          <Route path="/fiscal/autos" element={<AutosInfracaoPage />} />
          <Route path="/fiscal/autos/:id" element={<AutoDetalhesPage />} />
          <Route path="/fiscal/catalogo" element={<CatalogoInfracoesPage />} />
          <Route path="/fiscal/relatorios" element={<RelatoriosFiscaisPage />} />
          <Route path="/fiscal/importacao" element={<ImportacaoDadosPage />} />
          <Route path="/fiscal/notificacoes" element={<NotificacoesFiscaisPage />} />
          <Route path="/fiscal/processos" element={<ProcessosFiscaisPage />} />

          {/* Configurações */}
          <Route path="/configuracoes/aliquotas" element={<AliquotasPage />} />
          <Route path="/configuracoes/isencoes" element={<IsencoesPage />} />
          <Route path="/configuracoes/parametros" element={<ParametrosPage />} />

          {/* DTD - Domicílio Tributário Digital */}
          <Route path="/admin/dtd" element={<DTDListPage />} />
          <Route path="/admin/dtd/:dtdId/mensagens" element={<DTDMensagensPage />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<DashboardAdminPage />} />
          <Route path="/admin/usuarios" element={<UsuariosPage />} />
          <Route path="/admin/logs" element={<LogsAuditoriaPage />} />
          <Route path="/admin/papeis" element={<PapeisPermissoesPage />} />
          <Route path="/admin/configuracoes" element={<ConfiguracoesSistemaPage />} />

          {/* Portal do Contribuinte */}
          <Route path="/portal" element={<DashboardContribuinte />} />
          <Route path="/portal/debitos" element={<MeusDebitosPage />} />
          <Route path="/portal/imoveis" element={<MeusImoveisPage />} />
          <Route path="/portal/estabelecimentos" element={<MeusEstabelecimentosPage />} />
          <Route path="/portal/parcelamentos" element={<MeusParcelamentosPage />} />
          <Route path="/portal/cadastro" element={<MeuCadastroPage />} />
          <Route path="/portal/dtd/:dtdId/mensagens" element={<DTDMensagensPage />} />

          {/* Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Layout>
  )
}

export default App
