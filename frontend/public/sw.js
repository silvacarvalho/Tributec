/**
 * Service Worker para PWA
 * Cache-first strategy com fallback para network
 */

const CACHE_NAME = 'tributec-v1'
const STATIC_CACHE = 'tributec-static-v1'
const DYNAMIC_CACHE = 'tributec-dynamic-v1'

// Arquivos para cache offline
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
]

// Install event - cache arquivos estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker')

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static files')
      return cache.addAll(STATIC_FILES)
    })
  )

  // Força o novo SW a assumir imediatamente
  self.skipWaiting()
})

// Activate event - limpa caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker')

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      )
    })
  )

  // Assume o controle de todas as páginas imediatamente
  return self.clients.claim()
})

// Fetch event - estratégia de cache
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Ignora requisições que não são GET
  if (request.method !== 'GET') {
    return
  }

  // Ignora requisições da API (sempre busca da network)
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Sem conexão com a internet' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      })
    )
    return
  }

  // Cache-first para outros recursos
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retorna do cache e atualiza em background
        fetch(request)
          .then((response) => {
            return caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, response.clone())
              return response
            })
          })
          .catch(() => {})

        return cachedResponse
      }

      // Não está em cache, busca da network
      return fetch(request)
        .then((response) => {
          // Não cacheia respostas inválidas
          if (!response || response.status !== 200 || response.type === 'error') {
            return response
          }

          // Clone a resposta
          const responseToCache = response.clone()

          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Fallback para página offline
          if (request.destination === 'document') {
            return caches.match('/index.html')
          }
        })
    })
  )
})

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Tributec'
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' },
    ],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    )
  }
})

// Background sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync', event.tag)

  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Implementar sincronização de dados offline
      Promise.resolve()
    )
  }
})

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-cache') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.keys().then((requests) => {
          return Promise.all(
            requests.map((request) => {
              return fetch(request).then((response) => {
                return cache.put(request, response)
              })
            })
          )
        })
      })
    )
  }
})
