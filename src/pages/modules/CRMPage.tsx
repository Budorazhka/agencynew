import ModuleHub from '@/components/ModuleHub'
import { Users, UserCog, Building2, BookMarked, Briefcase, LayoutGrid } from 'lucide-react'

export default function CRMPage() {
  return (
    <ModuleHub
      moduleIcon={<LayoutGrid size={32} color="#c9a84c" />}
      moduleName="CRM"
      moduleDescription="Контейнерный раздел — единая точка входа во все операционные сущности системы."
      sections={[
        {
          icon: <Users size={20} color="#c9a84c" />,
          title: 'Лиды',
          description: 'Канбан входящих обращений, очередь, квалификация и перевод в сделку.',
          route: '/dashboard/leads',
        },
        {
          icon: <UserCog size={20} color="#c9a84c" />,
          title: 'Клиенты',
          description: 'Единая база физлиц и юрлиц, карточки, история коммуникаций.',
          route: '/dashboard/clients',
        },
        {
          icon: <Building2 size={20} color="#c9a84c" />,
          title: 'Объекты',
          description: 'Каталог вторички и первички, поиск, фильтры, карточка объекта.',
          route: '/dashboard/objects',
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
