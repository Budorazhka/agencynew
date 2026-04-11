import ModuleHub from '@/components/ModuleHub'
import { Users, Radio, FileBarChart, LineChart, LayoutGrid } from 'lucide-react'

/** П. 13.3 */
export default function LeadsHubPage() {
  return (
    <ModuleHub
      moduleIcon={<Users size={32} color="#c9a84c" />}
      moduleName="Лиды"
      sections={[
        {
          icon: <LayoutGrid size={20} color="#c9a84c" />,
          title: 'Распределение лидов',
          description: '',
          route: '/dashboard/leads/poker?distribution=1',
        },
        {
          icon: <Radio size={20} color="#c9a84c" />,
          title: 'Источники лидов',
          description: '',
          route: '/dashboard/leads/sources',
        },
        {
          icon: <FileBarChart size={20} color="#c9a84c" />,
          title: 'Общий отчёт по лидам',
          description: '',
          route: '/dashboard/leads/report/general',
        },
        {
          icon: <LineChart size={20} color="#c9a84c" />,
          title: 'Маркетинговый отчёт по лидам',
          description: '',
          route: '/dashboard/leads/report/marketing',
        },
      ]}
    />
  )
}
