import { Box, LinearProgress, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material'
import { validatePasswordStrength, getPasswordRequirementText } from '@/utils/passwordValidator'

interface PasswordStrengthIndicatorProps {
  password: string
  showRequirements?: boolean
}

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null

  const strength = validatePasswordStrength(password)
  const requirements = getPasswordRequirementText(strength.requirements)

  // Calcular progresso (0-100)
  const progress = (strength.score / 4) * 100

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={strength.color}
          sx={{ flex: 1, height: 8, borderRadius: 4 }}
        />
        <Typography variant="caption" color={`${strength.color}.main`} fontWeight="bold">
          {strength.feedback}
        </Typography>
      </Box>

      {showRequirements && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Requisitos da senha:
          </Typography>
          <List dense>
            <ListItem disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {strength.requirements.minLength ? (
                  <CheckIcon fontSize="small" color="success" />
                ) : (
                  <CloseIcon fontSize="small" color="error" />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Mínimo de 8 caracteres"
                primaryTypographyProps={{
                  variant: 'caption',
                  color: strength.requirements.minLength ? 'success.main' : 'text.secondary',
                }}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {strength.requirements.hasUpperCase ? (
                  <CheckIcon fontSize="small" color="success" />
                ) : (
                  <CloseIcon fontSize="small" color="error" />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Letra maiúscula"
                primaryTypographyProps={{
                  variant: 'caption',
                  color: strength.requirements.hasUpperCase ? 'success.main' : 'text.secondary',
                }}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {strength.requirements.hasLowerCase ? (
                  <CheckIcon fontSize="small" color="success" />
                ) : (
                  <CloseIcon fontSize="small" color="error" />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Letra minúscula"
                primaryTypographyProps={{
                  variant: 'caption',
                  color: strength.requirements.hasLowerCase ? 'success.main' : 'text.secondary',
                }}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {strength.requirements.hasNumber ? (
                  <CheckIcon fontSize="small" color="success" />
                ) : (
                  <CloseIcon fontSize="small" color="error" />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Número"
                primaryTypographyProps={{
                  variant: 'caption',
                  color: strength.requirements.hasNumber ? 'success.main' : 'text.secondary',
                }}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {strength.requirements.hasSpecialChar ? (
                  <CheckIcon fontSize="small" color="success" />
                ) : (
                  <CloseIcon fontSize="small" color="error" />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Caractere especial (!@#$%^&*)"
                primaryTypographyProps={{
                  variant: 'caption',
                  color: strength.requirements.hasSpecialChar ? 'success.main' : 'text.secondary',
                }}
              />
            </ListItem>
          </List>
        </Box>
      )}
    </Box>
  )
}
