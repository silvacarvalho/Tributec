import { useState } from 'react'
import { Box, Button, Stack } from '@mui/material'
import {
  Notifications,
  Description,
  Gavel,
  AttachMoney,
  Cancel,
  PictureAsPdf
} from '@mui/icons-material'
import type { AutoInfracao, StatusAutoInfracao } from '../../types/fiscal'
import { NotificarAutoDialog } from './NotificarAutoDialog'
import { RegistrarDefesaDialog } from './RegistrarDefesaDialog'
import { JulgarDefesaDialog } from './JulgarDefesaDialog'
import { RegistrarPagamentoDialog } from './RegistrarPagamentoDialog'

interface AutoActionsProps {
  auto: AutoInfracao
  onCancelar?: () => void
}

export function AutoActions({ auto, onCancelar }: AutoActionsProps) {
  const [dialogAberto, setDialogAberto] = useState<
    'notificar' | 'defesa' | 'julgar' | 'pagamento' | null
  >(null)

  const podeNotificar = auto.status === 'LAVRADO'
  const podeRegistrarDefesa =
    auto.status === 'NOTIFICADO' || auto.status === 'EM_DEFESA'
  const podeJulgar = auto.status === 'EM_DEFESA' && auto.data_defesa
  const podePagar = ['NOTIFICADO', 'EM_DEFESA', 'INDEFERIDO', 'EM_RECURSO'].includes(auto.status)
  const podeCancelar = !['PAGO', 'CANCELADO', 'DEFERIDO'].includes(auto.status)

  return (
    <>
      <Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {/* Notificar */}
          {podeNotificar && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Notifications />}
              onClick={() => setDialogAberto('notificar')}
            >
              Notificar
            </Button>
          )}

          {/* Registrar Defesa */}
          {podeRegistrarDefesa && (
            <Button
              variant="contained"
              color="info"
              startIcon={<Description />}
              onClick={() => setDialogAberto('defesa')}
            >
              Registrar Defesa
            </Button>
          )}

          {/* Julgar Defesa */}
          {podeJulgar && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<Gavel />}
              onClick={() => setDialogAberto('julgar')}
            >
              Julgar Defesa
            </Button>
          )}

          {/* Registrar Pagamento */}
          {podePagar && (
            <Button
              variant="contained"
              color="success"
              startIcon={<AttachMoney />}
              onClick={() => setDialogAberto('pagamento')}
            >
              Registrar Pagamento
            </Button>
          )}

          {/* Gerar PDF */}
          <Button variant="outlined" startIcon={<PictureAsPdf />}>
            Gerar PDF
          </Button>

          {/* Cancelar */}
          {podeCancelar && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={onCancelar}
            >
              Cancelar Auto
            </Button>
          )}
        </Stack>
      </Box>

      {/* Diálogos */}
      {dialogAberto === 'notificar' && (
        <NotificarAutoDialog
          open={true}
          onClose={() => setDialogAberto(null)}
          autoId={auto.id}
        />
      )}

      {dialogAberto === 'defesa' && (
        <RegistrarDefesaDialog
          open={true}
          onClose={() => setDialogAberto(null)}
          autoId={auto.id}
          dataLimiteDefesa={auto.data_limite_defesa}
        />
      )}

      {dialogAberto === 'julgar' && (
        <JulgarDefesaDialog
          open={true}
          onClose={() => setDialogAberto(null)}
          autoId={auto.id}
          argumentacaoDefesa={auto.argumentacao_defesa}
        />
      )}

      {dialogAberto === 'pagamento' && (
        <RegistrarPagamentoDialog
          open={true}
          onClose={() => setDialogAberto(null)}
          autoId={auto.id}
          valorTotal={auto.valor_total}
          numeroAuto={auto.numero_auto}
        />
      )}
    </>
  )
}
