import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deve retornar o valor inicial imediatamente', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('deve fazer debounce do valor após o delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Atualizar o valor
    rerender({ value: 'updated', delay: 500 })

    // Valor ainda deve ser o inicial (debounce não completou)
    expect(result.current).toBe('initial')

    // Avançar o tempo
    vi.advanceTimersByTime(500)

    // Aguardar atualização
    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })

  it('deve cancelar o debounce anterior ao receber novo valor', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    // Primeira atualização
    rerender({ value: 'first' })
    vi.advanceTimersByTime(300)

    // Segunda atualização (antes de completar a primeira)
    rerender({ value: 'second' })
    vi.advanceTimersByTime(500)

    // Deve usar o último valor
    await waitFor(() => {
      expect(result.current).toBe('second')
    })
  })

  it('deve usar delay customizado', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    )

    rerender({ value: 'updated', delay: 1000 })

    // Com 500ms não deve ter atualizado
    vi.advanceTimersByTime(500)
    expect(result.current).toBe('initial')

    // Com 1000ms deve atualizar
    vi.advanceTimersByTime(500)
    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })
})
