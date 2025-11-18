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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { pessoaService } from '@/services/pessoaService'
import type { Pessoa, PessoaCreate, TipoPessoa } from '@/types/cadastro'
import { PessoaFormDialog } from '@/components/cadastro/PessoaFormDialog'

export function PessoasListPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoPessoaFilter, setTipoPessoaFilter] = useState<TipoPessoa | ''>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPessoa, setSelectedPessoa] = useState<Pessoa | undefined>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['pessoas', page + 1, rowsPerPage, searchTerm, tipoPessoaFilter],
    queryFn: () =>
      pessoaService.listar({
        pagina: page + 1,
        limite: rowsPerPage,
        busca: searchTerm || undefined,
        tipo_pessoa: tipoPessoaFilter || undefined,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (data: PessoaCreate) => pessoaService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoas'] })
      toast.success('Pessoa criada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao criar pessoa')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PessoaCreate }) =>
      pessoaService.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoas'] })
      toast.success('Pessoa atualizada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar pessoa')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pessoaService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoas'] })
      toast.success('Pessoa excluída com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao excluir pessoa')
    },
  })

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleOpenDialog = (pessoa?: Pessoa) => {
    setSelectedPessoa(pessoa)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedPessoa(undefined)
  }

  const handleSubmit = async (data: PessoaCreate) => {
    if (selectedPessoa) {
      await updateMutation.mutateAsync({ id: selectedPessoa.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta pessoa?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const formatDocument = (pessoa: Pessoa) => {
    if (pessoa.tipo_pessoa === 'F') {
      return pessoa.cpf || '-'
    }
    return pessoa.cnpj || '-'
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Pessoas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nova Pessoa
        </Button>
      </Box>

      <Card sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por nome, CPF/CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tipoPessoaFilter}
              onChange={(e) => setTipoPessoaFilter(e.target.value as TipoPessoa | '')}
              label="Tipo"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="F">Física</MenuItem>
              <MenuItem value="J">Jurídica</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Card>

      <Card>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            Erro ao carregar pessoas. Tente novamente.
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Nome/Razão Social</TableCell>
                    <TableCell>CPF/CNPJ</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.itens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Nenhuma pessoa encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.itens.map((pessoa) => (
                      <TableRow key={pessoa.id} hover>
                        <TableCell>
                          <Chip
                            label={pessoa.tipo_pessoa === 'F' ? 'Física' : 'Jurídica'}
                            size="small"
                            color={pessoa.tipo_pessoa === 'F' ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>{pessoa.nome_razao_social}</TableCell>
                        <TableCell>{formatDocument(pessoa)}</TableCell>
                        <TableCell>{pessoa.email || '-'}</TableCell>
                        <TableCell>{pessoa.celular || pessoa.telefone || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={pessoa.ativo ? 'Ativo' : 'Inativo'}
                            size="small"
                            color={pessoa.ativo ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(pessoa)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(pessoa.id)}
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
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </>
        )}
      </Card>

      <PessoaFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        pessoa={selectedPessoa}
      />
    </Box>
  )
}
