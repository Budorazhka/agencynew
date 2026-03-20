import ModuleHub from '@/components/ModuleHub'
import { Building2, SlidersHorizontal, Image, Link2, Tag, BarChart } from 'lucide-react'

export default function ObjectsPage() {
  return (
    <ModuleHub
      moduleIcon={<Building2 size={32} color="#c9a84c" />}
      moduleName="Объекты"
      moduleDescription="Каталог вторички и первички, поиск с фильтрами, карточка объекта с аналитикой."
      sections={[
        {
          icon: <Building2 size={20} color="#c9a84c" />,
          title: 'Каталог объектов',
          description: 'Вторичка и первичка в единой базе с удобным поиском.',
          route: '/dashboard/my-properties',
        },
        {
          icon: <SlidersHorizontal size={20} color="#c9a84c" />,
          title: 'Поиск и фильтры',
          description: 'Цена, площадь, комнатность, статус, ЖК, локация и другие параметры.',
          route: '/dashboard/my-properties',
        },
        {
          icon: <Image size={20} color="#c9a84c" />,
          title: 'Карточка объекта',
          description: 'Фото, 3D-тур, цена, история цены, характеристики, юридический блок.',
          route: '/dashboard/my-properties',
        },
        {
          icon: <Link2 size={20} color="#c9a84c" />,
          title: 'Связь с ЖК и планировками',
          description: 'Переход в building/unit для объектов из новостроек.',
          route: '/dashboard/my-properties',
          badge: 'soon',
        },
        {
          icon: <Tag size={20} color="#c9a84c" />,
          title: 'Статусы объекта',
          description: 'Свободна, холд, продана и иные операционные статусы.',
          route: '/dashboard/my-properties',
        },
        {
          icon: <BarChart size={20} color="#c9a84c" />,
          title: 'Оценка ликвидности',
          description: 'Аналитические блоки для закупки и продаж, сравнение с рынком.',
          route: '/dashboard/my-properties',
          badge: 'soon',
        },
      ]}
    />
  )
}
