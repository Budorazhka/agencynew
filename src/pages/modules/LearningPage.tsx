import ModuleHub from '@/components/ModuleHub'
import { GraduationCap } from 'lucide-react'

export default function LearningPage() {
  return (
    <ModuleHub
      moduleIcon={<GraduationCap size={32} color="#c9a84c" />}
      moduleName="Обучение и база знаний"
      sections={[
        {
          icon: <GraduationCap size={20} color="#c9a84c" />,
          title: 'Обучение и база знаний',
          description: '',
          route: '/dashboard/lms/browse',
        },
      ]}
    />
  )
}
