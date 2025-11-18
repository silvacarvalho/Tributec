import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'

import { Layout } from './components/layout/Layout'
import { useAuthStore } from './stores/authStore'

// Pages
import { LoginPage } from './pages/auth/LoginPage'
import { Dashboard } from './pages/Dashboard'
import { PessoasListPage } from './pages/cadastro/PessoasListPage'
import { ImoveisListPage } from './pages/cadastro/ImoveisListPage'
import { CalculoIPTUPage } from './pages/tributario/CalculoIPTUPage'

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

          {/* Tributário */}
          <Route path="/tributario/iptu/calcular" element={<CalculoIPTUPage />} />

          {/* Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Layout>
  )
}

export default App
