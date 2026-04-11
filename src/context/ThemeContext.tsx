import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export type ThemeType = 'felt' | 'standard' | 'light'
export type ThemePreference = 'auto' | 'standard' | 'light'
/** Базовый кегль интерфейса (настройки «Внешний вид»), хранится локально */
export type UiFontScale = '100' | '110' | '125'

interface ThemeContextValue {
  theme: ThemeType
  isFeltStyle: boolean
  preference: ThemePreference
  setPreference: (pref: ThemePreference) => void
  uiFontScale: UiFontScale
  setUiFontScale: (scale: UiFontScale) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const THEME_PREFERENCE_STORAGE_KEY = 'maindash.themePreference'
const UI_FONT_SCALE_STORAGE_KEY = 'maindash.uiFontScale'

function scaleToCssMultiplier(scale: UiFontScale): string {
  if (scale === '110') return '1.1'
  if (scale === '125') return '1.25'
  return '1'
}

function applyUiFontScaleToDocument(scale: UiFontScale) {
  document.documentElement.style.setProperty('--ui-font-scale', scaleToCssMultiplier(scale))
}

function readUiFontScaleFromStorage(): UiFontScale {
  try {
    const raw = localStorage.getItem(UI_FONT_SCALE_STORAGE_KEY)
    if (raw === '100' || raw === '110' || raw === '125') return raw
  } catch {
    /* ignore */
  }
  return '100'
}

function writeUiFontScaleToStorage(scale: UiFontScale) {
  try {
    localStorage.setItem(UI_FONT_SCALE_STORAGE_KEY, scale)
  } catch {
    /* ignore */
  }
}

function readPreferenceFromStorage(): ThemePreference {
  try {
    const raw = localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY)
    if (raw === 'auto' || raw === 'standard' || raw === 'light') return raw
  } catch {
    // ошибки чтения игнорируем
  }
  return 'auto'
}

function writePreferenceToStorage(pref: ThemePreference) {
  try {
    localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, pref)
  } catch {
    // ошибки записи игнорируем
  }
}

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
  const [preference, setPreferenceState] = useState<ThemePreference>(() => readPreferenceFromStorage())
  const [uiFontScale, setUiFontScaleState] = useState<UiFontScale>(() => readUiFontScaleFromStorage())

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref)
    writePreferenceToStorage(pref)
  }, [])

  const setUiFontScale = useCallback((scale: UiFontScale) => {
    setUiFontScaleState(scale)
    writeUiFontScaleToStorage(scale)
    applyUiFontScaleToDocument(scale)
  }, [])

  const themeValue = useMemo<ThemeContextValue>(() => {
    let theme: ThemeType

    if (preference === 'light') {
      theme = 'light'
    } else if (preference === 'standard') {
      theme = 'standard'
    } else {
      const isFeltStyle = shouldUseFeltTheme(location.pathname, currentUser?.accountType)
      theme = isFeltStyle ? 'felt' : 'standard'
    }

    const isFeltStyle = theme === 'felt'
    return { theme, isFeltStyle, preference, setPreference, uiFontScale, setUiFontScale }
  }, [location.pathname, currentUser?.accountType, preference, uiFontScale, setPreference, setUiFontScale])

  useEffect(() => {
    // Глобально выставляем тему на <html>, чтобы CSS-переменные работали везде (включая body).
    const root = document.documentElement
    root.dataset.theme = themeValue.theme
  }, [themeValue.theme])

  useEffect(() => {
    applyUiFontScaleToDocument(uiFontScale)
  }, [uiFontScale])

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
