import ModuleHub from '@/components/ModuleHub'
import { Trello, Inbox, User, CopyCheck, ClipboardList, Users } from 'lucide-react'

export default function LeadsHubPage() {
  return (
    <ModuleHub
      moduleIcon={<Users size={32} color="#c9a84c" />}
      moduleName="Лиды"
      moduleDescription="Управление входящими обращениями: канбан, квалификация, дубли, перевод в сделку."
      sections={[
        {
          icon: <Trello size={20} color="#c9a84c" />,
          title: 'Канбан лидов',
          description: 'Новые, в работе, недозвон, квалифицирован, брак и другие статусы.',
          route: '/dashboard/leads',
        },
        {
          icon: <Inbox size={20} color="#c9a84c" />,
          title: 'Очередь входящих',
          description: 'Лиды из сайта, звонков, мессенджеров и API в порядке поступления.',
          route: '/dashboard/leads',
        },
        {
          icon: <User size={20} color="#c9a84c" />,
          title: 'Карточка лида',
          description: 'Контакты, источник, UTM, таймлайн касаний, ответственный.',
          route: '/dashboard/leads',
        },
        {
          icon: <CopyCheck size={20} color="#c9a84c" />,
          title: 'Проверка дублей',
          description: 'Поиск совпадений по телефону, email и ФИО.',
          route: '/dashboard/leads',
        },
        {
          icon: <ClipboardList size={20} color="#c9a84c" />,
          title: 'Квалификация',
          description: 'Анкета, комментарии, задачи, перевод в клиента или сделку.',
          route: '/dashboard/leads',
        },
      ]}
    />
  )
}
