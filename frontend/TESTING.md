# Guia de Testes - Frontend Tributec

## 📋 Visão Geral

Este projeto utiliza **Vitest** e **Testing Library** para testes automatizados do frontend.

## 🚀 Executando os Testes

### Todos os testes
```bash
npm test
```

### Modo watch (desenvolvimento)
```bash
npm test -- --watch
```

### Com interface gráfica
```bash
npm run test:ui
```

### Cobertura de testes
```bash
npm run test:coverage
```

## 📁 Estrutura de Testes

```
src/
├── components/
│   └── common/
│       ├── LoadingSpinner.tsx
│       └── __tests__/
│           └── LoadingSpinner.test.tsx
├── hooks/
│   ├── useDebounce.ts
│   └── __tests__/
│       └── useDebounce.test.ts
├── utils/
│   ├── errorHandler.ts
│   └── __tests__/
│       └── errorHandler.test.ts
└── tests/
    ├── setup.ts              # Configuração global
    └── utils/
        └── test-utils.tsx    # Utilitários para testes
```

## 🧪 Tipos de Testes

### 1. Testes de Componentes

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/tests/utils/test-utils'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('deve renderizar com mensagem padrão', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })
})
```

### 2. Testes de Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useDisclosure } from '../useDisclosure'

describe('useDisclosure', () => {
  it('deve abrir ao chamar open()', () => {
    const { result } = renderHook(() => useDisclosure())

    act(() => {
      result.current.open()
    })

    expect(result.current.isOpen).toBe(true)
  })
})
```

### 3. Testes de Utilitários

```typescript
import { describe, it, expect } from 'vitest'
import { parseError } from '../errorHandler'

describe('errorHandler', () => {
  it('deve parsear erro do Axios', () => {
    const error = new AxiosError('Request failed')
    const result = parseError(error)
    expect(result.message).toBeDefined()
  })
})
```

## 🛠️ Utilitários de Teste

### renderWithProviders

Renderiza componentes com todos os providers necessários:

```typescript
import { render } from '@/tests/utils/test-utils'

test('meu componente', () => {
  render(<MeuComponente />)
  // Já inclui QueryProvider, ThemeProvider, Router, etc.
})
```

### createTestQueryClient

Cria um QueryClient otimizado para testes:

```typescript
import { createTestQueryClient } from '@/tests/utils/test-utils'

const queryClient = createTestQueryClient()
// Configurado com retry: false, cache desabilitado
```

## 📝 Boas Práticas

### 1. Nomear Testes Claramente

```typescript
// ✅ Bom
it('deve exibir mensagem de erro quando CPF for inválido')

// ❌ Ruim
it('teste 1')
```

### 2. Organizar com describe

```typescript
describe('LoginForm', () => {
  describe('validação', () => {
    it('deve validar email')
    it('deve validar senha')
  })

  describe('submissão', () => {
    it('deve chamar onSubmit com dados corretos')
  })
})
```

### 3. Usar Queries Corretas

```typescript
// ✅ Bom - buscar por texto visível ao usuário
screen.getByText('Salvar')
screen.getByRole('button', { name: 'Salvar' })
screen.getByLabelText('CPF')

// ❌ Ruim - buscar por detalhes de implementação
container.querySelector('.my-class')
screen.getByTestId('save-button')
```

### 4. Testar Comportamento do Usuário

```typescript
import { userEvent } from '@testing-library/user-event'

it('deve submeter formulário ao clicar em salvar', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn()

  render(<Form onSubmit={onSubmit} />)

  // Simular interação do usuário
  await user.type(screen.getByLabelText('Nome'), 'João')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))

  expect(onSubmit).toHaveBeenCalledWith({ nome: 'João' })
})
```

### 5. Mockar APIs

```typescript
import { vi } from 'vitest'
import * as pessoaService from '@/services/pessoaService'

it('deve carregar lista de pessoas', async () => {
  // Mock da função
  vi.spyOn(pessoaService, 'listar').mockResolvedValue([
    { id: '1', nome: 'João' }
  ])

  render(<PessoasPage />)

  expect(await screen.findByText('João')).toBeInTheDocument()
})
```

### 6. Testar Estados de Loading e Erro

```typescript
it('deve mostrar loading enquanto carrega', () => {
  render(<PessoasPage />)
  expect(screen.getByText('Carregando...')).toBeInTheDocument()
})

it('deve mostrar erro quando falhar', async () => {
  vi.spyOn(pessoaService, 'listar').mockRejectedValue(
    new Error('Erro ao carregar')
  )

  render(<PessoasPage />)

  expect(await screen.findByText(/erro/i)).toBeInTheDocument()
})
```

## 🎯 Cobertura de Testes

### Metas

- **Componentes**: 80%+
- **Hooks**: 90%+
- **Utils**: 95%+
- **Geral**: 80%+

### Verificar Cobertura

```bash
npm run test:coverage
```

O relatório HTML estará disponível em `coverage/index.html`.

### Excluir Arquivos da Cobertura

Configurado em `vitest.config.ts`:

```typescript
coverage: {
  exclude: [
    'node_modules/',
    'src/tests/',
    '**/*.d.ts',
    '**/*.config.*',
    'src/main.tsx',
  ]
}
```

## 🐛 Debugging

### Imprimir HTML do Componente

```typescript
import { render, screen } from '@/tests/utils/test-utils'

const { debug } = render(<MeuComponente />)
debug() // Imprime o HTML no console
```

### Pausar Teste

```typescript
import { screen } from '@/tests/utils/test-utils'

await screen.findByText('Texto', {}, { timeout: 10000 })
```

### Usar console.log

```typescript
it('meu teste', () => {
  console.log('Debug:', someValue)
})
```

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [User Event](https://testing-library.com/docs/user-event/intro)

## ✅ Checklist antes do Commit

- [ ] Todos os testes passando
- [ ] Cobertura aceitável (>80%)
- [ ] Testes para casos de erro
- [ ] Testes para loading states
- [ ] Sem console.log/debug esquecidos
- [ ] Nomes descritivos

```bash
# Executar antes de commitar
npm test && npm run test:coverage
```
