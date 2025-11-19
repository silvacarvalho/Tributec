import { Box, Typography, Divider, Table, TableBody, TableCell, TableRow } from '@mui/material'
import { formatters } from '@/utils/formatters'

interface ReciboPagamentoProps {
  numero_recibo: string
  data_pagamento: string
  contribuinte_nome: string
  contribuinte_cpf_cnpj: string
  contribuinte_endereco?: string
  descricao_pagamento: string
  tributo: string
  ano_exercicio: number
  valor_principal: number
  valor_juros?: number
  valor_multa?: number
  valor_desconto?: number
  valor_total: number
  forma_pagamento: string
  numero_documento?: string
  observacoes?: string
}

export function ReciboPagamento({
  numero_recibo,
  data_pagamento,
  contribuinte_nome,
  contribuinte_cpf_cnpj,
  contribuinte_endereco,
  descricao_pagamento,
  tributo,
  ano_exercicio,
  valor_principal,
  valor_juros = 0,
  valor_multa = 0,
  valor_desconto = 0,
  valor_total,
  forma_pagamento,
  numero_documento,
  observacoes,
}: ReciboPagamentoProps) {
  return (
    <Box
      sx={{
        p: 4,
        maxWidth: '21cm',
        margin: '0 auto',
        backgroundColor: 'white',
        '@media print': {
          p: 2,
        },
      }}
    >
      {/* Cabeçalho */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          PREFEITURA MUNICIPAL
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          SECRETARIA MUNICIPAL DE FINANÇAS
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Divisão de Arrecadação Tributária
        </Typography>

        <Box
          sx={{
            mt: 2,
            p: 1,
            backgroundColor: '#f5f5f5',
            border: '2px solid #333',
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            RECIBO DE PAGAMENTO
          </Typography>
          <Typography variant="body2">
            Nº {numero_recibo}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Dados do Contribuinte */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          DADOS DO CONTRIBUINTE
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '30%', border: 'none' }}>
                Nome/Razão Social:
              </TableCell>
              <TableCell sx={{ border: 'none' }}>{contribuinte_nome}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', border: 'none' }}>CPF/CNPJ:</TableCell>
              <TableCell sx={{ border: 'none' }}>
                {formatters.cpfCnpj(contribuinte_cpf_cnpj)}
              </TableCell>
            </TableRow>
            {contribuinte_endereco && (
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', border: 'none' }}>Endereço:</TableCell>
                <TableCell sx={{ border: 'none' }}>{contribuinte_endereco}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Dados do Pagamento */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          DADOS DO PAGAMENTO
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '30%', border: 'none' }}>
                Data do Pagamento:
              </TableCell>
              <TableCell sx={{ border: 'none' }}>
                {formatters.date(data_pagamento)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', border: 'none' }}>Tributo:</TableCell>
              <TableCell sx={{ border: 'none' }}>{tributo}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', border: 'none' }}>
                Exercício/Competência:
              </TableCell>
              <TableCell sx={{ border: 'none' }}>{ano_exercicio}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', border: 'none' }}>Descrição:</TableCell>
              <TableCell sx={{ border: 'none' }}>{descricao_pagamento}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', border: 'none' }}>Forma de Pagamento:</TableCell>
              <TableCell sx={{ border: 'none' }}>{forma_pagamento}</TableCell>
            </TableRow>
            {numero_documento && (
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', border: 'none' }}>
                  Número do Documento:
                </TableCell>
                <TableCell sx={{ border: 'none' }}>{numero_documento}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Valores */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          DISCRIMINAÇÃO DE VALORES
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Valor Principal:</TableCell>
              <TableCell align="right">{formatters.currency(valor_principal)}</TableCell>
            </TableRow>
            {valor_juros > 0 && (
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Juros:</TableCell>
                <TableCell align="right">{formatters.currency(valor_juros)}</TableCell>
              </TableRow>
            )}
            {valor_multa > 0 && (
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Multa:</TableCell>
                <TableCell align="right">{formatters.currency(valor_multa)}</TableCell>
              </TableRow>
            )}
            {valor_desconto > 0 && (
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  Desconto:
                </TableCell>
                <TableCell align="right" sx={{ color: 'success.main' }}>
                  - {formatters.currency(valor_desconto)}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  backgroundColor: '#f5f5f5',
                }}
              >
                VALOR TOTAL PAGO:
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  backgroundColor: '#f5f5f5',
                }}
              >
                {formatters.currency(valor_total)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {observacoes && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              OBSERVAÇÕES
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {observacoes}
            </Typography>
          </Box>
        </>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Rodapé */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Este recibo comprova o pagamento do tributo acima discriminado.
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Documento gerado eletronicamente em {formatters.date(new Date().toISOString())}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Autenticação: {numero_recibo.toUpperCase()}
        </Typography>
      </Box>

      {/* Linha para assinatura (apenas para impressão) */}
      <Box
        sx={{
          mt: 6,
          display: 'none',
          '@media print': {
            display: 'block',
          },
        }}
      >
        <Box sx={{ borderTop: '1px solid #000', width: '50%', margin: '0 auto', pt: 1 }}>
          <Typography variant="caption" textAlign="center" display="block">
            Assinatura do Responsável
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
