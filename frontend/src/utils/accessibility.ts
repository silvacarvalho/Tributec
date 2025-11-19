/**
 * Utilitários de acessibilidade (a11y)
 */

/**
 * Gera ID único para ARIA
 */
let idCounter = 0
export function generateAriaId(prefix = 'aria'): string {
  idCounter += 1
  return `${prefix}-${idCounter}-${Date.now()}`
}

/**
 * Foca elemento programaticamente
 */
export function focusElement(element: HTMLElement | null): void {
  if (!element) return

  // Remove tabindex temporário se existir
  const hadTabindex = element.hasAttribute('tabindex')
  const previousTabindex = element.getAttribute('tabindex')

  if (!hadTabindex || previousTabindex === '-1') {
    element.setAttribute('tabindex', '-1')
  }

  element.focus()

  // Restaura tabindex original
  if (!hadTabindex) {
    element.removeAttribute('tabindex')
  } else if (previousTabindex !== null) {
    element.setAttribute('tabindex', previousTabindex)
  }
}

/**
 * Detecta se usuário prefere reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Detecta se usuário prefere high contrast
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches
}

/**
 * Anuncia mensagem para leitores de tela
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only' // Screen reader only
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove após 1 segundo
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Trap focus dentro de um elemento (útil para modais)
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  element.addEventListener('keydown', handleTabKey)

  // Foca primeiro elemento
  firstElement?.focus()

  // Retorna função para cleanup
  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * Detecta se está navegando com teclado
 */
export function setupKeyboardDetection(): () => void {
  let isUsingKeyboard = false

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      isUsingKeyboard = true
      document.body.classList.add('keyboard-navigation')
    }
  }

  const handleMouseDown = () => {
    isUsingKeyboard = false
    document.body.classList.remove('keyboard-navigation')
  }

  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('mousedown', handleMouseDown)

  return () => {
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('mousedown', handleMouseDown)
  }
}

/**
 * Verifica se elemento está visível na tela
 */
export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Scroll para elemento com suporte a reduced motion
 */
export function scrollToElement(element: HTMLElement, options?: ScrollIntoViewOptions): void {
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth'

  element.scrollIntoView({
    behavior,
    block: 'center',
    ...options,
  })
}

/**
 * Formata texto para leitores de tela
 */
export function formatForScreenReader(text: string): string {
  // Remove múltiplos espaços
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Cria label acessível para input
 */
export function createAccessibleLabel(
  inputId: string,
  labelText: string,
  required = false
): string {
  return `${labelText}${required ? ' (obrigatório)' : ''}`
}

/**
 * Valida contraste de cores (WCAG AA)
 */
export function hasGoodContrast(
  foreground: string,
  background: string,
  fontSize = 16
): boolean {
  // Implementação simplificada
  // Em produção, usar biblioteca como 'color-contrast-checker'
  const minRatio = fontSize >= 18 ? 3 : 4.5 // WCAG AA
  // Aqui você implementaria o cálculo real de contraste
  return true // Placeholder
}

/**
 * Adiciona atributos ARIA para estado de loading
 */
export function getLoadingAriaAttributes(isLoading: boolean) {
  return {
    'aria-busy': isLoading,
    'aria-live': 'polite' as const,
  }
}

/**
 * Adiciona atributos ARIA para estado de erro
 */
export function getErrorAriaAttributes(hasError: boolean, errorId?: string) {
  return hasError
    ? {
        'aria-invalid': true,
        'aria-describedby': errorId,
      }
    : {
        'aria-invalid': false,
      }
}

/**
 * Detecta tamanho de fonte preferido
 */
export function getPreferredFontSize(): number {
  const rootFontSize = window.getComputedStyle(document.documentElement).fontSize
  return parseInt(rootFontSize, 10)
}

/**
 * Verifica se usuário está usando leitor de tela
 */
export function isScreenReaderActive(): boolean {
  // Não há forma 100% confiável de detectar
  // Esta é uma heurística básica
  return (
    document.body.classList.contains('screen-reader') ||
    navigator.userAgent.includes('NVDA') ||
    navigator.userAgent.includes('JAWS')
  )
}
