import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material'
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Storage as StorageIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export function ConfiguracoesSistemaPage() {
  const [tabAtual, setTabAtual] = useState(0)
  const [salvando, setSalvando] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState(false)

  // Configurações Gerais
  const [nomeInstituicao, setNomeInstituicao] = useState('Prefeitura Municipal')
  const [cnpj, setCnpj] = useState('12.345.678/0001-90')
  const [endereco, setEndereco] = useState('Av. Principal, 1000')
  const [telefone, setTelefone] = useState('(11) 3456-7890')
  const [emailContato, setEmailContato] = useState('contato@prefeitura.gov.br')
  const [horarioAtendimento, setHorarioAtendimento] = useState('08:00 às 17:00')

  // Configurações de Segurança
  const [senhaExpiraDias, setSenhaExpiraDias] = useState('90')
  const [tentativasLogin, setTentativasLogin] = useState('3')
  const [tempoSessao, setTempoSessao] = useState('30')
  const [require2FA, setRequire2FA] = useState(false)
  const [allowPasswordReset, setAllowPasswordReset] = useState(true)
  const [senhaMinLength, setSenhaMinLength] = useState('8')

  // Configurações de Email
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpUser, setSmtpUser] = useState('noreply@prefeitura.gov.br')
  const [smtpUseTLS, setSmtpUseTLS] = useState(true)
  const [emailRemetente, setEmailRemetente] = useState('Prefeitura Municipal')

  // Configurações de Armazenamento
  const [limiteUpload, setLimiteUpload] = useState('10')
  const [tiposArquivos, setTiposArquivos] = useState([
    'PDF',
    'JPG',
    'PNG',
    'DOCX',
    'XLSX',
  ])
  const [retencaoLogs, setRetencaoLogs] = useState('365')
  const [retencaoBackup, setRetencaoBackup] = useState('30')

  // Configurações de Notificações
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifSMS, setNotifSMS] = useState(false)
  const [notifPush, setNotifPush] = useState(true)
  const [notifVencimento, setNotifVencimento] = useState('7')
  const [notifParcelamento, setNotifParcelamento] = useState(true)

  // Configurações de Agendamento
  const [backupAutomatico, setBackupAutomatico] = useState(true)
  const [horarioBackup, setHorarioBackup] = useState('02:00')
  const [calculoAutomatico, setCalculoAutomatico] = useState(true)
  const [diaCalculo, setDiaCalculo] = useState('1')
  const [envioBoletosAuto, setEnvioBoletosAuto] = useState(true)
  const [diasAntesVencimento, setDiasAntesVencimento] = useState('5')

  const handleSalvar = async () => {
    setSalvando(true)
    // Simular salvamento
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSalvando(false)
    setMensagemSucesso(true)
    setTimeout(() => setMensagemSucesso(false), 3000)
  }

  const handleRestaurarPadroes = () => {
    if (confirm('Deseja restaurar todas as configurações para os valores padrão?')) {
      // Restaurar valores padrão
      setSenhaExpiraDias('90')
      setTentativasLogin('3')
      setTempoSessao('30')
      setRequire2FA(false)
      // ... restaurar outros valores
      setMensagemSucesso(true)
      setTimeout(() => setMensagemSucesso(false), 3000)
    }
  }

  const handleRemoverTipoArquivo = (tipo: string) => {
    setTiposArquivos(tiposArquivos.filter((t) => t !== tipo))
  }

  const handleAdicionarTipoArquivo = () => {
    const novoTipo = prompt('Digite a extensão do arquivo (ex: XML):')
    if (novoTipo && !tiposArquivos.includes(novoTipo.toUpperCase())) {
      setTiposArquivos([...tiposArquivos, novoTipo.toUpperCase()])
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Configurações do Sistema
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie as configurações gerais e parâmetros do sistema
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={handleRestaurarPadroes}
          >
            Restaurar Padrões
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSalvar}
            disabled={salvando}
          >
            {salvando ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </Box>
      </Box>

      {mensagemSucesso && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Configurações salvas com sucesso!
        </Alert>
      )}

      <Card>
        <Tabs
          value={tabAtual}
          onChange={(_, newValue) => setTabAtual(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<SettingsIcon />} label="Geral" />
          <Tab icon={<SecurityIcon />} label="Segurança" />
          <Tab icon={<EmailIcon />} label="Email" />
          <Tab icon={<StorageIcon />} label="Armazenamento" />
          <Tab icon={<NotificationsIcon />} label="Notificações" />
          <Tab icon={<ScheduleIcon />} label="Agendamentos" />
        </Tabs>

        <CardContent>
          {/* Tab Geral */}
          <TabPanel value={tabAtual} index={0}>
            <Typography variant="h6" gutterBottom>
              Informações da Instituição
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome da Instituição"
                  value={nomeInstituicao}
                  onChange={(e) => setNomeInstituicao(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CNPJ"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Endereço"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email de Contato"
                  type="email"
                  value={emailContato}
                  onChange={(e) => setEmailContato(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Horário de Atendimento"
                  value={horarioAtendimento}
                  onChange={(e) => setHorarioAtendimento(e.target.value)}
                  helperText="Ex: 08:00 às 17:00"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab Segurança */}
          <TabPanel value={tabAtual} index={1}>
            <Typography variant="h6" gutterBottom>
              Políticas de Segurança
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Expiração de Senha (dias)"
                  type="number"
                  value={senhaExpiraDias}
                  onChange={(e) => setSenhaExpiraDias(e.target.value)}
                  helperText="Dias até a senha expirar"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Tentativas de Login"
                  type="number"
                  value={tentativasLogin}
                  onChange={(e) => setTentativasLogin(e.target.value)}
                  helperText="Antes de bloquear conta"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Tempo de Sessão (min)"
                  type="number"
                  value={tempoSessao}
                  onChange={(e) => setTempoSessao(e.target.value)}
                  helperText="Inatividade até logout"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Tamanho Mínimo da Senha"
                  type="number"
                  value={senhaMinLength}
                  onChange={(e) => setSenhaMinLength(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={require2FA}
                      onChange={(e) => setRequire2FA(e.target.checked)}
                    />
                  }
                  label="Exigir Autenticação de Dois Fatores (2FA)"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={allowPasswordReset}
                      onChange={(e) => setAllowPasswordReset(e.target.checked)}
                    />
                  }
                  label="Permitir Recuperação de Senha por Email"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab Email */}
          <TabPanel value={tabAtual} index={2}>
            <Typography variant="h6" gutterBottom>
              Configurações de Email (SMTP)
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Servidor SMTP"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Porta SMTP"
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Usuário SMTP"
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome do Remetente"
                  value={emailRemetente}
                  onChange={(e) => setEmailRemetente(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Senha SMTP"
                  type="password"
                  placeholder="••••••••"
                  helperText="Deixe em branco para manter a senha atual"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={smtpUseTLS}
                      onChange={(e) => setSmtpUseTLS(e.target.checked)}
                    />
                  }
                  label="Usar TLS/SSL"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab Armazenamento */}
          <TabPanel value={tabAtual} index={3}>
            <Typography variant="h6" gutterBottom>
              Gestão de Armazenamento
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Limite de Upload (MB)"
                  type="number"
                  value={limiteUpload}
                  onChange={(e) => setLimiteUpload(e.target.value)}
                  helperText="Tamanho máximo por arquivo"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Retenção de Logs (dias)"
                  type="number"
                  value={retencaoLogs}
                  onChange={(e) => setRetencaoLogs(e.target.value)}
                  helperText="Tempo de armazenamento dos logs"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Retenção de Backups (dias)"
                  type="number"
                  value={retencaoBackup}
                  onChange={(e) => setRetencaoBackup(e.target.value)}
                  helperText="Tempo de armazenamento dos backups"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Tipos de Arquivos Permitidos
              </Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={handleAdicionarTipoArquivo}>
                Adicionar
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {tiposArquivos.map((tipo) => (
                <Chip
                  key={tipo}
                  label={tipo}
                  onDelete={() => handleRemoverTipoArquivo(tipo)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </TabPanel>

          {/* Tab Notificações */}
          <TabPanel value={tabAtual} index={4}>
            <Typography variant="h6" gutterBottom>
              Configurações de Notificações
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Canais de Comunicação
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifEmail}
                      onChange={(e) => setNotifEmail(e.target.checked)}
                    />
                  }
                  label="Notificações por Email"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifSMS}
                      onChange={(e) => setNotifSMS(e.target.checked)}
                    />
                  }
                  label="Notificações por SMS"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifPush}
                      onChange={(e) => setNotifPush(e.target.checked)}
                    />
                  }
                  label="Notificações Push"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Alertas Automáticos
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Notificar Vencimento (dias antes)"
                  type="number"
                  value={notifVencimento}
                  onChange={(e) => setNotifVencimento(e.target.value)}
                  helperText="Dias antes do vencimento para notificar"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifParcelamento}
                      onChange={(e) => setNotifParcelamento(e.target.checked)}
                    />
                  }
                  label="Notificar Aprovação de Parcelamento"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab Agendamentos */}
          <TabPanel value={tabAtual} index={5}>
            <Typography variant="h6" gutterBottom>
              Tarefas Agendadas
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Backup Automático
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={backupAutomatico}
                      onChange={(e) => setBackupAutomatico(e.target.checked)}
                    />
                  }
                  label="Ativar Backup Automático"
                />
              </Grid>
              {backupAutomatico && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Horário do Backup"
                    type="time"
                    value={horarioBackup}
                    onChange={(e) => setHorarioBackup(e.target.value)}
                    helperText="Backup diário no horário especificado"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Cálculo Automático de Tributos
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={calculoAutomatico}
                      onChange={(e) => setCalculoAutomatico(e.target.checked)}
                    />
                  }
                  label="Ativar Cálculo Automático Mensal"
                />
              </Grid>
              {calculoAutomatico && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Dia do Mês para Cálculo"
                    value={diaCalculo}
                    onChange={(e) => setDiaCalculo(e.target.value)}
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((dia) => (
                      <MenuItem key={dia} value={dia.toString()}>
                        Dia {dia}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Envio Automático de Boletos
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={envioBoletosAuto}
                      onChange={(e) => setEnvioBoletosAuto(e.target.checked)}
                    />
                  }
                  label="Ativar Envio Automático"
                />
              </Grid>
              {envioBoletosAuto && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Dias Antes do Vencimento"
                    type="number"
                    value={diasAntesVencimento}
                    onChange={(e) => setDiasAntesVencimento(e.target.value)}
                    helperText="Enviar boleto X dias antes do vencimento"
                  />
                </Grid>
              )}
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  )
}
