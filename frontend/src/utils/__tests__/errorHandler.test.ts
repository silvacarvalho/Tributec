import { describe, it, expect } from 'vitest'
import { AxiosError } from 'axios'
import {
  parseError,
  isAuthError,
  isPermissionError,
  isNotFoundError,
  isConflictError,
  isValidationError,
} from '../errorHandler'

describe('errorHandler', () => {
  describe('parseError', () => {
    it('deve parsear erro do Axios com detail string', () => {
      const error = new AxiosError('Request failed')
      error.response = {
        status: 400,
        data: { detail: 'CPF inválido' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      }

      const result = parseError(error)
      expect(result.message).toBe('CPF inválido')
      expect(result.status).toBe(400)
    })

    it('deve parsear erro do Axios com detail array (validação)', () => {
      const error = new AxiosError('Validation error')
      error.response = {
        status: 422,
        data: {
          detail: [
            { loc: ['body', 'cpf'], msg: 'field required' },
            { loc: ['body', 'nome'], msg: 'field required' },
          ],
        },
        statusText: 'Unprocessable Entity',
        headers: {},
        config: {} as any,
      }

      const result = parseError(error)
      expect(result.message).toContain('body.cpf')
      expect(result.message).toContain('body.nome')
      expect(result.status).toBe(422)
    })

    it('deve usar mensagem HTTP padrão quando detail não existe', () => {
      const error = new AxiosError('Request failed')
      error.response = {
        status: 404,
        data: {},
        statusText: 'Not Found',
        headers: {},
        config: {} as any,
      }

      const result = parseError(error)
      expect(result.message).toBe('Recurso não encontrado')
      expect(result.status).toBe(404)
    })

    it('deve parsear Error JavaScript padrão', () => {
      const error = new Error('Erro customizado')
      const result = parseError(error)
      expect(result.message).toBe('Erro customizado')
    })

    it('deve retornar mensagem genérica para erro desconhecido', () => {
      const result = parseError('string aleatória')
      expect(result.message).toBe('Erro desconhecido')
    })
  })

  describe('isAuthError', () => {
    it('deve retornar true para erro 401', () => {
      const error = new AxiosError('Unauthorized')
      error.response = {
        status: 401,
        data: {},
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
      }

      expect(isAuthError(error)).toBe(true)
    })

    it('deve retornar false para outros erros', () => {
      const error = new AxiosError('Not Found')
      error.response = {
        status: 404,
        data: {},
        statusText: 'Not Found',
        headers: {},
        config: {} as any,
      }

      expect(isAuthError(error)).toBe(false)
    })
  })

  describe('isPermissionError', () => {
    it('deve retornar true para erro 403', () => {
      const error = new AxiosError('Forbidden')
      error.response = {
        status: 403,
        data: {},
        statusText: 'Forbidden',
        headers: {},
        config: {} as any,
      }

      expect(isPermissionError(error)).toBe(true)
    })
  })

  describe('isNotFoundError', () => {
    it('deve retornar true para erro 404', () => {
      const error = new AxiosError('Not Found')
      error.response = {
        status: 404,
        data: {},
        statusText: 'Not Found',
        headers: {},
        config: {} as any,
      }

      expect(isNotFoundError(error)).toBe(true)
    })
  })

  describe('isConflictError', () => {
    it('deve retornar true para erro 409', () => {
      const error = new AxiosError('Conflict')
      error.response = {
        status: 409,
        data: {},
        statusText: 'Conflict',
        headers: {},
        config: {} as any,
      }

      expect(isConflictError(error)).toBe(true)
    })
  })

  describe('isValidationError', () => {
    it('deve retornar true para erro 422', () => {
      const error = new AxiosError('Validation Error')
      error.response = {
        status: 422,
        data: {},
        statusText: 'Unprocessable Entity',
        headers: {},
        config: {} as any,
      }

      expect(isValidationError(error)).toBe(true)
    })
  })
})
