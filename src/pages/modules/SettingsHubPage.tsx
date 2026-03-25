import ModuleHub from '@/components/ModuleHub'
import { CreditCard, Palette, Bell, SlidersHorizontal, Settings } from 'lucide-react'

export default function SettingsHubPage() {
  return (
    <ModuleHub
      moduleIcon={<Settings size={32} color="#c9a84c" />}
      moduleName="Настройки"
      moduleDescription="Тарифы, тема оформления, уведомления, воронка сделок и системные параметры."
      backRoute="/dashboard"
      sections={[
        {
          icon: <Bell size={20} color="#c9a84c" />,
          title: 'Уведомления',
          description: 'Каналы доставки: push, email, SMS, Telegram — для каждого события.',
          route: '/dashboard/settings/notifications',
        },
        {
          icon: <Palette size={20} color="#c9a84c" />,
          title: 'White-label и тема',
          description: 'Название компании, акцентный цвет, шрифт, логотип.',
          route: '/dashboard/settings/theme',
        },
        {
          icon: <CreditCard size={20} color="#c9a84c" />,
          title: 'Тарифы и биллинг',
          description: 'Текущий план, использование ресурсов, платёжная информация.',
          route: '/dashboard/settings/tariff',
        },
        {
          icon: <SlidersHorizontal size={20} color="#c9a84c" />,
          title: 'Системные настройки',
          description: 'Расширенные параметры платформы, профиль и безопасность.',
          route: '/dashboard/settings',
        },
      ]}
    />
  )
}
