/**
 * Página de Detalhes de Imóvel
 * Visualização com tabs: Dados, Proprietários, IPTU
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
  Home as HomeIcon,
} from '@mui/icons-material'
import { imovelService } from '@/services/imovelService'

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

export const ImovelDetalhesPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tabAtual, setTabAtual] = useState(0)

  const { data: imovel, isLoading } = useQuery({
    queryKey: ['imovel', id],
    queryFn: () => imovelService.obter(id!),
    enabled: !!id,
  })

  const handleEditar = () => {
    navigate(`/cadastro/imoveis/${id}/editar`)
  }

  const handleVoltar = () => {
    navigate('/cadastro/imoveis')
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    )
  }

  if (!imovel) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Imóvel não encontrado</Alert>
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
          <HomeIcon />
          <Typography variant="h4">Imóvel {imovel.inscricao_imobiliaria}</Typography>
          <Chip
            label={imovel.ativo ? 'Ativo' : 'Inativo'}
            color={imovel.ativo ? 'success' : 'default'}
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
          <Tab label="Dados do Imóvel" />
          <Tab label="Proprietário" />
          <Tab label="Características" />
        </Tabs>

        {/* Tab 1: Dados do Imóvel */}
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
                Inscrição Imobiliária
              </Typography>
              <Typography variant="body1">{imovel.inscricao_imobiliaria}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Tipo de Imóvel
              </Typography>
              <Typography variant="body1">{imovel.tipo_imovel || '-'}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Tipo de Uso
              </Typography>
              <Typography variant="body1">{imovel.tipo_uso || '-'}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Setor Fiscal
              </Typography>
              <Typography variant="body1">
                {imovel.setor_fiscal?.nome || imovel.setor_fiscal_id || '-'}
              </Typography>
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
                {imovel.logradouro?.tipo_logradouro} {imovel.logradouro?.nome || '-'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Número
              </Typography>
              <Typography variant="body1">{imovel.numero || 'S/N'}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Bairro
              </Typography>
              <Typography variant="body1">{imovel.logradouro?.bairro || '-'}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                CEP
              </Typography>
              <Typography variant="body1">{imovel.logradouro?.cep || '-'}</Typography>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Proprietário */}
        <TabPanel value={tabAtual} index={1}>
          <Typography variant="h6" gutterBottom>
            Proprietário
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {imovel.proprietario ? (
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Nome/Razão Social
                    </Typography>
                    <Typography variant="body1">
                      {imovel.proprietario.tipo_pessoa === 'F'
                        ? imovel.proprietario.nome
                        : imovel.proprietario.razao_social}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      CPF/CNPJ
                    </Typography>
                    <Typography variant="body1">
                      {imovel.proprietario.cpf || imovel.proprietario.cnpj || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Tipo
                    </Typography>
                    <Chip
                      label={
                        imovel.proprietario.tipo_pessoa === 'F'
                          ? 'Pessoa Física'
                          : 'Pessoa Jurídica'
                      }
                      color={imovel.proprietario.tipo_pessoa === 'F' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/cadastro/pessoas/${imovel.proprietario_id}`)}
                    >
                      Ver Detalhes do Proprietário
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="warning">Proprietário não cadastrado</Alert>
          )}
        </TabPanel>

        {/* Tab 3: Características */}
        <TabPanel value={tabAtual} index={2}>
          <Typography variant="h6" gutterBottom>
            Características do Imóvel
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            {imovel.terreno && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Terreno
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Área do Terreno (m²)
                  </Typography>
                  <Typography variant="body1">
                    {imovel.terreno.area_terreno?.toFixed(2) || '-'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Testada (m)
                  </Typography>
                  <Typography variant="body1">
                    {imovel.terreno.testada?.toFixed(2) || '-'}
                  </Typography>
                </Grid>
              </>
            )}

            {imovel.edificacoes && imovel.edificacoes.length > 0 && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                    Edificações
                  </Typography>
                </Grid>

                {imovel.edificacoes.map((edificacao: any, index: number) => (
                  <Grid item xs={12} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          Edificação #{index + 1}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="text.secondary">
                              Área (m²)
                            </Typography>
                            <Typography variant="body1">
                              {edificacao.area_construida?.toFixed(2) || '-'}
                            </Typography>
                          </Grid>

                          <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="text.secondary">
                              Tipo
                            </Typography>
                            <Typography variant="body1">{edificacao.tipo_edificacao || '-'}</Typography>
                          </Grid>

                          <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="text.secondary">
                              Pavimentos
                            </Typography>
                            <Typography variant="body1">{edificacao.numero_pavimentos || '-'}</Typography>
                          </Grid>

                          <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="text.secondary">
                              Ano Construção
                            </Typography>
                            <Typography variant="body1">{edificacao.ano_construcao || '-'}</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </>
            )}

            {!imovel.terreno && (!imovel.edificacoes || imovel.edificacoes.length === 0) && (
              <Grid item xs={12}>
                <Alert severity="info">Nenhuma característica cadastrada</Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  )
}
