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

/** П. 13.6 */
export default function MlsHubPage() {
  return (
    <ModuleHub
      moduleIcon={<Network size={32} color="#c9a84c" />}
      moduleName="MLS"
      sections={[
        {
          icon: <Network size={20} color="#c9a84c" />,
          title: 'MLS',
          description: '',
          route: '/dashboard/mls',
        },
        {
          icon: <Building2 size={20} color="#c9a84c" />,
          title: 'MLS вторичного рынка',
          description: '',
          route: '/dashboard/mls/secondary',
        },
        {
          icon: <ShieldCheck size={20} color="#c9a84c" />,
          title: 'Верификация партнёров MLS вторичного рынка',
          description: '',
          route: '/dashboard/mls/verification-secondary',
        },
        {
          icon: <KeyRound size={20} color="#c9a84c" />,
          title: 'MLS аренды',
          description: '',
          route: '/dashboard/mls/rent',
        },
        {
          icon: <UserCheck size={20} color="#c9a84c" />,
          title: 'Верификация партнёров MLS аренды',
          description: '',
          route: '/dashboard/mls/verification-rent',
        },
        {
          icon: <BarChart3 size={20} color="#c9a84c" />,
          title: 'По MLS',
          description: '',
          route: '/dashboard/mls/reports/summary',
        },
        {
          icon: <Users size={20} color="#c9a84c" />,
          title: 'О работе MLS-партнёров по вторичному рынку',
          description: '',
          route: '/dashboard/mls/reports/partners-secondary',
        },
        {
          icon: <Home size={20} color="#c9a84c" />,
          title: 'О работе MLS-партнёров по аренде',
          description: '',
          route: '/dashboard/mls/reports/partners-rent',
        },
      ]}
    />
  )
}
