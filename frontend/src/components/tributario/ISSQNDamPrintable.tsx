import { Box, Typography, Table, TableBody, TableCell, TableRow, Divider } from '@mui/material'
import { formatters } from '@/utils/formatters'

interface ISSQNDamPrintableProps {
  estabelecimento: {
    inscricao_municipal: string
    nome_fantasia?: string
    cnae?: string
    atividade_principal?: string
  }
  competencia: {
    mes: number
    ano: number
  }
  regimeTributacao: string
  calculo: {
    receita_bruta_total: number
    deducoes_materiais: number
    outras_deducoes: number
    base_calculo: number
    aliquota: number
    valor_issqn: number
    valor_retido_terceiros: number
    valor_a_recolher: number
  }
}

export function ISSQNDamPrintable({
  estabelecimento,
  competencia,
  regimeTributacao,
  calculo,
}: ISSQNDamPrintableProps) {
  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`

  const getMesNome = (mes: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ]
    return meses[mes - 1] || mes.toString()
  }

  const getRegimeLabel = (regime: string) => {
    const regimes: Record<string, string> = {
      VARIAVEL: 'Variável (% sobre receita)',
      FIXO: 'Fixo (valor em UFM)',
      ESTIMATIVA: 'Estimativa',
      SOCIEDADE_PROFISSIONAIS: 'Sociedade de Profissionais',
    }
    return regimes[regime] || regime
  }

  const dataVencimento = new Date()
  dataVencimento.setMonth(competencia.mes) // próximo mês
  dataVencimento.setDate(10) // dia 10
  if (dataVencimento.getMonth() !== competencia.mes) {
    dataVencimento.setDate(0) // último dia do mês se dia 10 não existir
  }

  return (
    <Box>
      <div className="header">
        <Typography variant="h4" component="h1" gutterBottom>
          DAM - ISSQN
        </Typography>
        <Typography variant="subtitle1">
          Documento de Arrecadação Municipal
        </Typography>
        <Typography variant="subtitle2">
          Imposto sobre Serviços de Qualquer Natureza
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Prefeitura Municipal
        </Typography>
      </div>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dados do Contribuinte
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell><strong>Inscrição Municipal (CCM):</strong></TableCell>
              <TableCell>{estabelecimento.inscricao_municipal}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Nome Fantasia:</strong></TableCell>
              <TableCell>{estabelecimento.nome_fantasia || '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>CNAE:</strong></TableCell>
              <TableCell>{estabelecimento.cnae || '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Atividade Principal:</strong></TableCell>
              <TableCell>{estabelecimento.atividade_principal || '-'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dados da Declaração
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell><strong>Competência:</strong></TableCell>
              <TableCell>{getMesNome(competencia.mes)}/{competencia.ano}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Regime de Tributação:</strong></TableCell>
              <TableCell>{getRegimeLabel(regimeTributacao)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Data de Vencimento:</strong></TableCell>
              <TableCell>{formatters.date(dataVencimento.toISOString())}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cálculo do ISSQN
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell><strong>Receita Bruta Total:</strong></TableCell>
              <TableCell align="right">{formatters.currency(calculo.receita_bruta_total)}</TableCell>
            </TableRow>

            {calculo.deducoes_materiais > 0 && (
              <TableRow>
                <TableCell>(-) Deduções de Materiais:</TableCell>
                <TableCell align="right" sx={{ color: 'red' }}>
                  -{formatters.currency(calculo.deducoes_materiais)}
                </TableCell>
              </TableRow>
            )}

            {calculo.outras_deducoes > 0 && (
              <TableRow>
                <TableCell>(-) Outras Deduções:</TableCell>
                <TableCell align="right" sx={{ color: 'red' }}>
                  -{formatters.currency(calculo.outras_deducoes)}
                </TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell colSpan={2}><Divider /></TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>Base de Cálculo:</strong></TableCell>
              <TableCell align="right"><strong>{formatters.currency(calculo.base_calculo)}</strong></TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Alíquota ({formatPercentage(calculo.aliquota)}):</TableCell>
              <TableCell align="right">{formatters.currency(calculo.valor_issqn)}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={2}><Divider /></TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>Valor do ISSQN:</strong></TableCell>
              <TableCell align="right"><strong>{formatters.currency(calculo.valor_issqn)}</strong></TableCell>
            </TableRow>

            {calculo.valor_retido_terceiros > 0 && (
              <TableRow>
                <TableCell>(-) Retido na Fonte:</TableCell>
                <TableCell align="right" sx={{ color: 'red' }}>
                  -{formatters.currency(calculo.valor_retido_terceiros)}
                </TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell colSpan={2}><Divider /></TableCell>
            </TableRow>

            <TableRow>
              <TableCell>
                <Typography variant="h6">
                  <strong>VALOR A RECOLHER:</strong>
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6" className="total">
                  {formatters.currency(calculo.valor_a_recolher)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {calculo.valor_a_recolher > 0 ? (
        <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" gutterBottom>
            <strong>Instruções para Pagamento:</strong>
          </Typography>
          <Typography variant="body2">
            • O pagamento deverá ser efetuado até o dia {dataVencimento.getDate()} do mês seguinte ao da competência<br />
            • Utilize o código de barras ou número do DAM para efetuar o pagamento<br />
            • O pagamento pode ser realizado em qualquer agência bancária ou casa lotérica<br />
            • Após o vencimento, incidirão juros e multa conforme legislação municipal<br />
            • Guarde o comprovante de pagamento por 5 anos
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 4, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
          <Typography variant="body2" color="success.dark">
            <strong>Nenhum valor a recolher neste período.</strong>
          </Typography>
        </Box>
      )}
    </Box>
  )
}
