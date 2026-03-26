import ModuleHub from '@/components/ModuleHub'
import { ListTodo, Plus, ClipboardList } from 'lucide-react'

/** Точка входа «Задачи»: два сценария, как у броней. */
export default function TasksHubPage() {
  return (
    <ModuleHub
      moduleIcon={<ListTodo size={32} color="#c9a84c" />}
      moduleName="Задачи"
      moduleDescription="Дашборд задач и управление задачами."
      backRoute="/dashboard"
      sections={[
        {
          icon: <ClipboardList size={20} color="#c9a84c" />,
          title: 'Дашборд по задачам',
          description: 'Общий обзор задач: мои, на сегодня, просроченные, команда.',
          route: '/dashboard/tasks/my',
        },
        {
          icon: <Plus size={20} color="#c9a84c" />,
          title: 'Управление задачами',
          description: 'Создание, редактирование и контроль выполнения задач.',
          route: '/dashboard/tasks/new',
        },
      ]}
    />
  )
}
