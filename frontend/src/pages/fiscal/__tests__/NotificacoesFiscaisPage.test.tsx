import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { NotificacoesFiscaisPage } from '../NotificacoesFiscaisPage'
import * as fiscalService from '../../../services/fiscalService'

// Mock do serviço
vi.mock('../../../services/fiscalService')

// Mock do react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

const mockNotificacoes = [
  {
    id: '1',
    numero: 'NOT-2025-001',
    tipo: 'INTIMACAO',
    contribuinte: {
      id: 'c1',
      nome: 'João Silva',
      cpf_cnpj: '123.456.789-00',
    },
    assunto: 'Intimação para Regularização - IPTU 2025',
    descricao: 'Intimação para regularização de débitos de IPTU do exercício 2025',
    status: 'PENDENTE',
    data_emissao: '2025-01-15',
    prazo_resposta: '2025-02-15',
    data_envio: null,
    data_recebimento: null,
  },
  {
    id: '2',
    numero: 'AUT-2025-002',
    tipo: 'AUTO_INFRACAO',
    contribuinte: {
      id: 'c2',
      nome: 'Empresa XYZ Ltda',
      cpf_cnpj: '12.345.678/0001-90',
    },
    assunto: 'Auto de Infração - Falta de Alvará',
    descricao: 'Autuação por funcionamento sem alvará válido',
    status: 'ENVIADA',
    data_emissao: '2025-01-10',
    prazo_resposta: '2025-02-10',
    data_envio: '2025-01-12',
    data_recebimento: '2025-01-13',
  },
]

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('NotificacoesFiscaisPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização', () => {
    it('deve renderizar o título da página', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        size: 10,
        pages: 0,
      })

      renderWithRouter(<NotificacoesFiscaisPage />)

      expect(screen.getByText('Notificações Fiscais')).toBeInTheDocument()
    })

    it('deve renderizar loading state inicial', () => {
      vi.mocked(fiscalService.listarNotificacoes).mockImplementation(
        () => new Promise(() => {})
      )

      renderWithRouter(<NotificacoesFiscaisPage />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('deve renderizar lista de notificações', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: mockNotificacoes,
        total: 2,
        page: 1,
        size: 10,
        pages: 1,
      })

      renderWithRouter(<NotificacoesFiscaisPage />)

      await waitFor(() => {
        expect(screen.getByText('NOT-2025-001')).toBeInTheDocument()
        expect(screen.getByText('AUT-2025-002')).toBeInTheDocument()
      })
    })

    it('deve renderizar mensagem quando não há notificações', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        size: 10,
        pages: 0,
      })

      renderWithRouter(<NotificacoesFiscaisPage />)

      await waitFor(() => {
        expect(screen.getByText(/nenhuma notificação encontrada/i)).toBeInTheDocument()
      })
    })
  })

  describe('Filtros', () => {
    it('deve filtrar por tipo de notificação', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: mockNotificacoes,
        total: 2,
        page: 1,
        size: 10,
        pages: 1,
      })

      renderWithRouter(<NotificacoesFiscaisPage />)

      await waitFor(() => {
        expect(screen.getByText('NOT-2025-001')).toBeInTheDocument()
      })

      // Seleciona filtro de tipo
      const tipoSelect = screen.getByLabelText(/tipo/i)
      fireEvent.change(tipoSelect, { target: { value: 'INTIMACAO' } })

      await waitFor(() => {
        expect(fiscalService.listarNotificacoes).toHaveBeenCalledWith(
          expect.objectContaining({ tipo: 'INTIMACAO' })
        )
      })
    })

    it('deve filtrar por status', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: mockNotificacoes,
        total: 2,
        page: 1,
        size: 10,
        pages: 1,
      })

      renderWithRouter(<NotificacoesFiscaisPage />)

      await waitFor(() => {
        expect(screen.getByText('NOT-2025-001')).toBeInTheDocument()
      })

      const statusSelect = screen.getByLabelText(/status/i)
      fireEvent.change(statusSelect, { target: { value: 'PENDENTE' } })

      await waitFor(() => {
        expect(fiscalService.listarNotificacoes).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'PENDENTE' })
        )
      })
    })

    it('deve buscar por número ou contribuinte', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: mockNotificacoes,
        total: 2,
        page: 1,
        size: 10,
        pages: 1,
      })

      renderWithRouter(<NotificacoesFiscaisPage />)

      const searchInput = screen.getByPlaceholderText(/buscar/i)
      fireEvent.change(searchInput, { target: { value: 'João Silva' } })

      await waitFor(() => {
        expect(fiscalService.listarNotificacoes).toHaveBeenCalledWith(
          expect.objectContaining({ busca: 'João Silva' })
        )
      }, { timeout: 1500 }) // Debounce de 500ms
    })

    it('deve limpar filtros', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: mockNotificacoes,
        total: 2,
        page: 1,
        size: 10,
        pages: 1,
      })

      renderWithRouter(<NotificacoesFiscaisPage />)

      // Aplica filtros
      const tipoSelect = screen.getByLabelText(/tipo/i)
      fireEvent.change(tipoSelect, { target: { value: 'INTIMACAO' } })

      await waitFor(() => {
        expect(fiscalService.listarNotificacoes).toHaveBeenCalledWith(
          expect.objectContaining({ tipo: 'INTIMACAO' })
        )
      })

      // Limpa filtros
      const limparButton = screen.getByText(/limpar filtros/i)
      fireEvent.click(limparButton)

      await waitFor(() => {
        expect(fiscalService.listarNotificacoes).toHaveBeenCalledWith(
          expect.objectContaining({ tipo: undefined })
        )
      })
    })
  })

  describe('Ações', () => {
    it('deve abrir modal de criação ao clicar em Nova Notificação', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: mockNotificacoes,
        total: 2,
        page: 1,
        size: 10,
        pages: 1,
      })

      renderWithRouter(<NotificacoesFiscaisPage />)

      await waitFor(() => {
        expect(screen.getByText('NOT-2025-001')).toBeInTheDocument()
      })

      const novoButton = screen.getByText(/nova notificação/i)
      fireEvent.click(novoButton)

      expect(screen.getByText(/criar notificação/i)).toBeInTheDocument()
    })

    it('deve enviar notificação com sucesso', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: mockNotificacoes,
        total: 2,
        page: 1,
        size: 10,
        pages: 1,
      })
      vi.mocked(fiscalService.enviarNotificacao).mockResolvedValue({
        success: true,
        message: 'Notificação enviada',
      })

      renderWithRouter(<NotificacoesFiscaisPage />)

      await waitFor(() => {
        expect(screen.getByText('NOT-2025-001')).toBeInTheDocument()
      })

      // Clica no botão Enviar da primeira notificação
      const enviarButtons = screen.getAllByTitle(/enviar/i)
      fireEvent.click(enviarButtons[0])

      // Confirma envio
      const confirmarButton = screen.getByText(/confirmar/i)
      fireEvent.click(confirmarButton)

      await waitFor(() => {
        expect(fiscalService.enviarNotificacao).toHaveBeenCalledWith('1')
      })
    })

    it('deve cancelar notificação', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: mockNotificacoes,
        total: 2,
        page: 1,
        size: 10,
        pages: 1,
      })
      vi.mocked(fiscalService.cancelarNotificacao).mockResolvedValue({
        success: true,
        message: 'Notificação cancelada',
      })

      renderWithRouter(<NotificacoesFiscaisPage />)

      await waitFor(() => {
        expect(screen.getByText('NOT-2025-001')).toBeInTheDocument()
      })

      const cancelarButtons = screen.getAllByTitle(/cancelar/i)
      fireEvent.click(cancelarButtons[0])

      const confirmarButton = screen.getByText(/confirmar/i)
      fireEvent.click(confirmarButton)

      await waitFor(() => {
        expect(fiscalService.cancelarNotificacao).toHaveBeenCalledWith('1')
      })
    })

    it('deve visualizar detalhes da notificação', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: mockNotificacoes,
        total: 2,
        page: 1,
        size: 10,
        pages: 1,
      })

      renderWithRouter(<NotificacoesFiscaisPage />)

      await waitFor(() => {
        expect(screen.getByText('NOT-2025-001')).toBeInTheDocument()
      })

      const visualizarButtons = screen.getAllByTitle(/visualizar/i)
      fireEvent.click(visualizarButtons[0])

      expect(screen.getByText(/detalhes da notificação/i)).toBeInTheDocument()
    })
  })

  describe('Paginação', () => {
    it('deve mudar de página', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: mockNotificacoes,
        total: 25,
        page: 1,
        size: 10,
        pages: 3,
      })

      renderWithRouter(<NotificacoesFiscaisPage />)

      await waitFor(() => {
        expect(screen.getByText('NOT-2025-001')).toBeInTheDocument()
      })

      // Vai para página 2
      const page2Button = screen.getByLabelText(/página 2/i)
      fireEvent.click(page2Button)

      await waitFor(() => {
        expect(fiscalService.listarNotificacoes).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        )
      })
    })

    it('deve mudar o número de itens por página', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: mockNotificacoes,
        total: 25,
        page: 1,
        size: 10,
        pages: 3,
      })

      renderWithRouter(<NotificacoesFiscaisPage />)

      await waitFor(() => {
        expect(screen.getByText('NOT-2025-001')).toBeInTheDocument()
      })

      const sizeSelect = screen.getByLabelText(/itens por página/i)
      fireEvent.change(sizeSelect, { target: { value: '25' } })

      await waitFor(() => {
        expect(fiscalService.listarNotificacoes).toHaveBeenCalledWith(
          expect.objectContaining({ size: 25 })
        )
      })
    })
  })

  describe('Chips de Status', () => {
    it('deve mostrar chip PENDENTE em amarelo', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: [mockNotificacoes[0]],
        total: 1,
        page: 1,
        size: 10,
        pages: 1,
      })

      renderWithRouter(<NotificacoesFiscaisPage />)

      await waitFor(() => {
        const chip = screen.getByText('PENDENTE')
        expect(chip).toHaveClass('MuiChip-colorWarning')
      })
    })

    it('deve mostrar chip ENVIADA em azul', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: [mockNotificacoes[1]],
        total: 1,
        page: 1,
        size: 10,
        pages: 1,
      })

      renderWithRouter(<NotificacoesFiscaisPage />)

      await waitFor(() => {
        const chip = screen.getByText('ENVIADA')
        expect(chip).toHaveClass('MuiChip-colorInfo')
      })
    })
  })

  describe('Error Handling', () => {
    it('deve mostrar erro ao falhar ao carregar notificações', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockRejectedValue(
        new Error('Erro ao carregar notificações')
      )

      renderWithRouter(<NotificacoesFiscaisPage />)

      await waitFor(() => {
        expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument()
      })
    })

    it('deve mostrar erro ao falhar ao enviar notificação', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: mockNotificacoes,
        total: 2,
        page: 1,
        size: 10,
        pages: 1,
      })
      vi.mocked(fiscalService.enviarNotificacao).mockRejectedValue(
        new Error('Erro ao enviar')
      )

      renderWithRouter(<NotificacoesFiscaisPage />)

      await waitFor(() => {
        expect(screen.getByText('NOT-2025-001')).toBeInTheDocument()
      })

      const enviarButtons = screen.getAllByTitle(/enviar/i)
      fireEvent.click(enviarButtons[0])

      const confirmarButton = screen.getByText(/confirmar/i)
      fireEvent.click(confirmarButton)

      await waitFor(() => {
        expect(screen.getByText(/erro ao enviar/i)).toBeInTheDocument()
      })
    })
  })

  describe('Validação de Formulário', () => {
    it('deve validar campos obrigatórios ao criar notificação', async () => {
      vi.mocked(fiscalService.listarNotificacoes).mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        size: 10,
        pages: 0,
      })

      renderWithRouter(<NotificacoesFiscaisPage />)

      await waitFor(() => {
        expect(screen.getByText(/nova notificação/i)).toBeInTheDocument()
      })

      const novoButton = screen.getByText(/nova notificação/i)
      fireEvent.click(novoButton)

      // Tenta salvar sem preencher campos
      const salvarButton = screen.getByText(/salvar/i)
      fireEvent.click(salvarButton)

      await waitFor(() => {
        expect(screen.getByText(/campo obrigatório/i)).toBeInTheDocument()
      })
    })
  })
})
