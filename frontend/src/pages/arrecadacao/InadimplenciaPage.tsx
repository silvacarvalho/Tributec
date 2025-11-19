import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Grid,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
} from '@mui/material'
import {
  Email as EmailIcon,
  Print as PrintIcon,
  Phone as PhoneIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { formatters } from '@/utils/formatters'

interface Inadimplente {
  id: string
  contribuinte_nome: string
  contribuinte_cpf_cnpj: string
  email?: string
  telefone?: string
  total_debitos: number
  valor_total_vencido: number
  quantidade_debitos: number
  dias_mais_antigo: number
  ultima_acao_cobranca?: string
  data_ultima_acao?: string
  score_risco: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO'
}

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  color: string
  icon: React.ReactNode
}

function StatCard({ title, value, subtitle, color, icon }: StatCardProps) {
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

export function InadimplenciaPage() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [scoreFilter, setScoreFilter] = useState<string>('')
  const [periodoFilter, setPeriodoFilter] = useState('90')

  // Dados simulados de inadimplentes
  const inadimplentes: Inadimplente[] = [
    {
      id: '1',
      contribuinte_nome: 'João Silva Santos',
      contribuinte_cpf_cnpj: '123.456.789-00',
      email: 'joao.silva@email.com',
      telefone: '(11) 98765-4321',
      total_debitos: 3,
      valor_total_vencido: 12500.0,
      quantidade_debitos: 3,
      dias_mais_antigo: 450,
      ultima_acao_cobranca: 'Email enviado',
      data_ultima_acao: '2024-10-15',
      score_risco: 'CRITICO',
    },
    {
      id: '2',
      contribuinte_nome: 'Maria Oliveira Costa',
      contribuinte_cpf_cnpj: '987.654.321-00',
      email: 'maria.costa@email.com',
      telefone: '(11) 91234-5678',
      total_debitos: 1,
      valor_total_vencido: 2800.0,
      quantidade_debitos: 1,
      dias_mais_antigo: 120,
      ultima_acao_cobranca: 'Carta enviada',
      data_ultima_acao: '2024-09-20',
      score_risco: 'MEDIO',
    },
    {
      id: '3',
      contribuinte_nome: 'Empresa ABC Ltda',
      contribuinte_cpf_cnpj: '12.345.678/0001-90',
      email: 'contato@empresaabc.com.br',
      telefone: '(11) 3456-7890',
      total_debitos: 5,
      valor_total_vencido: 45000.0,
      quantidade_debitos: 5,
      dias_mais_antigo: 720,
      ultima_acao_cobranca: 'Notificação judicial',
      data_ultima_acao: '2024-08-10',
      score_risco: 'CRITICO',
    },
    {
      id: '4',
      contribuinte_nome: 'Pedro Alves Lima',
      contribuinte_cpf_cnpj: '456.789.123-00',
      total_debitos: 2,
      valor_total_vencido: 6500.0,
      quantidade_debitos: 2,
      dias_mais_antigo: 180,
      score_risco: 'ALTO',
    },
    {
      id: '5',
      contribuinte_nome: 'Ana Paula Ferreira',
      contribuinte_cpf_cnpj: '321.654.987-00',
      email: 'ana.ferreira@email.com',
      total_debitos: 1,
      valor_total_vencido: 1200.0,
      quantidade_debitos: 1,
      dias_mais_antigo: 45,
      ultima_acao_cobranca: 'Email enviado',
      data_ultima_acao: '2024-11-01',
      score_risco: 'BAIXO',
    },
  ]

  // Filtragem
  let inadimplementesFiltrados = inadimplentes
  if (scoreFilter) {
    inadimplementesFiltrados = inadimplementesFiltrados.filter((i) => i.score_risco === scoreFilter)
  }
  if (periodoFilter) {
    const dias = parseInt(periodoFilter)
    inadimplementesFiltrados = inadimplementesFiltrados.filter((i) => i.dias_mais_antigo >= dias)
  }

  // Paginação
  const inadimplementesPaginados = inadimplementesFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // Totalizadores
  const totalInadimplentes = inadimplementesFiltrados.length
  const totalValorVencido = inadimplementesFiltrados.reduce((sum, i) => sum + i.valor_total_vencido, 0)
  const totalDebitos = inadimplementesFiltrados.reduce((sum, i) => sum + i.quantidade_debitos, 0)
  const ticketMedio = totalValorVencido / totalInadimplentes || 0

  const getScoreColor = (score: Inadimplente['score_risco']) => {
    const colors: Record<Inadimplente['score_risco'], 'success' | 'warning' | 'error'> = {
      BAIXO: 'success',
      MEDIO: 'warning',
      ALTO: 'error',
      CRITICO: 'error',
    }
    return colors[score]
  }

  const getScoreLabel = (score: Inadimplente['score_risco']) => {
    const labels: Record<Inadimplente['score_risco'], string> = {
      BAIXO: 'Baixo',
      MEDIO: 'Médio',
      ALTO: 'Alto',
      CRITICO: 'Crítico',
    }
    return labels[score]
  }

  const getScoreProgress = (score: Inadimplente['score_risco']) => {
    const progress: Record<Inadimplente['score_risco'], number> = {
      BAIXO: 25,
      MEDIO: 50,
      ALTO: 75,
      CRITICO: 100,
    }
    return progress[score]
  }

  const handleExportar = () => {
    const csvContent = [
      [
        'Contribuinte',
        'CPF/CNPJ',
        'Email',
        'Telefone',
        'Qtd Débitos',
        'Valor Total Vencido',
        'Dias Mais Antigo',
        'Última Ação',
        'Data Última Ação',
        'Score',
      ].join(';'),
      ...inadimplementesFiltrados.map((i) =>
        [
          i.contribuinte_nome,
          i.contribuinte_cpf_cnpj,
          i.email || '',
          i.telefone || '',
          i.quantidade_debitos,
          i.valor_total_vencido.toFixed(2),
          i.dias_mais_antigo,
          i.ultima_acao_cobranca || '',
          i.data_ultima_acao ? formatters.date(i.data_ultima_acao) : '',
          getScoreLabel(i.score_risco),
        ].join(';')
      ),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `inadimplencia_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestão de Inadimplência
        </Typography>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportar}>
          Exportar
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Importante:</strong> Esta página mostra contribuintes com débitos vencidos que
          necessitam de ações de cobrança. Utilize as ferramentas de comunicação para reduzir a
          inadimplência.
        </Typography>
      </Alert>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Inadimplentes"
            value={totalInadimplentes.toString()}
            subtitle="Contribuintes"
            color="#f44336"
            icon={<WarningIcon />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Valor Total Vencido"
            value={formatters.currency(totalValorVencido)}
            subtitle="A recuperar"
            color="#ff9800"
            icon={<TrendingUpIcon />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Débitos"
            value={totalDebitos.toString()}
            subtitle="Lançamentos vencidos"
            color="#9c27b0"
            icon={<WarningIcon />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ticket Médio"
            value={formatters.currency(ticketMedio)}
            subtitle="Por inadimplente"
            color="#2196f3"
            icon={<TrendingUpIcon />}
          />
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Score de Risco"
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="BAIXO">Baixo</MenuItem>
              <MenuItem value="MEDIO">Médio</MenuItem>
              <MenuItem value="ALTO">Alto</MenuItem>
              <MenuItem value="CRITICO">Crítico</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Período de Inadimplência"
              value={periodoFilter}
              onChange={(e) => setPeriodoFilter(e.target.value)}
            >
              <MenuItem value="30">Mais de 30 dias</MenuItem>
              <MenuItem value="60">Mais de 60 dias</MenuItem>
              <MenuItem value="90">Mais de 90 dias</MenuItem>
              <MenuItem value="180">Mais de 6 meses</MenuItem>
              <MenuItem value="365">Mais de 1 ano</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Tabela de Inadimplentes */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contribuinte</TableCell>
                <TableCell>Contato</TableCell>
                <TableCell align="right">Débitos</TableCell>
                <TableCell align="right">Valor Vencido</TableCell>
                <TableCell align="center">Dias Mais Antigo</TableCell>
                <TableCell>Última Ação</TableCell>
                <TableCell>Score de Risco</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inadimplementesPaginados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Nenhum inadimplente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                inadimplementesPaginados.map((inadimplente) => (
                  <TableRow key={inadimplente.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {inadimplente.contribuinte_nome}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatters.cpfCnpj(inadimplente.contribuinte_cpf_cnpj)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {inadimplente.email && (
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          📧 {inadimplente.email}
                        </Typography>
                      )}
                      {inadimplente.telefone && (
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          📞 {inadimplente.telefone}
                        </Typography>
                      )}
                      {!inadimplente.email && !inadimplente.telefone && (
                        <Typography variant="caption" color="text.secondary">
                          Sem contato
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={inadimplente.quantidade_debitos} size="small" color="primary" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="error">
                        {formatters.currency(inadimplente.valor_total_vencido)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${inadimplente.dias_mais_antigo} dias`}
                        size="small"
                        color={inadimplente.dias_mais_antigo > 365 ? 'error' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      {inadimplente.ultima_acao_cobranca ? (
                        <>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            {inadimplente.ultima_acao_cobranca}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {inadimplente.data_ultima_acao &&
                              formatters.date(inadimplente.data_ultima_acao)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Sem ações
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          label={getScoreLabel(inadimplente.score_risco)}
                          size="small"
                          color={getScoreColor(inadimplente.score_risco)}
                        />
                        <LinearProgress
                          variant="determinate"
                          value={getScoreProgress(inadimplente.score_risco)}
                          color={getScoreColor(inadimplente.score_risco)}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Enviar Email">
                        <IconButton
                          size="small"
                          color="primary"
                          disabled={!inadimplente.email}
                        >
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ligar">
                        <IconButton
                          size="small"
                          color="secondary"
                          disabled={!inadimplente.telefone}
                        >
                          <PhoneIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Imprimir Notificação">
                        <IconButton size="small">
                          <PrintIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={inadimplementesFiltrados.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Card>
    </Box>
  )
}
