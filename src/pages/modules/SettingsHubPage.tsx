import ModuleHub from '@/components/ModuleHub'
import { CreditCard, Palette, Bell, SlidersHorizontal, Settings, Paintbrush, Megaphone } from 'lucide-react'

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
          title: 'Внешний вид',
          description: 'Тема интерфейса (светлая/тёмная) и оформление.',
          route: '/dashboard/settings/theme',
        },
        {
          icon: <Paintbrush size={20} color="#c9a84c" />,
          title: 'Брендинг агентства',
          description: 'Логотип и название для шапки CRM, главного экрана и клиентских материалов.',
          route: '/dashboard/settings/branding',
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
          description: 'Профиль, компания, уведомления, безопасность, лиды и менеджеры — без дублирования брендинга.',
          route: '/dashboard/settings',
        },
        {
          icon: <Megaphone size={20} color="#c9a84c" />,
          title: 'Новости и рассылки',
          description: 'Управление лентой новостей и массовыми оповещениями в CRM и личный кабинет.',
          route: '/dashboard/settings/news-mailings',
        },
      ]}
    />
  )
}
