import ModuleHub from '@/components/ModuleHub'
import { Users, BarChart3, GraduationCap } from 'lucide-react'

/** П. 13.7 */
export default function TeamPage() {
  return (
    <ModuleHub
      moduleIcon={<Users size={32} color="#c9a84c" />}
      moduleName="Команда"
      sections={[
        {
          icon: <Users size={20} color="#c9a84c" />,
          title: 'Команда',
          description: '',
          route: '/dashboard/team/org',
        },
        {
          icon: <GraduationCap size={20} color="#c9a84c" />,
          title: 'Обучение и база знаний',
          description: '',
          route: '/dashboard/learning',
        },
        {
          icon: <BarChart3 size={20} color="#c9a84c" />,
          title: 'По команде',
          description: '',
          route: '/dashboard/reports/team',
        },
      ]}
    />
  )
}
