/**
 * Componente de Input para Inscrição Imobiliária com validação
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
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Home as HomeIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'
import validacaoService from '@/services/validacaoService'

interface InscricaoImobiliariaInputProps extends Omit<TextFieldProps, 'onChange'> {
  value: string
  onChange: (value: string) => void
  onValidacao?: (resultado: {
    valido: boolean
    existe: boolean
    imovel_id?: string
    mensagem?: string
  }) => void
  validarAoDigitar?: boolean
  mostrarIcone?: boolean
  formatoMascara?: string // Ex: "99.99.999.9999" - formato customizável
}

export const InscricaoImobiliariaInput = ({
  value,
  onChange,
  onValidacao,
  validarAoDigitar = true,
  mostrarIcone = true,
  formatoMascara,
  ...textFieldProps
}: InscricaoImobiliariaInputProps) => {
  const [validando, setValidando] = useState(false)
  const [valido, setValido] = useState<boolean | null>(null)
  const [mensagemErro, setMensagemErro] = useState<string>('')

  // Aplica máscara de inscrição imobiliária
  // Formato padrão: XX.XX.XXX.XXXX (pode ser customizado)
  const aplicarMascara = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, '')

    if (!formatoMascara) {
      // Formato padrão: XX.XX.XXX.XXXX
      return apenasNumeros
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .substring(0, 14) // 10 dígitos + 3 pontos
    }

    // Aplica máscara customizada
    let resultado = ''
    let indexNumero = 0

    for (let i = 0; i < formatoMascara.length && indexNumero < apenasNumeros.length; i++) {
      if (formatoMascara[i] === '9') {
        resultado += apenasNumeros[indexNumero]
        indexNumero++
      } else {
        resultado += formatoMascara[i]
      }
    }

    return resultado
  }

  // Handler para mudança de valor
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valorDigitado = event.target.value
    const valorFormatado = aplicarMascara(valorDigitado)
    onChange(valorFormatado)

    // Reset validação
    setValido(null)
    setMensagemErro('')
  }

  // Validação assíncrona
  const validar = useCallback(async () => {
    const inscricaoLimpa = value.replace(/\D/g, '')

    // Valida apenas se tiver algum conteúdo
    if (!inscricaoLimpa) {
      setValido(null)
      setMensagemErro('')
      return
    }

    setValidando(true)

    try {
      const resultado = await validacaoService.validarInscricaoImobiliaria(value)

      setValido(resultado.valido)

      if (!resultado.valido) {
        setMensagemErro(resultado.mensagem || 'Inscrição imobiliária inválida')
      } else if (resultado.existe) {
        setMensagemErro('Inscrição imobiliária já cadastrada no sistema')
      } else {
        setMensagemErro('')
      }

      if (onValidacao) {
        onValidacao(resultado)
      }
    } catch (error) {
      console.error('Erro ao validar inscrição imobiliária:', error)
      setValido(false)
      setMensagemErro('Erro ao validar. Tente novamente.')
    } finally {
      setValidando(false)
    }
  }, [value, onValidacao])

  // Valida ao sair do campo (onBlur)
  const handleBlur = () => {
    if (validarAoDigitar && value) {
      validar()
    }
  }

  // Limpa o campo
  const handleLimpar = () => {
    onChange('')
    setValido(null)
    setMensagemErro('')
  }

  // Ícone de validação
  const renderIconeValidacao = () => {
    if (validando) {
      return <CircularProgress size={20} />
    }

    if (valido === true) {
      return (
        <Tooltip title="Válida">
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
      placeholder={textFieldProps.placeholder || formatoMascara || 'XX.XX.XXX.XXXX'}
      InputProps={{
        ...textFieldProps.InputProps,
        startAdornment: mostrarIcone ? (
          <InputAdornment position="start">
            <Tooltip title="Inscrição Imobiliária">
              <HomeIcon color="action" fontSize="small" />
            </Tooltip>
          </InputAdornment>
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

/**
 * Componente para CCM (Inscrição Municipal)
 * Similar ao InscricaoImobiliariaInput mas com ícone diferente
 */
import { Business as BusinessIcon } from '@mui/icons-material'

interface CcmInputProps extends Omit<TextFieldProps, 'onChange'> {
  value: string
  onChange: (value: string) => void
  onValidacao?: (resultado: {
    valido: boolean
    existe: boolean
    estabelecimento_id?: string
    mensagem?: string
  }) => void
  validarAoDigitar?: boolean
  mostrarIcone?: boolean
}

export const CcmInput = ({
  value,
  onChange,
  onValidacao,
  validarAoDigitar = true,
  mostrarIcone = true,
  ...textFieldProps
}: CcmInputProps) => {
  const [validando, setValidando] = useState(false)
  const [valido, setValido] = useState<boolean | null>(null)
  const [mensagemErro, setMensagemErro] = useState<string>('')

  // Handler para mudança de valor
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)

    // Reset validação
    setValido(null)
    setMensagemErro('')
  }

  // Validação assíncrona
  const validar = useCallback(async () => {
    if (!value) {
      setValido(null)
      setMensagemErro('')
      return
    }

    setValidando(true)

    try {
      const resultado = await validacaoService.validarCcm(value)

      setValido(resultado.valido)

      if (!resultado.valido) {
        setMensagemErro(resultado.mensagem || 'CCM inválido')
      } else if (resultado.existe) {
        setMensagemErro('CCM já cadastrado no sistema')
      } else {
        setMensagemErro('')
      }

      if (onValidacao) {
        onValidacao(resultado)
      }
    } catch (error) {
      console.error('Erro ao validar CCM:', error)
      setValido(false)
      setMensagemErro('Erro ao validar. Tente novamente.')
    } finally {
      setValidando(false)
    }
  }, [value, onValidacao])

  // Valida ao sair do campo
  const handleBlur = () => {
    if (validarAoDigitar && value) {
      validar()
    }
  }

  // Limpa o campo
  const handleLimpar = () => {
    onChange('')
    setValido(null)
    setMensagemErro('')
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
      placeholder={textFieldProps.placeholder || 'CCM'}
      InputProps={{
        ...textFieldProps.InputProps,
        startAdornment: mostrarIcone ? (
          <InputAdornment position="start">
            <Tooltip title="CCM - Cadastro de Contribuinte Municipal">
              <BusinessIcon color="action" fontSize="small" />
            </Tooltip>
          </InputAdornment>
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
