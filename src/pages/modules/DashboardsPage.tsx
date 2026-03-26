import ModuleHub from '@/components/ModuleHub'
import { BarChart3, Filter, UserRound, Users } from 'lucide-react'

export default function DashboardsPage() {
  return (
    <ModuleHub
      moduleIcon={<BarChart3 size={32} color="#c9a84c" />}
      moduleName="Аналитика"
      moduleDescription="Отчеты по лидам, воронке, команде и личным показателям."
      backRoute="/dashboard"
      sections={[
        {
          icon: <BarChart3 size={20} color="#c9a84c" />,
          title: 'Отчет по лидам',
          description: 'Конверсия, источники и динамика лидов.',
          route: '/dashboard/leads',
        },
        {
          icon: <Filter size={20} color="#c9a84c" />,
          title: 'Отчет по воронке',
          description: 'Стадии и конверсия по сделкам.',
          route: '/dashboard/deals/report',
        },
        {
          icon: <Users size={20} color="#c9a84c" />,
          title: 'Отчет по команде',
          description: 'Показатели по сотрудникам и отделам.',
          route: '/dashboard/team/kpi',
        },
        {
          icon: <UserRound size={20} color="#c9a84c" />,
          title: 'Отчет обо мне',
          description: 'Личные KPI и выполнение плана.',
          route: '/dashboard/overview',
        },
      ]}
    />
  )
}
