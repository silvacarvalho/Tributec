import { InfoOutlined } from '@mui/icons-material'
import { IconButton, Popover, Typography, Box, Chip } from '@mui/material'
import { useState } from 'react'

interface ParameterInfoIconProps {
  parameterKey: string
  title: string
  description: string
  helpText?: string
  currentValue?: string | number
  legalBasis?: string
  unit?: string
}

export function ParameterInfoIcon({
  parameterKey,
  title,
  description,
  helpText,
  currentValue,
  legalBasis,
  unit
}: ParameterInfoIconProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{ ml: 0.5, color: 'info.main' }}
        aria-label="Informações do parâmetro"
      >
        <InfoOutlined fontSize="small" />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 400 }}>
          <Typography variant="subtitle2" gutterBottom color="primary">
            {title}
          </Typography>

          <Typography variant="body2" paragraph>
            {description}
          </Typography>

          {helpText && (
            <Typography variant="body2" color="text.secondary" paragraph>
              💡 {helpText}
            </Typography>
          )}

          {currentValue !== undefined && (
            <Box sx={{ mt: 1, mb: 1 }}>
              <Chip
                label={`Valor atual: ${currentValue}${unit ? ' ' + unit : ''}`}
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>
          )}

          {legalBasis && (
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
              📜 Base legal: {legalBasis}
            </Typography>
          )}

          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{ mt: 1, fontFamily: 'monospace' }}
          >
            🔑 Parâmetro: {parameterKey}
          </Typography>
        </Box>
      </Popover>
    </>
  )
}
