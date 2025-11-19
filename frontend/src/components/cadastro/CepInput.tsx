/**
 * Componente de Input para CEP com busca automática de endereço
 */
import { useState, useCallback } from 'react'
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'
import cepService, { CepResponse } from '@/services/cepService'

interface CepInputProps extends Omit<TextFieldProps, 'onChange'> {
  value: string
  onChange: (value: string) => void
  onEnderecoBuscado?: (endereco: CepResponse) => void
  buscarAutomatico?: boolean
}

export const CepInput = ({
  value,
  onChange,
  onEnderecoBuscado,
  buscarAutomatico = true,
  ...textFieldProps
}: CepInputProps) => {
  const [buscando, setBuscando] = useState(false)
  const [encontrado, setEncontrado] = useState<boolean | null>(null)
  const [mensagemErro, setMensagemErro] = useState<string>('')

  // Aplica máscara de CEP: XXXXX-XXX
  const aplicarMascara = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, '')

    if (apenasNumeros.length <= 5) {
      return apenasNumeros
    }

    return apenasNumeros.substring(0, 5) + '-' + apenasNumeros.substring(5, 8)
  }

  // Handler para mudança de valor
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valorDigitado = event.target.value
    const apenasNumeros = valorDigitado.replace(/\D/g, '')

    // Limita a 8 dígitos
    if (apenasNumeros.length > 8) return

    const valorFormatado = aplicarMascara(apenasNumeros)
    onChange(valorFormatado)

    // Reset estado
    setEncontrado(null)
    setMensagemErro('')
  }

  // Busca endereço por CEP
  const buscarEndereco = useCallback(async () => {
    const cepLimpo = value.replace(/\D/g, '')

    if (cepLimpo.length !== 8) {
      setMensagemErro('CEP deve conter 8 dígitos')
      setEncontrado(false)
      return
    }

    setBuscando(true)
    setMensagemErro('')

    try {
      const endereco = await cepService.buscarCep(cepLimpo)

      setEncontrado(true)
      setMensagemErro('')

      if (onEnderecoBuscado) {
        onEnderecoBuscado(endereco)
      }
    } catch (error: any) {
      console.error('Erro ao buscar CEP:', error)

      setEncontrado(false)

      if (error.response?.status === 404) {
        setMensagemErro('CEP não encontrado')
      } else if (error.response?.status === 400) {
        setMensagemErro('CEP inválido')
      } else if (error.response?.status === 504) {
        setMensagemErro('Timeout ao consultar CEP. Tente novamente.')
      } else {
        setMensagemErro('Erro ao consultar CEP')
      }
    } finally {
      setBuscando(false)
    }
  }, [value, onEnderecoBuscado])

  // Busca automaticamente ao sair do campo
  const handleBlur = () => {
    const cepLimpo = value.replace(/\D/g, '')

    if (buscarAutomatico && cepLimpo.length === 8) {
      buscarEndereco()
    }
  }

  // Limpa o campo
  const handleLimpar = () => {
    onChange('')
    setEncontrado(null)
    setMensagemErro('')
  }

  // Ícone de validação/busca
  const renderIcone = () => {
    if (buscando) {
      return <CircularProgress size={20} />
    }

    if (encontrado === true) {
      return (
        <Tooltip title="CEP encontrado">
          <CheckCircleIcon color="success" fontSize="small" />
        </Tooltip>
      )
    }

    if (encontrado === false) {
      return (
        <Tooltip title={mensagemErro}>
          <ErrorIcon color="error" fontSize="small" />
        </Tooltip>
      )
    }

    // Botão de busca manual
    const cepLimpo = value.replace(/\D/g, '')
    if (cepLimpo.length === 8 && !buscarAutomatico) {
      return (
        <Tooltip title="Buscar endereço">
          <IconButton size="small" onClick={buscarEndereco} edge="end">
            <SearchIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }

    return null
  }

  return (
    <TextField
      {...textFieldProps}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={textFieldProps.error || encontrado === false}
      helperText={textFieldProps.helperText || mensagemErro}
      placeholder={textFieldProps.placeholder || 'XXXXX-XXX'}
      InputProps={{
        ...textFieldProps.InputProps,
        endAdornment: (
          <InputAdornment position="end">
            {renderIcone()}
            {value && (
              <IconButton size="small" onClick={handleLimpar} edge="end">
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
          </InputAdornment>
        ),
      }}
    />
  )
}
