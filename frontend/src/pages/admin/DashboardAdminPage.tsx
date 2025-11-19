import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material'
import {
  People as PeopleIcon,
  Description as DocumentIcon,
  Assessment as ReportIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatters } from '@/utils/formatters'

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
  subtitle?: string
  trend?: string
}

function StatCard({ title, value, icon, color, subtitle, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" variant="overline">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ mt: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                <Typography variant="caption" color="success.main">
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: 2,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ color, fontSize: 40 }}>{icon}</Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0']

export function DashboardAdminPage() {
  // Dados simulados de estatísticas do sistema
  const sistemasStats = {
    usuarios_ativos: 45,
    usuarios_total: 52,
    sessoes_ativas: 12,
    uptime: '99.8%',
    ultima_falha: '15 dias atrás',
  }

  const performanceStats = {
    tempo_resposta_medio: '245ms',
    requisicoes_por_minuto: 1250,
    uso_cpu: 35,
    uso_memoria: 62,
    uso_disco: 48,
  }

  // Dados de uso de módulos
  const dadosUsoModulos = [
    { modulo: 'Cadastro', acessos: 1250, usuarios: 25 },
    { modulo: 'Tributário', acessos: 890, usuarios: 18 },
    { modulo: 'Fiscal', acessos: 645, usuarios: 12 },
    { modulo: 'Arrecadação', acessos: 1100, usuarios: 20 },
    { modulo: 'Portal', acessos: 2300, usuarios: 150 },
  ]

  // Dados de atividade por hora (últimas 24h)
  const dadosAtividade24h = [
    { hora: '00h', acessos: 45 },
    { hora: '02h', acessos: 32 },
    { hora: '04h', acessos: 28 },
    { hora: '06h', acessos: 55 },
    { hora: '08h', acessos: 180 },
    { hora: '10h', acessos: 245 },
    { hora: '12h', acessos: 210 },
    { hora: '14h', acessos: 280 },
    { hora: '16h', acessos: 195 },
    { hora: '18h', acessos: 125 },
    { hora: '20h', acessos: 85 },
    { hora: '22h', acessos: 62 },
  ]

  // Dados de distribuição de perfis
  const dadosPerfis = [
    { name: 'Administradores', value: 5, color: '#f44336' },
    { name: 'Fiscais', value: 12, color: '#ff9800' },
    { name: 'Atendentes', value: 15, color: '#2196f3' },
    { name: 'Contribuintes', value: 850, color: '#4caf50' },
  ]

  // Alertas e avisos recentes
  const alertasRecentes = [
    {
      tipo: 'warning',
      mensagem: 'Backup agendado para hoje às 23:00',
      timestamp: '2024-11-19 14:30',
    },
    {
      tipo: 'info',
      mensagem: '3 usuários aguardando aprovação',
      timestamp: '2024-11-19 12:15',
    },
    {
      tipo: 'success',
      mensagem: 'Atualização do sistema concluída com sucesso',
      timestamp: '2024-11-18 22:45',
    },
  ]

  // Logs de auditoria recentes
  const logsRecentes = [
    { acao: 'Login bem-sucedido', usuario: 'admin@tributec.com', timestamp: 'Há 5 min' },
    { acao: 'Criação de usuário', usuario: 'gestor@tributec.com', timestamp: 'Há 12 min' },
    { acao: 'Alteração de permissão', usuario: 'admin@tributec.com', timestamp: 'Há 25 min' },
    { acao: 'Exportação de relatório', usuario: 'fiscal@tributec.com', timestamp: 'Há 1h' },
    { acao: 'Atualização de parâmetro', usuario: 'admin@tributec.com', timestamp: 'Há 2h' },
  ]

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard Administrativo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visão geral do sistema e métricas de desempenho
        </Typography>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Usuários Ativos"
            value={`${sistemasStats.usuarios_ativos}/${sistemasStats.usuarios_total}`}
            icon={<PeopleIcon />}
            color="#2196f3"
            subtitle="Usuários online"
            trend="+8% esta semana"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sessões Ativas"
            value={sistemasStats.sessoes_ativas.toString()}
            icon={<SecurityIcon />}
            color="#4caf50"
            subtitle="Conexões simultâneas"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Uptime"
            value={sistemasStats.uptime}
            icon={<SpeedIcon />}
            color="#ff9800"
            subtitle={`Última falha: ${sistemasStats.ultima_falha}`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tempo Resposta"
            value={performanceStats.tempo_resposta_medio}
            icon={<TrendingUpIcon />}
            color="#9c27b0"
            subtitle={`${performanceStats.requisicoes_por_minuto} req/min`}
          />
        </Grid>
      </Grid>

      {/* Alertas */}
      {alertasRecentes.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {alertasRecentes.map((alerta, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Alert
                severity={alerta.tipo as any}
                icon={
                  alerta.tipo === 'warning' ? (
                    <WarningIcon />
                  ) : alerta.tipo === 'success' ? (
                    <CheckIcon />
                  ) : undefined
                }
              >
                <Typography variant="body2" fontWeight="medium">
                  {alerta.mensagem}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {alerta.timestamp}
                </Typography>
              </Alert>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Uso de Recursos do Sistema */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Uso de Recursos
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">CPU</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {performanceStats.uso_cpu}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={performanceStats.uso_cpu}
                  color={performanceStats.uso_cpu > 80 ? 'error' : 'primary'}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Memória</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {performanceStats.uso_memoria}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={performanceStats.uso_memoria}
                  color={performanceStats.uso_memoria > 80 ? 'warning' : 'primary'}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Disco</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {performanceStats.uso_disco}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={performanceStats.uso_disco}
                  color="primary"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribuição de Perfis */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribuição de Perfis
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dadosPerfis}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPerfis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Logs de Auditoria Recentes */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Auditoria Recente
              </Typography>
              <List dense>
                {logsRecentes.map((log, index) => (
                  <ListItem key={index} divider={index < logsRecentes.length - 1}>
                    <ListItemIcon>
                      <DocumentIcon color="action" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={log.acao}
                      secondary={
                        <>
                          <Typography component="span" variant="caption" color="text.secondary">
                            {log.usuario}
                          </Typography>
                          {' • '}
                          <Typography component="span" variant="caption" color="text.secondary">
                            {log.timestamp}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Atividade 24h */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Atividade nas Últimas 24 Horas
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosAtividade24h}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="acessos"
                    name="Acessos"
                    stroke="#2196f3"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Uso de Módulos */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Uso de Módulos
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosUsoModulos} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="modulo" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="acessos" name="Acessos" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
