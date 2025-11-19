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
  Chip,
  TextField,
  MenuItem,
  Button,
  Grid,
} from '@mui/material'
import { GetApp as DownloadIcon, FilterList as FilterIcon } from '@mui/icons-material'
import { formatters } from '@/utils/formatters'

interface LogAuditoria {
  id: string
  timestamp: string
  usuario: string
  acao: string
  modulo: string
  tipo: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ERROR'
  ip: string
  detalhes?: string
}

export function LogsAuditoriaPage() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [tipoFilter, setTipoFilter] = useState('')
  const [moduloFilter, setModuloFilter] = useState('')

  const logs: LogAuditoria[] = [
    {
      id: '1',
      timestamp: '2024-11-19 14:30:25',
      usuario: 'admin@tributec.com',
      acao: 'Login bem-sucedido',
      modulo: 'Autenticação',
      tipo: 'LOGIN',
      ip: '192.168.1.100',
    },
    {
      id: '2',
      timestamp: '2024-11-19 14:28:15',
      usuario: 'fiscal@tributec.com',
      acao: 'Criação de auto de infração #12345',
      modulo: 'Fiscal',
      tipo: 'CREATE',
      ip: '192.168.1.105',
      detalhes: 'Auto lavrado contra contribuinte ID: 5678',
    },
    {
      id: '3',
      timestamp: '2024-11-19 14:25:40',
      usuario: 'atendente@tributec.com',
      acao: 'Atualização de cadastro de pessoa',
      modulo: 'Cadastro',
      tipo: 'UPDATE',
      ip: '192.168.1.110',
      detalhes: 'Pessoa ID: 1234 - Atualizado endereço',
    },
    {
      id: '4',
      timestamp: '2024-11-19 14:20:10',
      usuario: 'admin@tributec.com',
      acao: 'Alteração de permissões de usuário',
      modulo: 'Admin',
      tipo: 'UPDATE',
      ip: '192.168.1.100',
      detalhes: 'Usuário ID: 42 - Perfil alterado para FISCAL',
    },
    {
      id: '5',
      timestamp: '2024-11-19 14:15:55',
      usuario: 'contribuinte@email.com',
      acao: 'Tentativa de login falha',
      modulo: 'Autenticação',
      tipo: 'ERROR',
      ip: '203.45.67.89',
      detalhes: 'Senha incorreta - 3ª tentativa',
    },
  ]

  let logsFiltrados = logs
  if (tipoFilter) logsFiltrados = logsFiltrados.filter((l) => l.tipo === tipoFilter)
  if (moduloFilter) logsFiltrados = logsFiltrados.filter((l) => l.modulo === moduloFilter)

  const logsPaginados = logsFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const getTipoColor = (tipo: LogAuditoria['tipo']) => {
    const colors: Record<LogAuditoria['tipo'], any> = {
      CREATE: 'success',
      READ: 'info',
      UPDATE: 'warning',
      DELETE: 'error',
      LOGIN: 'primary',
      LOGOUT: 'default',
      ERROR: 'error',
    }
    return colors[tipo]
  }

  const handleExportar = () => {
    const csv = [
      ['Timestamp', 'Usuário', 'Ação', 'Módulo', 'Tipo', 'IP', 'Detalhes'].join(';'),
      ...logsFiltrados.map((l) =>
        [l.timestamp, l.usuario, l.acao, l.modulo, l.tipo, l.ip, l.detalhes || ''].join(';')
      ),
    ].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `logs_auditoria_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Logs de Auditoria</Typography>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportar}>
          Exportar
        </Button>
      </Box>

      <Card sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Tipo"
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="CREATE">Criação</MenuItem>
              <MenuItem value="READ">Leitura</MenuItem>
              <MenuItem value="UPDATE">Atualização</MenuItem>
              <MenuItem value="DELETE">Exclusão</MenuItem>
              <MenuItem value="LOGIN">Login</MenuItem>
              <MenuItem value="LOGOUT">Logout</MenuItem>
              <MenuItem value="ERROR">Erro</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Módulo"
              value={moduloFilter}
              onChange={(e) => setModuloFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Autenticação">Autenticação</MenuItem>
              <MenuItem value="Cadastro">Cadastro</MenuItem>
              <MenuItem value="Tributário">Tributário</MenuItem>
              <MenuItem value="Fiscal">Fiscal</MenuItem>
              <MenuItem value="Arrecadação">Arrecadação</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>Ação</TableCell>
                <TableCell>Módulo</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Detalhes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logsPaginados.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="caption">{log.timestamp}</Typography>
                  </TableCell>
                  <TableCell>{log.usuario}</TableCell>
                  <TableCell>{log.acao}</TableCell>
                  <TableCell>{log.modulo}</TableCell>
                  <TableCell>
                    <Chip label={log.tipo} size="small" color={getTipoColor(log.tipo)} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{log.ip}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {log.detalhes || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={logsFiltrados.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          rowsPerPageOptions={[25, 50, 100]}
          labelRowsPerPage="Linhas:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Card>
    </Box>
  )
}
