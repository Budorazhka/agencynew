import { useLocation } from 'react-router-dom'

export type SelectionsMarket = 'secondary' | 'newbuild'

/** Базовый префикс маршрутов подборок: вторичка или новостройки (разные контуры). */
export function useSelectionsBasePath(): string {
  const { pathname } = useLocation()
  if (pathname.includes('/dashboard/new-buildings/selections')) {
    return '/dashboard/new-buildings/selections'
  }
  return '/dashboard/objects/selections'
}

export function useSelectionsMarket(): SelectionsMarket {
  const { pathname } = useLocation()
  if (pathname.includes('/dashboard/new-buildings/selections')) return 'newbuild'
  return 'secondary'
}
