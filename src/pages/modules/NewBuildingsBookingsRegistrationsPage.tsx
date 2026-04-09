import ModuleHub from '@/components/ModuleHub'
import { CalendarCheck, FileCheck2, History, LayoutList } from 'lucide-react'

/**
 * Сводная UI-панель "Брони и регистрации" для контура новостроек.
 * Объединяет быстрые переходы к процессам бронирования и регистрации.
 */
export default function NewBuildingsBookingsRegistrationsPage() {
  return (
    <ModuleHub
      moduleIcon={<LayoutList size={32} color="#c9a84c" />}
      moduleName="Брони и регистрации"
      moduleDescription="Операционный центр первичного рынка: контроль броней, регистраций и истории операций."
      sections={[
        {
          icon: <CalendarCheck size={20} color="#c9a84c" />,
          title: 'Брони',
          description: 'Открыть рабочий контур бронирования клиентов и квартир.',
          route: '/dashboard/bookings',
        },
        {
          icon: <FileCheck2 size={20} color="#c9a84c" />,
          title: 'Регистрация',
          description: 'Реестр регистраций покупателей в проектах девелопера.',
          route: '/dashboard/new-buildings/registration',
        },
        {
          icon: <History size={20} color="#c9a84c" />,
          title: 'История броней',
          description: 'Исторические операции, завершенные и спорные записи.',
          route: '/dashboard/bookings/history',
        },
      ]}
    />
  )
}
