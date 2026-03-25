import { PersonnelErrorBoundary } from '@/components/common/ModuleErrorBoundary'
import { PersonnelPage } from '@/components/personnel/PersonnelPage'

/**
 * Маршрут «Компания → Оргструктура»: дерево, карточки сотрудников, боковая карточка,
 * добавление/редактирование (для собственника/директора), вкладка «Управление» для собственника.
 *
 * Раньше здесь был упрощённый дубль + лишний DashboardShell поверх App (двойной сайдбар).
 */
export function TeamOrgPage() {
  return (
    <PersonnelErrorBoundary>
      <PersonnelPage />
    </PersonnelErrorBoundary>
  )
}
