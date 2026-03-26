import ModuleHub from '@/components/ModuleHub'
import { Users, UserCog, Handshake, Briefcase, LayoutGrid, Layers, CalendarDays } from 'lucide-react'

export default function CRMPage() {
  return (
    <ModuleHub
      moduleIcon={<LayoutGrid size={32} color="#c9a84c" />}
      moduleName="CRM"
      moduleDescription="CRM (Customer Relationship Management) — управление клиентами и сделками."
      backRoute="/dashboard"
      actionButton={{
        label: 'Перейти в обычную версию CRM',
        externalUrl: 'https://crm.baza.sale/',
      }}
      sections={[
        {
          icon: <Layers size={20} color="#c9a84c" />,
          title: 'Распределение лидов',
          description: 'Ручная раздача лидов по менеджерам (дежурный/РОП).',
          route: '/dashboard/leads/poker?distribution=1',
        },
        {
          icon: <Users size={20} color="#c9a84c" />,
          title: 'Лиды',
          description: 'Канбан входящих обращений, очередь, квалификация и перевод в сделку.',
          route: '/dashboard/leads/poker',
        },
        {
          icon: <UserCog size={20} color="#c9a84c" />,
          title: 'Клиенты',
          description: 'Единая база физлиц и юрлиц, карточки, история коммуникаций.',
          route: '/dashboard/clients',
        },
        {
          icon: <Handshake size={20} color="#c9a84c" />,
          title: 'Партнеры',
          description: 'Партнерская база, реферальные связи и карточки партнеров.',
          route: '/dashboard/partners',
        },
        {
          icon: <Briefcase size={20} color="#c9a84c" />,
          title: 'Сделки',
          description: 'Воронки первички и вторички, карточка сделки, финансы, документы.',
          route: '/dashboard/deals',
        },
        {
          icon: <CalendarDays size={20} color="#c9a84c" />,
          title: 'Календарь',
          description: 'Календарь CRM-задач, встреч и дедлайнов.',
          route: '/dashboard/calendar/personal',
        },
      ]}
    />
  )
}
