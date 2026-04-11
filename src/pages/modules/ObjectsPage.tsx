import ModuleHub from '@/components/ModuleHub'
import { Building2, BarChart3 } from 'lucide-react'

/** П. 13.5 */
export default function ObjectsPage() {
  return (
    <ModuleHub
      moduleIcon={<Building2 size={32} color="#c9a84c" />}
      moduleName="Объекты вторичного рынка"
      sections={[
        {
          icon: <Building2 size={20} color="#c9a84c" />,
          title: 'Объекты',
          description: '',
          route: '/dashboard/objects/list',
        },
        {
          icon: <BarChart3 size={20} color="#c9a84c" />,
          title: 'По объектам',
          description: '',
          route: '/dashboard/objects/report',
        },
      ]}
    />
  )
}
