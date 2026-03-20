import ModuleHub from '@/components/ModuleHub'
import { CreditCard, Palette, Bell, AlarmClock, SlidersHorizontal, Settings } from 'lucide-react'

export default function SettingsHubPage() {
  return (
    <ModuleHub
      moduleIcon={<Settings size={32} color="#c9a84c" />}
      moduleName="Настройки"
      moduleDescription="Тарифы, тема оформления, уведомления, напоминания и общие системные настройки."
      sections={[
        {
          icon: <CreditCard size={20} color="#c9a84c" />,
          title: 'Тарифы',
          description: 'Конфигурация тарифных планов, биллинг и условия использования.',
          route: '/dashboard/settings',
        },
        {
          icon: <Palette size={20} color="#c9a84c" />,
          title: 'Тема',
          description: 'Визуальное оформление: dark/light, white-label параметры.',
          route: '/dashboard/settings',
        },
        {
          icon: <Bell size={20} color="#c9a84c" />,
          title: 'Уведомления',
          description: 'Каналы доставки: email, SMS, Telegram, push.',
          route: '/dashboard/settings',
        },
        {
          icon: <AlarmClock size={20} color="#c9a84c" />,
          title: 'Напоминания',
          description: 'Правила и частота напоминаний.',
          route: '/dashboard/settings',
        },
        {
          icon: <SlidersHorizontal size={20} color="#c9a84c" />,
          title: 'Системные настройки',
          description: 'Конфигурация платформы на уровне компании или роли.',
          route: '/dashboard/settings',
        },
      ]}
    />
  )
}
