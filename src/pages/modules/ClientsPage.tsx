import ModuleHub from '@/components/ModuleHub'
import { List, UserCog, MessageSquare, Link2, Zap } from 'lucide-react'

export default function ClientsPage() {
  return (
    <ModuleHub
      moduleIcon={<UserCog size={32} color="#c9a84c" />}
      moduleName="Клиенты"
      moduleDescription="Единая база физлиц и юрлиц, карточки клиентов, история взаимодействий."
      sections={[
        {
          icon: <List size={20} color="#c9a84c" />,
          title: 'Список клиентов',
          description: 'Единая база физлиц и юрлиц с фильтрацией и поиском.',
          route: '/dashboard/clients/list',
          badge: 'soon',
        },
        {
          icon: <UserCog size={20} color="#c9a84c" />,
          title: 'Карточка клиента',
          description: 'Контактные данные, теги, бюджет, история взаимодействий.',
          route: '/dashboard/clients/card',
          badge: 'soon',
        },
        {
          icon: <MessageSquare size={20} color="#c9a84c" />,
          title: 'Таймлайн коммуникаций',
          description: 'Звонки, сообщения, смена статусов, системные события.',
          route: '/dashboard/clients/timeline',
          badge: 'soon',
        },
        {
          icon: <Link2 size={20} color="#c9a84c" />,
          title: 'Связанные сущности',
          description: 'Сделки, подборки, брони, документы и задачи клиента.',
          route: '/dashboard/clients/related',
          badge: 'soon',
        },
        {
          icon: <Zap size={20} color="#c9a84c" />,
          title: 'Быстрые действия',
          description: 'Создать задачу, встречу, подборку, файл или сделку.',
          route: '/dashboard/clients/actions',
          badge: 'soon',
        },
      ]}
    />
  )
}
