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
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import validacaoService from '@/services/validacaoService'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { pessoaService } from '@/services/pessoaService'
import type { Pessoa, PessoaCreate, TipoPessoa } from '@/types/cadastro'
import { PessoaFormDialog } from '@/components/cadastro/PessoaFormDialog'

export function PessoasListPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
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
      return pessoa.cpf ? validacaoService.formatarCpf(pessoa.cpf) : '-'
    }
    return pessoa.cnpj ? validacaoService.formatarCnpj(pessoa.cnpj) : '-'
  }

  // Export CSV
  const handleExportarCSV = () => {
    if (!data?.itens || data.itens.length === 0) {
      toast.warning('Nenhum dado para exportar')
      return
    }

    const headers = ['Tipo', 'Nome/Razão Social', 'CPF/CNPJ', 'E-mail', 'Telefone', 'Status']
    const rows = data.itens.map((pessoa) => [
      pessoa.tipo_pessoa === 'F' ? 'Física' : 'Jurídica',
      pessoa.nome_razao_social || '',
      formatDocument(pessoa),
      pessoa.email || '',
      pessoa.celular || pessoa.telefone || '',
      pessoa.ativo ? 'Ativo' : 'Inativo',
    ])

    const csv = [headers, ...rows].map((row) => row.join(';')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `pessoas-${new Date().toISOString().split('T')[0]}.csv`
    link.click()

    toast.success('CSV exportado com sucesso!')
  }

  // Export Excel (HTML table)
  const handleExportarExcel = () => {
    if (!data?.itens || data.itens.length === 0) {
      toast.warning('Nenhum dado para exportar')
      return
    }

    const headers = ['Tipo', 'Nome/Razão Social', 'CPF/CNPJ', 'E-mail', 'Telefone', 'Status']
    const rows = data.itens.map((pessoa) => [
      pessoa.tipo_pessoa === 'F' ? 'Física' : 'Jurídica',
      pessoa.nome_razao_social || '',
      formatDocument(pessoa),
      pessoa.email || '',
      pessoa.celular || pessoa.telefone || '',
      pessoa.ativo ? 'Ativo' : 'Inativo',
    ])

    const htmlTable = `
      <table>
        <thead>
          <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    `

    const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `pessoas-${new Date().toISOString().split('T')[0]}.xls`
    link.click()

    toast.success('Excel exportado com sucesso!')
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Pessoas
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportarCSV}
            disabled={!data?.itens || data.itens.length === 0}
          >
            CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportarExcel}
            disabled={!data?.itens || data.itens.length === 0}
          >
            Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nova Pessoa
          </Button>
        </Box>
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
                            onClick={() => navigate(`/cadastro/pessoas/${pessoa.id}`)}
                            color="info"
                            title="Visualizar"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(pessoa)}
                            color="primary"
                            title="Editar"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(pessoa.id)}
                            color="error"
                            title="Excluir"
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
