export interface PasswordStrength {
  score: number // 0-4
  feedback: string
  level: 'weak' | 'fair' | 'good' | 'strong'
  color: 'error' | 'warning' | 'info' | 'success'
  requirements: {
    minLength: boolean
    hasUpperCase: boolean
    hasLowerCase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const passedRequirements = Object.values(requirements).filter(Boolean).length
  let score = 0
  let feedback = ''
  let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
  let color: 'error' | 'warning' | 'info' | 'success' = 'error'

  // Calcular score baseado nos requisitos
  if (requirements.minLength) score++
  if (requirements.hasUpperCase && requirements.hasLowerCase) score++
  if (requirements.hasNumber) score++
  if (requirements.hasSpecialChar) score++

  // Bonus para senhas mais longas
  if (password.length >= 12) score++
  if (password.length >= 16) score++

  // Normalizar score para 0-4
  score = Math.min(score, 4)

  // Definir level, color e feedback
  if (score === 0 || score === 1) {
    level = 'weak'
    color = 'error'
    feedback = 'Senha muito fraca'
  } else if (score === 2) {
    level = 'fair'
    color = 'warning'
    feedback = 'Senha fraca'
  } else if (score === 3) {
    level = 'good'
    color = 'info'
    feedback = 'Senha boa'
  } else {
    level = 'strong'
    color = 'success'
    feedback = 'Senha forte'
  }

  return {
    score,
    feedback,
    level,
    color,
    requirements,
  }
}

export function getPasswordRequirementText(requirements: PasswordStrength['requirements']): string[] {
  const messages: string[] = []

  if (!requirements.minLength) messages.push('Mínimo de 8 caracteres')
  if (!requirements.hasUpperCase) messages.push('Pelo menos uma letra maiúscula')
  if (!requirements.hasLowerCase) messages.push('Pelo menos uma letra minúscula')
  if (!requirements.hasNumber) messages.push('Pelo menos um número')
  if (!requirements.hasSpecialChar) messages.push('Pelo menos um caractere especial (!@#$%^&*)')

  return messages
}

export function isPasswordValid(password: string): boolean {
  const strength = validatePasswordStrength(password)
  return (
    strength.requirements.minLength &&
    strength.requirements.hasUpperCase &&
    strength.requirements.hasLowerCase &&
    strength.requirements.hasNumber &&
    strength.requirements.hasSpecialChar
  )
}
