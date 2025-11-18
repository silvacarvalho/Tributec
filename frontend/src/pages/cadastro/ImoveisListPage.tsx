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
import { imovelService } from '@/services/imovelService'
import type { Imovel, ImovelCreate } from '@/types/cadastro'
import { ImovelFormDialog } from '@/components/cadastro/ImovelFormDialog'

export function ImoveisListPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedImovel, setSelectedImovel] = useState<Imovel | undefined>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['imoveis', page + 1, rowsPerPage, searchTerm],
    queryFn: () =>
      imovelService.listar({
        pagina: page + 1,
        limite: rowsPerPage,
        busca: searchTerm || undefined,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (data: ImovelCreate) => imovelService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] })
      toast.success('Imóvel criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao criar imóvel')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ImovelCreate }) =>
      imovelService.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] })
      toast.success('Imóvel atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar imóvel')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => imovelService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] })
      toast.success('Imóvel excluído com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao excluir imóvel')
    },
  })

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleOpenDialog = (imovel?: Imovel) => {
    setSelectedImovel(imovel)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedImovel(undefined)
  }

  const handleSubmit = async (data: ImovelCreate) => {
    if (selectedImovel) {
      await updateMutation.mutateAsync({ id: selectedImovel.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este imóvel?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const formatEndereco = (imovel: Imovel) => {
    const { logradouro, numero, bairro } = imovel.endereco
    return `${logradouro}${numero ? `, ${numero}` : ''} - ${bairro}`
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Imóveis
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Imóvel
        </Button>
      </Box>

      <Card sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por inscrição, endereço, proprietário..."
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
        </Box>
      </Card>

      <Card>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            Erro ao carregar imóveis. Tente novamente.
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
                    <TableCell>Inscrição</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Endereço</TableCell>
                    <TableCell>Proprietário</TableCell>
                    <TableCell>Área Terreno</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.itens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Nenhum imóvel encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.itens.map((imovel) => (
                      <TableRow key={imovel.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {imovel.inscricao_imobiliaria}
                          </Typography>
                        </TableCell>
                        <TableCell>{imovel.tipo_imovel.descricao}</TableCell>
                        <TableCell>{formatEndereco(imovel)}</TableCell>
                        <TableCell>
                          {imovel.proprietario?.nome_razao_social || '-'}
                        </TableCell>
                        <TableCell>
                          {imovel.area_terreno ? `${imovel.area_terreno.toFixed(2)} m²` : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={imovel.ativo ? 'Ativo' : 'Inativo'}
                            size="small"
                            color={imovel.ativo ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(imovel)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(imovel.id)}
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

      <ImovelFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        imovel={selectedImovel}
      />
    </Box>
  )
}
