import ModuleHub from '@/components/ModuleHub'
import { CalendarCheck, FileCheck2, LayoutList } from 'lucide-react'

export default function NewBuildingsBookingsRegistrationsPage() {
  return (
    <ModuleHub
      moduleIcon={<LayoutList size={32} color="#c9a84c" />}
      moduleName="Новостройки"
      sections={[
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
      ]}
    />
  )
}
