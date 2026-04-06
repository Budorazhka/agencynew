import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { resolveDashboardBackNavigation } from '@/lib/dashboard-back'

export function useDashboardBack() {
  const { pathname, search, state } = useLocation()
  const navigate = useNavigate()

  const target = useMemo(
    () => resolveDashboardBackNavigation(pathname, search, state),
    [pathname, search, state],
  )

  const goBack = useCallback(() => {
    if (!target) return
    navigate({ pathname: target.pathname, search: target.search })
  }, [navigate, target])

  if (!target) return null

  return { goBack, target }
}
