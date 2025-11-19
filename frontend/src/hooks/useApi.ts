/**
 * Hook para facilitar uso de APIs com React Query
 * Fornece loading, error e retry automáticos
 */
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'react-toastify'

export interface ApiError {
  message: string
  status?: number
  detail?: string
}

/**
 * Extrai mensagem de erro de uma resposta Axios
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') {
      return detail
    }
    if (Array.isArray(detail)) {
      return detail.map(d => d.msg).join(', ')
    }
    return error.message || 'Erro ao processar requisição'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Erro desconhecido'
}

/**
 * Hook para fazer queries (GET) com tratamento de erro automático
 */
export function useApiQuery<TData = unknown, TError = AxiosError>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
    ...options,
  })
}

/**
 * Hook para fazer mutations (POST, PUT, DELETE) com toast automático
 */
export function useApiMutation<TData = unknown, TVariables = unknown, TError = AxiosError>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables> & {
    successMessage?: string
    errorMessage?: string
    invalidateQueries?: unknown[][]
  }
) {
  const queryClient = useQueryClient()

  return useMutation<TData, TError, TVariables>({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Mostrar toast de sucesso
      if (options?.successMessage) {
        toast.success(options.successMessage)
      }

      // Invalidar queries relacionadas
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey })
        })
      }

      // Callback customizado
      options?.onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      // Mostrar toast de erro
      const errorMessage = options?.errorMessage || getErrorMessage(error)
      toast.error(errorMessage)

      // Callback customizado
      options?.onError?.(error, variables, context)
    },
    ...options,
  })
}

/**
 * Hook para lidar com paginação
 */
export function usePagination(initialPage = 1, initialLimit = 20) {
  const [page, setPage] = React.useState(initialPage)
  const [limit, setLimit] = React.useState(initialLimit)

  const offset = (page - 1) * limit

  const nextPage = () => setPage(p => p + 1)
  const prevPage = () => setPage(p => Math.max(1, p - 1))
  const goToPage = (newPage: number) => setPage(Math.max(1, newPage))

  return {
    page,
    limit,
    offset,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
  }
}

import React from 'react'
