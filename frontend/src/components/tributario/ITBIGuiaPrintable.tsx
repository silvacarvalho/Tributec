import { Box, Typography, Table, TableBody, TableCell, TableRow, Divider } from '@mui/material'
import { formatters } from '@/utils/formatters'

interface ITBIGuiaPrintableProps {
  imovel: {
    inscricao_imobiliaria: string
    endereco?: string
  }
  transmitente: {
    nome_razao_social: string
    cpf?: string
    cnpj?: string
  }
  adquirente: {
    nome_razao_social: string
    cpf?: string
    cnpj?: string
  }
  tipoTransmissao: string
  calculo: {
    valor_declarado: number
    valor_venal: number
    valor_base_calculo: number
    valor_financiado_sfh: number
    valor_nao_financiado: number
    aliquota_sfh: number
    aliquota_normal: number
    valor_itbi_sfh: number
    valor_itbi_normal: number
    valor_itbi_total: number
    valor_isencao: number
    valor_liquido: number
  }
}

export function ITBIGuiaPrintable({
  imovel,
  transmitente,
  adquirente,
  tipoTransmissao,
  calculo,
}: ITBIGuiaPrintableProps) {
  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`

  const getTipoTransmissaoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      COMPRA_VENDA: 'Compra e Venda',
      DOACAO: 'Doação',
      PERMUTA: 'Permuta',
      ARREMATACAO: 'Arrematação',
      ADJUDICACAO: 'Adjudicação',
      USUCAPIAO: 'Usucapião',
      HERANCA: 'Herança',
      MEACAO: 'Meação',
      OUTROS: 'Outros',
    }
    return tipos[tipo] || tipo
  }

  return (
    <Box>
      <div className="header">
        <Typography variant="h4" component="h1" gutterBottom>
          GUIA DE ITBI
        </Typography>
        <Typography variant="subtitle1">
          Imposto sobre Transmissão de Bens Imóveis
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Prefeitura Municipal
        </Typography>
      </div>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dados do Imóvel
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell><strong>Inscrição Imobiliária:</strong></TableCell>
              <TableCell>{imovel.inscricao_imobiliaria}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Endereço:</strong></TableCell>
              <TableCell>{imovel.endereco || '-'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Partes Envolvidas
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell><strong>Transmitente:</strong></TableCell>
              <TableCell>
                {transmitente.nome_razao_social}
                <br />
                {transmitente.cpf ? formatters.cpf(transmitente.cpf) : formatters.cnpj(transmitente.cnpj || '')}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Adquirente:</strong></TableCell>
              <TableCell>
                {adquirente.nome_razao_social}
                <br />
                {adquirente.cpf ? formatters.cpf(adquirente.cpf) : formatters.cnpj(adquirente.cnpj || '')}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Tipo de Transmissão:</strong></TableCell>
              <TableCell>{getTipoTransmissaoLabel(tipoTransmissao)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cálculo do ITBI
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell><strong>Valor Declarado:</strong></TableCell>
              <TableCell align="right">{formatters.currency(calculo.valor_declarado)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Valor Venal:</strong></TableCell>
              <TableCell align="right">{formatters.currency(calculo.valor_venal)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Base de Cálculo:</strong></TableCell>
              <TableCell align="right"><strong>{formatters.currency(calculo.valor_base_calculo)}</strong></TableCell>
            </TableRow>

            {calculo.valor_financiado_sfh > 0 && (
              <>
                <TableRow>
                  <TableCell colSpan={2}><Divider /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Valor Financiado (SFH):</strong></TableCell>
                  <TableCell align="right">{formatters.currency(calculo.valor_financiado_sfh)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Alíquota SFH ({formatPercentage(calculo.aliquota_sfh)}):</TableCell>
                  <TableCell align="right">{formatters.currency(calculo.valor_itbi_sfh)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Valor Não Financiado:</strong></TableCell>
                  <TableCell align="right">{formatters.currency(calculo.valor_nao_financiado)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Alíquota Normal ({formatPercentage(calculo.aliquota_normal)}):</TableCell>
                  <TableCell align="right">{formatters.currency(calculo.valor_itbi_normal)}</TableCell>
                </TableRow>
              </>
            )}

            {calculo.valor_financiado_sfh === 0 && (
              <TableRow>
                <TableCell>Alíquota ({formatPercentage(calculo.aliquota_normal)}):</TableCell>
                <TableCell align="right">{formatters.currency(calculo.valor_itbi_total)}</TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell colSpan={2}><Divider /></TableCell>
            </TableRow>

            {calculo.valor_isencao > 0 && (
              <TableRow>
                <TableCell><strong>Isenção:</strong></TableCell>
                <TableCell align="right" sx={{ color: 'green' }}>
                  -{formatters.currency(calculo.valor_isencao)}
                </TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell>
                <Typography variant="h6">
                  <strong>VALOR TOTAL A PAGAR:</strong>
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6" className="total">
                  {formatters.currency(calculo.valor_liquido)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" gutterBottom>
          <strong>Instruções para Pagamento:</strong>
        </Typography>
        <Typography variant="body2">
          • O pagamento deverá ser efetuado em qualquer agência bancária ou casa lotérica<br />
          • Após o pagamento, apresentar comprovante na Secretaria de Finanças<br />
          • Prazo de validade: 30 dias a partir da emissão<br />
          • Após o vencimento, incidirão juros e multa conforme legislação municipal
        </Typography>
      </Box>
    </Box>
  )
}
