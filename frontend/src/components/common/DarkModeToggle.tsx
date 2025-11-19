/**
 * Componente de toggle para Dark Mode
 */
import { IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import {
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  BrightnessAuto as AutoIcon,
  Check as CheckIcon,
} from '@mui/icons-material'
import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeProvider'
import { ColorMode } from '@/hooks/useDarkMode'

export function DarkModeToggle() {
  const { colorMode, setColorMode, isDark } = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleModeChange = (mode: ColorMode) => {
    setColorMode(mode)
    handleClose()
  }

  const modes: { value: ColorMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Claro', icon: <LightIcon fontSize="small" /> },
    { value: 'dark', label: 'Escuro', icon: <DarkIcon fontSize="small" /> },
    { value: 'system', label: 'Sistema', icon: <AutoIcon fontSize="small" /> },
  ]

  return (
    <>
      <Tooltip title="Tema">
        <IconButton onClick={handleClick} color="inherit">
          {isDark ? <DarkIcon /> : <LightIcon />}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {modes.map((mode) => (
          <MenuItem
            key={mode.value}
            onClick={() => handleModeChange(mode.value)}
            selected={colorMode === mode.value}
          >
            <ListItemIcon>{mode.icon}</ListItemIcon>
            <ListItemText>{mode.label}</ListItemText>
            {colorMode === mode.value && (
              <ListItemIcon>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
