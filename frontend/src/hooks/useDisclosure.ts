/**
 * Hook para gerenciar estado de modais/dialogs
 */
import { useState, useCallback } from 'react'

export function useDisclosure(defaultIsOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultIsOpen)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return {
    isOpen,
    open,
    close,
    toggle,
    onOpen: open,
    onClose: close,
    onToggle: toggle,
  }
}
