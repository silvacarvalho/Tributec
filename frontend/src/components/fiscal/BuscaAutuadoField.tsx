import { useState } from 'react'
import { Autocomplete, TextField, CircularProgress, Box, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '../../hooks/useDebounce'
import { pessoaService } from '../../services/pessoaService'

interface BuscaAutuadoFieldProps {
  value: string
  onChange: (pessoaId: string, pessoa?: any) => void
  error?: boolean
  helperText?: string
  required?: boolean
  disabled?: boolean
  label?: string
}

export function BuscaAutuadoField({
  value,
  onChange,
  error,
  helperText,
  required,
  disabled,
  label = 'Autuado'
}: BuscaAutuadoFieldProps) {
  const [inputValue, setInputValue] = useState('')
  const [selectedPessoa, setSelectedPessoa] = useState<any>(null)
  const debouncedSearch = useDebounce(inputValue, 500)

  const { data: pessoas, isLoading } = useQuery({
    queryKey: ['pessoas-busca', debouncedSearch],
    queryFn: () =>
      pessoaService.listar({
        skip: 0,
        limit: 10,
        busca: debouncedSearch
      }),
    enabled: debouncedSearch.length >= 3
  })

  const handleChange = (_: any, newValue: any) => {
    setSelectedPessoa(newValue)
    if (newValue) {
      onChange(newValue.id, newValue)
    } else {
      onChange('', undefined)
    }
  }

  const formatarCpfCnpj = (documento: string) => {
    const numeros = documento.replace(/\D/g, '')
    if (numeros.length === 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else if (numeros.length === 14) {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    return documento
  }

  return (
    <Autocomplete
      value={selectedPessoa}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      options={pessoas?.items || []}
      getOptionLabel={(option) => option.nome_razao_social || ''}
      loading={isLoading}
      disabled={disabled}
      noOptionsText={
        inputValue.length < 3
          ? 'Digite ao menos 3 caracteres'
          : 'Nenhuma pessoa encontrada'
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText || 'Digite nome, CPF ou CNPJ'}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Box>
            <Typography variant="body2">{option.nome_razao_social}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.tipo_pessoa === 'FISICA' ? 'CPF' : 'CNPJ'}:{' '}
              {formatarCpfCnpj(option.cpf || option.cnpj || '')}
            </Typography>
          </Box>
        </Box>
      )}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
    />
  )
}
