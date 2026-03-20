import ModuleHub from '@/components/ModuleHub'
import { List, LayoutList, FileText, Zap, AlertCircle, CheckSquare } from 'lucide-react'

export default function TasksPage() {
  return (
    <ModuleHub
      moduleIcon={<CheckSquare size={32} color="#c9a84c" />}
      moduleName="Задачи"
      moduleDescription="Личный и общий трекер задач: дедлайны, приоритеты, автоматические триггеры."
      sections={[
        {
          icon: <List size={20} color="#c9a84c" />,
          title: 'Мои задачи',
          description: 'Личные и назначенные задачи пользователя.',
          route: '/dashboard/tasks/my',
          badge: 'soon',
        },
        {
          icon: <LayoutList size={20} color="#c9a84c" />,
          title: 'Общий трекер',
          description: 'Задачи по клиентам, сделкам, лидам, объектам и иным сущностям.',
          route: '/dashboard/tasks/all',
          badge: 'soon',
        },
        {
          icon: <FileText size={20} color="#c9a84c" />,
          title: 'Карточка задачи',
          description: 'Срок, приоритет, исполнитель, связанная сущность, статус.',
          route: '/dashboard/tasks/card',
          badge: 'soon',
        },
        {
          icon: <Zap size={20} color="#c9a84c" />,
          title: 'Автоматические задачи',
          description: 'Задачи, созданные триггерами системы по событиям.',
          route: '/dashboard/tasks/auto',
          badge: 'soon',
        },
        {
          icon: <AlertCircle size={20} color="#c9a84c" />,
          title: 'Контроль дедлайнов',
          description: 'Просроченные, срочные и ближайшие задачи.',
          route: '/dashboard/tasks/deadlines',
          badge: 'soon',
        },
      ]}
    />
  )
}
