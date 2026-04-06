import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useDashboard } from '@/context/DashboardContext'

/**
 * Точка входа в «МЛМ аналитику» из модуля «Партнёры».
 * Не дублируем отчёт — используем существующий экран `/dashboard/city/:cityId/partner`.
 */
export default function PartnersMlmAnalyticsPage() {
  const navigate = useNavigate()
  const { state } = useDashboard()
  const cityId = state.cities[0]?.id ?? null

  useEffect(() => {
    if (!cityId) return
    navigate(`/dashboard/city/${cityId}/partner`, { replace: true })
  }, [cityId, navigate])

  if (!cityId) {
    return <Navigate to="/dashboard/community" replace />
  }

  // Переходим эффектом; это просто "пустая" прокладка.
  return null
}

