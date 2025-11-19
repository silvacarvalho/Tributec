import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/tests/utils/test-utils'
import { ErrorAlert } from '../ErrorAlert'

describe('ErrorAlert', () => {
  it('deve renderizar mensagem de erro', () => {
    render(<ErrorAlert message="Erro ao carregar dados" />)
    expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument()
  })

  it('deve renderizar título padrão', () => {
    render(<ErrorAlert message="Mensagem" />)
    expect(screen.getByText('Erro')).toBeInTheDocument()
  })

  it('deve renderizar título customizado', () => {
    render(<ErrorAlert title="Atenção" message="Mensagem" />)
    expect(screen.getByText('Atenção')).toBeInTheDocument()
  })

  it('deve renderizar Alert do MUI com severity error', () => {
    const { container } = render(<ErrorAlert message="Erro" />)
    const alert = container.querySelector('.MuiAlert-standardError')
    expect(alert).toBeInTheDocument()
  })
})
