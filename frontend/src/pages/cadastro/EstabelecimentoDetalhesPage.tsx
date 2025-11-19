/**
 * Página de Detalhes de Estabelecimento
 * Visualização com tabs: Dados, Atividades, ISS
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Chip,
  Button,
  IconButton,
  Divider,
  Alert,
  Card,
  CardContent,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
} from '@mui/icons-material'
import { estabelecimentoService } from '@/services/estabelecimentoService'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export const EstabelecimentoDetalhesPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tabAtual, setTabAtual] = useState(0)

  const { data: estabelecimento, isLoading } = useQuery({
    queryKey: ['estabelecimento', id],
    queryFn: () => estabelecimentoService.obterPorId(id!),
    enabled: !!id,
  })

  const handleEditar = () => {
    navigate(`/cadastro/estabelecimentos/${id}/editar`)
  }

  const handleVoltar = () => {
    navigate('/cadastro/estabelecimentos')
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    )
  }

  if (!estabelecimento) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Estabelecimento não encontrado</Alert>
        <Button onClick={handleVoltar} sx={{ mt: 2 }}>
          Voltar
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleVoltar}>
            <ArrowBackIcon />
          </IconButton>
          <BusinessIcon />
          <Typography variant="h4">
            {estabelecimento.nome_fantasia || estabelecimento.razao_social}
          </Typography>
          <Chip
            label={estabelecimento.ativo ? 'Ativo' : 'Inativo'}
            color={estabelecimento.ativo ? 'success' : 'default'}
            size="small"
          />
        </Box>
        <Button variant="contained" startIcon={<EditIcon />} onClick={handleEditar}>
          Editar
        </Button>
      </Box>

      {/* Tabs */}
      <Paper>
        <Tabs value={tabAtual} onChange={(_, newValue) => setTabAtual(newValue)}>
          <Tab label="Dados do Estabelecimento" />
          <Tab label="Pessoa Jurídica" />
          <Tab label="Regime Tributário" />
        </Tabs>

        {/* Tab 1: Dados do Estabelecimento */}
        <TabPanel value={tabAtual} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Identificação
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                CCM - Inscrição Municipal
              </Typography>
              <Typography variant="body1">{estabelecimento.inscricao_municipal}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Nome Fantasia
              </Typography>
              <Typography variant="body1">{estabelecimento.nome_fantasia || '-'}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Razão Social
              </Typography>
              <Typography variant="body1">{estabelecimento.razao_social || '-'}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                CNAE Principal
              </Typography>
              <Typography variant="body1">{estabelecimento.cnae_principal || '-'}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Localização
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={8}>
              <Typography variant="body2" color="text.secondary">
                Logradouro
              </Typography>
              <Typography variant="body1">
                {estabelecimento.logradouro
                  ? `${estabelecimento.logradouro.tipo_logradouro} ${estabelecimento.logradouro.nome}`
                  : '-'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Número
              </Typography>
              <Typography variant="body1">{estabelecimento.numero || 'S/N'}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Complemento
              </Typography>
              <Typography variant="body1">{estabelecimento.complemento || '-'}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Bairro
              </Typography>
              <Typography variant="body1">{estabelecimento.logradouro?.bairro || '-'}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Contato
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Telefone
              </Typography>
              <Typography variant="body1">{estabelecimento.telefone || '-'}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                E-mail
              </Typography>
              <Typography variant="body1">{estabelecimento.email || '-'}</Typography>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Pessoa Jurídica */}
        <TabPanel value={tabAtual} index={1}>
          <Typography variant="h6" gutterBottom>
            Pessoa Jurídica Responsável
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {estabelecimento.pessoa ? (
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Razão Social
                    </Typography>
                    <Typography variant="body1">
                      {estabelecimento.pessoa.razao_social || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      CNPJ
                    </Typography>
                    <Typography variant="body1">{estabelecimento.pessoa.cnpj || '-'}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Inscrição Estadual
                    </Typography>
                    <Typography variant="body1">
                      {estabelecimento.pessoa.inscricao_estadual || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/cadastro/pessoas/${estabelecimento.pessoa_id}`)}
                    >
                      Ver Detalhes da Pessoa Jurídica
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="warning">Pessoa jurídica não vinculada</Alert>
          )}
        </TabPanel>

        {/* Tab 3: Regime Tributário */}
        <TabPanel value={tabAtual} index={2}>
          <Typography variant="h6" gutterBottom>
            Regime Tributário e ISS
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Regime ISS
              </Typography>
              <Chip
                label={estabelecimento.regime_issqn || 'Não definido'}
                color={estabelecimento.regime_issqn ? 'primary' : 'default'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Alíquota ISS Padrão
              </Typography>
              <Typography variant="body1">
                {estabelecimento.aliquota_iss ? `${estabelecimento.aliquota_iss}%` : '-'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Optante Simples Nacional
              </Typography>
              <Chip
                label={estabelecimento.optante_simples ? 'Sim' : 'Não'}
                color={estabelecimento.optante_simples ? 'success' : 'default'}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Emite NF-e
              </Typography>
              <Chip
                label={estabelecimento.emite_nfe ? 'Sim' : 'Não'}
                color={estabelecimento.emite_nfe ? 'success' : 'default'}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Data de Início das Atividades
              </Typography>
              <Typography variant="body1">
                {estabelecimento.data_inicio_atividades
                  ? new Date(estabelecimento.data_inicio_atividades).toLocaleDateString('pt-BR')
                  : '-'}
              </Typography>
            </Grid>

            {estabelecimento.data_encerramento && (
              <Grid item xs={12}>
                <Alert severity="warning">
                  <Typography variant="body2">
                    Estabelecimento encerrado em:{' '}
                    {new Date(estabelecimento.data_encerramento).toLocaleDateString('pt-BR')}
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  )
}
