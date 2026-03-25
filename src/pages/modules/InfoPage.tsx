import ModuleHub from '@/components/ModuleHub'
import { AlarmClock, Newspaper, PenLine, Info } from 'lucide-react'

export default function InfoPage() {
  return (
    <ModuleHub
      moduleIcon={<Info size={32} color="#c9a84c" />}
      moduleName="Информация"
      moduleDescription="Корпоративные новости, напоминания — единый информационный центр платформы."
      backRoute="/dashboard"
      sections={[
        {
          icon: <Newspaper size={20} color="#c9a84c" />,
          title: 'Новости',
          description: 'Корпоративная лента, обновления рынка, новые ЖК, изменения ставок.',
          route: '/dashboard/info/news',
        },
        {
          icon: <AlarmClock size={20} color="#c9a84c" />,
          title: 'Напоминания',
          description: 'Персональные напоминания о дедлайнах, встречах и действиях.',
          route: '/dashboard/info/reminders',
        },
        {
          icon: <PenLine size={20} color="#c9a84c" />,
          title: 'Управление новостями',
          description: 'Публикация, редактирование и архив корпоративных новостей.',
          route: '/dashboard/info/news',
          badge: 'soon',
        },
      ]}
    />
  )
}
