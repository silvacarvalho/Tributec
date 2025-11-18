import { useState } from 'react'
import { Box, Typography, Grid, Card, CardContent, CardHeader, Chip, Button, Dialog, DialogTitle, DialogContent, Table, TableBody, TableRow, TableCell } from '@mui/material'
import { Home, AccountBalance, Visibility } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { portalService } from '@/services/portalService'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { formatters } from '@/utils/formatters'

export function MeusImoveisPage() {
  const [selectedImovel, setSelectedImovel] = useState<string | null>(null)

  const { data: imoveis, isLoading, error } = useQuery({
    queryKey: ['portal-imoveis'],
    queryFn: () => portalService.listarMeusImoveis(),
  })

  const { data: debitos } = useQuery({
    queryKey: ['portal-imovel-debitos', selectedImovel],
    queryFn: () => portalService.obterDebitosImovel(selectedImovel!),
    enabled: !!selectedImovel,
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorAlert message="Erro ao carregar imóveis" />

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Meus Imóveis
      </Typography>

      <Grid container spacing={3}>
        {imoveis?.map((imovel: any) => (
          <Grid item xs={12} md={6} key={imovel.id}>
            <Card>
              <CardHeader
                avatar={<Home color="primary" />}
                title={imovel.inscricao_imobiliaria}
                subheader={imovel.tipo_imovel}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {imovel.endereco || 'Endereço não cadastrado'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  <Chip label={imovel.tipo_uso} size="small" />
                  {imovel.valor_venal && (
                    <Chip
                      icon={<AccountBalance />}
                      label={`Valor Venal: ${formatters.currency(imovel.valor_venal)}`}
                      size="small"
                      color="primary"
                    />
                  )}
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => setSelectedImovel(imovel.id)}
                  sx={{ mt: 2 }}
                >
                  Ver Débitos
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!selectedImovel} onClose={() => setSelectedImovel(null)} maxWidth="md" fullWidth>
        <DialogTitle>Débitos do Imóvel</DialogTitle>
        <DialogContent>
          {debitos && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Inscrição: {debitos.inscricao_imobiliaria}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                {debitos.endereco}
              </Typography>

              {debitos.debitos.length === 0 ? (
                <Typography color="success.main">Nenhum débito em aberto</Typography>
              ) : (
                <>
                  <Table size="small">
                    <TableBody>
                      {debitos.debitos.map((d: any) => (
                        <TableRow key={d.id}>
                          <TableCell>{d.exercicio} - Parc. {d.numero_parcela}/{d.total_parcelas}</TableCell>
                          <TableCell align="right">
                            <strong>{formatters.currency(d.valor_total)}</strong>
                          </TableCell>
                          <TableCell>{formatters.date(d.data_vencimento)}</TableCell>
                          <TableCell>
                            <Chip label={d.situacao} size="small" color={d.situacao === 'VENCIDO' ? 'error' : 'warning'} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Typography variant="h6" sx={{ mt: 2, textAlign: 'right' }}>
                    Total: {formatters.currency(debitos.valor_total)}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
