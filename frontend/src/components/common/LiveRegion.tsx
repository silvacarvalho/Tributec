/**
 * Região live para anúncios de acessibilidade
 */
import { useEffect, useRef } from 'react'
import { Box } from '@mui/material'

interface LiveRegionProps {
  message: string
  priority?: 'polite' | 'assertive'
  clearAfter?: number
}

export function LiveRegion({ message, priority = 'polite', clearAfter = 5000 }: LiveRegionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (clearAfter && message) {
      const timer = setTimeout(() => {
        if (ref.current) {
          ref.current.textContent = ''
        }
      }, clearAfter)

      return () => clearTimeout(timer)
    }
  }, [message, clearAfter])

  return (
    <Box
      ref={ref}
      role={priority === 'assertive' ? 'alert' : 'status'}
      aria-live={priority}
      aria-atomic="true"
      sx={{
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      {message}
    </Box>
  )
}
