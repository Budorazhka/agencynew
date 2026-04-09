import ModuleHub from '@/components/ModuleHub'
import {
  Settings,
  ShieldCheck,
  Zap,
  Bell,
  Server,
  CreditCard,
  Palette,
  AlarmClock,
  Sparkles,
  Newspaper,
  MapPinned,
} from 'lucide-react'

/**
 * Раздел 6.10 стартового ТЗ ALPHABASE.sale: Настройки (служебный раздел).
 * Ниже — дополнительные пункты оформления и тарифа, не перечисленные в том же абзаце ТЗ.
 */
export default function SettingsHubPage() {
  return (
    <ModuleHub
      moduleIcon={<Settings size={32} color="#c9a84c" />}
      moduleName="Настройки"
      moduleDescription="Служебный контур: доступы, автоматизация, уведомления, инфо-центр и системные параметры."
      sections={[
        {
          icon: <Newspaper size={20} color="#c9a84c" />,
          title: 'Инфо',
          description: 'Новости, напоминания и корпоративная лента.',
          route: '/dashboard/settings/info',
        },
        {
          icon: <ShieldCheck size={20} color="#c9a84c" />,
          title: 'Доступы',
          description: 'Матрица ролей и прав доступа к разделам и данным.',
          route: '/dashboard/team/access',
        },
        {
          icon: <Sparkles size={20} color="#c9a84c" />,
          title: 'AI-автоматизации',
          description: 'Сценарии ИИ и автоматизации процессов (панель из матрицы ALPHABASE).',
          route: '/dashboard/settings/ai-automation',
        },
        {
          icon: <Zap size={20} color="#c9a84c" />,
          title: 'Автозадачи и триггеры',
          description: 'Правила постановки задач по этапам и событиям.',
          route: '/dashboard/settings/automation',
        },
        {
          icon: <Bell size={20} color="#c9a84c" />,
          title: 'Уведомления',
          description: 'Каналы и шаблоны уведомлений.',
          route: '/dashboard/settings/notifications',
        },
        {
          icon: <MapPinned size={20} color="#c9a84c" />,
          title: 'Статусы агентства',
          description: 'Региональная статусная модель: назначение и снятие статусов.',
          route: '/dashboard/settings/agency-statuses',
        },
        {
          icon: <Server size={20} color="#c9a84c" />,
          title: 'Настройки системы',
          description: 'Профиль агентства, интеграции и системные параметры.',
          route: '/dashboard/settings/system',
        },
        {
          icon: <CreditCard size={20} color="#c9a84c" />,
          title: 'Тарифы',
          description: 'Текущий план, лимиты и биллинг.',
          route: '/dashboard/settings/tariff',
        },
        {
          icon: <Palette size={20} color="#c9a84c" />,
          title: 'Тема',
          description: 'Светлая и тёмная тема интерфейса.',
          route: '/dashboard/settings/theme',
        },
        {
          icon: <AlarmClock size={20} color="#c9a84c" />,
          title: 'Напоминания',
          description: 'Персональные напоминания и контроль сроков.',
          route: '/dashboard/settings/info/reminders',
        },
      ]}
    />
  )
}
