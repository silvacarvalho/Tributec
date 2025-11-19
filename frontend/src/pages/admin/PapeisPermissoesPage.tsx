import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Button,
  Divider,
  Chip,
} from '@mui/material'
import {
  Security as SecurityIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material'

interface Permissao {
  id: string
  modulo: string
  acao: string
  descricao: string
}

interface Papel {
  id: string
  nome: string
  descricao: string
  usuarios_count: number
  permissoes: string[]
}

export function PapeisPermissoesPage() {
  const [papelSelecionado, setPapelSelecionado] = useState<string>('admin')

  const permissoesDisponiveis: Permissao[] = [
    { id: 'cadastro.create', modulo: 'Cadastro', acao: 'Criar', descricao: 'Criar registros' },
    { id: 'cadastro.read', modulo: 'Cadastro', acao: 'Visualizar', descricao: 'Visualizar registros' },
    { id: 'cadastro.update', modulo: 'Cadastro', acao: 'Editar', descricao: 'Editar registros' },
    { id: 'cadastro.delete', modulo: 'Cadastro', acao: 'Excluir', descricao: 'Excluir registros' },
    { id: 'fiscal.create', modulo: 'Fiscal', acao: 'Lavrar Auto', descricao: 'Lavrar autos de infração' },
    { id: 'fiscal.read', modulo: 'Fiscal', acao: 'Visualizar', descricao: 'Visualizar autos' },
    { id: 'fiscal.update', modulo: 'Fiscal', acao: 'Julgar', descricao: 'Julgar defesas' },
    { id: 'fiscal.cancel', modulo: 'Fiscal', acao: 'Cancelar', descricao: 'Cancelar autos' },
    { id: 'arrecadacao.read', modulo: 'Arrecadação', acao: 'Visualizar', descricao: 'Ver débitos' },
    { id: 'arrecadacao.parcelar', modulo: 'Arrecadação', acao: 'Parcelar', descricao: 'Criar parcelamentos' },
    { id: 'arrecadacao.cancelar', modulo: 'Arrecadação', acao: 'Cancelar', descricao: 'Cancelar parcelamentos' },
    { id: 'admin.users', modulo: 'Admin', acao: 'Usuários', descricao: 'Gerenciar usuários' },
    { id: 'admin.roles', modulo: 'Admin', acao: 'Permissões', descricao: 'Gerenciar permissões' },
    { id: 'admin.logs', modulo: 'Admin', acao: 'Logs', descricao: 'Visualizar logs' },
  ]

  const papeis: Papel[] = [
    {
      id: 'admin',
      nome: 'Administrador',
      descricao: 'Acesso completo ao sistema',
      usuarios_count: 5,
      permissoes: permissoesDisponiveis.map((p) => p.id),
    },
    {
      id: 'fiscal',
      nome: 'Fiscal',
      descricao: 'Acesso ao módulo fiscal',
      usuarios_count: 12,
      permissoes: [
        'cadastro.read',
        'fiscal.create',
        'fiscal.read',
        'fiscal.update',
        'arrecadacao.read',
      ],
    },
    {
      id: 'atendente',
      nome: 'Atendente',
      descricao: 'Atendimento ao contribuinte',
      usuarios_count: 15,
      permissoes: [
        'cadastro.read',
        'cadastro.update',
        'fiscal.read',
        'arrecadacao.read',
        'arrecadacao.parcelar',
      ],
    },
  ]

  const papelAtual = papeis.find((p) => p.id === papelSelecionado)

  const temPermissao = (permissaoId: string) => {
    return papelAtual?.permissoes.includes(permissaoId) || false
  }

  // Agrupar permissões por módulo
  const permissoesPorModulo = permissoesDisponiveis.reduce((acc, perm) => {
    if (!acc[perm.modulo]) acc[perm.modulo] = []
    acc[perm.modulo].push(perm)
    return acc
  }, {} as Record<string, Permissao[]>)

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Papéis e Permissões
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gerencie os perfis de acesso e suas permissões no sistema (RBAC)
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Lista de Papéis */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Papéis</Typography>
                <Button size="small" startIcon={<AddIcon />}>
                  Novo
                </Button>
              </Box>
              <List>
                {papeis.map((papel) => (
                  <ListItem
                    key={papel.id}
                    button
                    selected={papelSelecionado === papel.id}
                    onClick={() => setPapelSelecionado(papel.id)}
                  >
                    <ListItemIcon>
                      <SecurityIcon color={papelSelecionado === papel.id ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={papel.nome}
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            {papel.descricao}
                          </Typography>
                          <Chip
                            label={`${papel.usuarios_count} usuários`}
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Permissões do Papel Selecionado */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6">{papelAtual?.nome}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {papelAtual?.descricao}
                  </Typography>
                </Box>
                <Button variant="contained" startIcon={<EditIcon />} size="small">
                  Salvar Alterações
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {Object.entries(permissoesPorModulo).map(([modulo, perms]) => (
                <Box key={modulo} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {modulo}
                  </Typography>
                  <List dense>
                    {perms.map((perm) => (
                      <ListItem key={perm.id}>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={temPermissao(perm.id)}
                            tabIndex={-1}
                            disableRipple
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={perm.acao}
                          secondary={perm.descricao}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
