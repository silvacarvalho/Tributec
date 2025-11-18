import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
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
} from '@mui/material'
import {
  Visibility as ViewIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { tributarioService } from '@/services/tributarioService'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { formatters } from '@/utils/formatters'
import type { StatusLancamento } from '@/types'

export function IPTULancamentosPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [anoExercicio, setAnoExercicio] = useState(new Date().getFullYear())
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['iptu-lancamentos', page + 1, rowsPerPage, anoExercicio, statusFilter],
    queryFn: () =>
      tributarioService.listarIPTU({
        pagina: page + 1,
        limite: rowsPerPage,
        ano_exercicio: anoExercicio,
        status: statusFilter || undefined,
      }),
  })

  const getStatusColor = (status: StatusLancamento) => {
    const colors: Record<StatusLancamento, 'success' | 'warning' | 'error' | 'default'> = {
      LANCADO: 'warning',
      PAGO: 'success',
      CANCELADO: 'error',
      VENCIDO: 'error',
    }
    return colors[status] || 'default'
  }

  const getStatusLabel = (status: StatusLancamento) => {
    const labels: Record<StatusLancamento, string> = {
      LANCADO: 'Lançado',
      PAGO: 'Pago',
      CANCELADO: 'Cancelado',
      VENCIDO: 'Vencido',
    }
    return labels[status] || status
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Lançamentos de IPTU
        </Typography>
        <Button variant="contained" onClick={() => navigate('/tributario/iptu/calcular')}>
          Novo Lançamento
        </Button>
      </Box>

      <Card sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Ano Exercício"
            type="number"
            value={anoExercicio}
            onChange={(e) => setAnoExercicio(Number(e.target.value))}
            sx={{ width: 150 }}
          />
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="LANCADO">Lançado</MenuItem>
            <MenuItem value="PAGO">Pago</MenuItem>
            <MenuItem value="VENCIDO">Vencido</MenuItem>
            <MenuItem value="CANCELADO">Cancelado</MenuItem>
          </TextField>
        </Box>
      </Card>

      <Card>
        {error && <ErrorAlert message="Erro ao carregar lançamentos. Tente novamente." />}

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Número</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Ano</TableCell>
                    <TableCell align="right">Valor IPTU</TableCell>
                    <TableCell align="right">Valor Líquido</TableCell>
                    <TableCell>Parcelas</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.itens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        Nenhum lançamento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.itens.map((lancamento) => (
                      <TableRow key={lancamento.id} hover>
                        <TableCell>{lancamento.numero_lancamento}</TableCell>
                        <TableCell>{formatters.date(lancamento.data_lancamento)}</TableCell>
                        <TableCell>{lancamento.ano_exercicio}</TableCell>
                        <TableCell align="right">
                          {formatters.currency(lancamento.valor_iptu)}
                        </TableCell>
                        <TableCell align="right">
                          {formatters.currency(lancamento.valor_liquido)}
                        </TableCell>
                        <TableCell>{lancamento.numero_parcelas}x</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(lancamento.status)}
                            size="small"
                            color={getStatusColor(lancamento.status)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/tributario/iptu/${lancamento.id}`)}
                            color="primary"
                          >
                            <ViewIcon />
                          </IconButton>
                          {lancamento.status === 'LANCADO' && (
                            <IconButton size="small" color="error">
                              <CancelIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={data?.total || 0}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10))
                setPage(0)
              }}
              rowsPerPageOptions={[10, 20, 50]}
              labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </>
        )}
      </Card>
    </Box>
  )
}
