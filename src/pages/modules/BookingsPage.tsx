import ModuleHub from '@/components/ModuleHub'
import { UserCheck, Home, List, FileText, Grid2x2, ClipboardCheck, BookMarked } from 'lucide-react'

export default function BookingsPage() {
  return (
    <ModuleHub
      moduleIcon={<BookMarked size={32} color="#c9a84c" />}
      moduleName="Брони / Регистрации"
      moduleDescription="Бронирование клиентов и квартир у девелоперов, реестр и статусы, интеграция с шахматкой."
      sections={[
        {
          icon: <UserCheck size={20} color="#c9a84c" />,
          title: 'Бронирование клиента',
          description: 'Фиксация клиента в рамках взаимодействия с застройщиком.',
          route: '/dashboard/bookings/client',
          badge: 'soon',
        },
        {
          icon: <Home size={20} color="#c9a84c" />,
          title: 'Бронирование квартиры',
          description: 'Выбор конкретного лота и создание брони.',
          route: '/dashboard/bookings/unit',
          badge: 'soon',
        },
        {
          icon: <List size={20} color="#c9a84c" />,
          title: 'Реестр броней',
          description: 'Ожидание, бронь активна, отклонена, просрочена.',
          route: '/dashboard/bookings/registry',
          badge: 'soon',
        },
        {
          icon: <FileText size={20} color="#c9a84c" />,
          title: 'Карточка брони',
          description: 'Объект, клиент, сроки, developer_booking_id, таймер истечения.',
          route: '/dashboard/bookings/card',
          badge: 'soon',
        },
        {
          icon: <Grid2x2 size={20} color="#c9a84c" />,
          title: 'Шахматка девелопера',
          description: 'Выбор лота и отправка API-запроса на бронирование.',
          route: '/dashboard/bookings/chess',
          badge: 'soon',
        },
        {
          icon: <ClipboardCheck size={20} color="#c9a84c" />,
          title: 'Контроль регистраций',
          description: 'Отслеживание статусов по первичному рынку.',
          route: '/dashboard/bookings/registrations',
          badge: 'soon',
        },
      ]}
    />
  )
}
