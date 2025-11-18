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
  MenuItem,
  Tooltip,
} from '@mui/material'
import {
  Add as AddIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PowerSettingsNew as PowerIcon,
  Message as MessageIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { dtdService } from '@/services/dtdService'
import type { DomicilioTributarioDigital, DomicilioTributarioDigitalCreate } from '@/types/dtd'
import { DTDFormDialog } from '@/components/dtd/DTDFormDialog'
import { EnviarMensagemDialog } from '@/components/dtd/EnviarMensagemDialog'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { formatters } from '@/utils/formatters'

export function DTDListPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mensagemDialogOpen, setMensagemDialogOpen] = useState(false)
  const [selectedDTD, setSelectedDTD] = useState<DomicilioTributarioDigital | undefined>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['dtds', page + 1, rowsPerPage, searchTerm, statusFilter],
    queryFn: () =>
      dtdService.listarDTDs({
        pagina: page + 1,
        limite: rowsPerPage,
        busca: searchTerm || undefined,
        ativo: statusFilter === 'ATIVO' ? true : statusFilter === 'INATIVO' ? false : undefined,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (data: DomicilioTributarioDigitalCreate) => dtdService.criarDTD(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dtds'] })
      toast.success('DTD criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao criar DTD')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => dtdService.atualizarDTD(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dtds'] })
      toast.success('DTD atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar DTD')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dtdService.excluirDTD(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dtds'] })
      toast.success('DTD excluído com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao excluir DTD')
    },
  })

  const handleOpenDialog = (dtd?: DomicilioTributarioDigital) => {
    setSelectedDTD(dtd)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedDTD(undefined)
  }

  const handleSubmit = async (data: DomicilioTributarioDigitalCreate) => {
    if (selectedDTD) {
      await updateMutation.mutateAsync({ id: selectedDTD.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
    handleCloseDialog()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este DTD?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleToggleStatus = async (dtd: DomicilioTributarioDigital) => {
    await updateMutation.mutateAsync({
      id: dtd.id,
      data: { ativo: !dtd.ativo },
    })
  }

  const handleEnviarMensagem = (dtd: DomicilioTributarioDigital) => {
    setSelectedDTD(dtd)
    setMensagemDialogOpen(true)
  }

  const handleVerMensagens = (dtd: DomicilioTributarioDigital) => {
    navigate(`/admin/dtd/${dtd.id}/mensagens`)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Domicílios Tributários Digitais (DTD)
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Novo DTD
        </Button>
      </Box>

      <Card sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Buscar por nome, email, CPF ou CNPJ..."
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
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="ATIVO">Ativo</MenuItem>
            <MenuItem value="INATIVO">Inativo</MenuItem>
          </TextField>
        </Box>
      </Card>

      <Card>
        {error && <ErrorAlert message="Erro ao carregar DTDs. Tente novamente." />}

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Contribuinte</TableCell>
                    <TableCell>Documento</TableCell>
                    <TableCell>Email Principal</TableCell>
                    <TableCell>Notificações</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Data Ativação</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.itens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Nenhum DTD encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.itens.map((dtd) => (
                      <TableRow key={dtd.id} hover>
                        <TableCell>{dtd.contribuinte_nome || '-'}</TableCell>
                        <TableCell>
                          {dtd.contribuinte_cpf
                            ? formatters.cpf(dtd.contribuinte_cpf)
                            : dtd.contribuinte_cnpj
                            ? formatters.cnpj(dtd.contribuinte_cnpj)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon fontSize="small" color="action" />
                            {dtd.email_principal}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {dtd.notificar_lancamentos && <Chip label="Lançamentos" size="small" />}
                            {dtd.notificar_vencimentos && <Chip label="Vencimentos" size="small" />}
                            {dtd.notificar_protestos && <Chip label="Protestos" size="small" color="error" />}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={dtd.ativo ? 'Ativo' : 'Inativo'}
                            size="small"
                            color={dtd.ativo ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {dtd.data_ativacao ? formatters.date(dtd.data_ativacao) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver Mensagens">
                            <IconButton size="small" onClick={() => handleVerMensagens(dtd)} color="info">
                              <MessageIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Enviar Mensagem">
                            <IconButton size="small" onClick={() => handleEnviarMensagem(dtd)} color="primary">
                              <EmailIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={dtd.ativo ? 'Desativar' : 'Ativar'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(dtd)}
                              color={dtd.ativo ? 'warning' : 'success'}
                            >
                              <PowerIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleOpenDialog(dtd)} color="primary">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton size="small" onClick={() => handleDelete(dtd.id)} color="error">
                              <DeleteIcon />
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

      <DTDFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        dtd={selectedDTD}
      />

      {selectedDTD && (
        <EnviarMensagemDialog
          open={mensagemDialogOpen}
          onClose={() => setMensagemDialogOpen(false)}
          dtd={selectedDTD}
        />
      )}
    </Box>
  )
}
