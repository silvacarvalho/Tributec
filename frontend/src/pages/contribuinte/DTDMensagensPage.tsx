import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  IconButton,
  Collapse,
  MenuItem,
  TextField,
  Alert,
  Badge,
  Divider,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  MarkEmailRead as MarkEmailReadIcon,
  PriorityHigh as PriorityHighIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { dtdService } from '@/services/dtdService'
import type { DTDMensagem, TipoMensagemDTD } from '@/types/dtd'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { formatters } from '@/utils/formatters'

export function DTDMensagensPage() {
  const { dtdId } = useParams<{ dtdId: string }>()
  const queryClient = useQueryClient()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [tipoFilter, setTipoFilter] = useState<string>('')
  const [lidaFilter, setLidaFilter] = useState<string>('')

  const { data: mensagens, isLoading, error } = useQuery({
    queryKey: ['dtd-mensagens', dtdId, tipoFilter, lidaFilter],
    queryFn: () =>
      dtdService.listarMensagens(dtdId!, {
        pagina: 1,
        limite: 100,
        tipo_mensagem: tipoFilter as TipoMensagemDTD | undefined,
        lida: lidaFilter === 'true' ? true : lidaFilter === 'false' ? false : undefined,
      }),
    enabled: !!dtdId,
  })

  const { data: estatisticas } = useQuery({
    queryKey: ['dtd-estatisticas', dtdId],
    queryFn: () => dtdService.obterEstatisticas(dtdId!),
    enabled: !!dtdId,
  })

  const marcarLidaMutation = useMutation({
    mutationFn: (mensagemId: string) => dtdService.marcarComoLida(mensagemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dtd-mensagens'] })
      queryClient.invalidateQueries({ queryKey: ['dtd-estatisticas'] })
      toast.success('Mensagem marcada como lida')
    },
  })

  const handleToggleExpand = (mensagemId: string, mensagem: DTDMensagem) => {
    setExpandedId(expandedId === mensagemId ? null : mensagemId)

    // Marcar como lida ao expandir
    if (expandedId !== mensagemId && !mensagem.lida) {
      marcarLidaMutation.mutate(mensagemId)
    }
  }

  const getTipoLabel = (tipo: TipoMensagemDTD) => {
    const labels: Record<TipoMensagemDTD, string> = {
      NOTIFICACAO: 'Notificação',
      ALERTA: 'Alerta',
      LANCAMENTO: 'Lançamento',
      VENCIMENTO: 'Vencimento',
      COBRANCA: 'Cobrança',
      PROTESTO: 'Protesto',
    }
    return labels[tipo]
  }

  const getTipoColor = (tipo: TipoMensagemDTD): 'default' | 'info' | 'warning' | 'error' => {
    const colors: Record<TipoMensagemDTD, 'default' | 'info' | 'warning' | 'error'> = {
      NOTIFICACAO: 'info',
      ALERTA: 'warning',
      LANCAMENTO: 'info',
      VENCIMENTO: 'warning',
      COBRANCA: 'warning',
      PROTESTO: 'error',
    }
    return colors[tipo]
  }

  const getTipoIcon = (tipo: TipoMensagemDTD) => {
    const icons: Record<TipoMensagemDTD, JSX.Element> = {
      NOTIFICACAO: <NotificationsIcon />,
      ALERTA: <WarningIcon />,
      LANCAMENTO: <InfoIcon />,
      VENCIMENTO: <WarningIcon />,
      COBRANCA: <PriorityHighIcon />,
      PROTESTO: <PriorityHighIcon />,
    }
    return icons[tipo]
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Mensagens do DTD
        </Typography>
        {estatisticas && (
          <Badge badgeContent={estatisticas.mensagens_nao_lidas} color="error">
            <Chip
              icon={<NotificationsIcon />}
              label={`${estatisticas.total_mensagens} mensagens`}
              color="primary"
            />
          </Badge>
        )}
      </Box>

      {/* Estatísticas */}
      {estatisticas && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total de Mensagens
                </Typography>
                <Typography variant="h4">{estatisticas.total_mensagens}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Não Lidas
                </Typography>
                <Typography variant="h4" color="error.main">
                  {estatisticas.mensagens_nao_lidas}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Tipo"
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="NOTIFICACAO">Notificação</MenuItem>
            <MenuItem value="ALERTA">Alerta</MenuItem>
            <MenuItem value="LANCAMENTO">Lançamento</MenuItem>
            <MenuItem value="VENCIMENTO">Vencimento</MenuItem>
            <MenuItem value="COBRANCA">Cobrança</MenuItem>
            <MenuItem value="PROTESTO">Protesto</MenuItem>
          </TextField>
          <TextField
            select
            label="Status"
            value={lidaFilter}
            onChange={(e) => setLidaFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="false">Não lidas</MenuItem>
            <MenuItem value="true">Lidas</MenuItem>
          </TextField>
        </Box>
      </Card>

      {/* Lista de Mensagens */}
      {error && <ErrorAlert message="Erro ao carregar mensagens. Tente novamente." />}

      {isLoading ? (
        <LoadingSpinner />
      ) : mensagens?.itens.length === 0 ? (
        <Alert severity="info">Nenhuma mensagem encontrada</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {mensagens?.itens.map((mensagem) => (
            <Card
              key={mensagem.id}
              sx={{
                bgcolor: mensagem.lida ? 'background.paper' : 'action.hover',
                border: mensagem.prioridade === 'ALTA' ? '2px solid' : undefined,
                borderColor: mensagem.prioridade === 'ALTA' ? 'error.main' : undefined,
              }}
            >
              <CardHeader
                avatar={getTipoIcon(mensagem.tipo_mensagem)}
                action={
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {!mensagem.lida && <Chip label="Nova" color="error" size="small" />}
                    {mensagem.prioridade === 'ALTA' && (
                      <Chip label="Prioritária" color="error" size="small" />
                    )}
                    <IconButton
                      onClick={() => handleToggleExpand(mensagem.id, mensagem)}
                      sx={{
                        transform: expandedId === mensagem.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s',
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>
                }
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" component="span">
                      {mensagem.assunto}
                    </Typography>
                  </Box>
                }
                subheader={
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    <Chip label={getTipoLabel(mensagem.tipo_mensagem)} size="small" color={getTipoColor(mensagem.tipo_mensagem)} />
                    <Chip label={formatters.date(mensagem.data_envio)} size="small" />
                    <Chip label={new Date(mensagem.data_envio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} size="small" />
                  </Box>
                }
              />

              <Collapse in={expandedId === mensagem.id}>
                <Divider />
                <CardContent>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                    {mensagem.conteudo}
                  </Typography>

                  {mensagem.anexos && mensagem.anexos.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Anexos:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {mensagem.anexos.map((anexo, index) => (
                          <Chip key={index} label={anexo.nome} clickable component="a" href={anexo.url} target="_blank" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {mensagem.lida && mensagem.data_leitura && (
                    <Alert severity="success" icon={<MarkEmailReadIcon />} sx={{ mt: 2 }}>
                      Lida em {formatters.date(mensagem.data_leitura)} às{' '}
                      {new Date(mensagem.data_leitura).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Alert>
                  )}
                </CardContent>
              </Collapse>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}
