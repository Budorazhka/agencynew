import ModuleHub from '@/components/ModuleHub'
import { ListTodo, Plus } from 'lucide-react'

/** Точка входа «Задачи»: два сценария, как у броней. */
export default function TasksHubPage() {
  return (
    <ModuleHub
      moduleIcon={<ListTodo size={32} color="#c9a84c" />}
      moduleName="Задачи"
      moduleDescription="Создание задач и просмотр личного и командного списка."
      backRoute="/dashboard"
      sections={[
        {
          icon: <Plus size={20} color="#c9a84c" />,
          title: 'Создать задачу',
          description: 'Новая задача: срок, приоритет, привязка к сделке или клиенту.',
          route: '/dashboard/tasks/new',
        },
        {
          icon: <ListTodo size={20} color="#c9a84c" />,
          title: 'Посмотреть задачи',
          description: 'Мои задачи, на сегодня, просроченные, команда и автоматические.',
          route: '/dashboard/tasks/my',
        },
      ]}
    />
  )
}
