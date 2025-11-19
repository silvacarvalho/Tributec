import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'

import { Layout } from './components/layout/Layout'
import { useAuthStore } from './stores/authStore'

// Pages
import { LoginPage } from './pages/auth/LoginPage'
import { Dashboard } from './pages/Dashboard'
import { PessoasListPage } from './pages/cadastro/PessoasListPage'
import { ImoveisListPage } from './pages/cadastro/ImoveisListPage'
import { LogradourosListPage } from './pages/cadastro/LogradourosListPage'
import { EstabelecimentosListPage } from './pages/cadastro/EstabelecimentosListPage'
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
import { AutoDetalhesPage } from './pages/fiscal/AutoDetalhesPage'
import { CatalogoInfracoesPage } from './pages/fiscal/CatalogoInfracoesPage'
import { DashboardFiscalPage } from './pages/fiscal/DashboardFiscalPage'
import { RelatoriosFiscaisPage } from './pages/fiscal/RelatoriosFiscaisPage'
import { ParametrosPage } from './pages/configuracoes/ParametrosPage'

function App() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          {/* Cadastros */}
          <Route path="/cadastro/pessoas" element={<PessoasListPage />} />
          <Route path="/cadastro/imoveis" element={<ImoveisListPage />} />
          <Route path="/cadastro/logradouros" element={<LogradourosListPage />} />
          <Route path="/cadastro/estabelecimentos" element={<EstabelecimentosListPage />} />

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
          <Route path="/fiscal/dashboard" element={<DashboardFiscalPage />} />
          <Route path="/fiscal/autos" element={<AutosInfracaoPage />} />
          <Route path="/fiscal/autos/:id" element={<AutoDetalhesPage />} />
          <Route path="/fiscal/catalogo" element={<CatalogoInfracoesPage />} />
          <Route path="/fiscal/relatorios" element={<RelatoriosFiscaisPage />} />

          {/* Configurações */}
          <Route path="/configuracoes/aliquotas" element={<AliquotasPage />} />
          <Route path="/configuracoes/isencoes" element={<IsencoesPage />} />
          <Route path="/configuracoes/parametros" element={<ParametrosPage />} />

          {/* DTD - Domicílio Tributário Digital */}
          <Route path="/admin/dtd" element={<DTDListPage />} />
          <Route path="/admin/dtd/:dtdId/mensagens" element={<DTDMensagensPage />} />

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
