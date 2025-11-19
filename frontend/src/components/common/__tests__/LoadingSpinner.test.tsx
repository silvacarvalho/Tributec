import { describe, it, expect } from 'vitest'
import { render, screen } from '@/tests/utils/test-utils'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('deve renderizar com mensagem padrão', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('deve renderizar com mensagem customizada', () => {
    render(<LoadingSpinner message="Processando..." />)
    expect(screen.getByText('Processando...')).toBeInTheDocument()
  })

  it('não deve renderizar mensagem quando message for vazio', () => {
    render(<LoadingSpinner message="" />)
    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument()
  })

  it('deve renderizar CircularProgress', () => {
    const { container } = render(<LoadingSpinner />)
    const progress = container.querySelector('.MuiCircularProgress-root')
    expect(progress).toBeInTheDocument()
  })

  it('deve usar tamanho customizado', () => {
    const { container } = render(<LoadingSpinner size={60} />)
    const progress = container.querySelector('.MuiCircularProgress-root')
    expect(progress).toBeInTheDocument()
  })
})
