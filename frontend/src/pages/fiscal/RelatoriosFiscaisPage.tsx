import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
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
  Divider,
  Card,
  CardContent
} from '@mui/material'
import { FileDownload, Assessment } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { fiscalService } from '../../services/fiscalService'

export function RelatoriosFiscaisPage() {
  const [tipoRelatorio, setTipoRelatorio] = useState('infracoes')
  const [periodo, setPeriodo] = useState('30')

  const dataInicio = new Date()
  dataInicio.setDate(dataInicio.getDate() - parseInt(periodo))

  const { data: infracoesMaisAplicadas } = useQuery({
    queryKey: ['infracoes-mais-aplicadas', periodo],
    queryFn: () =>
      fiscalService.obterInfracoesMaisAplicadas({
        limite: 20,
        data_inicio: dataInicio.toISOString().split('T')[0]
      }),
    enabled: tipoRelatorio === 'infracoes'
  })

  const { data: estatisticasStatus } = useQuery({
    queryKey: ['estatisticas-status', periodo],
    queryFn: () =>
      fiscalService.obterEstatisticasPorStatus({
        data_inicio: dataInicio.toISOString().split('T')[0]
      }),
    enabled: tipoRelatorio === 'status'
  })

  const { data: estatisticasValores } = useQuery({
    queryKey: ['estatisticas-valores', periodo],
    queryFn: () =>
      fiscalService.obterEstatisticasValores({
        data_inicio: dataInicio.toISOString().split('T')[0]
      })
  })

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const handleExportar = () => {
    let csvContent = ''
    let filename = ''

    if (tipoRelatorio === 'infracoes' && infracoesMaisAplicadas) {
      csvContent = [
        ['Código', 'Descrição', 'Quantidade'].join(';'),
        ...infracoesMaisAplicadas.map((inf: any) =>
          [inf.codigo, inf.descricao, inf.quantidade].join(';')
        )
      ].join('\n')
      filename = `relatorio-infracoes-${new Date().toISOString().split('T')[0]}.csv`
    } else if (tipoRelatorio === 'status' && estatisticasStatus) {
      csvContent = [
        ['Status', 'Quantidade'].join(';'),
        ...Object.entries(estatisticasStatus).map(([status, qtd]) => [status, qtd].join(';'))
      ].join('\n')
      filename = `relatorio-status-${new Date().toISOString().split('T')[0]}.csv`
    }

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Relatórios Fiscais</Typography>
        <Button variant="contained" startIcon={<FileDownload />} onClick={handleExportar}>
          Exportar Relatório
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Tipo de Relatório"
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value)}
            >
              <MenuItem value="infracoes">Infrações Mais Aplicadas</MenuItem>
              <MenuItem value="status">Autos por Status</MenuItem>
              <MenuItem value="arrecadacao">Arrecadação</MenuItem>
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
      </Paper>

      {/* Resumo Financeiro */}
      {tipoRelatorio === 'arrecadacao' && estatisticasValores && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Lavrado
                </Typography>
                <Typography variant="h4" color="primary">
                  {formatarMoeda(estatisticasValores.total_lavrado)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Pago
                </Typography>
                <Typography variant="h4" color="success.main">
                  {formatarMoeda(estatisticasValores.total_pago)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Pendente
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {formatarMoeda(estatisticasValores.total_pendente)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabela de Infrações */}
      {tipoRelatorio === 'infracoes' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Infrações Mais Aplicadas
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Quantidade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {infracoesMaisAplicadas?.map((infracao: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <strong>{infracao.codigo}</strong>
                    </TableCell>
                    <TableCell>{infracao.descricao}</TableCell>
                    <TableCell align="right">
                      <strong>{infracao.quantidade}</strong>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tabela de Status */}
      {tipoRelatorio === 'status' && estatisticasStatus && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Distribuição de Autos por Status
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Quantidade</TableCell>
                  <TableCell align="right">Percentual</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(estatisticasStatus).map(([status, quantidade]) => {
                  const total = Object.values(estatisticasStatus).reduce(
                    (acc: number, val: any) => acc + val,
                    0
                  )
                  const percentual = ((quantidade as number) / total) * 100

                  return (
                    <TableRow key={status}>
                      <TableCell>
                        <strong>{status}</strong>
                      </TableCell>
                      <TableCell align="right">{quantidade as number}</TableCell>
                      <TableCell align="right">{percentual.toFixed(1)}%</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Relatório de Arrecadação */}
      {tipoRelatorio === 'arrecadacao' && estatisticasValores && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Análise de Arrecadação
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Resumo do Período
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  No período selecionado, foram lavrados autos no valor total de{' '}
                  <strong>{formatarMoeda(estatisticasValores.total_lavrado)}</strong>, dos quais{' '}
                  <strong>{formatarMoeda(estatisticasValores.total_pago)}</strong> foram pagos,
                  resultando em uma taxa de arrecadação de{' '}
                  <strong>
                    {(
                      (estatisticasValores.total_pago / estatisticasValores.total_lavrado) *
                      100
                    ).toFixed(1)}
                    %
                  </strong>
                  .
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Valor pendente de arrecadação:{' '}
                  <strong style={{ color: '#ff9800' }}>
                    {formatarMoeda(estatisticasValores.total_pendente)}
                  </strong>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}
    </Box>
  )
}
