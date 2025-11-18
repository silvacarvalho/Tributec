import { useState } from 'react'
import { Box, Typography, Card, CardContent, Chip, Button, Dialog, DialogTitle, DialogContent, Table, TableBody, TableRow, TableCell, LinearProgress, Alert, Grid } from '@mui/material'
import { Payment, Visibility } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { portalService } from '@/services/portalService'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { formatters } from '@/utils/formatters'

export function MeusParcelamentosPage() {
  const [selectedParc, setSelectedParc] = useState<string | null>(null)

  const { data: parcelamentos, isLoading, error } = useQuery({
    queryKey: ['portal-parcelamentos'],
    queryFn: () => portalService.listarMeusParcelamentos(),
  })

  const { data: parcelas } = useQuery({
    queryKey: ['portal-parcelas', selectedParc],
    queryFn: () => portalService.obterParcelasParcelamento(selectedParc!),
    enabled: !!selectedParc,
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorAlert message="Erro ao carregar parcelamentos" />

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Meus Parcelamentos
      </Typography>

      {parcelamentos?.length === 0 ? (
        <Alert severity="info">Você não possui parcelamentos cadastrados</Alert>
      ) : (
        <Grid container spacing={3}>
          {parcelamentos?.map((p) => {
            const progresso = (p.parcelas_pagas / p.numero_parcelas) * 100
            return (
              <Grid item xs={12} md={6} key={p.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">{p.numero_parcelamento}</Typography>
                      <Chip label={p.status} color={p.status === 'ATIVO' ? 'success' : 'default'} size="small" />
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      Valor Parcelado: <strong>{formatters.currency(p.valor_parcelado)}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {p.numero_parcelas}x de {formatters.currency(p.valor_parcela)}
                    </Typography>

                    <Box sx={{ mt: 2, mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">{p.parcelas_pagas} de {p.numero_parcelas} pagas</Typography>
                        <Typography variant="caption">{progresso.toFixed(0)}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={progresso} />
                    </Box>

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => setSelectedParc(p.id)}
                      sx={{ mt: 2 }}
                    >
                      Ver Parcelas
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      <Dialog open={!!selectedParc} onClose={() => setSelectedParc(null)} maxWidth="md" fullWidth>
        <DialogTitle>Parcelas do Parcelamento</DialogTitle>
        <DialogContent>
          {parcelas && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Parcelamento: {parcelas.numero_parcelamento}
              </Typography>

              <Table size="small">
                <TableBody>
                  {parcelas.parcelas.map((parc) => (
                    <TableRow key={parc.id}>
                      <TableCell>Parcela {parc.numero_parcela}</TableCell>
                      <TableCell>{formatters.currency(parc.valor_parcela)}</TableCell>
                      <TableCell>{formatters.date(parc.data_vencimento)}</TableCell>
                      <TableCell>
                        <Chip
                          label={parc.situacao}
                          size="small"
                          color={parc.situacao === 'PAGO' ? 'success' : parc.situacao === 'VENCIDO' ? 'error' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
