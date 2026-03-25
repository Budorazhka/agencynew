import ModuleHub from '@/components/ModuleHub'
import { BookOpen, UserPlus, ClipboardCheck, LayoutGrid, GraduationCap } from 'lucide-react'

export default function LearningPage() {
  return (
    <ModuleHub
      moduleIcon={<GraduationCap size={32} color="#c9a84c" />}
      moduleName="Обучение"
      moduleDescription="База знаний, онбординг, тестирование и категоризированный контент для команды."
      backRoute="/dashboard"
      sections={[
        {
          icon: <BookOpen size={20} color="#c9a84c" />,
          title: 'База знаний',
          description: 'Регламенты, инструкции, скрипты продаж, SOP-материалы.',
          route: '/dashboard/lms',
        },
        {
          icon: <UserPlus size={20} color="#c9a84c" />,
          title: 'Онбординг',
          description: 'Материалы для новых сотрудников.',
          route: '/dashboard/lms',
        },
        {
          icon: <ClipboardCheck size={20} color="#c9a84c" />,
          title: 'Тестирование',
          description: 'Проверка знаний по темам и ролям.',
          route: '/dashboard/lms',
          badge: 'soon',
        },
        {
          icon: <LayoutGrid size={20} color="#c9a84c" />,
          title: 'Категории контента',
          description: 'Обучение по продажам, продукту, процессам и юридическим темам.',
          route: '/dashboard/lms',
        },
      ]}
    />
  )
}
