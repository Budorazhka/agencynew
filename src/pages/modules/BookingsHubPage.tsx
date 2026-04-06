import ModuleHub from '@/components/ModuleHub'
import { KeyRound, UserRoundPlus } from 'lucide-react'

/** Точка входа в «Брони / Регистрации»: два сценария как в хабах CRM. */
export default function BookingsHubPage() {
  return (
    <ModuleHub
      moduleIcon={<KeyRound size={32} color="#c9a84c" />}
      moduleName="Брони / Регистрации"
      moduleDescription="Бронирование клиента и квартиры."
      sections={[
        {
          icon: <UserRoundPlus size={20} color="#c9a84c" />,
          title: 'Забронировать клиента',
          description: 'Фиксация приведённого клиента за жилым комплексом в новостройке (несколько таких регистраций на клиента допустимы).',
          route: '/dashboard/bookings/register-client',
        },
        {
          icon: <KeyRound size={20} color="#c9a84c" />,
          title: 'Забронировать квартиру',
          description: 'Бронь квартиры: новостройка (лот в ЖК) или вторичка из базы агентства.',
          route: '/dashboard/bookings/register-buyer',
        },
      ]}
    />
  )
}
