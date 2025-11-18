import { Box, Typography, Grid, Card, CardContent } from '@mui/material'
import {
  TrendingUp,
  Assignment,
  AccountBalance,
  Receipt,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { tributarioService } from '@/services/tributarioService'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatters } from '@/utils/formatters'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" component="div">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const currentYear = new Date().getFullYear()
  const startDate = `${currentYear}-01-01`
  const endDate = `${currentYear}-12-31`

  // Buscar dados de arrecadação
  const { data: arrecadacao, isLoading: loadingArrecadacao } = useQuery({
    queryKey: ['relatorio-arrecadacao', startDate, endDate],
    queryFn: () =>
      tributarioService.relatorioArrecadacao({
        data_inicio: startDate,
        data_fim: endDate,
      }),
  })

  // Buscar dados de inadimplência
  const { data: inadimplencia, isLoading: loadingInadimplencia } = useQuery({
    queryKey: ['relatorio-inadimplencia'],
    queryFn: () =>
      tributarioService.relatorioInadimplencia({
        aging_buckets: true,
      }),
  })

  // Dados para gráfico de pizza - Arrecadação por tributo
  const dadosPizza = arrecadacao
    ? [
        { name: 'IPTU', value: arrecadacao.totais.iptu },
        { name: 'ITBI', value: arrecadacao.totais.itbi },
        { name: 'ISSQN', value: arrecadacao.totais.issqn },
      ]
    : []

  // Dados para gráfico de barras - Arrecadação mensal
  const dadosBarras = arrecadacao?.por_mes || []

  // Dados para gráfico de linhas - Aging buckets
  const dadosAging = inadimplencia?.aging_buckets
    ? [
        { faixa: '0-30 dias', valor: inadimplencia.aging_buckets['0-30'].valor },
        { faixa: '31-60 dias', valor: inadimplencia.aging_buckets['31-60'].valor },
        { faixa: '61-90 dias', valor: inadimplencia.aging_buckets['61-90'].valor },
        { faixa: '90+ dias', valor: inadimplencia.aging_buckets['90+'].valor },
      ]
    : []

  if (loadingArrecadacao || loadingInadimplencia) {
    return <LoadingSpinner message="Carregando dashboard..." />
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Visão geral da arrecadação e inadimplência - Ano {currentYear}
      </Typography>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Arrecadação Total"
            value={formatters.currency(arrecadacao?.totais.total_geral || 0)}
            icon={<TrendingUp sx={{ color: '#0088FE' }} />}
            color="#0088FE"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="IPTU"
            value={formatters.currency(arrecadacao?.totais.iptu || 0)}
            icon={<AccountBalance sx={{ color: '#00C49F' }} />}
            color="#00C49F"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inadimplentes"
            value={inadimplencia?.total_inadimplentes.toString() || '0'}
            icon={<Assignment sx={{ color: '#FFBB28' }} />}
            color="#FFBB28"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Valor Inadimplente"
            value={formatters.currency(inadimplencia?.valor_total || 0)}
            icon={<Receipt sx={{ color: '#FF8042' }} />}
            color="#FF8042"
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Gráfico de Barras - Arrecadação Mensal */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Arrecadação Mensal
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosBarras}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatters.currency(Number(value))} />
                  <Legend />
                  <Bar dataKey="valor" fill="#0088FE" name="Arrecadação" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Pizza - Arrecadação por Tributo */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Arrecadação por Tributo
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosPizza}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatters.currency(entry.value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPizza.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatters.currency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Linhas - Aging de Inadimplência */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inadimplência por Faixa de Atraso (Aging)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosAging}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="faixa" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatters.currency(Number(value))} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#FF8042"
                    strokeWidth={2}
                    name="Valor Inadimplente"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabela de Top Devedores */}
        {inadimplencia?.top_devedores && inadimplencia.top_devedores.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Maiores Devedores
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #ddd' }}>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Nome</th>
                        <th style={{ textAlign: 'right', padding: '12px' }}>Valor Total</th>
                        <th style={{ textAlign: 'center', padding: '12px' }}>Qtd Débitos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inadimplencia.top_devedores.slice(0, 10).map((devedor) => (
                        <tr
                          key={devedor.contribuinte_id}
                          style={{ borderBottom: '1px solid #eee' }}
                        >
                          <td style={{ padding: '12px' }}>{devedor.nome}</td>
                          <td style={{ textAlign: 'right', padding: '12px' }}>
                            {formatters.currency(devedor.valor_total)}
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px' }}>
                            {devedor.quantidade_debitos}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
