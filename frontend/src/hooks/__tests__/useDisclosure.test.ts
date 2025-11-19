import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDisclosure } from '../useDisclosure'

describe('useDisclosure', () => {
  it('deve iniciar fechado por padrão', () => {
    const { result } = renderHook(() => useDisclosure())
    expect(result.current.isOpen).toBe(false)
  })

  it('deve iniciar aberto quando especificado', () => {
    const { result } = renderHook(() => useDisclosure(true))
    expect(result.current.isOpen).toBe(true)
  })

  it('deve abrir ao chamar open()', () => {
    const { result } = renderHook(() => useDisclosure())

    act(() => {
      result.current.open()
    })

    expect(result.current.isOpen).toBe(true)
  })

  it('deve fechar ao chamar close()', () => {
    const { result } = renderHook(() => useDisclosure(true))

    act(() => {
      result.current.close()
    })

    expect(result.current.isOpen).toBe(false)
  })

  it('deve alternar ao chamar toggle()', () => {
    const { result } = renderHook(() => useDisclosure())

    // Abrir
    act(() => {
      result.current.toggle()
    })
    expect(result.current.isOpen).toBe(true)

    // Fechar
    act(() => {
      result.current.toggle()
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('deve ter aliases onOpen, onClose, onToggle', () => {
    const { result } = renderHook(() => useDisclosure())

    expect(result.current.onOpen).toBe(result.current.open)
    expect(result.current.onClose).toBe(result.current.close)
    expect(result.current.onToggle).toBe(result.current.toggle)
  })
})
