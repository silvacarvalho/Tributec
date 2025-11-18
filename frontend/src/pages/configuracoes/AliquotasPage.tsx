import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { tributarioService } from '@/services/tributarioService'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { formatters } from '@/utils/formatters'
import type { TipoTributo } from '@/types'

export function AliquotasPage() {
  const [tipoTributo, setTipoTributo] = useState<TipoTributo>('IPTU')
  const [anoVigencia, setAnoVigencia] = useState(new Date().getFullYear())

  const { data, isLoading, error } = useQuery({
    queryKey: ['aliquotas', tipoTributo, anoVigencia],
    queryFn: () =>
      tributarioService.listarAliquotas({
        tipo_tributo: tipoTributo,
        ano_vigencia: anoVigencia,
        pagina: 1,
        limite: 100,
      }),
  })

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Alíquotas Tributárias
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configuração de alíquotas por tipo de tributo e faixa de valor
        </Typography>
      </Box>

      <Card sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Tipo de Tributo"
            value={tipoTributo}
            onChange={(e) => setTipoTributo(e.target.value as TipoTributo)}
            sx={{ width: 200 }}
          >
            <MenuItem value="IPTU">IPTU</MenuItem>
            <MenuItem value="ITBI">ITBI</MenuItem>
            <MenuItem value="ISSQN">ISSQN</MenuItem>
          </TextField>
          <TextField
            label="Ano Vigência"
            type="number"
            value={anoVigencia}
            onChange={(e) => setAnoVigencia(Number(e.target.value))}
            sx={{ width: 150 }}
          />
        </Box>
      </Card>

      <Card>
        {error && <ErrorAlert message="Erro ao carregar alíquotas. Tente novamente." />}

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Categoria</TableCell>
                  <TableCell align="right">Valor Mínimo</TableCell>
                  <TableCell align="right">Valor Máximo</TableCell>
                  <TableCell align="right">Alíquota</TableCell>
                  <TableCell>Vigência</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.itens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Nenhuma alíquota configurada para este tributo/ano
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.itens.map((aliquota) => (
                    <TableRow key={aliquota.id}>
                      <TableCell>{aliquota.categoria || '-'}</TableCell>
                      <TableCell align="right">
                        {aliquota.valor_minimo ? formatters.currency(aliquota.valor_minimo) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {aliquota.valor_maximo ? formatters.currency(aliquota.valor_maximo) : 'Sem limite'}
                      </TableCell>
                      <TableCell align="right">
                        {formatters.percent(aliquota.aliquota * 100, 4)}
                      </TableCell>
                      <TableCell>
                        {formatters.date(aliquota.data_inicio_vigencia)}
                        {aliquota.data_fim_vigencia && ` até ${formatters.date(aliquota.data_fim_vigencia)}`}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={aliquota.ativa ? 'Ativa' : 'Inativa'}
                          size="small"
                          color={aliquota.ativa ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  )
}
