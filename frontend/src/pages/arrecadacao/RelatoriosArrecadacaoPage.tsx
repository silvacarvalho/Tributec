import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material'
import {
  GetApp as DownloadIcon,
  Assessment as ReportIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatters } from '@/utils/formatters'

const COLORS = ['#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4']

export function RelatoriosArrecadacaoPage() {
  const [tipoRelatorio, setTipoRelatorio] = useState('arrecadacao-tributo')
  const [periodo, setPeriodo] = useState('30')

  // Dados de exemplo para Arrecadação por Tributo
  const dadosArrecadacaoTributo = [
    { tributo: 'IPTU', arrecadado: 680000, pendente: 125000, meta: 750000 },
    { tributo: 'ITBI', arrecadado: 250000, pendente: 45000, meta: 280000 },
    { tributo: 'ISSQN', arrecadado: 285000, pendente: 98000, meta: 350000 },
    { tributo: 'Outros', arrecadado: 35000, pendente: 12000, meta: 45000 },
  ]

  // Dados de exemplo para Evolução Mensal
  const dadosEvolucaoMensal = [
    { mes: 'Jan', arrecadado: 95000, meta: 100000 },
    { mes: 'Fev', arrecadado: 105000, meta: 100000 },
    { mes: 'Mar', arrecadado: 125000, meta: 110000 },
    { mes: 'Abr', arrecadado: 98000, meta: 105000 },
    { mes: 'Mai', arrecadado: 110000, meta: 105000 },
    { mes: 'Jun', arrecadado: 132000, meta: 115000 },
    { mes: 'Jul', arrecadado: 115000, meta: 110000 },
    { mes: 'Ago', arrecadado: 128000, meta: 115000 },
    { mes: 'Set', arrecadado: 95000, meta: 105000 },
    { mes: 'Out', arrecadado: 118000, meta: 110000 },
    { mes: 'Nov', arrecadado: 142000, meta: 120000 },
    { mes: 'Dez', arrecadado: 87000, meta: 100000 },
  ]

  // Dados de exemplo para Taxa de Recuperação
  const dadosTaxaRecuperacao = [
    { faixa: '0-30 dias', recuperado: 85, nao_recuperado: 15 },
    { faixa: '31-60 dias', recuperado: 65, nao_recuperado: 35 },
    { faixa: '61-90 dias', recuperado: 45, nao_recuperado: 55 },
    { faixa: '91-180 dias', recuperado: 28, nao_recuperado: 72 },
    { faixa: '181-365 dias', recuperado: 15, nao_recuperado: 85 },
    { faixa: '> 365 dias', recuperado: 5, nao_recuperado: 95 },
  ]

  // Dados de exemplo para Análise de Inadimplência
  const dadosInadimplencia = [
    { categoria: 'Em Dia', value: 65, color: '#4caf50' },
    { categoria: 'Vencidos até 30 dias', value: 15, color: '#ff9800' },
    { categoria: 'Vencidos 31-90 dias', value: 10, color: '#f44336' },
    { categoria: 'Vencidos > 90 dias', value: 10, color: '#d32f2f' },
  ]

  const handleExportar = () => {
    let csvContent = ''
    let filename = ''

    switch (tipoRelatorio) {
      case 'arrecadacao-tributo':
        csvContent = [
          ['Tributo', 'Arrecadado', 'Pendente', 'Meta', '% Meta'].join(';'),
          ...dadosArrecadacaoTributo.map((item) =>
            [
              item.tributo,
              item.arrecadado.toFixed(2),
              item.pendente.toFixed(2),
              item.meta.toFixed(2),
              ((item.arrecadado / item.meta) * 100).toFixed(1) + '%',
            ].join(';')
          ),
        ].join('\n')
        filename = 'relatorio_arrecadacao_tributo'
        break

      case 'evolucao-mensal':
        csvContent = [
          ['Mês', 'Arrecadado', 'Meta', 'Variação'].join(';'),
          ...dadosEvolucaoMensal.map((item) =>
            [
              item.mes,
              item.arrecadado.toFixed(2),
              item.meta.toFixed(2),
              ((item.arrecadado - item.meta) / item.meta * 100).toFixed(1) + '%',
            ].join(';')
          ),
        ].join('\n')
        filename = 'relatorio_evolucao_mensal'
        break

      case 'taxa-recuperacao':
        csvContent = [
          ['Faixa', 'Recuperado %', 'Não Recuperado %'].join(';'),
          ...dadosTaxaRecuperacao.map((item) =>
            [item.faixa, item.recuperado + '%', item.nao_recuperado + '%'].join(';')
          ),
        ].join('\n')
        filename = 'relatorio_taxa_recuperacao'
        break

      case 'inadimplencia':
        csvContent = [
          ['Categoria', 'Percentual'].join(';'),
          ...dadosInadimplencia.map((item) => [item.categoria, item.value + '%'].join(';')),
        ].join('\n')
        filename = 'relatorio_inadimplencia'
        break
    }

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const renderRelatorio = () => {
    switch (tipoRelatorio) {
      case 'arrecadacao-tributo':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Arrecadação x Meta por Tributo
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dadosArrecadacaoTributo}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tributo" />
                      <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value: number) => formatters.currency(value)}
                        labelStyle={{ color: '#666' }}
                      />
                      <Legend />
                      <Bar dataKey="arrecadado" name="Arrecadado" fill="#4caf50" />
                      <Bar dataKey="meta" name="Meta" fill="#2196f3" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Detalhamento por Tributo
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Tributo</TableCell>
                          <TableCell align="right">Arrecadado</TableCell>
                          <TableCell align="right">Pendente</TableCell>
                          <TableCell align="right">Meta</TableCell>
                          <TableCell align="right">% Meta</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dadosArrecadacaoTributo.map((row) => {
                          const percentualMeta = (row.arrecadado / row.meta) * 100
                          return (
                            <TableRow key={row.tributo}>
                              <TableCell>{row.tributo}</TableCell>
                              <TableCell align="right">
                                {formatters.currency(row.arrecadado)}
                              </TableCell>
                              <TableCell align="right">
                                {formatters.currency(row.pendente)}
                              </TableCell>
                              <TableCell align="right">{formatters.currency(row.meta)}</TableCell>
                              <TableCell
                                align="right"
                                sx={{
                                  color: percentualMeta >= 100 ? 'success.main' : 'error.main',
                                  fontWeight: 'bold',
                                }}
                              >
                                {percentualMeta.toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )

      case 'evolucao-mensal':
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Evolução Mensal de Arrecadação
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dadosEvolucaoMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => formatters.currency(value)}
                    labelStyle={{ color: '#666' }}
                  />
                  <Legend />
                  <Bar dataKey="arrecadado" name="Arrecadado" fill="#4caf50" />
                  <Bar dataKey="meta" name="Meta" fill="#ff9800" />
                </BarChart>
              </ResponsiveContainer>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" gutterBottom>
                Análise de Desempenho
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Mês</TableCell>
                      <TableCell align="right">Arrecadado</TableCell>
                      <TableCell align="right">Meta</TableCell>
                      <TableCell align="right">Variação</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dadosEvolucaoMensal.map((row) => {
                      const variacao = ((row.arrecadado - row.meta) / row.meta) * 100
                      return (
                        <TableRow key={row.mes}>
                          <TableCell>{row.mes}</TableCell>
                          <TableCell align="right">{formatters.currency(row.arrecadado)}</TableCell>
                          <TableCell align="right">{formatters.currency(row.meta)}</TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: variacao >= 0 ? 'success.main' : 'error.main' }}
                          >
                            {variacao >= 0 ? '+' : ''}
                            {variacao.toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            {variacao >= 0 ? '✅ Acima' : '⚠️ Abaixo'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )

      case 'taxa-recuperacao':
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Taxa de Recuperação de Débitos por Antiguidade
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dadosTaxaRecuperacao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="faixa" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="recuperado" name="Recuperado (%)" fill="#4caf50" stackId="a" />
                  <Bar
                    dataKey="nao_recuperado"
                    name="Não Recuperado (%)"
                    fill="#f44336"
                    stackId="a"
                  />
                </BarChart>
              </ResponsiveContainer>

              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Análise:</strong>
                </Typography>
                <Typography variant="body2">
                  • Débitos com até 30 dias têm 85% de taxa de recuperação
                  <br />
                  • A taxa cai drasticamente após 90 dias (apenas 28%)
                  <br />• Recomenda-se ação imediata para débitos recém-vencidos
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )

      case 'inadimplencia':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Distribuição de Inadimplência
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={dadosInadimplencia}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ categoria, value }) => `${categoria}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dadosInadimplencia.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Detalhamento
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {dadosInadimplencia.map((item, index) => (
                      <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                backgroundColor: item.color,
                              }}
                            />
                            <Typography variant="body2">{item.categoria}</Typography>
                          </Box>
                          <Typography variant="h6" sx={{ color: item.color }}>
                            {item.value}%
                          </Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Box>

                  <Box sx={{ mt: 3, p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                      <strong>Alerta:</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      35% dos débitos estão vencidos. Considere intensificar as ações de cobrança
                      para reduzir a inadimplência.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )

      default:
        return null
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Relatórios de Arrecadação
        </Typography>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportar}>
          Exportar CSV
        </Button>
      </Box>

      {/* Seletores */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Tipo de Relatório"
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value)}
              InputProps={{
                startAdornment: <ReportIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            >
              <MenuItem value="arrecadacao-tributo">Arrecadação por Tributo</MenuItem>
              <MenuItem value="evolucao-mensal">Evolução Mensal</MenuItem>
              <MenuItem value="taxa-recuperacao">Taxa de Recuperação</MenuItem>
              <MenuItem value="inadimplencia">Análise de Inadimplência</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Período"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            >
              <MenuItem value="7">Últimos 7 dias</MenuItem>
              <MenuItem value="15">Últimos 15 dias</MenuItem>
              <MenuItem value="30">Últimos 30 dias</MenuItem>
              <MenuItem value="60">Últimos 60 dias</MenuItem>
              <MenuItem value="90">Últimos 90 dias</MenuItem>
              <MenuItem value="180">Últimos 6 meses</MenuItem>
              <MenuItem value="365">Último ano</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Relatório Selecionado */}
      {renderRelatorio()}
    </Box>
  )
}
