import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab'
import { Typography, Paper, Box, Chip } from '@mui/material'
import {
  Gavel,
  Notifications,
  Description,
  AttachMoney,
  Cancel,
  CheckCircle,
  HourglassEmpty
} from '@mui/icons-material'
import type { AutoInfracao } from '../../types/fiscal'

interface AutoTimelineProps {
  auto: AutoInfracao
}

export function AutoTimeline({ auto }: AutoTimelineProps) {
  const formatarData = (data: string | null) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const eventos = [
    {
      tipo: 'LAVRATURA',
      titulo: 'Auto Lavrado',
      descricao: `Fiscal: ${auto.fiscal_nome || 'N/A'}`,
      data: auto.data_lavratura,
      icon: <Gavel />,
      color: 'primary' as const,
      completed: true
    },
    {
      tipo: 'NOTIFICACAO',
      titulo: 'Notificação',
      descricao: auto.forma_notificacao
        ? `Forma: ${auto.forma_notificacao}`
        : 'Aguardando notificação',
      data: auto.data_notificacao,
      icon: <Notifications />,
      color: auto.data_notificacao ? ('success' as const) : ('grey' as const),
      completed: !!auto.data_notificacao
    },
    {
      tipo: 'DEFESA',
      titulo: 'Defesa',
      descricao:
        auto.status === 'EM_DEFESA' || auto.data_defesa
          ? 'Defesa apresentada'
          : 'Aguardando prazo de defesa',
      data: auto.data_defesa,
      icon: <Description />,
      color: auto.data_defesa ? ('info' as const) : ('grey' as const),
      completed: !!auto.data_defesa
    }
  ]

  // Adiciona julgamento se houver
  if (auto.status === 'DEFERIDO' || auto.status === 'INDEFERIDO') {
    eventos.push({
      tipo: 'JULGAMENTO',
      titulo: 'Julgamento',
      descricao: `Decisão: ${auto.status}`,
      data: auto.data_decisao_defesa,
      icon: auto.status === 'DEFERIDO' ? <CheckCircle /> : <Cancel />,
      color: auto.status === 'DEFERIDO' ? ('success' as const) : ('error' as const),
      completed: true
    })
  }

  // Adiciona pagamento se houver
  if (auto.status === 'PAGO') {
    eventos.push({
      tipo: 'PAGAMENTO',
      titulo: 'Pagamento',
      descricao: `Valor: R$ ${auto.valor_pago?.toFixed(2) || '0.00'}`,
      data: auto.data_pagamento,
      icon: <AttachMoney />,
      color: 'success' as const,
      completed: true
    })
  }

  // Adiciona cancelamento se houver
  if (auto.status === 'CANCELADO') {
    eventos.push({
      tipo: 'CANCELAMENTO',
      titulo: 'Cancelamento',
      descricao: auto.motivo_cancelamento || 'Auto cancelado',
      data: auto.updated_at,
      icon: <Cancel />,
      color: 'error' as const,
      completed: true
    })
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <HourglassEmpty sx={{ mr: 1 }} />
        <Typography variant="h6">Histórico do Auto</Typography>
      </Box>

      <Timeline position="right">
        {eventos.map((evento, index) => (
          <TimelineItem key={evento.tipo}>
            <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.2 }}>
              <Typography variant="caption">{formatarData(evento.data)}</Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color={evento.color} variant={evento.completed ? 'filled' : 'outlined'}>
                {evento.icon}
              </TimelineDot>
              {index < eventos.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Paper elevation={evento.completed ? 2 : 0} sx={{ p: 2, bgcolor: evento.completed ? 'background.paper' : 'action.hover' }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {evento.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {evento.descricao}
                </Typography>
                {!evento.completed && (
                  <Chip
                    label="Pendente"
                    size="small"
                    color="default"
                    sx={{ mt: 1 }}
                  />
                )}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  )
}
