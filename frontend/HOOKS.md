# Hooks Customizados - Frontend Tributec

Documentação dos hooks reutilizáveis do projeto.

## 📦 Hooks Disponíveis

### useApiQuery

Hook para fazer queries (GET) com React Query e tratamento de erro automático.

```typescript
import { useApiQuery } from '@/hooks'

function PessoasPage() {
  const { data, isLoading, error } = useApiQuery(
    ['pessoas'],                    // Query key
    () => pessoaService.listar(),  // Query function
    {
      staleTime: 5 * 60 * 1000,    // 5 minutos
      // ... outras opções do React Query
    }
  )

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorAlert message={getErrorMessage(error)} />

  return <div>{/* renderizar data */}</div>
}
```

**Características:**
- Retry automático (2 tentativas)
- Stale time de 5 minutos por padrão
- Tratamento de erro integrado

---

### useApiMutation

Hook para fazer mutations (POST, PUT, DELETE) com toast automático e invalidação de cache.

```typescript
import { useApiMutation } from '@/hooks'

function PessoaForm() {
  const mutation = useApiMutation(
    (data) => pessoaService.criar(data),
    {
      successMessage: 'Pessoa criada com sucesso!',
      errorMessage: 'Erro ao criar pessoa',
      invalidateQueries: [['pessoas']], // Invalida cache da lista
      onSuccess: (data) => {
        navigate(`/pessoas/${data.id}`)
      }
    }
  )

  const handleSubmit = (formData) => {
    mutation.mutate(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* campos do form */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}
```

**Características:**
- Toast de sucesso/erro automático
- Invalidação automática de queries relacionadas
- Loading state integrado

---

### useDebounce

Hook para fazer debounce de valores. Útil para campos de busca.

```typescript
import { useDebounce } from '@/hooks'

function SearchInput() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500) // 500ms de delay

  // Buscar apenas quando debouncedSearch mudar
  const { data } = useApiQuery(
    ['pessoas', 'search', debouncedSearch],
    () => pessoaService.buscar(debouncedSearch),
    {
      enabled: !!debouncedSearch, // Só buscar se tiver valor
    }
  )

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Buscar..."
    />
  )
}
```

**Parâmetros:**
- `value`: Valor a ser debounced
- `delay`: Tempo de espera em ms (padrão: 500)

---

### useDisclosure

Hook para gerenciar estado de modais/dialogs.

```typescript
import { useDisclosure } from '@/hooks'

function PessoasPage() {
  const dialog = useDisclosure()

  return (
    <>
      <Button onClick={dialog.open}>
        Nova Pessoa
      </Button>

      <Dialog open={dialog.isOpen} onClose={dialog.close}>
        {/* conteúdo do dialog */}
      </Dialog>
    </>
  )
}
```

**API:**
```typescript
{
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  onOpen: () => void    // alias para open
  onClose: () => void   // alias para close
  onToggle: () => void  // alias para toggle
}
```

---

### useLocalStorage

Hook para persistir estado no localStorage.

```typescript
import { useLocalStorage } from '@/hooks'

function PreferencesPage() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 14)

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Claro</option>
        <option value="dark">Escuro</option>
      </select>

      <input
        type="number"
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
      />
    </div>
  )
}
```

**Características:**
- Sincroniza automaticamente com localStorage
- Suporta qualquer tipo serializável (JSON)
- Tratamento de erros integrado

---

### usePagination

Hook para gerenciar paginação.

```typescript
import { usePagination, useApiQuery } from '@/hooks'

function PessoasPage() {
  const pagination = usePagination(1, 20) // página 1, 20 itens por página

  const { data } = useApiQuery(
    ['pessoas', pagination.page, pagination.limit],
    () => pessoaService.listar({
      offset: pagination.offset,
      limit: pagination.limit
    })
  )

  return (
    <div>
      {/* lista */}

      <Pagination
        page={pagination.page}
        onChange={(_, page) => pagination.goToPage(page)}
      />
    </div>
  )
}
```

**API:**
```typescript
{
  page: number
  limit: number
  offset: number
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
}
```

---

## 🎯 Exemplos Práticos

### Formulário com Loading e Erro

```typescript
function PessoaForm() {
  const navigate = useNavigate()

  const mutation = useApiMutation(
    (data) => pessoaService.criar(data),
    {
      successMessage: 'Pessoa criada!',
      invalidateQueries: [['pessoas']],
      onSuccess: (pessoa) => navigate(`/pessoas/${pessoa.id}`)
    }
  )

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      mutation.mutate(formData)
    }}>
      {/* campos */}

      <Button
        type="submit"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Salvando...' : 'Salvar'}
      </Button>

      {mutation.isError && (
        <ErrorAlert message={getErrorMessage(mutation.error)} />
      )}
    </form>
  )
}
```

### Busca com Debounce

```typescript
function PessoasSearchPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading } = useApiQuery(
    ['pessoas', 'search', debouncedSearch],
    () => pessoaService.buscar(debouncedSearch),
    { enabled: debouncedSearch.length >= 3 }
  )

  return (
    <>
      <TextField
        label="Buscar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading && <LoadingSpinner />}

      {data?.map(pessoa => (
        <PessoaCard key={pessoa.id} pessoa={pessoa} />
      ))}
    </>
  )
}
```

### Modal com useDisclosure

```typescript
function PessoasPage() {
  const createDialog = useDisclosure()
  const editDialog = useDisclosure()
  const [selectedPessoa, setSelectedPessoa] = useState(null)

  const handleEdit = (pessoa) => {
    setSelectedPessoa(pessoa)
    editDialog.open()
  }

  return (
    <>
      <Button onClick={createDialog.open}>Nova</Button>

      {/* Lista de pessoas */}

      <PessoaFormDialog
        open={createDialog.isOpen}
        onClose={createDialog.close}
      />

      <PessoaFormDialog
        open={editDialog.isOpen}
        onClose={editDialog.close}
        pessoa={selectedPessoa}
      />
    </>
  )
}
```

### Lista Paginada

```typescript
function PessoasPage() {
  const pagination = usePagination(1, 20)

  const { data, isLoading } = useApiQuery(
    ['pessoas', pagination.page, pagination.limit],
    () => pessoaService.listar({
      offset: pagination.offset,
      limit: pagination.limit
    })
  )

  return (
    <>
      {isLoading ? (
        <TableSkeleton rows={20} />
      ) : (
        <>
          <PessoasTable data={data.items} />

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(data.total / pagination.limit)}
              page={pagination.page}
              onChange={(_, page) => pagination.goToPage(page)}
            />
          </Box>
        </>
      )}
    </>
  )
}
```

## 🧪 Testando Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useDisclosure } from '@/hooks'

describe('useDisclosure', () => {
  it('deve abrir e fechar', () => {
    const { result } = renderHook(() => useDisclosure())

    expect(result.current.isOpen).toBe(false)

    act(() => {
      result.current.open()
    })

    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.close()
    })

    expect(result.current.isOpen).toBe(false)
  })
})
```

## 📚 Recursos

- [React Query Docs](https://tanstack.com/query/latest)
- [React Hooks](https://react.dev/reference/react)
- [Zustand](https://docs.pmnd.rs/zustand)
