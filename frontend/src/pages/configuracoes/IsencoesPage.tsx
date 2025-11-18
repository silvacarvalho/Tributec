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
  Chip,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material'
import { CheckCircle as ApproveIcon, Cancel as CancelIcon } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { tributarioService } from '@/services/tributarioService'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { formatters } from '@/utils/formatters'
import type { TipoTributo } from '@/types'

export function IsencoesPage() {
  const queryClient = useQueryClient()
  const [tipoTributo, setTipoTributo] = useState<string>('')
  const [ativaFilter, setAtivaFilter] = useState<string>('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['isencoes', tipoTributo, ativaFilter],
    queryFn: () =>
      tributarioService.listarIsencoes({
        tipo_tributo: tipoTributo || undefined,
        ativa: ativaFilter === 'true' ? true : ativaFilter === 'false' ? false : undefined,
        pagina: 1,
        limite: 50,
      }),
  })

  const aprovarMutation = useMutation({
    mutationFn: (id: string) => tributarioService.aprovarIsencao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isencoes'] })
      toast.success('Isenção aprovada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao aprovar isenção')
    },
  })

  const cancelarMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      tributarioService.cancelarIsencao(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isencoes'] })
      toast.success('Isenção cancelada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erro ao cancelar isenção')
    },
  })

  const handleAprovar = (id: string) => {
    if (window.confirm('Tem certeza que deseja aprovar esta isenção?')) {
      aprovarMutation.mutate(id)
    }
  }

  const handleCancelar = (id: string) => {
    const motivo = window.prompt('Motivo do cancelamento:')
    if (motivo) {
      cancelarMutation.mutate({ id, motivo })
    }
  }

  const getMotivoLabel = (motivo: string) => {
    const labels: Record<string, string> = {
      IDOSO: 'Idoso',
      DEFICIENTE: 'Deficiente',
      BAIXA_RENDA: 'Baixa Renda',
      FILANTROPIA: 'Filantropia',
      UTILIDADE_PUBLICA: 'Utilidade Pública',
      IMUNIDADE_CONSTITUCIONAL: 'Imunidade Constitucional',
      OUTROS: 'Outros',
    }
    return labels[motivo] || motivo
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Isenções e Imunidades
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gerenciamento de isenções tributárias
        </Typography>
      </Box>

      <Card sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Tipo de Tributo"
            value={tipoTributo}
            onChange={(e) => setTipoTributo(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="IPTU">IPTU</MenuItem>
            <MenuItem value="ITBI">ITBI</MenuItem>
            <MenuItem value="ISSQN">ISSQN</MenuItem>
          </TextField>
          <TextField
            select
            label="Status"
            value={ativaFilter}
            onChange={(e) => setAtivaFilter(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Ativas</MenuItem>
            <MenuItem value="false">Inativas</MenuItem>
          </TextField>
        </Box>
      </Card>

      <Card>
        {error && <ErrorAlert message="Erro ao carregar isenções. Tente novamente." />}

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Processo</TableCell>
                  <TableCell>Tributo</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell align="right">Percentual</TableCell>
                  <TableCell>Vigência</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.itens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Nenhuma isenção encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.itens.map((isencao) => (
                    <TableRow key={isencao.id}>
                      <TableCell>{isencao.numero_processo}</TableCell>
                      <TableCell>
                        <Chip label={isencao.tipo_tributo} size="small" />
                      </TableCell>
                      <TableCell>{getMotivoLabel(isencao.motivo)}</TableCell>
                      <TableCell align="right">
                        {formatters.percent(isencao.percentual_isencao)}
                      </TableCell>
                      <TableCell>
                        {formatters.date(isencao.data_inicio)}
                        {isencao.data_fim && ` até ${formatters.date(isencao.data_fim)}`}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isencao.ativa ? 'Ativa' : 'Inativa'}
                          size="small"
                          color={isencao.ativa ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {!isencao.ativa && !isencao.data_aprovacao && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleAprovar(isencao.id)}
                          >
                            <ApproveIcon />
                          </IconButton>
                        )}
                        {isencao.ativa && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleCancelar(isencao.id)}
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
        )}
      </Card>
    </Box>
  )
}
