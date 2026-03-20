import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { OverviewPage } from '@/components/overview/OverviewPage'

/** Обзор (карта, аналитика по сети) — только для internal. Остальных редирект на главную. */
export function OverviewGuard() {
  const { currentUser } = useAuth()
  if (currentUser?.accountType !== 'internal') {
    return <Navigate to="/dashboard" replace />
  }
  return <OverviewPage />
}
