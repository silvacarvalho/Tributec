import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Paper,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import { tributarioService } from '@/services/tributarioService'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { formatters } from '@/utils/formatters'

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
  subtitle?: string
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
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

const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0']

const TRIBUTO_COLORS: Record<string, string> = {
  IPTU: '#2196f3',
  ITBI: '#4caf50',
  ISSQN: '#ff9800',
  OUTROS: '#9c27b0',
}

export function DashboardArrecadacaoPage() {
  const [periodo, setPeriodo] = useState('30')

  // Calcula data de início com base no período
  const getDataInicio = () => {
    const hoje = new Date()
    const diasAtras = parseInt(periodo)
    const dataInicio = new Date(hoje)
    dataInicio.setDate(hoje.getDate() - diasAtras)
    return dataInicio.toISOString().split('T')[0]
  }

  // Busca dados de arrecadação
  const { data: arrecadacao, isLoading, error } = useQuery({
    queryKey: ['arrecadacao-dashboard', periodo],
    queryFn: () =>
      tributarioService.relatorioArrecadacao({
        data_inicio: getDataInicio(),
        data_fim: new Date().toISOString().split('T')[0],
      }),
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorAlert message="Erro ao carregar dados de arrecadação" />

  // Dados simulados para demonstração (em produção viriam do backend)
  const totalArrecadado = 1250000
  const totalPendente = 480000
  const totalVencido = 125000
  const taxaArrecadacao = ((totalArrecadado / (totalArrecadado + totalPendente)) * 100).toFixed(1)

  // Dados de arrecadação por período (últimos 12 meses/períodos)
  const dadosArrecadacaoPeriodo = [
    { mes: 'Jan', arrecadado: 95000, pendente: 45000 },
    { mes: 'Fev', arrecadado: 105000, pendente: 38000 },
    { mes: 'Mar', arrecadado: 125000, pendente: 42000 },
    { mes: 'Abr', arrecadado: 98000, pendente: 51000 },
    { mes: 'Mai', arrecadado: 110000, pendente: 47000 },
    { mes: 'Jun', arrecadado: 132000, pendente: 35000 },
    { mes: 'Jul', arrecadado: 115000, pendente: 39000 },
    { mes: 'Ago', arrecadado: 128000, pendente: 41000 },
    { mes: 'Set', arrecadado: 95000, pendente: 48000 },
    { mes: 'Out', arrecadado: 118000, pendente: 44000 },
    { mes: 'Nov', arrecadado: 142000, pendente: 36000 },
    { mes: 'Dez', arrecadado: 87000, pendente: 52000 },
  ]

  // Dados de arrecadação por tributo
  const dadosPorTributo = [
    { name: 'IPTU', value: 680000, color: TRIBUTO_COLORS.IPTU },
    { name: 'ITBI', value: 250000, color: TRIBUTO_COLORS.ITBI },
    { name: 'ISSQN', value: 285000, color: TRIBUTO_COLORS.ISSQN },
    { name: 'Outros', value: 35000, color: TRIBUTO_COLORS.OUTROS },
  ]

  // Dados de status de débitos
  const dadosStatus = [
    { name: 'Em Dia', value: 65, color: '#4caf50' },
    { name: 'Vencidos', value: 20, color: '#f44336' },
    { name: 'Parcelados', value: 15, color: '#ff9800' },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard de Arrecadação
        </Typography>

        <TextField
          select
          label="Período"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          sx={{ width: 200 }}
          size="small"
        >
          <MenuItem value="7">Últimos 7 dias</MenuItem>
          <MenuItem value="15">Últimos 15 dias</MenuItem>
          <MenuItem value="30">Últimos 30 dias</MenuItem>
          <MenuItem value="60">Últimos 60 dias</MenuItem>
          <MenuItem value="90">Últimos 90 dias</MenuItem>
          <MenuItem value="180">Últimos 6 meses</MenuItem>
          <MenuItem value="365">Último ano</MenuItem>
        </TextField>
      </Box>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Arrecadado"
            value={formatters.currency(totalArrecadado)}
            icon={<CheckCircleIcon />}
            color="#4caf50"
            subtitle={`${taxaArrecadacao}% de taxa de arrecadação`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pendente"
            value={formatters.currency(totalPendente)}
            icon={<AccessTimeIcon />}
            color="#ff9800"
            subtitle="Débitos a receber"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Vencidos"
            value={formatters.currency(totalVencido)}
            icon={<ErrorIcon />}
            color="#f44336"
            subtitle="Requer atenção"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Projeção Mensal"
            value={formatters.currency(totalArrecadado * 1.15)}
            icon={<TrendingUpIcon />}
            color="#2196f3"
            subtitle="+15% sobre média"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Gráfico de Arrecadação por Período */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Arrecadação x Pendente (Últimos 12 Meses)
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={dadosArrecadacaoPeriodo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => formatters.currency(value)}
                    labelStyle={{ color: '#666' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="arrecadado"
                    name="Arrecadado"
                    stackId="1"
                    stroke="#4caf50"
                    fill="#4caf50"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="pendente"
                    name="Pendente"
                    stackId="2"
                    stroke="#ff9800"
                    fill="#ff9800"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Status de Débitos */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status de Débitos
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={dadosStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Arrecadação por Tributo */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Arrecadação por Tributo
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosPorTributo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => formatters.currency(value)}
                    labelStyle={{ color: '#666' }}
                  />
                  <Bar dataKey="value" name="Arrecadado" radius={[8, 8, 0, 0]}>
                    {dadosPorTributo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabela de Performance */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance por Tributo
              </Typography>
              <Box sx={{ mt: 2 }}>
                {dadosPorTributo.map((tributo, index) => {
                  const total = dadosPorTributo.reduce((sum, t) => sum + t.value, 0)
                  const percentual = ((tributo.value / total) * 100).toFixed(1)
                  return (
                    <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: tributo.color,
                            }}
                          />
                          <Typography variant="body1" fontWeight="medium">
                            {tributo.name}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" color="primary">
                            {formatters.currency(tributo.value)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {percentual}% do total
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  )
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
