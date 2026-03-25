import ModuleHub from '@/components/ModuleHub'
import { Building2, SlidersHorizontal, BarChart } from 'lucide-react'

export default function ObjectsPage() {
  return (
    <ModuleHub
      moduleIcon={<Building2 size={32} color="#c9a84c" />}
      moduleName="Объекты"
      moduleDescription="Каталог вторички и первички, поиск с фильтрами, карточка объекта с аналитикой."
      backRoute="/dashboard"
      sections={[
        {
          icon: <Building2 size={20} color="#c9a84c" />,
          title: 'Каталог объектов',
          description: 'Вторичка и первичка в единой базе с удобным поиском.',
          route: '/dashboard/objects/list',
        },
        {
          icon: <SlidersHorizontal size={20} color="#c9a84c" />,
          title: 'Мои объекты',
          description: 'Личный кабинет агента: добавление и управление своими объектами.',
          route: '/dashboard/my-properties',
        },
        {
          icon: <BarChart size={20} color="#c9a84c" />,
          title: 'Аналитика',
          description: 'Days on Market, история цен, сравнение с рынком.',
          route: '/dashboard/objects/list',
          badge: 'soon',
        },
      ]}
    />
  )
}
