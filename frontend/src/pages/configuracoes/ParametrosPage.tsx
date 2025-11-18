import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material'
import { Edit } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { parametroService } from '../../services/parametroService'
import { ParameterInfoIcon } from '../../components/common/ParameterInfoIcon'
import type { ParametroSistema } from '../../types/fiscal'

export function ParametrosPage() {
  const [moduloSelecionado, setModuloSelecionado] = useState('FISCAL')
  const [parametroEditando, setParametroEditando] = useState<ParametroSistema | null>(null)
  const queryClient = useQueryClient()

  const { data: parametros, isLoading } = useQuery({
    queryKey: ['parametros', moduloSelecionado],
    queryFn: () => parametroService.listarPorModulo(moduloSelecionado)
  })

  const atualizarMutation = useMutation({
    mutationFn: (dados: { id: number; valor: any }) =>
      parametroService.atualizar(dados.id, dados.valor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parametros'] })
      setParametroEditando(null)
    }
  })

  // Agrupa parâmetros por categoria
  const parametrosPorCategoria = parametros?.items.reduce((acc, param) => {
    const cat = param.categoria || 'GERAL'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(param)
    return acc
  }, {} as Record<string, ParametroSistema[]>) || {}

  const formatarValor = (param: ParametroSistema) => {
    switch (param.tipo_valor) {
      case 'STRING':
        return param.valor_string
      case 'INTEGER':
        return param.valor_inteiro
      case 'DECIMAL':
      case 'PERCENT':
        return `${param.valor_decimal}${param.validacoes?.unidade ? ' ' + param.validacoes.unidade : ''}`
      case 'BOOLEAN':
        return param.valor_booleano ? 'Sim' : 'Não'
      case 'DATE':
        return param.valor_data ? new Date(param.valor_data).toLocaleDateString('pt-BR') : '-'
      case 'JSON':
        return 'Ver detalhes'
      default:
        return '-'
    }
  }

  const handleEditar = (param: ParametroSistema) => {
    setParametroEditando(param)
  }

  const handleSalvar = () => {
    if (!parametroEditando) return

    const campoValor = {
      STRING: 'valor_string',
      INTEGER: 'valor_inteiro',
      DECIMAL: 'valor_decimal',
      PERCENT: 'valor_decimal',
      BOOLEAN: 'valor_booleano',
      DATE: 'valor_data',
      JSON: 'valor_json'
    }[parametroEditando.tipo_valor]

    if (!campoValor) return

    atualizarMutation.mutate({
      id: parametroEditando.id,
      valor: {
        [campoValor]: (parametroEditando as any)[campoValor]
      }
    })
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Parâmetros do Sistema
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={moduloSelecionado}
          onChange={(e, newValue) => setModuloSelecionado(newValue)}
          variant="fullWidth"
        >
          <Tab label="Fiscal" value="FISCAL" />
          <Tab label="Tributário" value="TRIBUTARIO" />
          <Tab label="Arrecadação" value="ARRECADACAO" />
          <Tab label="Geral" value="GERAL" />
        </Tabs>
      </Paper>

      {isLoading ? (
        <Typography>Carregando...</Typography>
      ) : (
        Object.entries(parametrosPorCategoria).map(([categoria, params]) => (
          <Card key={categoria} sx={{ mb: 2 }}>
            <CardHeader
              title={categoria.replace(/_/g, ' ')}
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <List>
                {params.map((param) => (
                  <ListItem
                    key={param.id}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={formatarValor(param)}
                          color="primary"
                          variant="outlined"
                        />
                        {param.editavel && (
                          <IconButton
                            edge="end"
                            onClick={() => handleEditar(param)}
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                        )}
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {param.nome_exibicao}
                          <ParameterInfoIcon
                            parameterKey={param.chave}
                            title={param.nome_exibicao}
                            description={param.descricao}
                            helpText={param.texto_ajuda || undefined}
                            currentValue={formatarValor(param)}
                            legalBasis={param.base_legal || undefined}
                            unit={param.validacoes?.unidade}
                          />
                          {param.obrigatorio && (
                            <Chip
                              label="Obrigatório"
                              size="small"
                              color="error"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={param.descricao}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        ))
      )}

      {/* Dialog de Edição */}
      <Dialog
        open={parametroEditando !== null}
        onClose={() => setParametroEditando(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Parâmetro</DialogTitle>
        <DialogContent>
          {parametroEditando && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {parametroEditando.nome_exibicao}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {parametroEditando.descricao}
              </Typography>

              {parametroEditando.tipo_valor === 'STRING' && (
                <TextField
                  fullWidth
                  label="Valor"
                  value={parametroEditando.valor_string || ''}
                  onChange={(e) =>
                    setParametroEditando({ ...parametroEditando, valor_string: e.target.value })
                  }
                />
              )}

              {(parametroEditando.tipo_valor === 'INTEGER') && (
                <TextField
                  fullWidth
                  type="number"
                  label="Valor"
                  value={parametroEditando.valor_inteiro || 0}
                  onChange={(e) =>
                    setParametroEditando({
                      ...parametroEditando,
                      valor_inteiro: parseInt(e.target.value)
                    })
                  }
                />
              )}

              {(parametroEditando.tipo_valor === 'DECIMAL' ||
                parametroEditando.tipo_valor === 'PERCENT') && (
                <TextField
                  fullWidth
                  type="number"
                  label="Valor"
                  value={parametroEditando.valor_decimal || 0}
                  onChange={(e) =>
                    setParametroEditando({
                      ...parametroEditando,
                      valor_decimal: parseFloat(e.target.value)
                    })
                  }
                  InputProps={{
                    endAdornment: parametroEditando.validacoes?.unidade
                  }}
                />
              )}

              {parametroEditando.base_legal && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Base legal: {parametroEditando.base_legal}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setParametroEditando(null)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSalvar}
            disabled={atualizarMutation.isPending}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
