import ModuleHub from '@/components/ModuleHub'
import { Megaphone, Newspaper, Send } from 'lucide-react'

export default function SettingsNewsMailingsHubPage() {
  return (
    <ModuleHub
      moduleIcon={<Megaphone size={32} color="#c9a84c" />}
      moduleName="Новости и рассылки"
      moduleDescription="Публикация корпоративных новостей и массовых оповещений в CRM и личный кабинет."
      backRoute="/dashboard/settings-hub"
      backLabel="К настройкам"
      sections={[
        {
          icon: <Newspaper size={20} color="#c9a84c" />,
          title: 'Управление новостями',
          description: 'Создание, редактирование и порядок публикаций в ленте новостей.',
          route: '/dashboard/settings/news-mailings/news',
        },
        {
          icon: <Send size={20} color="#c9a84c" />,
          title: 'Рассылки',
          description: 'Сообщения партнёрам и команде: аудитория, каналы, отложенная отправка.',
          route: '/dashboard/settings/news-mailings/mailings',
        },
      ]}
    />
  )
}
