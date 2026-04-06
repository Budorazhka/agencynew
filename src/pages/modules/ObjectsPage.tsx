import ModuleHub from '@/components/ModuleHub'
import { Building2, BarChart3, FolderOpen } from 'lucide-react'

/**
 * Раздел 6.5 стартового ТЗ ALPHABASE.sale: объекты вторичного рынка.
 */
export default function ObjectsPage() {
  return (
    <ModuleHub
      moduleIcon={<Building2 size={32} color="#c9a84c" />}
      moduleName="Объекты вторичного рынка"
      moduleDescription="Сильный список объектов, фильтры, карточки и история активности — контур вторички."
      sections={[
        {
          icon: <Building2 size={20} color="#c9a84c" />,
          title: 'Объекты',
          description: 'Панель управления: каталог объектов вторичного рынка.',
          route: '/dashboard/objects/list',
        },
        {
          icon: <FolderOpen size={20} color="#c9a84c" />,
          title: 'Подборки',
          description: 'Коллекции объектов вторички для клиентов (отдельно от подборок по новостройкам).',
          route: '/dashboard/objects/selections',
        },
        {
          icon: <BarChart3 size={20} color="#c9a84c" />,
          title: 'Отчёт: по объектам',
          description: 'Аналитика и выгрузки по объектам и размещениям.',
          route: '/dashboard/objects/report',
        },
      ]}
    />
  )
}
