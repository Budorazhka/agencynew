import ModuleHub from '@/components/ModuleHub'
import { Settings, Zap, Bell, Server } from 'lucide-react'

/** П. 13.10 */
export default function SettingsHubPage() {
  return (
    <ModuleHub
      moduleIcon={<Settings size={32} color="#c9a84c" />}
      moduleName="Настройки"
      sections={[
        {
          icon: <Zap size={20} color="#c9a84c" />,
          title: 'Автозадачи и триггеры',
          description: '',
          route: '/dashboard/settings/automation',
        },
        {
          icon: <Bell size={20} color="#c9a84c" />,
          title: 'Уведомления',
          description: '',
          route: '/dashboard/settings/notifications',
        },
        {
          icon: <Server size={20} color="#c9a84c" />,
          title: 'Настройки системы',
          description: '',
          route: '/dashboard/settings/system',
        },
      ]}
    />
  )
}
