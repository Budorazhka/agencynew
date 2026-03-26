import ModuleHub from '@/components/ModuleHub'
import { Building2, SlidersHorizontal, Home, FolderOpen, Scale } from 'lucide-react'

export default function ObjectsPage() {
  return (
    <ModuleHub
      moduleIcon={<Building2 size={32} color="#c9a84c" />}
      moduleName="База объектов"
      moduleDescription="Управление первичкой, продажа, личная база, подборки и сравнения."
      backRoute="/dashboard"
      sections={[
        {
          icon: <SlidersHorizontal size={20} color="#c9a84c" />,
          title: 'Управление первичкой',
          description: 'Управление новостройками и лотами первичного рынка.',
          route: '/dashboard/objects/list?market=primary',
        },
        {
          icon: <Building2 size={20} color="#c9a84c" />,
          title: 'Первичка на продажу',
          description: 'Каталог первички для продаж и работы с клиентами.',
          route: '/dashboard/objects/list?market=primary',
        },
        {
          icon: <Home size={20} color="#c9a84c" />,
          title: 'Мои',
          description: 'Личный кабинет агента: добавление и управление своими объектами.',
          route: '/dashboard/my-properties',
        },
        {
          icon: <FolderOpen size={20} color="#c9a84c" />,
          title: 'Подборки',
          description: 'Создание и управление подборками объектов для клиентов.',
          route: '/dashboard/selections',
        },
        {
          icon: <Scale size={20} color="#c9a84c" />,
          title: 'Сравнения',
          description: 'Сравнение объектов и параметров.',
          route: '/dashboard/objects/list',
          badge: 'soon',
        },
      ]}
    />
  )
}
