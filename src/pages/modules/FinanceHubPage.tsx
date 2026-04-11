import ModuleHub from '@/components/ModuleHub'
import { Wallet, BarChart3 } from 'lucide-react'

/** П. 13.8 */
export default function FinanceHubPage() {
  return (
    <ModuleHub
      moduleIcon={<Wallet size={32} color="#c9a84c" />}
      moduleName="Финансы"
      sections={[
        {
          icon: <Wallet size={20} color="#c9a84c" />,
          title: 'Финансы',
          description: '',
          route: '/dashboard/finance/panel',
        },
        {
          icon: <BarChart3 size={20} color="#c9a84c" />,
          title: 'По финансам',
          description: '',
          route: '/dashboard/finance/report',
        },
      ]}
    />
  )
}
