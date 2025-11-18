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
import { estabelecimentoService } from '@/services/estabelecimentoService'
import type { Estabelecimento, EstabelecimentoCreate } from '@/types'
import { EstabelecimentoFormDialog } from '@/components/cadastro/EstabelecimentoFormDialog'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'

export function EstabelecimentosListPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEstabelecimento, setSelectedEstabelecimento] = useState<Estabelecimento | undefined>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['estabelecimentos', page + 1, rowsPerPage, searchTerm],
    queryFn: () =>
      estabelecimentoService.listar({
        pagina: page + 1,
        limite: rowsPerPage,
        busca: searchTerm || undefined,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (data: EstabelecimentoCreate) => estabelecimentoService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estabelecimentos'] })
      toast.success('Estabelecimento criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao criar estabelecimento')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EstabelecimentoCreate }) =>
      estabelecimentoService.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estabelecimentos'] })
      toast.success('Estabelecimento atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar estabelecimento')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => estabelecimentoService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estabelecimentos'] })
      toast.success('Estabelecimento excluído com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao excluir estabelecimento')
    },
  })

  const handleOpenDialog = (estabelecimento?: Estabelecimento) => {
    setSelectedEstabelecimento(estabelecimento)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedEstabelecimento(undefined)
  }

  const handleSubmit = async (data: EstabelecimentoCreate) => {
    if (selectedEstabelecimento) {
      await updateMutation.mutateAsync({ id: selectedEstabelecimento.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
    handleCloseDialog()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este estabelecimento?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Estabelecimentos
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Novo Estabelecimento
        </Button>
      </Box>

      <Card sx={{ mb: 2, p: 2 }}>
        <TextField
          placeholder="Buscar estabelecimento..."
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
        {error && <ErrorAlert message="Erro ao carregar estabelecimentos. Tente novamente." />}

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Inscrição Municipal</TableCell>
                    <TableCell>Nome Fantasia</TableCell>
                    <TableCell>CNAE</TableCell>
                    <TableCell>Atividade</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.itens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Nenhum estabelecimento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.itens.map((estabelecimento) => (
                      <TableRow key={estabelecimento.id} hover>
                        <TableCell>{estabelecimento.inscricao_municipal}</TableCell>
                        <TableCell>{estabelecimento.nome_fantasia}</TableCell>
                        <TableCell>{estabelecimento.cnae}</TableCell>
                        <TableCell>{estabelecimento.atividade_principal}</TableCell>
                        <TableCell>
                          <Chip
                            label={estabelecimento.ativo ? 'Ativo' : 'Inativo'}
                            size="small"
                            color={estabelecimento.ativo ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(estabelecimento)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(estabelecimento.id)}
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

      <EstabelecimentoFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        estabelecimento={selectedEstabelecimento}
      />
    </Box>
  )
}
