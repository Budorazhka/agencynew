import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export type ThemeType = 'felt' | 'standard'

interface ThemeContextValue {
  theme: ThemeType
  isFeltStyle: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

// Маршруты аналитики сети партнёров содержат '/partner' в пути
function isAnalyticsNetworkRoute(pathname: string): boolean {
  return pathname.includes('/partner')
}

// Возвращает true если на данном маршруте нужна тема felt (тёмно-зелёная).
// Все маршруты внутри /dashboard используют felt, остальные — standard.
function shouldUseFeltTheme(pathname: string, accountType?: string): boolean {
  if (pathname.startsWith('/dashboard')) {
    return true
  }

  if (isAnalyticsNetworkRoute(pathname)) {
    return true
  }

  // Пользователи internal-кабинета всегда получают felt
  if (accountType === 'internal') {
    return true
  }

  return false
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const auth = useAuth()
  const currentUser = auth?.currentUser || null

  const themeValue = useMemo(() => {
    const isFeltStyle = shouldUseFeltTheme(location.pathname, currentUser?.accountType)
    const theme: ThemeType = isFeltStyle ? 'felt' : 'standard'
    return { theme, isFeltStyle }
  }, [location.pathname, currentUser?.accountType])

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
