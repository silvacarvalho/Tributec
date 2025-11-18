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
  InputAdornment,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { logradouroService } from '@/services/logradouroService'
import type { Logradouro, LogradouroCreate } from '@/types'
import { LogradouroFormDialog } from '@/components/cadastro/LogradouroFormDialog'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'

export function LogradourosListPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedLogradouro, setSelectedLogradouro] = useState<Logradouro | undefined>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['logradouros', page + 1, rowsPerPage, searchTerm],
    queryFn: () =>
      logradouroService.listar({
        pagina: page + 1,
        limite: rowsPerPage,
        busca: searchTerm || undefined,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (data: LogradouroCreate) => logradouroService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logradouros'] })
      toast.success('Logradouro criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao criar logradouro')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: LogradouroCreate }) =>
      logradouroService.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logradouros'] })
      toast.success('Logradouro atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar logradouro')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => logradouroService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logradouros'] })
      toast.success('Logradouro excluído com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao excluir logradouro')
    },
  })

  const handleOpenDialog = (logradouro?: Logradouro) => {
    setSelectedLogradouro(logradouro)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedLogradouro(undefined)
  }

  const handleSubmit = async (data: LogradouroCreate) => {
    if (selectedLogradouro) {
      await updateMutation.mutateAsync({ id: selectedLogradouro.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
    handleCloseDialog()
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este logradouro?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Logradouros
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Novo Logradouro
        </Button>
      </Box>

      <Card sx={{ mb: 2, p: 2 }}>
        <TextField
          placeholder="Buscar logradouro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      <Card>
        {error && <ErrorAlert message="Erro ao carregar logradouros. Tente novamente." />}

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>Bairro</TableCell>
                    <TableCell>CEP</TableCell>
                    <TableCell>Setor Fiscal</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.itens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Nenhum logradouro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.itens.map((logradouro) => (
                      <TableRow key={logradouro.id} hover>
                        <TableCell>{logradouro.tipo_logradouro}</TableCell>
                        <TableCell>{logradouro.nome}</TableCell>
                        <TableCell>{logradouro.bairro}</TableCell>
                        <TableCell>{logradouro.cep || '-'}</TableCell>
                        <TableCell>{logradouro.setor_fiscal || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={logradouro.ativo ? 'Ativo' : 'Inativo'}
                            size="small"
                            color={logradouro.ativo ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(logradouro)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(logradouro.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
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

      <LogradouroFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        logradouro={selectedLogradouro}
      />
    </Box>
  )
}
