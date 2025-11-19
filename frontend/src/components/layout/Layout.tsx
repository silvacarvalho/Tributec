import { ReactNode } from 'react'
import { Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, Collapse, Divider } from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  AccountBalance as AccountBalanceIcon,
  Logout as LogoutIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Business as BusinessIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Email as EmailIcon,
  Gavel as GavelIcon,
  Warning as WarningIcon,
  Tune as TuneIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useThemeMode } from '@/contexts/ThemeContext'

interface LayoutProps {
  children: ReactNode
}

const drawerWidth = 240

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [fiscalOpen, setFiscalOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()
  const { mode, toggleTheme } = useThemeMode()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Pessoas', icon: <PeopleIcon />, path: '/cadastro/pessoas' },
    { text: 'Imóveis', icon: <HomeIcon />, path: '/cadastro/imoveis' },
    { text: 'Estabelecimentos', icon: <BusinessIcon />, path: '/cadastro/estabelecimentos' },
    { text: 'Calcular IPTU', icon: <AssignmentIcon />, path: '/tributario/iptu/calcular' },
    { text: 'ITBI', icon: <DescriptionIcon />, path: '/tributario/itbi' },
    { text: 'ISSQN', icon: <ReceiptIcon />, path: '/tributario/issqn' },
    { text: 'Parcelamentos', icon: <PaymentIcon />, path: '/arrecadacao/parcelamentos' },
    { text: 'DTD', icon: <EmailIcon />, path: '/admin/dtd' },
  ]

  const drawer = (
    <Box>
      <Toolbar>
        <AccountBalanceIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap component="div">
          Tributec
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 1 }} />

        {/* Fiscalização */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setFiscalOpen(!fiscalOpen)}>
            <ListItemIcon>
              <GavelIcon />
            </ListItemIcon>
            <ListItemText primary="Fiscalização" />
            {fiscalOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={fiscalOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/fiscal/autos-infracao')}>
              <ListItemIcon>
                <WarningIcon />
              </ListItemIcon>
              <ListItemText primary="Autos de Infração" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/fiscal/catalogo-infracoes')}>
              <ListItemIcon>
                <MenuBookIcon />
              </ListItemIcon>
              <ListItemText primary="Catálogo de Infrações" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Configurações */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setConfigOpen(!configOpen)}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Configurações" />
            {configOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={configOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/configuracoes/aliquotas')}>
              <ListItemIcon>
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText primary="Alíquotas" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/configuracoes/parametros')}>
              <ListItemIcon>
                <TuneIcon />
              </ListItemIcon>
              <ListItemText primary="Parâmetros" />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1 }} />

        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sistema de Gestão Tributária Municipal
          </Typography>
          <Tooltip title={mode === 'light' ? 'Modo escuro' : 'Modo claro'}>
            <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 2 }}>
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
          <Typography variant="body2">
            {user?.nome || user?.email}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
