import ModuleHub from '@/components/ModuleHub'
import { GitBranch, Users, ShieldCheck, User, Building2 } from 'lucide-react'

export default function TeamPage() {
  return (
    <ModuleHub
      moduleIcon={<Users size={32} color="#c9a84c" />}
      moduleName="Команда"
      moduleDescription="Оргструктура компании, управление сотрудниками, роли, права и доступы."
      sections={[
        {
          icon: <GitBranch size={20} color="#c9a84c" />,
          title: 'Оргструктура',
          description: 'Дерево компании, филиалов, департаментов и команд.',
          route: '/dashboard/team',
        },
        {
          icon: <Users size={20} color="#c9a84c" />,
          title: 'Управление командой',
          description: 'Карточки сотрудников, роли, статусы, привязка к отделам.',
          route: '/dashboard/team',
        },
        {
          icon: <ShieldCheck size={20} color="#c9a84c" />,
          title: 'Управление доступами',
          description: 'Матрица ролей и прав, scopes доступа для каждого пользователя.',
          route: '/dashboard/team',
          badge: 'soon',
        },
        {
          icon: <User size={20} color="#c9a84c" />,
          title: 'Карточка сотрудника',
          description: 'Контакты, роль, команда, активность, статус доступа.',
          route: '/dashboard/team',
        },
        {
          icon: <Building2 size={20} color="#c9a84c" />,
          title: 'Филиалы и отделы',
          description: 'Управление branches и teams внутри структуры компании.',
          route: '/dashboard/team',
          badge: 'soon',
        },
      ]}
    />
  )
}
