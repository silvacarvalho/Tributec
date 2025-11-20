import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Cancel,
  Payment,
  Gavel,
  Notifications,
  CheckCircle,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { fiscalService } from '../../services/fiscalService'
import type { StatusAutoInfracao } from '../../types/fiscal'
import { NotificarAutoDialog } from '../../components/fiscal/NotificarAutoDialog'
import { JulgarDefesaDialog } from '../../components/fiscal/JulgarDefesaDialog'
import { RegistrarPagamentoDialog } from '../../components/fiscal/RegistrarPagamentoDialog'
import { CancelarAutoDialog } from '../../components/fiscal/CancelarAutoDialog'

const STATUS_COLORS: Record<StatusAutoInfracao, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  LAVRADO: 'default',
  NOTIFICADO: 'warning',
  PAGO: 'success',
  EM_DEFESA: 'info',
  EM_RECURSO: 'info',
  DEFERIDO: 'success',
  INDEFERIDO: 'error',
  CANCELADO: 'default',
  INSCRITO_DIVIDA: 'error',
}

export function DetalhesAutoPage() {
  const { autoId } = useParams<{ autoId: string }>()
  const navigate = useNavigate()
  const [dialogNotificar, setDialogNotificar] = useState(false)
  const [dialogJulgar, setDialogJulgar] = useState(false)
  const [dialogPagamento, setDialogPagamento] = useState(false)
  const [dialogCancelar, setDialogCancelar] = useState(false)

  const { data: auto, isLoading } = useQuery({
    queryKey: ['auto-infracao', autoId],
    queryFn: () => fiscalService.obterAutoPorId(autoId!)
  })

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarData = (data: string | null) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    )
  }

  if (!auto) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Auto de infração não encontrado</Alert>
        <Button onClick={() => navigate('/fiscal/autos-infracao')} sx={{ mt: 2 }}>
          Voltar
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/fiscal/autos-infracao')}>
            Voltar
          </Button>
          <Typography variant="h4">Auto de Infração {auto.numero_auto}</Typography>
          <Chip label={auto.status} color={STATUS_COLORS[auto.status]} />
          {auto.reincidente && (
            <Chip label="REINCIDENTE" color="error" variant="outlined" />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {auto.status === 'LAVRADO' && (
            <Button
              variant="contained"
              startIcon={<Notifications />}
              onClick={() => setDialogNotificar(true)}
            >
              Notificar
            </Button>
          )}
          {auto.status === 'EM_DEFESA' && (
            <Button
              variant="contained"
              startIcon={<Gavel />}
              onClick={() => setDialogJulgar(true)}
            >
              Julgar Defesa
            </Button>
          )}
          {['NOTIFICADO', 'INDEFERIDO'].includes(auto.status) && (
            <Button
              variant="contained"
              color="success"
              startIcon={<Payment />}
              onClick={() => setDialogPagamento(true)}
            >
              Registrar Pagamento
            </Button>
          )}
          {!auto.cancelado && auto.status !== 'PAGO' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => setDialogCancelar(true)}
            >
              Cancelar
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Informações Principais */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Dados do Auto" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Número do Auto
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {auto.numero_auto}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Data de Lavratura
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatarData(auto.data_lavratura)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Infração
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {auto.codigo_infracao} - {auto.descricao_infracao}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Base Legal
                  </Typography>
                  <Typography variant="body1">
                    {auto.artigo_lei}
                  </Typography>
                </Grid>

                {auto.local_infracao && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Local da Infração
                    </Typography>
                    <Typography variant="body1">
                      {auto.local_infracao}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Autuado
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {auto.autuado_nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {auto.autuado_cpf_cnpj}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Fiscal Autuante
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {auto.fiscal_nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Matrícula: {auto.fiscal_matricula}
                  </Typography>
                </Grid>

                {auto.observacoes && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Observações
                      </Typography>
                      <Typography variant="body2">
                        {auto.observacoes}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Defesa */}
          {auto.data_defesa && (
            <Card sx={{ mt: 3 }}>
              <CardHeader title="Defesa Apresentada" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Data da Defesa
                    </Typography>
                    <Typography variant="body1">
                      {formatarData(auto.data_defesa)}
                    </Typography>
                  </Grid>
                  {auto.data_decisao_defesa && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Data da Decisão
                        </Typography>
                        <Typography variant="body1">
                          {formatarData(auto.data_decisao_defesa)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          Decisão
                        </Typography>
                        <Typography variant="body1">
                          <Chip
                            label={auto.decisao_defesa}
                            color={auto.decisao_defesa === 'DEFERIDO' ? 'success' : 'error'}
                            size="small"
                          />
                        </Typography>
                      </Grid>
                      {auto.motivo_decisao && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            Motivo da Decisão
                          </Typography>
                          <Typography variant="body2">
                            {auto.motivo_decisao}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Valores e Timeline */}
        <Grid item xs={12} md={4}>
          {/* Valores */}
          <Card>
            <CardHeader title="Valores" />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Tipo de Multa
                </Typography>
                <Typography variant="body1">
                  {auto.tipo_multa}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Valor da Multa (UFM)
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {auto.valor_multa_ufm.toFixed(2)} UFM
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  UFM de Referência
                </Typography>
                <Typography variant="body2">
                  {formatarMoeda(auto.ufm_valor_referencia)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Valor da Multa
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatarMoeda(auto.valor_multa)}
                </Typography>
              </Box>

              {auto.reincidente && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Acréscimo Reincidência
                  </Typography>
                  <Typography variant="body1" color="error">
                    + {formatarMoeda(auto.acrescimo_reincidencia)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({auto.quantidade_reincidencias}ª reincidência)
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Valor Total
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  {formatarMoeda(auto.valor_total)}
                </Typography>
              </Box>

              {auto.valor_pago && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Valor Pago
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatarMoeda(auto.valor_pago)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    em {formatarData(auto.data_pagamento)}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card sx={{ mt: 3 }}>
            <CardHeader title="Histórico" />
            <CardContent>
              <Timeline position="right">
                <TimelineItem>
                  <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
                    {formatarData(auto.data_lavratura)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="primary" />
                    {auto.data_notificacao && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography>Auto Lavrado</Typography>
                  </TimelineContent>
                </TimelineItem>

                {auto.data_notificacao && (
                  <TimelineItem>
                    <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
                      {formatarData(auto.data_notificacao)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="warning" />
                      {auto.data_defesa && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography>Notificado</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {auto.forma_notificacao}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {auto.data_defesa && (
                  <TimelineItem>
                    <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
                      {formatarData(auto.data_defesa)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="info" />
                      {auto.data_decisao_defesa && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography>Defesa Apresentada</Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {auto.data_decisao_defesa && (
                  <TimelineItem>
                    <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
                      {formatarData(auto.data_decisao_defesa)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color={auto.decisao_defesa === 'DEFERIDO' ? 'success' : 'error'} />
                      {auto.data_pagamento && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography>Defesa {auto.decisao_defesa}</Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {auto.data_pagamento && (
                  <TimelineItem>
                    <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
                      {formatarData(auto.data_pagamento)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="success">
                        <CheckCircle />
                      </TimelineDot>
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography>Pago</Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {auto.cancelado && (
                  <TimelineItem>
                    <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
                      {formatarData(auto.data_cancelamento)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="error">
                        <Cancel />
                      </TimelineDot>
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography>Cancelado</Typography>
                      {auto.motivo_cancelamento && (
                        <Typography variant="caption" color="text.secondary">
                          {auto.motivo_cancelamento}
                        </Typography>
                      )}
                    </TimelineContent>
                  </TimelineItem>
                )}
              </Timeline>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <NotificarAutoDialog
        open={dialogNotificar}
        onClose={() => setDialogNotificar(false)}
        autoId={autoId!}
        numeroAuto={auto.numero_auto}
      />

      <JulgarDefesaDialog
        open={dialogJulgar}
        onClose={() => setDialogJulgar(false)}
        autoId={autoId!}
        numeroAuto={auto.numero_auto}
        dataDefesa={auto.data_defesa}
      />

      <RegistrarPagamentoDialog
        open={dialogPagamento}
        onClose={() => setDialogPagamento(false)}
        autoId={autoId!}
        numeroAuto={auto.numero_auto}
        valorTotal={auto.valor_total}
      />

      <CancelarAutoDialog
        open={dialogCancelar}
        onClose={() => setDialogCancelar(false)}
        autoId={autoId!}
        numeroAuto={auto.numero_auto}
      />
    </Box>
  )
}
