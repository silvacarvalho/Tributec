import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'

import { Layout } from './components/layout/Layout'
import { useAuthStore } from './stores/authStore'

// Pages
import { LoginPage } from './pages/auth/LoginPage'
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
          <Route path="/arrecadacao/parcelamentos" element={<ParcelamentosPage />} />

          {/* Fiscal */}
          <Route path="/fiscal/autos-infracao" element={<AutosInfracaoPage />} />
          <Route path="/fiscal/autos-infracao/:autoId" element={<DetalhesAutoPage />} />
          <Route path="/fiscal/catalogo-infracoes" element={<CatalogoInfracoesPage />} />

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
