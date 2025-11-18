import { Box, Typography, Grid, Card, CardContent, CardHeader, Chip, Button, Alert, List, ListItem, ListItemText, Divider } from '@mui/material'
import {
  Home as HomeIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Payment as PaymentIcon,
  Email as EmailIcon,
  Warning as WarningIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { portalService } from '@/services/portalService'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { formatters } from '@/utils/formatters'

export function DashboardContribuinte() {
  const navigate = useNavigate()

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['portal-dashboard'],
    queryFn: () => portalService.obterDashboard(),
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorAlert message="Erro ao carregar dashboard. Tente novamente." />

  const { contribuinte, resumo, proximos_vencimentos, tem_dtd, dtd_id } = dashboard!

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bem-vindo, {contribuinte.nome}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {contribuinte.cpf ? `CPF: ${formatters.cpf(contribuinte.cpf)}` : `CNPJ: ${formatters.cnpj(contribuinte.cnpj || '')}`}
        </Typography>
      </Box>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Meus Imóveis
                  </Typography>
                  <Typography variant="h4">{resumo.total_imoveis}</Typography>
                </Box>
                <HomeIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
              <Button size="small" onClick={() => navigate('/portal/imoveis')} sx={{ mt: 1 }}>
                Ver Imóveis
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Estabelecimentos
                  </Typography>
                  <Typography variant="h4">{resumo.total_estabelecimentos}</Typography>
                </Box>
                <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
              <Button size="small" onClick={() => navigate('/portal/estabelecimentos')} sx={{ mt: 1 }}>
                Ver Estabelecimentos
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Débitos Abertos
                  </Typography>
                  <Typography variant="h4" color={resumo.total_debitos > 0 ? 'error.main' : 'success.main'}>
                    {resumo.total_debitos}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatters.currency(resumo.valor_total_debitos)}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: resumo.total_debitos > 0 ? 'error.main' : 'success.main', opacity: 0.3 }} />
              </Box>
              <Button size="small" onClick={() => navigate('/portal/debitos')} sx={{ mt: 1 }}>
                Ver Débitos
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Parcelamentos
                  </Typography>
                  <Typography variant="h4">{resumo.parcelamentos_ativos}</Typography>
                </Box>
                <PaymentIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
              <Button size="small" onClick={() => navigate('/portal/parcelamentos')} sx={{ mt: 1 }}>
                Ver Parcelamentos
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Próximos Vencimentos */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              avatar={<WarningIcon color="warning" />}
              title="Próximos Vencimentos"
              subheader="Próximos 30 dias"
            />
            <Divider />
            <CardContent>
              {proximos_vencimentos.length === 0 ? (
                <Alert severity="success">Nenhum vencimento nos próximos 30 dias</Alert>
              ) : (
                <List>
                  {proximos_vencimentos.map((venc, index) => (
                    <Box key={venc.id}>
                      <ListItem>
                        <ReceiptIcon sx={{ mr: 2, color: 'text.secondary' }} />
                        <ListItemText
                          primary={venc.descricao}
                          secondary={`Vencimento: ${formatters.date(venc.data_vencimento)}`}
                        />
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body1" fontWeight="bold">
                            {formatters.currency(venc.valor)}
                          </Typography>
                          <Chip label={venc.tipo} size="small" />
                        </Box>
                      </ListItem>
                      {index < proximos_vencimentos.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Avisos e Ações */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardHeader
              avatar={<EmailIcon color="primary" />}
              title="Mensagens DTD"
              subheader={tem_dtd ? `${resumo.mensagens_nao_lidas} não lidas` : 'Não cadastrado'}
            />
            <CardContent>
              {tem_dtd ? (
                <>
                  {resumo.mensagens_nao_lidas > 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Você tem {resumo.mensagens_nao_lidas} mensagens não lidas
                    </Alert>
                  )}
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/portal/dtd/${dtd_id}/mensagens`)}
                  >
                    Ver Mensagens
                  </Button>
                </>
              ) : (
                <Alert severity="warning">
                  Você ainda não possui DTD cadastrado. Entre em contato com a prefeitura.
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Acesso Rápido" />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" fullWidth onClick={() => navigate('/portal/debitos')}>
                  Meus Débitos
                </Button>
                <Button variant="outlined" fullWidth onClick={() => navigate('/portal/imoveis')}>
                  Meus Imóveis
                </Button>
                <Button variant="outlined" fullWidth onClick={() => navigate('/portal/cadastro')}>
                  Meu Cadastro
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
