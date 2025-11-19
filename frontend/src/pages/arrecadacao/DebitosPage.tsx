import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Button,
  Collapse,
  Grid,
  Tooltip,
} from '@mui/material'
import {
  Payment as PaymentIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterIcon,
  AccountBalance as ParcelamentoIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { formatters } from '@/utils/formatters'

interface Debito {
  id: string
  numero_lancamento: string
  tributo: 'IPTU' | 'ITBI' | 'ISSQN' | 'OUTROS'
  contribuinte_nome: string
  contribuinte_cpf_cnpj: string
  descricao: string
  ano_exercicio: number
  valor_original: number
  valor_atualizado: number
  valor_juros: number
  valor_multa: number
  valor_total: number
  data_vencimento: string
  status: 'EM_DIA' | 'VENCIDO' | 'PARCELADO' | 'PAGO' | 'CANCELADO'
  dias_vencido?: number
  imovel_inscricao?: string
  estabelecimento_ccm?: string
}

export function DebitosPage() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [filtrosExpanded, setFiltrosExpanded] = useState(false)

  // Filtros
  const [tributoFilter, setTributoFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  // Dados simulados (em produção viriam do backend)
  const debitos: Debito[] = [
    {
      id: '1',
      numero_lancamento: '2024/00001',
      tributo: 'IPTU',
      contribuinte_nome: 'João Silva Santos',
      contribuinte_cpf_cnpj: '123.456.789-00',
      descricao: 'IPTU 2024 - Imóvel 123.456',
      ano_exercicio: 2024,
      valor_original: 1500.00,
      valor_atualizado: 1575.00,
      valor_juros: 45.00,
      valor_multa: 30.00,
      valor_total: 1650.00,
      data_vencimento: '2024-03-15',
      status: 'VENCIDO',
      dias_vencido: 245,
      imovel_inscricao: '123.456',
    },
    {
      id: '2',
      numero_lancamento: '2024/00002',
      tributo: 'ISSQN',
      contribuinte_nome: 'Empresa XYZ Ltda',
      contribuinte_cpf_cnpj: '12.345.678/0001-90',
      descricao: 'ISSQN Out/2024 - CCM 98765',
      ano_exercicio: 2024,
      valor_original: 2800.00,
      valor_atualizado: 2800.00,
      valor_juros: 0,
      valor_multa: 0,
      valor_total: 2800.00,
      data_vencimento: '2024-11-20',
      status: 'EM_DIA',
      estabelecimento_ccm: '98765',
    },
    {
      id: '3',
      numero_lancamento: '2024/00003',
      tributo: 'ITBI',
      contribuinte_nome: 'Maria Oliveira Costa',
      contribuinte_cpf_cnpj: '987.654.321-00',
      descricao: 'ITBI Transf. Imóvel',
      ano_exercicio: 2024,
      valor_original: 15000.00,
      valor_atualizado: 15000.00,
      valor_juros: 0,
      valor_multa: 0,
      valor_total: 15000.00,
      data_vencimento: '2024-12-01',
      status: 'EM_DIA',
      imovel_inscricao: '789.012',
    },
    {
      id: '4',
      numero_lancamento: '2023/05678',
      tributo: 'IPTU',
      contribuinte_nome: 'Pedro Alves Lima',
      contribuinte_cpf_cnpj: '456.789.123-00',
      descricao: 'IPTU 2023 - Imóvel 654.321',
      ano_exercicio: 2023,
      valor_original: 2200.00,
      valor_atualizado: 2530.00,
      valor_juros: 220.00,
      valor_multa: 110.00,
      valor_total: 2860.00,
      data_vencimento: '2023-04-10',
      status: 'VENCIDO',
      dias_vencido: 588,
      imovel_inscricao: '654.321',
    },
    {
      id: '5',
      numero_lancamento: '2024/00150',
      tributo: 'IPTU',
      contribuinte_nome: 'Ana Paula Ferreira',
      contribuinte_cpf_cnpj: '321.654.987-00',
      descricao: 'IPTU 2024 - Parcelado',
      ano_exercicio: 2024,
      valor_original: 3500.00,
      valor_atualizado: 3500.00,
      valor_juros: 0,
      valor_multa: 0,
      valor_total: 3500.00,
      data_vencimento: '2024-02-01',
      status: 'PARCELADO',
      imovel_inscricao: '111.222',
    },
  ]

  // Filtragem
  let debitosFiltrados = debitos
  if (tributoFilter) {
    debitosFiltrados = debitosFiltrados.filter((d) => d.tributo === tributoFilter)
  }
  if (statusFilter) {
    debitosFiltrados = debitosFiltrados.filter((d) => d.status === statusFilter)
  }
  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    debitosFiltrados = debitosFiltrados.filter(
      (d) =>
        d.contribuinte_nome.toLowerCase().includes(term) ||
        d.contribuinte_cpf_cnpj.includes(term) ||
        d.numero_lancamento.includes(term) ||
        d.imovel_inscricao?.includes(term) ||
        d.estabelecimento_ccm?.includes(term)
    )
  }

  // Paginação
  const debitosPaginados = debitosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // Totalizadores
  const totalValor = debitosFiltrados.reduce((sum, d) => sum + d.valor_total, 0)
  const totalVencido = debitosFiltrados
    .filter((d) => d.status === 'VENCIDO')
    .reduce((sum, d) => sum + d.valor_total, 0)

  const getStatusColor = (status: Debito['status']) => {
    const colors: Record<Debito['status'], 'default' | 'success' | 'warning' | 'error'> = {
      EM_DIA: 'success',
      VENCIDO: 'error',
      PARCELADO: 'warning',
      PAGO: 'default',
      CANCELADO: 'default',
    }
    return colors[status]
  }

  const getStatusLabel = (status: Debito['status']) => {
    const labels: Record<Debito['status'], string> = {
      EM_DIA: 'Em Dia',
      VENCIDO: 'Vencido',
      PARCELADO: 'Parcelado',
      PAGO: 'Pago',
      CANCELADO: 'Cancelado',
    }
    return labels[status]
  }

  const getTributoColor = (tributo: Debito['tributo']) => {
    const colors: Record<Debito['tributo'], string> = {
      IPTU: '#2196f3',
      ITBI: '#4caf50',
      ISSQN: '#ff9800',
      OUTROS: '#9c27b0',
    }
    return colors[tributo]
  }

  const handleExportar = () => {
    const csvContent = [
      [
        'Lançamento',
        'Tributo',
        'Contribuinte',
        'CPF/CNPJ',
        'Descrição',
        'Exercício',
        'Valor Original',
        'Atualizado',
        'Juros',
        'Multa',
        'Total',
        'Vencimento',
        'Status',
        'Dias Vencido',
      ].join(';'),
      ...debitosFiltrados.map((d) =>
        [
          d.numero_lancamento,
          d.tributo,
          d.contribuinte_nome,
          d.contribuinte_cpf_cnpj,
          d.descricao,
          d.ano_exercicio,
          d.valor_original.toFixed(2),
          d.valor_atualizado.toFixed(2),
          d.valor_juros.toFixed(2),
          d.valor_multa.toFixed(2),
          d.valor_total.toFixed(2),
          formatters.date(d.data_vencimento),
          getStatusLabel(d.status),
          d.dias_vencido || '',
        ].join(';')
      ),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `debitos_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Débitos e Dívidas
        </Typography>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportar}>
          Exportar
        </Button>
      </Box>

      {/* Cards de Resumo */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="overline" color="text.secondary">
              Total de Débitos
            </Typography>
            <Typography variant="h5" color="primary">
              {formatters.currency(totalValor)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {debitosFiltrados.length} lançamento(s)
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, backgroundColor: '#ffebee' }}>
            <Typography variant="overline" color="text.secondary">
              Total Vencido
            </Typography>
            <Typography variant="h5" color="error">
              {formatters.currency(totalVencido)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {debitosFiltrados.filter((d) => d.status === 'VENCIDO').length} lançamento(s)
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, backgroundColor: '#e8f5e9' }}>
            <Typography variant="overline" color="text.secondary">
              Taxa de Inadimplência
            </Typography>
            <Typography variant="h5" color="success.main">
              {((totalVencido / totalValor) * 100).toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sobre total de débitos
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 2 }}>
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setFiltrosExpanded(!filtrosExpanded)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            <Typography variant="h6">Filtros</Typography>
          </Box>
          <IconButton size="small">
            {filtrosExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={filtrosExpanded}>
          <Box sx={{ p: 2, pt: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Buscar"
                  placeholder="Nome, CPF/CNPJ, Inscrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Tributo"
                  value={tributoFilter}
                  onChange={(e) => setTributoFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="IPTU">IPTU</MenuItem>
                  <MenuItem value="ITBI">ITBI</MenuItem>
                  <MenuItem value="ISSQN">ISSQN</MenuItem>
                  <MenuItem value="OUTROS">Outros</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="EM_DIA">Em Dia</MenuItem>
                  <MenuItem value="VENCIDO">Vencido</MenuItem>
                  <MenuItem value="PARCELADO">Parcelado</MenuItem>
                  <MenuItem value="PAGO">Pago</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Card>

      {/* Tabela de Débitos */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Lançamento</TableCell>
                <TableCell>Tributo</TableCell>
                <TableCell>Contribuinte</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="right">Valor Original</TableCell>
                <TableCell align="right">Atualizado</TableCell>
                <TableCell align="right">J + M</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Vencimento</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {debitosPaginados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    Nenhum débito encontrado
                  </TableCell>
                </TableRow>
              ) : (
                debitosPaginados.map((debito) => (
                  <TableRow key={debito.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {debito.numero_lancamento}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {debito.ano_exercicio}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={debito.tributo}
                        size="small"
                        sx={{
                          backgroundColor: getTributoColor(debito.tributo),
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{debito.contribuinte_nome}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatters.cpfCnpj(debito.contribuinte_cpf_cnpj)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{debito.descricao}</Typography>
                      {debito.imovel_inscricao && (
                        <Typography variant="caption" color="text.secondary">
                          Inscrição: {debito.imovel_inscricao}
                        </Typography>
                      )}
                      {debito.estabelecimento_ccm && (
                        <Typography variant="caption" color="text.secondary">
                          CCM: {debito.estabelecimento_ccm}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {formatters.currency(debito.valor_original)}
                    </TableCell>
                    <TableCell align="right">
                      {formatters.currency(debito.valor_atualizado)}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip
                        title={`Juros: ${formatters.currency(debito.valor_juros)} + Multa: ${formatters.currency(debito.valor_multa)}`}
                      >
                        <span>{formatters.currency(debito.valor_juros + debito.valor_multa)}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatters.currency(debito.valor_total)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatters.date(debito.data_vencimento)}
                      </Typography>
                      {debito.dias_vencido && (
                        <Typography variant="caption" color="error">
                          {debito.dias_vencido} dias
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(debito.status)}
                        size="small"
                        color={getStatusColor(debito.status)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Parcelar">
                        <IconButton size="small" color="primary">
                          <ParcelamentoIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Gerar Boleto">
                        <IconButton size="small" color="secondary">
                          <PaymentIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Imprimir">
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
          count={debitosFiltrados.length}
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
