import ModuleHub from '@/components/ModuleHub'
import { Users, UserCog, BookMarked, Briefcase, LayoutGrid, Layers } from 'lucide-react'

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
          icon: <Users size={20} color="#c9a84c" />,
          title: 'Лиды',
          description: 'Канбан входящих обращений, очередь, квалификация и перевод в сделку.',
          route: '/dashboard/leads/poker',
        },
        {
          icon: <Layers size={20} color="#c9a84c" />,
          title: 'Распределение лидов',
          description: 'Ручная раздача лидов по менеджерам (дежурный/РОП).',
          route: '/dashboard/leads/poker?distribution=1',
        },
        {
          icon: <UserCog size={20} color="#c9a84c" />,
          title: 'Клиенты',
          description: 'Единая база физлиц и юрлиц, карточки, история коммуникаций.',
          route: '/dashboard/clients',
        },
        {
          icon: <BookMarked size={20} color="#c9a84c" />,
          title: 'Подборки',
          description: 'Подборки объектов для клиентов, история отправки и реакции.',
          route: '/dashboard/selections',
          badge: 'soon',
        },
        {
          icon: <Briefcase size={20} color="#c9a84c" />,
          title: 'Сделки',
          description: 'Воронки первички и вторички, карточка сделки, финансы, документы.',
          route: '/dashboard/deals',
        },
        {
          icon: <BookMarked size={20} color="#c9a84c" />,
          title: 'Брони / Регистрации',
          description: 'Бронирование клиентов и квартир, реестр броней, статусы.',
          route: '/dashboard/bookings',
        },
      ]}
    />
  )
}
