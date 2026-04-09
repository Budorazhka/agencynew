import ModuleHub from '@/components/ModuleHub'
import { Users, GraduationCap, BarChart3, UserRound, Building2 } from 'lucide-react'

/**
 * Раздел 6.7 стартового ТЗ ALPHABASE.sale: Команда (включая обучение и отчёт).
 */
export default function TeamPage() {
  return (
    <ModuleHub
      moduleIcon={<Users size={32} color="#c9a84c" />}
      moduleName="Команда"
      moduleDescription="Управленческий раздел: состав, обучение и показатели без лишней HR-сложности."
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
          icon: <GraduationCap size={20} color="#c9a84c" />,
          title: 'Обучение и база знаний',
          description: 'Курсы, материалы и регламенты для команды.',
          route: '/dashboard/learning',
        },
        {
          icon: <UserRound size={20} color="#c9a84c" />,
          title: 'Отчёт: по менеджеру',
          description: 'Личный отчет по результативности конкретного сотрудника.',
          route: '/dashboard/reports/manager',
        },
        {
          icon: <BarChart3 size={20} color="#c9a84c" />,
          title: 'Отчёт: по команде',
          description: 'Сводная аналитика команды, KPI и выполнение планов.',
          route: '/dashboard/reports/team',
        },
      ]}
    />
  )
}
