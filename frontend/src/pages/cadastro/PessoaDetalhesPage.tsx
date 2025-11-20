/**
 * Página de Detalhes de Pessoa
 * Visualização completa com tabs: Dados, Endereços, Imóveis, Estabelecimentos
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Star as StarIcon,
} from '@mui/icons-material'
import { pessoaService } from '@/services/pessoaService'
import enderecoService, { Endereco, EnderecoCreate } from '@/services/enderecoService'
import validacaoService from '@/services/validacaoService'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export const PessoaDetalhesPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tabAtual, setTabAtual] = useState(0)
  const [dialogEnderecoAberto, setDialogEnderecoAberto] = useState(false)
  const [enderecoEditando, setEnderecoEditando] = useState<Endereco | null>(null)

  // Buscar dados da pessoa
  const { data: pessoa, isLoading } = useQuery({
    queryKey: ['pessoa', id],
    queryFn: () => pessoaService.obter(id!),
    enabled: !!id,
  })

  // Formatar CPF/CNPJ para exibição
  const formatarDocumento = (pessoa: any) => {
    if (pessoa.tipo_pessoa === 'F') {
      return validacaoService.formatarCpf(pessoa.cpf || '')
    } else {
      return validacaoService.formatarCnpj(pessoa.cnpj || '')
    }
  }

  // Handler para editar
  const handleEditar = () => {
    navigate(`/cadastro/pessoas/${id}/editar`)
  }

  // Handler para voltar
  const handleVoltar = () => {
    navigate('/cadastro/pessoas')
  }

  // Adicionar endereço
  const handleAbrirDialogEndereco = (endereco?: Endereco) => {
    setEnderecoEditando(endereco || null)
    setDialogEnderecoAberto(true)
  }

  // Excluir endereço
  const excluirEnderecoMutation = useMutation({
    mutationFn: (enderecoId: number) => enderecoService.excluir(enderecoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoa', id] })
    },
  })

  // Definir endereço como principal
  const definirPrincipalMutation = useMutation({
    mutationFn: (enderecoId: number) => enderecoService.definirPrincipal(enderecoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pessoa', id] })
    },
  })

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    )
  }

  if (!pessoa) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Pessoa não encontrada</Alert>
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
          <Typography variant="h4">
            {pessoa.tipo_pessoa === 'F' ? pessoa.nome : pessoa.razao_social}
          </Typography>
          <Chip
            label={pessoa.tipo_pessoa === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'}
            color={pessoa.tipo_pessoa === 'F' ? 'primary' : 'secondary'}
            size="small"
          />
          <Chip
            label={pessoa.situacao_cadastral}
            color={pessoa.situacao_cadastral === 'ATIVO' ? 'success' : 'default'}
            size="small"
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEditar}
        >
          Editar
        </Button>
      </Box>

      {/* Tabs */}
      <Paper>
        <Tabs value={tabAtual} onChange={(_, newValue) => setTabAtual(newValue)}>
          <Tab label="Dados Cadastrais" />
          <Tab label="Endereços" />
          <Tab label="Imóveis" />
          <Tab label="Estabelecimentos" />
        </Tabs>

        {/* Tab 1: Dados Cadastrais */}
        <TabPanel value={tabAtual} index={0}>
          <Grid container spacing={3}>
            {/* Dados Básicos */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Dados Básicos
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {pessoa.tipo_pessoa === 'F' ? (
              <>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Nome Completo
                  </Typography>
                  <Typography variant="body1">{pessoa.nome || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    CPF
                  </Typography>
                  <Typography variant="body1">{formatarDocumento(pessoa)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    RG
                  </Typography>
                  <Typography variant="body1">{pessoa.rg || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Data de Nascimento
                  </Typography>
                  <Typography variant="body1">
                    {pessoa.data_nascimento
                      ? new Date(pessoa.data_nascimento).toLocaleDateString('pt-BR')
                      : '-'}
                  </Typography>
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Razão Social
                  </Typography>
                  <Typography variant="body1">{pessoa.razao_social || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Nome Fantasia
                  </Typography>
                  <Typography variant="body1">{pessoa.nome_fantasia || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    CNPJ
                  </Typography>
                  <Typography variant="body1">{formatarDocumento(pessoa)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Inscrição Estadual
                  </Typography>
                  <Typography variant="body1">{pessoa.inscricao_estadual || '-'}</Typography>
                </Grid>
              </>
            )}

            {/* Contato */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Contato
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Telefone Principal
              </Typography>
              <Typography variant="body1">{pessoa.telefone_principal || '-'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Telefone Secundário
              </Typography>
              <Typography variant="body1">{pessoa.telefone_secundario || '-'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                E-mail
              </Typography>
              <Typography variant="body1">{pessoa.email || '-'}</Typography>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Endereços */}
        <TabPanel value={tabAtual} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Endereços Cadastrados</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAbrirDialogEndereco()}
            >
              Adicionar Endereço
            </Button>
          </Box>

          {pessoa.enderecos && pessoa.enderecos.length > 0 ? (
            <List>
              {pessoa.enderecos.map((endereco: Endereco) => (
                <Card key={endereco.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={enderecoService.getLabelTipoEndereco(endereco.tipo_endereco)}
                          color={enderecoService.getCorTipoEndereco(endereco.tipo_endereco)}
                          size="small"
                        />
                        {endereco.endereco_principal && (
                          <Chip
                            icon={<StarIcon />}
                            label="Principal"
                            color="warning"
                            size="small"
                          />
                        )}
                      </Box>
                      <Box>
                        {!endereco.endereco_principal && (
                          <IconButton
                            size="small"
                            onClick={() => definirPrincipalMutation.mutate(endereco.id)}
                            title="Definir como principal"
                          >
                            <StarIcon />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleAbrirDialogEndereco(endereco)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (confirm('Deseja excluir este endereço?')) {
                              excluirEnderecoMutation.mutate(endereco.id)
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body1">
                      {enderecoService.formatarEndereco(endereco)}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </List>
          ) : (
            <Alert severity="info">Nenhum endereço cadastrado</Alert>
          )}
        </TabPanel>

        {/* Tab 3: Imóveis */}
        <TabPanel value={tabAtual} index={2}>
          <Typography variant="h6" gutterBottom>
            Imóveis Vinculados
          </Typography>
          {pessoa.imoveis && pessoa.imoveis.length > 0 ? (
            <List>
              {pessoa.imoveis.map((imovel: any) => (
                <ListItem key={imovel.id}>
                  <HomeIcon sx={{ mr: 2 }} />
                  <ListItemText
                    primary={imovel.inscricao_imobiliaria}
                    secondary={`${imovel.tipo_imovel} - ${imovel.logradouro || ''}`}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      onClick={() => navigate(`/cadastro/imoveis/${imovel.id}`)}
                    >
                      Detalhes
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">Nenhum imóvel vinculado</Alert>
          )}
        </TabPanel>

        {/* Tab 4: Estabelecimentos */}
        <TabPanel value={tabAtual} index={3}>
          <Typography variant="h6" gutterBottom>
            Estabelecimentos Vinculados
          </Typography>
          {pessoa.estabelecimentos && pessoa.estabelecimentos.length > 0 ? (
            <List>
              {pessoa.estabelecimentos.map((estabelecimento: any) => (
                <ListItem key={estabelecimento.id}>
                  <BusinessIcon sx={{ mr: 2 }} />
                  <ListItemText
                    primary={estabelecimento.inscricao_municipal}
                    secondary={estabelecimento.nome_fantasia || estabelecimento.razao_social}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      onClick={() => navigate(`/cadastro/estabelecimentos/${estabelecimento.id}`)}
                    >
                      Detalhes
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">
              {pessoa.tipo_pessoa === 'F'
                ? 'Pessoa física não possui estabelecimentos'
                : 'Nenhum estabelecimento vinculado'}
            </Alert>
          )}
        </TabPanel>
      </Paper>
    </Box>
  )
}
