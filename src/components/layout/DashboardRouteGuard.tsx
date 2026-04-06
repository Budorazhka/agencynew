import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isDashboardRouteForbiddenForRole } from '@/config/dashboard-rail'

/**
 * Редирект на страницу «Нет доступа»: URL не в rail для роли или закрыты настройки (матрица ALPHABASE).
 */
export function DashboardRouteGuard() {
  const { pathname } = useLocation()
  const { currentUser } = useAuth()
  const role = currentUser?.role ?? 'manager'

  if (isDashboardRouteForbiddenForRole(pathname, role)) {
    return <Navigate to="/dashboard/access-denied" replace state={{ from: pathname }} />
  }

  return <Outlet />
}
