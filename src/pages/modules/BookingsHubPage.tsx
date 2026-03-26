import ModuleHub from '@/components/ModuleHub'
import { KeyRound, UserRoundPlus } from 'lucide-react'

/** Точка входа в «Брони / Регистрации»: два сценария как в хабах CRM. */
export default function BookingsHubPage() {
  return (
    <ModuleHub
      moduleIcon={<KeyRound size={32} color="#c9a84c" />}
      moduleName="Брони / Регистрации"
      moduleDescription="Регистрация покупателя (бронь квартиры) и регистрация клиента (фиксация в жилом комплексе)."
      backRoute="/dashboard"
      sections={[
        {
          icon: <KeyRound size={20} color="#c9a84c" />,
          title: 'Брони № 1',
          description: 'Бронь квартиры: новостройка (лот в ЖК) или вторичка из базы агентства.',
          route: '/dashboard/bookings/register-buyer',
        },
        {
          icon: <UserRoundPlus size={20} color="#c9a84c" />,
          title: 'Регистрация № 2',
          description: 'Фиксация приведённого клиента за жилым комплексом в новостройке (несколько таких регистраций на клиента допустимы).',
          route: '/dashboard/bookings/register-client',
        },
      ]}
    />
  )
}
