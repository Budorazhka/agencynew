import ModuleHub from '@/components/ModuleHub'
import { Users, BarChart3, UserRound, Building2, LibraryBig } from 'lucide-react'

/**
 * Раздел 6.7 стартового ТЗ ALPHABASE.sale: Команда.
 * «Обучение» вынесено в отдельный пункт rail как поздняя правка навигации (вне базового ТЗ).
 */
export default function TeamPage() {
  return (
    <ModuleHub
      moduleIcon={<Users size={32} color="#c9a84c" />}
      moduleName="Команда"
      moduleDescription="Управленческий раздел: состав и показатели без лишней HR-сложности."
      sections={[
        {
          icon: <Users size={20} color="#c9a84c" />,
          title: 'Команда',
          description: 'Оргструктура, сотрудники и роли.',
          route: '/dashboard/team/org',
        },
        {
          icon: <Building2 size={20} color="#c9a84c" />,
          title: 'Филиалы',
          description: 'Структура филиалов, команды и привязка сотрудников.',
          route: '/dashboard/team/branches',
        },
        {
          icon: <UserRound size={20} color="#c9a84c" />,
          title: 'Отчёт: по менеджеру',
          description: 'Шаблон отчёта по сотруднику: период, KPI, активность и динамика (не личный кабинет).',
          route: '/dashboard/reports/manager',
        },
        {
          icon: <BarChart3 size={20} color="#c9a84c" />,
          title: 'Отчёт: по команде',
          description: 'Сводка по офису, таблица сотрудников и KPI-карточки в одном отчётном контуре.',
          route: '/dashboard/reports/team',
        },
        {
          icon: <LibraryBig size={20} color="#c9a84c" />,
          title: 'Реестр отчётов',
          description: 'Единый вход в весь набор управленческой отчётности.',
          route: '/dashboard/reports/registry',
        },
      ]}
    />
  )
}
