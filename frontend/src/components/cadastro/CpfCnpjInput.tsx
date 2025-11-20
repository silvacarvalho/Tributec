/**
 * Componente de Input para CPF/CNPJ com máscara e validação
 */
import { useState, useCallback, useEffect } from 'react'
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'
import validacaoService from '@/services/validacaoService'

interface CpfCnpjInputProps extends Omit<TextFieldProps, 'onChange'> {
  value: string
  onChange: (value: string) => void
  onValidacao?: (resultado: {
    valido: boolean
    existe: boolean
    pessoa_id?: string
    mensagem?: string
  }) => void
  validarAoDigitar?: boolean
  mostrarIcone?: boolean
}

export const CpfCnpjInput = ({
  value,
  onChange,
  onValidacao,
  validarAoDigitar = true,
  mostrarIcone = true,
  ...textFieldProps
}: CpfCnpjInputProps) => {
  const [validando, setValidando] = useState(false)
  const [valido, setValido] = useState<boolean | null>(null)
  const [mensagemErro, setMensagemErro] = useState<string>('')
  const [tipoPessoa, setTipoPessoa] = useState<'F' | 'J' | null>(null)

  // Aplica máscara de CPF ou CNPJ conforme o tamanho
  const aplicarMascara = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, '')

    if (apenasNumeros.length <= 11) {
      // Máscara de CPF: XXX.XXX.XXX-XX
      return apenasNumeros
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    } else {
      // Máscara de CNPJ: XX.XXX.XXX/XXXX-XX
      return apenasNumeros
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    }
  }

  // Handler para mudança de valor
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valorDigitado = event.target.value
    const apenasNumeros = valorDigitado.replace(/\D/g, '')

    // Limita a 14 dígitos (CNPJ)
    if (apenasNumeros.length > 14) return

    const valorFormatado = aplicarMascara(apenasNumeros)
    onChange(valorFormatado)

    // Determina tipo de pessoa
    if (apenasNumeros.length <= 11) {
      setTipoPessoa('F')
    } else {
      setTipoPessoa('J')
    }

    // Reset validação
    setValido(null)
    setMensagemErro('')
  }

  // Validação assíncrona
  const validar = useCallback(async () => {
    const apenasNumeros = value.replace(/\D/g, '')

    // Valida apenas se tiver tamanho completo (11 ou 14)
    if (apenasNumeros.length !== 11 && apenasNumeros.length !== 14) {
      setValido(null)
      setMensagemErro('')
      return
    }

    setValidando(true)

    try {
      const resultado = await validacaoService.validarCpfCnpj(apenasNumeros)

      setValido(resultado.valido)

      if (!resultado.valido) {
        setMensagemErro(
          resultado.mensagem || `${apenasNumeros.length === 11 ? 'CPF' : 'CNPJ'} inválido`
        )
      } else if (resultado.existe) {
        setMensagemErro(
          `${apenasNumeros.length === 11 ? 'CPF' : 'CNPJ'} já cadastrado no sistema`
        )
      } else {
        setMensagemErro('')
      }

      if (onValidacao) {
        onValidacao(resultado)
      }
    } catch (error) {
      console.error('Erro ao validar CPF/CNPJ:', error)
      setValido(false)
      setMensagemErro('Erro ao validar. Tente novamente.')
    } finally {
      setValidando(false)
    }
  }, [value, onValidacao])

  // Valida ao sair do campo (onBlur)
  const handleBlur = () => {
    if (validarAoDigitar) {
      validar()
    }
  }

  // Limpa o campo
  const handleLimpar = () => {
    onChange('')
    setValido(null)
    setMensagemErro('')
    setTipoPessoa(null)
  }

  // Ícone do tipo de pessoa
  const renderIconeTipoPessoa = () => {
    if (!mostrarIcone || !tipoPessoa) return null

    return (
      <Tooltip title={tipoPessoa === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'}>
        <span>
          {tipoPessoa === 'F' ? (
            <PersonIcon color="action" fontSize="small" />
          ) : (
            <BusinessIcon color="action" fontSize="small" />
          )}
        </span>
      </Tooltip>
    )
  }

  // Ícone de validação
  const renderIconeValidacao = () => {
    if (validando) {
      return <CircularProgress size={20} />
    }

    if (valido === true) {
      return (
        <Tooltip title="Válido">
          <CheckCircleIcon color="success" fontSize="small" />
        </Tooltip>
      )
    }

    if (valido === false) {
      return (
        <Tooltip title={mensagemErro}>
          <ErrorIcon color="error" fontSize="small" />
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
      error={textFieldProps.error || valido === false}
      helperText={textFieldProps.helperText || mensagemErro}
      placeholder={textFieldProps.placeholder || 'XXX.XXX.XXX-XX ou XX.XXX.XXX/XXXX-XX'}
      InputProps={{
        ...textFieldProps.InputProps,
        startAdornment: mostrarIcone ? (
          <InputAdornment position="start">{renderIconeTipoPessoa()}</InputAdornment>
        ) : undefined,
        endAdornment: (
          <InputAdornment position="end">
            {renderIconeValidacao()}
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
