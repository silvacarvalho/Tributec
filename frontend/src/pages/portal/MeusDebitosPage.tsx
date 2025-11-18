import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert, Grid } from '@mui/material'
import { AttachMoney, Warning, CheckCircle } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { portalService } from '@/services/portalService'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { formatters } from '@/utils/formatters'

export function MeusDebitosPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['portal-debitos'],
    queryFn: () => portalService.listarDebitos(),
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorAlert message="Erro ao carregar débitos" />

  const { debitos, resumo } = data!

  const getSituacaoColor = (situacao: string) => {
    return situacao === 'VENCIDO' ? 'error' : 'warning'
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Meus Débitos
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <AttachMoney sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h5">{resumo.total_debitos}</Typography>
            <Typography variant="body2" color="text.secondary">Total de Débitos</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Warning sx={{ fontSize: 40, color: 'error.main' }} />
            <Typography variant="h5">{resumo.debitos_vencidos}</Typography>
            <Typography variant="body2" color="text.secondary">Vencidos</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
            <Typography variant="h5">{formatters.currency(resumo.valor_total)}</Typography>
            <Typography variant="body2" color="text.secondary">Valor Total</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card>
        {debitos.length === 0 ? (
          <Alert severity="success" sx={{ m: 2 }}>Você não possui débitos em aberto!</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Referência</TableCell>
                  <TableCell align="right">Valor Original</TableCell>
                  <TableCell align="right">Valor Atualizado</TableCell>
                  <TableCell>Vencimento</TableCell>
                  <TableCell>Situação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {debitos.map((deb) => (
                  <TableRow key={deb.id} hover>
                    <TableCell><Chip label={deb.tipo} size="small" color="primary" /></TableCell>
                    <TableCell>{deb.descricao}</TableCell>
                    <TableCell>{deb.referencia}</TableCell>
                    <TableCell align="right">{formatters.currency(deb.valor_original)}</TableCell>
                    <TableCell align="right"><strong>{formatters.currency(deb.valor_atualizado)}</strong></TableCell>
                    <TableCell>
                      {formatters.date(deb.data_vencimento)}
                      {deb.dias_vencido > 0 && (
                        <Typography variant="caption" color="error" display="block">
                          {deb.dias_vencido} dias vencido
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={deb.situacao} size="small" color={getSituacaoColor(deb.situacao)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  )
}
