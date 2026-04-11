import ModuleHub from '@/components/ModuleHub'
import {
  Building2,
  CalendarCheck,
  FileCheck2,
  Landmark,
  PieChart,
  Users,
} from 'lucide-react'

/** П. 13.4 */
export default function NewBuildingsHubPage() {
  return (
    <ModuleHub
      moduleIcon={<Landmark size={32} color="#c9a84c" />}
      moduleName="Новостройки"
      sections={[
        {
          icon: <Building2 size={20} color="#c9a84c" />,
          title: 'Объекты и комиссии',
          description: '',
          route: '/dashboard/new-buildings/objects',
        },
        {
          icon: <Landmark size={20} color="#c9a84c" />,
          title: 'Новостройки',
          description: '',
          route: '/dashboard/new-buildings/catalog',
        },
        {
          icon: <Users size={20} color="#c9a84c" />,
          title: 'Партнёры первичного рынка',
          description: '',
          route: '/dashboard/new-buildings/partners',
        },
        {
          icon: <CalendarCheck size={20} color="#c9a84c" />,
          title: 'Бронирование',
          description: '',
          route: '/dashboard/bookings',
        },
        {
          icon: <FileCheck2 size={20} color="#c9a84c" />,
          title: 'Регистрация',
          description: '',
          route: '/dashboard/new-buildings/registration',
        },
        {
          icon: <PieChart size={20} color="#c9a84c" />,
          title: 'О работе партнёров по первичному рынку',
          description: '',
          route: '/dashboard/new-buildings/report-partners',
        },
      ]}
    />
  )
}
