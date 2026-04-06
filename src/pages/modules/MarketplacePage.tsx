import ModuleHub from '@/components/ModuleHub'
import { Building2, Globe, KeyRound } from 'lucide-react'

export default function MarketplacePage() {
  return (
    <ModuleHub
      moduleIcon={<Globe size={32} color="#c9a84c" />}
      moduleName="Маркетплейс"
      moduleDescription="Маркетплейс: новостройки, вторичка и аренда."
      sections={[
        {
          icon: <Building2 size={20} color="#c9a84c" />,
          title: 'Новостройки',
          description: 'Каталог новостроек и жилых комплексов.',
          route: '/dashboard/objects/list?market=primary',
        },
        {
          icon: <Globe size={20} color="#c9a84c" />,
          title: 'Вторичка',
          description: 'Каталог вторичного рынка.',
          route: '/dashboard/objects/list?market=secondary',
        },
        {
          icon: <KeyRound size={20} color="#c9a84c" />,
          title: 'Аренда',
          description: 'Раздел аренды объектов.',
          route: '/dashboard/objects/list?market=rent',
        },
      ]}
    />
  )
}
