import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'react-toastify'

interface UseSessionTimeoutOptions {
  /**
   * Tempo de inatividade em milissegundos antes de fazer logout
   * Padrão: 30 minutos (1800000ms)
   */
  timeout?: number

  /**
   * Tempo em milissegundos antes do logout para exibir aviso
   * Padrão: 2 minutos (120000ms)
   */
  warningTime?: number

  /**
   * Habilitar/desabilitar o timeout
   * Padrão: true
   */
  enabled?: boolean
}

/**
 * Hook para gerenciar timeout de sessão por inatividade
 *
 * Monitora eventos do usuário (mouse, teclado, toque) e faz logout automático
 * após período de inatividade configurado.
 *
 * @example
 * ```tsx
 * function App() {
 *   useSessionTimeout({
 *     timeout: 30 * 60 * 1000, // 30 minutos
 *     warningTime: 2 * 60 * 1000, // 2 minutos antes
 *   })
 *
 *   return <YourApp />
 * }
 * ```
 */
export function useSessionTimeout(options: UseSessionTimeoutOptions = {}) {
  const {
    timeout = 30 * 60 * 1000, // 30 minutos padrão
    warningTime = 2 * 60 * 1000, // 2 minutos padrão
    enabled = true,
  } = options

  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuthStore()

  const timeoutIdRef = useRef<NodeJS.Timeout>()
  const warningIdRef = useRef<NodeJS.Timeout>()
  const warningShownRef = useRef(false)

  const handleLogout = useCallback(() => {
    logout()
    toast.warning('Sua sessão expirou por inatividade. Faça login novamente.')
    navigate('/login')
  }, [logout, navigate])

  const showWarning = useCallback(() => {
    if (!warningShownRef.current) {
      warningShownRef.current = true
      const minutes = Math.floor(warningTime / 60000)
      toast.warning(
        `Sua sessão expirará em ${minutes} minuto${minutes > 1 ? 's' : ''} por inatividade.`,
        {
          autoClose: 10000,
        }
      )
    }
  }, [warningTime])

  const resetTimer = useCallback(() => {
    // Limpar timers existentes
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current)
    }
    if (warningIdRef.current) {
      clearTimeout(warningIdRef.current)
    }

    warningShownRef.current = false

    if (!enabled || !isAuthenticated) {
      return
    }

    // Timer para exibir aviso
    warningIdRef.current = setTimeout(() => {
      showWarning()
    }, timeout - warningTime)

    // Timer para fazer logout
    timeoutIdRef.current = setTimeout(() => {
      handleLogout()
    }, timeout)
  }, [enabled, isAuthenticated, timeout, warningTime, showWarning, handleLogout])

  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      return
    }

    // Eventos que resetam o timer (atividade do usuário)
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    // Inicializar timer
    resetTimer()

    // Adicionar listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer)
    })

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })

      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }
      if (warningIdRef.current) {
        clearTimeout(warningIdRef.current)
      }
    }
  }, [enabled, isAuthenticated, resetTimer])

  return {
    resetTimer,
  }
}
