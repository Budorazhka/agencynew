import ModuleHub from '@/components/ModuleHub'
import { GitBranch, Users, ShieldCheck, BarChart2 } from 'lucide-react'

export default function TeamPage() {
  return (
    <ModuleHub
      moduleIcon={<Users size={32} color="#c9a84c" />}
      moduleName="Команда"
      moduleDescription="Оргструктура компании, управление сотрудниками, роли, права и доступы."
      backRoute="/dashboard"
      sections={[
        {
          icon: <GitBranch size={20} color="#c9a84c" />,
          title: 'Оргструктура',
          description: 'Дерево компании, филиалов, департаментов и команд.',
          route: '/dashboard/team/org',
        },
        {
          icon: <BarChart2 size={20} color="#c9a84c" />,
          title: 'KPI команды',
          description: 'Показатели по лидам, сделкам и выручке за текущий месяц.',
          route: '/dashboard/team/kpi',
        },
        {
          icon: <ShieldCheck size={20} color="#c9a84c" />,
          title: 'Матрица доступов',
          description: 'Матрица ролей и прав, scopes доступа для каждого пользователя.',
          route: '/dashboard/team/access',
        },
      ]}
    />
  )
}
