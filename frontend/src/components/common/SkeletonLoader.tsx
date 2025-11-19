/**
 * Componentes de skeleton loading
 */
import { Box, Skeleton, Card, CardContent } from '@mui/material'

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Box>
      {Array.from({ length: rows }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            gap: 2,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent>
            <Skeleton variant="text" width="80%" height={32} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="90%" />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Skeleton variant="rectangular" width={100} height={36} />
              <Skeleton variant="rectangular" width={100} height={36} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

export function FormSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Skeleton variant="text" width="30%" height={24} />
      <Skeleton variant="rectangular" height={56} />
      <Skeleton variant="text" width="30%" height={24} />
      <Skeleton variant="rectangular" height={56} />
      <Skeleton variant="text" width="30%" height={24} />
      <Skeleton variant="rectangular" height={120} />
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Skeleton variant="rectangular" width={120} height={42} />
        <Skeleton variant="rectangular" width={120} height={42} />
      </Box>
    </Box>
  )
}
