import ModuleHub from '@/components/ModuleHub'
import { GitBranch, Users, ShieldCheck, UserCog } from 'lucide-react'

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
          icon: <UserCog size={20} color="#c9a84c" />,
          title: 'Управление командой',
          description: 'Сотрудники, роли, структура и управление составом команды.',
          route: '/dashboard/team/kpi',
        },
        {
          icon: <ShieldCheck size={20} color="#c9a84c" />,
          title: 'Управление доступами',
          description: 'Матрица ролей, прав и уровней доступа.',
          route: '/dashboard/team/access',
        },
      ]}
    />
  )
}
