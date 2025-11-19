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
  Button,
  TextField,
  MenuItem,
  Tooltip,
  Avatar,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { formatters } from '@/utils/formatters'

interface Usuario {
  id: string
  nome: string
  email: string
  cpf: string
  perfil: 'ADMIN' | 'FISCAL' | 'ATENDENTE' | 'CONTRIBUINTE'
  status: 'ATIVO' | 'INATIVO' | 'BLOQUEADO'
  ultimo_acesso?: string
  created_at: string
}

export function UsuariosPage() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [perfilFilter, setPerfilFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Dados simulados
  const usuarios: Usuario[] = [
    {
      id: '1',
      nome: 'Administrador Sistema',
      email: 'admin@tributec.com',
      cpf: '111.111.111-11',
      perfil: 'ADMIN',
      status: 'ATIVO',
      ultimo_acesso: '2024-11-19 14:30',
      created_at: '2024-01-15',
    },
    {
      id: '2',
      nome: 'João Silva Fiscal',
      email: 'joao.fiscal@tributec.com',
      cpf: '222.222.222-22',
      perfil: 'FISCAL',
      status: 'ATIVO',
      ultimo_acesso: '2024-11-19 10:15',
      created_at: '2024-02-20',
    },
    {
      id: '3',
      nome: 'Maria Santos Atendente',
      email: 'maria.atendente@tributec.com',
      cpf: '333.333.333-33',
      perfil: 'ATENDENTE',
      status: 'ATIVO',
      ultimo_acesso: '2024-11-18 16:45',
      created_at: '2024-03-10',
    },
    {
      id: '4',
      nome: 'Pedro Costa',
      email: 'pedro.costa@email.com',
      cpf: '444.444.444-44',
      perfil: 'CONTRIBUINTE',
      status: 'ATIVO',
      ultimo_acesso: '2024-11-17 09:20',
      created_at: '2024-05-22',
    },
    {
      id: '5',
      nome: 'Ana Oliveira (Bloqueada)',
      email: 'ana.oliveira@email.com',
      cpf: '555.555.555-55',
      perfil: 'CONTRIBUINTE',
      status: 'BLOQUEADO',
      ultimo_acesso: '2024-10-15 12:00',
      created_at: '2024-04-18',
    },
  ]

  // Filtragem
  let usuariosFiltrados = usuarios
  if (perfilFilter) {
    usuariosFiltrados = usuariosFiltrados.filter((u) => u.perfil === perfilFilter)
  }
  if (statusFilter) {
    usuariosFiltrados = usuariosFiltrados.filter((u) => u.status === statusFilter)
  }

  // Paginação
  const usuariosPaginados = usuariosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const getPerfilColor = (perfil: Usuario['perfil']) => {
    const colors: Record<Usuario['perfil'], 'error' | 'warning' | 'info' | 'default'> = {
      ADMIN: 'error',
      FISCAL: 'warning',
      ATENDENTE: 'info',
      CONTRIBUINTE: 'default',
    }
    return colors[perfil]
  }

  const getStatusColor = (status: Usuario['status']) => {
    const colors: Record<Usuario['status'], 'success' | 'default' | 'error'> = {
      ATIVO: 'success',
      INATIVO: 'default',
      BLOQUEADO: 'error',
    }
    return colors[status]
  }

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const handleExportar = () => {
    const csvContent = [
      ['Nome', 'Email', 'CPF', 'Perfil', 'Status', 'Último Acesso', 'Cadastro'].join(';'),
      ...usuariosFiltrados.map((u) =>
        [
          u.nome,
          u.email,
          u.cpf,
          u.perfil,
          u.status,
          u.ultimo_acesso ? formatters.date(u.ultimo_acesso) : 'Nunca',
          formatters.date(u.created_at),
        ].join(';')
      ),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gerenciamento de Usuários
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportar}>
            Exportar
          </Button>
          <Button variant="contained" startIcon={<AddIcon />}>
            Novo Usuário
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Perfil"
            value={perfilFilter}
            onChange={(e) => setPerfilFilter(e.target.value)}
            sx={{ width: 200 }}
            size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="ADMIN">Administrador</MenuItem>
            <MenuItem value="FISCAL">Fiscal</MenuItem>
            <MenuItem value="ATENDENTE">Atendente</MenuItem>
            <MenuItem value="CONTRIBUINTE">Contribuinte</MenuItem>
          </TextField>

          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: 200 }}
            size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="ATIVO">Ativo</MenuItem>
            <MenuItem value="INATIVO">Inativo</MenuItem>
            <MenuItem value="BLOQUEADO">Bloqueado</MenuItem>
          </TextField>
        </Box>
      </Card>

      {/* Tabela de Usuários */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuário</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>CPF</TableCell>
                <TableCell>Perfil</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Último Acesso</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuariosPaginados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                usuariosPaginados.map((usuario) => (
                  <TableRow key={usuario.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getInitials(usuario.nome)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {usuario.nome}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {usuario.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>{formatters.cpfCnpj(usuario.cpf)}</TableCell>
                    <TableCell>
                      <Chip
                        label={usuario.perfil}
                        size="small"
                        color={getPerfilColor(usuario.perfil)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={usuario.status}
                        size="small"
                        color={getStatusColor(usuario.status)}
                        icon={
                          usuario.status === 'ATIVO' ? (
                            <ActiveIcon />
                          ) : usuario.status === 'BLOQUEADO' ? (
                            <BlockIcon />
                          ) : undefined
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {usuario.ultimo_acesso ? (
                        <>
                          <Typography variant="body2">
                            {formatters.date(usuario.ultimo_acesso)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {usuario.ultimo_acesso.split(' ')[1]}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Nunca acessou
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={usuario.status === 'BLOQUEADO' ? 'Desbloquear' : 'Bloquear'}>
                        <IconButton
                          size="small"
                          color={usuario.status === 'BLOQUEADO' ? 'success' : 'warning'}
                        >
                          <BlockIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="error">
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
          count={usuariosFiltrados.length}
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
