import ModuleHub from '@/components/ModuleHub'
import { CreditCard, Palette, Bell, Wallet, AlarmClock, Settings } from 'lucide-react'

export default function SettingsHubPage() {
  return (
    <ModuleHub
      moduleIcon={<Settings size={32} color="#c9a84c" />}
      moduleName="Настройки"
      moduleDescription="Тарифы, тема, уведомления, напоминания и финансы."
      backRoute="/dashboard"
      sections={[
        {
          icon: <CreditCard size={20} color="#c9a84c" />,
          title: 'Тарифы',
          description: 'Текущий план, лимиты и биллинг.',
          route: '/dashboard/settings/tariff',
        },
        {
          icon: <Palette size={20} color="#c9a84c" />,
          title: 'Тема',
          description: 'Светлая и темная тема интерфейса.',
          route: '/dashboard/settings/theme',
        },
        {
          icon: <Bell size={20} color="#c9a84c" />,
          title: 'Уведомления',
          description: 'Каналы доставки: push, email, SMS, Telegram.',
          route: '/dashboard/settings/notifications',
        },
        {
          icon: <AlarmClock size={20} color="#c9a84c" />,
          title: 'Напоминания',
          description: 'Персональные напоминания и контроль сроков.',
          route: '/dashboard/info/reminders',
        },
        {
          icon: <Wallet size={20} color="#c9a84c" />,
          title: 'Финансы',
          description: 'Финансовые настройки и платежные данные.',
          route: '/dashboard/settings',
          badge: 'soon',
        },
      ]}
    />
  )
}
