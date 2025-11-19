/**
 * Provider do React Query com configurações otimizadas
 */
import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { showError, isAuthError } from '@/utils/errorHandler'

// Configuração do QueryClient com otimizações
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configurações padrão para queries
      staleTime: 5 * 60 * 1000, // 5 minutos - dados ficam "fresh"
      gcTime: 10 * 60 * 1000, // 10 minutos - garbage collection
      retry: (failureCount, error) => {
        // Não fazer retry em erros de autenticação/permissão
        if (isAuthError(error)) return false
        // Fazer até 2 retries para outros erros
        return failureCount < 2
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true, // Atualizar ao focar na janela
      refetchOnReconnect: true, // Atualizar ao reconectar
      refetchOnMount: true, // Atualizar ao montar componente
    },
    mutations: {
      // Configurações padrão para mutations
      retry: 1,
      onError: (error) => {
        // Tratar erro de autenticação
        if (isAuthError(error)) {
          // Redirecionar para login
          window.location.href = '/login'
          return
        }
        // Mostrar erro genérico
        showError(error)
      },
    },
  },
})

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools apenas em desenvolvimento */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />}
    </QueryClientProvider>
  )
}

// Funções utilitárias para gerenciar cache

/**
 * Invalida queries específicas
 */
export function invalidateQueries(queryKey: unknown[]) {
  return queryClient.invalidateQueries({ queryKey })
}

/**
 * Atualiza dados em cache
 */
export function setQueryData<T>(queryKey: unknown[], data: T) {
  queryClient.setQueryData(queryKey, data)
}

/**
 * Obtém dados do cache
 */
export function getQueryData<T>(queryKey: unknown[]): T | undefined {
  return queryClient.getQueryData(queryKey)
}

/**
 * Remove queries do cache
 */
export function removeQueries(queryKey: unknown[]) {
  queryClient.removeQueries({ queryKey })
}

/**
 * Limpa todo o cache
 */
export function clearCache() {
  queryClient.clear()
}

/**
 * Pré-carrega dados (prefetch)
 */
export async function prefetchQuery<T>(queryKey: unknown[], queryFn: () => Promise<T>) {
  await queryClient.prefetchQuery({ queryKey, queryFn })
}
