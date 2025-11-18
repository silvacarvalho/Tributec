import { Box, Typography, Card, CardContent, Grid, TextField, Button, Alert } from '@mui/material'
import { Person, Save } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { portalService } from '@/services/portalService'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { formatters } from '@/utils/formatters'

export function MeuCadastroPage() {
  const queryClient = useQueryClient()

  const { data: cadastro, isLoading, error } = useQuery({
    queryKey: ['portal-cadastro'],
    queryFn: () => portalService.obterMeuCadastro(),
  })

  const { register, handleSubmit } = useForm({
    values: {
      email: cadastro?.email || '',
      telefone: cadastro?.telefone || '',
      celular: cadastro?.celular || '',
      endereco: cadastro?.endereco || '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => portalService.atualizarMeuCadastro(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-cadastro'] })
      toast.success('Cadastro atualizado com sucesso!')
    },
    onError: () => toast.error('Erro ao atualizar cadastro'),
  })

  const onSubmit = (data: any) => {
    updateMutation.mutate(data)
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorAlert message="Erro ao carregar cadastro" />

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Meu Cadastro
      </Typography>

      <Card>
        <CardContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Você pode atualizar seus dados de contato. Para alterações de dados cadastrais (nome, CPF/CNPJ), entre em contato com a prefeitura.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Nome"
                value={cadastro?.nome_razao_social || ''}
                fullWidth
                disabled
                InputProps={{ startAdornment: <Person sx={{ mr: 1 }} /> }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label={cadastro?.tipo_pessoa === 'F' ? 'CPF' : 'CNPJ'}
                value={cadastro?.cpf ? formatters.cpf(cadastro.cpf) : cadastro?.cnpj ? formatters.cnpj(cadastro.cnpj) : ''}
                fullWidth
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField label="Tipo" value={cadastro?.tipo_pessoa === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'} fullWidth disabled />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Dados de Contato (Editável)
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField {...register('email')} label="Email" type="email" fullWidth />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField {...register('telefone')} label="Telefone" fullWidth />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField {...register('celular')} label="Celular" fullWidth />
              </Grid>

              <Grid item xs={12}>
                <TextField {...register('endereco')} label="Endereço" fullWidth multiline rows={2} />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
