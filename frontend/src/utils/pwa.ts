/**
 * Utilitários para PWA
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

/**
 * Registra o Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker não suportado')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    console.log('Service Worker registrado:', registration.scope)

    // Atualizar SW quando disponível
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nova versão disponível
            console.log('Nova versão do app disponível')

            // Notificar usuário
            if (confirm('Nova versão disponível. Atualizar agora?')) {
              window.location.reload()
            }
          }
        })
      }
    })

    return registration
  } catch (error) {
    console.error('Erro ao registrar Service Worker:', error)
    return null
  }
}

/**
 * Desregistra o Service Worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    return await registration.unregister()
  } catch (error) {
    console.error('Erro ao desregistrar Service Worker:', error)
    return false
  }
}

/**
 * Verifica se o app está instalado (PWA)
 */
export function isAppInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  )
}

/**
 * Solicita permissão para notificações
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('Notificações não suportadas')
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission()
  }

  return Notification.permission
}

/**
 * Envia notificação
 */
export async function sendNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  const permission = await requestNotificationPermission()

  if (permission !== 'granted') {
    console.log('Permissão de notificação negada')
    return
  }

  if (!('serviceWorker' in navigator)) {
    // Fallback para notificação simples
    new Notification(title, options)
    return
  }

  // Usa Service Worker para notificação
  const registration = await navigator.serviceWorker.ready
  await registration.showNotification(title, {
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    ...options,
  })
}

/**
 * Solicita instalação do PWA
 */
export function setupInstallPrompt(): {
  prompt: () => Promise<void>
  canInstall: boolean
} {
  let deferredPrompt: BeforeInstallPromptEvent | null = null

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
  })

  return {
    get canInstall() {
      return deferredPrompt !== null && !isAppInstalled()
    },
    async prompt() {
      if (!deferredPrompt) {
        throw new Error('Install prompt não disponível')
      }

      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      console.log(`Usuário ${outcome} a instalação`)
      deferredPrompt = null
    },
  }
}

/**
 * Solicita atualização do cache
 */
export async function updateCache(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return
  }

  const registration = await navigator.serviceWorker.ready
  await registration.update()
}

/**
 * Limpa cache do app
 */
export async function clearCache(): Promise<void> {
  if (!('caches' in window)) {
    return
  }

  const cacheNames = await caches.keys()
  await Promise.all(cacheNames.map((name) => caches.delete(name)))

  console.log('Cache limpo')
}

/**
 * Verifica se está online
 */
export function isOnline(): boolean {
  return navigator.onLine
}

/**
 * Monitora conexão
 */
export function setupConnectionMonitor(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}

/**
 * Compartilhar (Web Share API)
 */
export async function share(data: ShareData): Promise<boolean> {
  if (!('share' in navigator)) {
    console.log('Web Share API não suportada')
    return false
  }

  try {
    await navigator.share(data)
    return true
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log('Compartilhamento cancelado')
    } else {
      console.error('Erro ao compartilhar:', error)
    }
    return false
  }
}

/**
 * Verifica se pode compartilhar
 */
export function canShare(): boolean {
  return 'share' in navigator
}
