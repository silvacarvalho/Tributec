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
  Add as AddIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { tributarioService } from '@/services/tributarioService'
import type { ParcelamentoCreate, StatusParcelamento } from '@/types'
import { ParcelamentoFormDialog } from '@/components/tributario/ParcelamentoFormDialog'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { formatters } from '@/utils/formatters'

export function ParcelamentosPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['parcelamentos', page + 1, rowsPerPage, statusFilter],
    queryFn: () =>
      tributarioService.listarParcelamentos({
        pagina: page + 1,
        limite: rowsPerPage,
        status: statusFilter || undefined,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (data: ParcelamentoCreate) => tributarioService.criarParcelamento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelamentos'] })
      toast.success('Parcelamento criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao criar parcelamento')
    },
  })

  const cancelarMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      tributarioService.cancelarParcelamento(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcelamentos'] })
      toast.success('Parcelamento cancelado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao cancelar parcelamento')
    },
  })

  const handleSubmit = async (data: ParcelamentoCreate) => {
    await createMutation.mutateAsync(data)
    setDialogOpen(false)
  }

  const handleCancelar = (id: string) => {
    const motivo = window.prompt('Motivo do cancelamento:')
    if (motivo) {
      cancelarMutation.mutate({ id, motivo })
    }
  }

  const getStatusColor = (status: StatusParcelamento) => {
    const colors: Record<StatusParcelamento, 'success' | 'warning' | 'error'> = {
      ATIVO: 'warning',
      QUITADO: 'success',
      CANCELADO: 'error',
    }
    return colors[status]
  }

  const getStatusLabel = (status: StatusParcelamento) => {
    const labels: Record<StatusParcelamento, string> = {
      ATIVO: 'Ativo',
      QUITADO: 'Quitado',
      CANCELADO: 'Cancelado',
    }
    return labels[status]
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Parcelamentos
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Novo Parcelamento
        </Button>
      </Box>

      <Card sx={{ mb: 2, p: 2 }}>
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ width: 200 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="ATIVO">Ativo</MenuItem>
          <MenuItem value="QUITADO">Quitado</MenuItem>
          <MenuItem value="CANCELADO">Cancelado</MenuItem>
        </TextField>
      </Card>

      <Card>
        {error && <ErrorAlert message="Erro ao carregar parcelamentos. Tente novamente." />}

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
                    <TableCell align="right">Valor Original</TableCell>
                    <TableCell align="right">Entrada</TableCell>
                    <TableCell align="right">Parcelado</TableCell>
                    <TableCell>Parcelas</TableCell>
                    <TableCell align="right">Valor Parcela</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.itens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        Nenhum parcelamento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.itens.map((parcelamento) => (
                      <TableRow key={parcelamento.id} hover>
                        <TableCell>{parcelamento.numero_parcelamento}</TableCell>
                        <TableCell>{formatters.date(parcelamento.created_at)}</TableCell>
                        <TableCell align="right">
                          {formatters.currency(parcelamento.valor_original)}
                        </TableCell>
                        <TableCell align="right">
                          {formatters.currency(parcelamento.valor_entrada)}
                        </TableCell>
                        <TableCell align="right">
                          {formatters.currency(parcelamento.valor_parcelado)}
                        </TableCell>
                        <TableCell>{parcelamento.numero_parcelas}x</TableCell>
                        <TableCell align="right">
                          {formatters.currency(parcelamento.valor_parcela)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(parcelamento.status)}
                            size="small"
                            color={getStatusColor(parcelamento.status)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                          {parcelamento.status === 'ATIVO' && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleCancelar(parcelamento.id)}
                            >
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

      <ParcelamentoFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </Box>
  )
}
