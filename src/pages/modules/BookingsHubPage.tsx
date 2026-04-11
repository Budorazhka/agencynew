import ModuleHub from '@/components/ModuleHub'
import { KeyRound, UserRoundPlus } from 'lucide-react'

export default function BookingsHubPage() {
  return (
    <ModuleHub
      moduleIcon={<KeyRound size={32} color="#c9a84c" />}
      moduleName="Бронирование"
      sections={[
        {
          icon: <UserRoundPlus size={20} color="#c9a84c" />,
          title: 'Забронировать клиента',
          description: '',
          route: '/dashboard/bookings/register-client',
        },
        {
          icon: <KeyRound size={20} color="#c9a84c" />,
          title: 'Забронировать квартиру',
          description: '',
          route: '/dashboard/bookings/register-buyer',
        },
      ]}
    />
  )
}
