import ModuleHub from '@/components/ModuleHub'
import { Bell, AlarmClock, Newspaper, PenLine, Archive, Info } from 'lucide-react'

export default function InfoPage() {
  return (
    <ModuleHub
      moduleIcon={<Info size={32} color="#c9a84c" />}
      moduleName="Информация"
      moduleDescription="Уведомления, напоминания, корпоративные новости — единый информационный центр платформы."
      sections={[
        {
          icon: <Bell size={20} color="#c9a84c" />,
          title: 'Уведомления',
          description: 'Системные оповещения по событиям, задачам, сделкам и лидам.',
          route: '/dashboard/info/notifications',
          badge: 'soon',
        },
        {
          icon: <AlarmClock size={20} color="#c9a84c" />,
          title: 'Напоминания',
          description: 'Персональные и системные напоминания о дедлайнах и действиях.',
          route: '/dashboard/info/reminders',
          badge: 'soon',
        },
        {
          icon: <Newspaper size={20} color="#c9a84c" />,
          title: 'Новости',
          description: 'Корпоративная новостная лента, обновления рынка, новые ЖК, изменения ставок.',
          route: '/dashboard/info/news',
          badge: 'soon',
        },
        {
          icon: <PenLine size={20} color="#c9a84c" />,
          title: 'Управление новостями',
          description: 'Публикация, редактирование и архив корпоративных новостей.',
          route: '/dashboard/info/news-admin',
          badge: 'soon',
        },
        {
          icon: <Archive size={20} color="#c9a84c" />,
          title: 'Информационный центр',
          description: 'Единая точка для внутренних сообщений платформы.',
          route: '/dashboard/info/center',
          badge: 'soon',
        },
      ]}
    />
  )
}
