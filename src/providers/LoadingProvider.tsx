import { createContext, useContext, useState, type ReactNode } from 'react'

interface LoadingContextValue {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  loadingStates: Record<string, boolean>
  setLoadingState: (key: string, loading: boolean) => void
  clearLoadingState: (key: string) => void
}

const LoadingContext = createContext<LoadingContextValue | null>(null)

// Провайдер состояния загрузки.
// Хранит глобальный флаг isLoading и именованные состояния по строковому ключу.
// isLoading = true если активен глобальный флаг или хотя бы одно именованное состояние.
export function LoadingProvider({ children }: { children: ReactNode }) {
  const [globalLoading, setGlobalLoading] = useState(false)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setLoading = (loading: boolean) => {
    setGlobalLoading(loading)
  }

  const setLoadingState = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }))
  }

  const clearLoadingState = (key: string) => {
    setLoadingStates(prev => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })
  }

  const hasAnyLoading = Object.values(loadingStates).some(Boolean) || globalLoading

  return (
    <LoadingContext.Provider value={{
      isLoading: hasAnyLoading,
      setLoading,
      loadingStates,
      setLoadingState,
      clearLoadingState,
    }}>
      {children}
    </LoadingContext.Provider>
  )
}

// Хук для доступа к контексту загрузки
export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}

// Управляет состоянием загрузки для конкретной именованной операции.
// Используй startLoading/stopLoading вокруг асинхронного кода.
export function useLoadingState(key: string) {
  const { loadingStates, setLoadingState, clearLoadingState } = useLoading()

  const isLoading = loadingStates[key] || false

  const startLoading = () => setLoadingState(key, true)
  const stopLoading = () => clearLoadingState(key)

  return {
    isLoading,
    startLoading,
    stopLoading,
  }
}
