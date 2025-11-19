import { useState } from 'react'
import { Autocomplete, TextField, CircularProgress, Box, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '../../hooks/useDebounce'
import api from '../../services/api'

interface BuscaFiscalFieldProps {
  value: string
  onChange: (fiscalId: string, fiscal?: any) => void
  error?: boolean
  helperText?: string
  required?: boolean
  disabled?: boolean
  label?: string
}

export function BuscaFiscalField({
  value,
  onChange,
  error,
  helperText,
  required,
  disabled,
  label = 'Fiscal Autuante'
}: BuscaFiscalFieldProps) {
  const [inputValue, setInputValue] = useState('')
  const [selectedFiscal, setSelectedFiscal] = useState<any>(null)
  const debouncedSearch = useDebounce(inputValue, 500)

  // Buscar fiscais (usuários com perfil de fiscal)
  const { data: fiscais, isLoading } = useQuery({
    queryKey: ['fiscais-busca', debouncedSearch],
    queryFn: async () => {
      const response = await api.get('/auth/usuarios', {
        params: {
          perfil: 'FISCAL',
          busca: debouncedSearch,
          limit: 10
        }
      })
      return response.data
    },
    enabled: debouncedSearch.length >= 2
  })

  const handleChange = (_: any, newValue: any) => {
    setSelectedFiscal(newValue)
    if (newValue) {
      onChange(newValue.id, newValue)
    } else {
      onChange('', undefined)
    }
  }

  return (
    <Autocomplete
      value={selectedFiscal}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      options={fiscais?.items || []}
      getOptionLabel={(option) => option.nome || option.username || ''}
      loading={isLoading}
      disabled={disabled}
      noOptionsText={
        inputValue.length < 2 ? 'Digite ao menos 2 caracteres' : 'Nenhum fiscal encontrado'
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText || 'Digite o nome do fiscal'}
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
            <Typography variant="body2">{option.nome || option.username}</Typography>
            {option.matricula && (
              <Typography variant="caption" color="text.secondary">
                Matrícula: {option.matricula}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
    />
  )
}
