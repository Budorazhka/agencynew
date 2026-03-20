import ModuleHub from '@/components/ModuleHub'
import { Globe } from 'lucide-react'

export default function MarketplacePage() {
  return (
    <ModuleHub
      moduleIcon={<Globe size={32} color="#c9a84c" />}
      moduleName="Маркетплейс"
      moduleDescription="Публичный портал недвижимости — поиск объектов, размещение и витрина для клиентов."
      sections={[
        {
          icon: <Globe size={20} color="#c9a84c" />,
          title: 'Основной портал',
          description: 'Перейти на публичную витрину объектов недвижимости.',
          externalUrl: 'https://portal.example.com',
        },
      ]}
    />
  )
}
