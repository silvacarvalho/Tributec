/**
 * Hook para gerenciar estado no localStorage
 */
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Erro ao ler localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Retorna uma versão wrapped do setValue que persiste no localStorage
  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Erro ao salvar no localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}
