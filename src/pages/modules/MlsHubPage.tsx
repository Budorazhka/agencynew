import ModuleHub from '@/components/ModuleHub'
import {
  Network,
  Building2,
  ShieldCheck,
  KeyRound,
  UserCheck,
  BarChart3,
  Users,
  Home,
} from 'lucide-react'

/**
 * Раздел 6 стартового ТЗ ALPHABASE.sale: MLS — панели и отчёты.
 */
export default function MlsHubPage() {
  return (
    <ModuleHub
      moduleIcon={<Network size={32} color="#c9a84c" />}
      moduleName="MLS"
      moduleDescription="Профессиональная сеть и партнёрский контур: вторичка, аренда, верификация и отчёты."
      sections={[
        {
          icon: <Building2 size={20} color="#c9a84c" />,
          title: 'MLS вторичного рынка',
          description: 'Объекты и сделки партнёрской сети на вторичке.',
          route: '/dashboard/mls/secondary',
        },
        {
          icon: <ShieldCheck size={20} color="#c9a84c" />,
          title: 'Верификация партнёров MLS вторичного рынка',
          description: 'Проверка статуса и документов партнёров вторички.',
          route: '/dashboard/mls/verification-secondary',
        },
        {
          icon: <KeyRound size={20} color="#c9a84c" />,
          title: 'MLS аренды',
          description: 'Каталог и заявки по аренде в партнёрской сети.',
          route: '/dashboard/mls/rent',
        },
        {
          icon: <UserCheck size={20} color="#c9a84c" />,
          title: 'Верификация партнёров MLS аренды',
          description: 'Допуск партнёров к контуру аренды.',
          route: '/dashboard/mls/verification-rent',
        },
        {
          icon: <BarChart3 size={20} color="#c9a84c" />,
          title: 'Отчёт: по MLS',
          description: 'Сводные показатели сети и оборотов.',
          route: '/dashboard/mls/reports/summary',
        },
        {
          icon: <Users size={20} color="#c9a84c" />,
          title: 'Отчёт: о работе MLS-партнёров по вторичному рынку',
          description: 'Активность и результативность партнёров вторички.',
          route: '/dashboard/mls/reports/partners-secondary',
        },
        {
          icon: <Home size={20} color="#c9a84c" />,
          title: 'Отчёт: о работе MLS-партнёров по аренде',
          description: 'Показатели по арендному контуру MLS.',
          route: '/dashboard/mls/reports/partners-rent',
        },
      ]}
    />
  )
}
