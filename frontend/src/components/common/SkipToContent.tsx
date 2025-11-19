/**
 * Link "Pular para conteúdo" para acessibilidade
 */
import { Link } from '@mui/material'

export function SkipToContent() {
  return (
    <Link
      href="#main-content"
      sx={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        zIndex: 9999,
        padding: '8px 16px',
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        textDecoration: 'none',
        borderRadius: '0 0 4px 0',
        '&:focus': {
          left: 0,
        },
      }}
    >
      Pular para o conteúdo principal
    </Link>
  )
}
