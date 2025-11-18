import { useState } from 'react'
import { Box, Typography, Grid, Card, CardContent, CardHeader, Chip, Button, Dialog, DialogTitle, DialogContent, Table, TableBody, TableRow, TableCell } from '@mui/material'
import { Business, Visibility } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { portalService } from '@/services/portalService'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { formatters } from '@/utils/formatters'

export function MeusEstabelecimentosPage() {
  const [selectedEstab, setSelectedEstab] = useState<string | null>(null)

  const { data: estabelecimentos, isLoading, error } = useQuery({
    queryKey: ['portal-estabelecimentos'],
    queryFn: () => portalService.listarMeusEstabelecimentos(),
  })

  const { data: declaracoes } = useQuery({
    queryKey: ['portal-declaracoes', selectedEstab],
    queryFn: () => portalService.obterDeclaracoesEstabelecimento(selectedEstab!),
    enabled: !!selectedEstab,
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorAlert message="Erro ao carregar estabelecimentos" />

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Meus Estabelecimentos
      </Typography>

      <Grid container spacing={3}>
        {estabelecimentos?.map((estab: any) => (
          <Grid item xs={12} md={6} key={estab.id}>
            <Card>
              <CardHeader
                avatar={<Business color="primary" />}
                title={estab.inscricao_municipal}
                subheader={estab.nome_fantasia || 'Sem nome fantasia'}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {estab.endereco || 'Endereço não cadastrado'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  {estab.cnae && <Chip label={`CNAE: ${estab.cnae}`} size="small" />}
                  {estab.atividade_principal && <Chip label={estab.atividade_principal} size="small" color="primary" />}
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => setSelectedEstab(estab.id)}
                  sx={{ mt: 2 }}
                >
                  Ver Declarações ISSQN
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!selectedEstab} onClose={() => setSelectedEstab(null)} maxWidth="md" fullWidth>
        <DialogTitle>Declarações de ISSQN</DialogTitle>
        <DialogContent>
          {declaracoes && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                {declaracoes.inscricao_municipal} - {declaracoes.nome_fantasia}
              </Typography>

              {declaracoes.declaracoes.length === 0 ? (
                <Typography>Nenhuma declaração encontrada</Typography>
              ) : (
                <Table size="small">
                  <TableBody>
                    {declaracoes.declaracoes.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.mes_competencia}/{d.ano_competencia}</TableCell>
                        <TableCell><Chip label={d.regime_tributacao} size="small" /></TableCell>
                        <TableCell align="right">Receita: {formatters.currency(d.receita_bruta_total)}</TableCell>
                        <TableCell align="right">
                          <strong>ISSQN: {formatters.currency(d.valor_issqn)}</strong>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
