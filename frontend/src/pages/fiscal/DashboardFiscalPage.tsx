import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Divider
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Gavel,
  AttachMoney,
  CheckCircle,
  Cancel
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { fiscalService } from '../../services/fiscalService'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c']

export function DashboardFiscalPage() {
  const [periodo, setPeriodo] = useState('30')

  const dataInicio = new Date()
  dataInicio.setDate(dataInicio.getDate() - parseInt(periodo))

  const { data: estatisticasStatus } = useQuery({
    queryKey: ['estatisticas-status', periodo],
    queryFn: () =>
      fiscalService.obterEstatisticasPorStatus({
        data_inicio: dataInicio.toISOString().split('T')[0]
      })
  })

  const { data: estatisticasValores } = useQuery({
    queryKey: ['estatisticas-valores', periodo],
    queryFn: () =>
      fiscalService.obterEstatisticasValores({
        data_inicio: dataInicio.toISOString().split('T')[0]
      })
  })

  const { data: infracoesMaisAplicadas } = useQuery({
    queryKey: ['infracoes-mais-aplicadas', periodo],
    queryFn: () =>
      fiscalService.obterInfracoesMaisAplicadas({
        limite: 10,
        data_inicio: dataInicio.toISOString().split('T')[0]
      })
  })

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor)
  }

  // Dados para o gráfico de pizza (status)
  const dadosPizza = estatisticasStatus
    ? Object.entries(estatisticasStatus).map(([status, quantidade]) => ({
        name: status,
        value: quantidade as number
      }))
    : []

  // Dados para o gráfico de barras (top 10 infrações)
  const dadosBarras = infracoesMaisAplicadas
    ? infracoesMaisAplicadas.map((inf: any) => ({
        codigo: inf.codigo,
        quantidade: inf.quantidade,
        descricao: inf.descricao?.substring(0, 30) + '...'
      }))
    : []

  // Calcular taxas
  const totalLavrado = estatisticasValores?.total_lavrado || 0
  const totalPago = estatisticasValores?.total_pago || 0
  const totalPendente = estatisticasValores?.total_pendente || 0
  const taxaArrecadacao = totalLavrado > 0 ? (totalPago / totalLavrado) * 100 : 0

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard Fiscal</Typography>
        <TextField
          select
          label="Período"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          size="small"
          sx={{ width: 200 }}
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
        {/* Total Lavrado */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Gavel sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Lavrado
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatarMoeda(totalLavrado)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Valor total de autos lavrados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Pago */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Pago
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {formatarMoeda(totalPago)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Arrecadação efetiva
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Pendente */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Pendente
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {formatarMoeda(totalPendente)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Aguardando pagamento
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Taxa de Arrecadação */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {taxaArrecadacao >= 70 ? (
                  <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ mr: 1, color: 'error.main' }} />
                )}
                <Typography variant="subtitle2" color="text.secondary">
                  Taxa de Arrecadação
                </Typography>
              </Box>
              <Typography
                variant="h4"
                color={taxaArrecadacao >= 70 ? 'success.main' : 'error.main'}
              >
                {taxaArrecadacao.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Eficiência de cobrança
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Gráfico de Pizza - Status dos Autos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Autos por Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosPizza}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de Barras - Top 10 Infrações */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Top 10 Infrações Mais Aplicadas
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosBarras}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="codigo" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Tabela de Infrações */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Detalhamento das Infrações
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Código</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Descrição</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  {infracoesMaisAplicadas?.map((infracao: any, index: number) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: '1px solid #eee',
                        backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                      }}
                    >
                      <td style={{ padding: '12px' }}>
                        <strong>{infracao.codigo}</strong>
                      </td>
                      <td style={{ padding: '12px' }}>{infracao.descricao}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <strong>{infracao.quantidade}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
