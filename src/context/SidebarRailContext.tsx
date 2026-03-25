import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/** Префиксы «тяжёлых» экранов (для документации / будущих подсказок UI). Состояние rail больше не привязано к маршруту. */
export const HEAVY_ROUTE_PREFIXES: readonly string[] = [
  '/dashboard/objects',
  '/dashboard/selections',
  '/dashboard/leads/poker',
  '/dashboard/deals/kanban',
  '/dashboard/my-properties',
] as const

const STORAGE_KEY = 'agency-new.sidebar-rail-collapsed'

function readStoredCollapsed(): boolean {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    if (v === '1' || v === 'true') return true
    if (v === '0' || v === 'false') return false
  } catch {
    /* ignore */
  }
  return false
}

function writeStoredCollapsed(collapsed: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0')
  } catch {
    /* ignore */
  }
}

type SidebarRailContextValue = {
  /** Узкий режим: ~72px, только иконки 5 разделов */
  railCollapsed: boolean
  toggleRail: () => void
  expandRail: () => void
  collapseRail: () => void
}

const SidebarRailContext = createContext<SidebarRailContextValue | null>(null)

export function SidebarRailProvider({ children }: { children: ReactNode }) {
  const [railCollapsed, setRailCollapsed] = useState(readStoredCollapsed)

  const toggleRail = useCallback(() => {
    setRailCollapsed((prev) => {
      const next = !prev
      writeStoredCollapsed(next)
      return next
    })
  }, [])

  const expandRail = useCallback(() => {
    setRailCollapsed(false)
    writeStoredCollapsed(false)
  }, [])

  const collapseRail = useCallback(() => {
    setRailCollapsed(true)
    writeStoredCollapsed(true)
  }, [])

  const value = useMemo(
    () => ({ railCollapsed, toggleRail, expandRail, collapseRail }),
    [railCollapsed, toggleRail, expandRail, collapseRail],
  )

  return <SidebarRailContext.Provider value={value}>{children}</SidebarRailContext.Provider>
}

export function useSidebarRail(): SidebarRailContextValue {
  const ctx = useContext(SidebarRailContext)
  if (!ctx) {
    throw new Error('useSidebarRail must be used within SidebarRailProvider')
  }
  return ctx
}
