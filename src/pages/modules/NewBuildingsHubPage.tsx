import ModuleHub from '@/components/ModuleHub'
import {
  Building2,
  CalendarCheck,
  ClipboardList,
  FolderOpen,
  Landmark,
  PieChart,
  Users,
} from 'lucide-react'

export default function NewBuildingsHubPage() {
  return (
    <ModuleHub
      moduleIcon={<Landmark size={32} color="#c9a84c" />}
      moduleName="Новостройки"
      moduleDescription="Первичный рынок: объекты и комиссии, брони, каталог ЖК, партнёры и отчёты. Вёрстка готова к подключению API."
      sections={[
        {
          icon: <Building2 size={20} color="#c9a84c" />,
          title: 'Объекты и комиссии',
          description: 'Объекты первички и комиссионные схемы.',
          route: '/dashboard/new-buildings/objects',
        },
        {
          icon: <FolderOpen size={20} color="#c9a84c" />,
          title: 'Подборки',
          description: 'Коллекции лотов новостроек для клиентов (отдельно от подборок по вторичке).',
          route: '/dashboard/new-buildings/selections',
        },
        {
          icon: <CalendarCheck size={20} color="#c9a84c" />,
          title: 'Брони',
          description: 'Регистрация клиента, бронь квартиры и история операций.',
          route: '/dashboard/bookings',
        },
        {
          icon: <ClipboardList size={20} color="#c9a84c" />,
          title: 'Брони и регистрации',
          description: 'Сводная панель по бронированиям и регистрациям в контуре новостроек.',
          route: '/dashboard/new-buildings/bookings-registrations',
        },
        {
          icon: <Landmark size={20} color="#c9a84c" />,
          title: 'Каталог ЖК',
          description: 'Жилые комплексы, юниты и статусы лотов.',
          route: '/dashboard/new-buildings/catalog',
        },
        {
          icon: <Users size={20} color="#c9a84c" />,
          title: 'Партнёры первичного рынка',
          description: 'Застройщики и контакты по первичке.',
          route: '/dashboard/new-buildings/partners',
        },
        {
          icon: <PieChart size={20} color="#c9a84c" />,
          title: 'Отчёт: работа партнёров по первичке',
          description: 'Показатели партнёров и застройщиков.',
          route: '/dashboard/new-buildings/report-partners',
        },
      ]}
    />
  )
}
