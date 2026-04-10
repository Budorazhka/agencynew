import ModuleHub from '@/components/ModuleHub'
import { Handshake, LineChart, MessagesSquare, PieChart, LibraryBig } from 'lucide-react'

/**
 * Раздел 6.9 стартового ТЗ ALPHABASE.sale: Сообщество.
 */
export default function CommunityHubPage() {
  return (
    <ModuleHub
      moduleIcon={<MessagesSquare size={32} color="#c9a84c" />}
      moduleName="Сообщество"
      moduleDescription="Экосистема партнёров: коммуникации, MLS, MLM-аналитика и отчёты по сети."
      sections={[
        {
          icon: <MessagesSquare size={20} color="#c9a84c" />,
          title: 'Сообщество',
          description: 'Панель управления: лента, обсуждения и активность партнёров.',
          route: '/dashboard/community/panel',
        },
        {
          icon: <Handshake size={20} color="#c9a84c" />,
          title: 'Партнёры сообщества',
          description: 'Каталог партнёров сети; карточки и статусы — п. 6.9 ТЗ.',
          route: '/dashboard/partners/list',
        },
        {
          icon: <LineChart size={20} color="#c9a84c" />,
          title: 'MLM-аналитика',
          description: 'Дашборд сети: рефералы, лиды, активность и лидерборд.',
          route: '/dashboard/partners/mlm',
        },
        {
          icon: <PieChart size={20} color="#c9a84c" />,
          title: 'Отчёт: о формировании сообщества партнёров',
          description: 'Динамика роста и вовлечённости сети.',
          route: '/dashboard/community/report',
        },
        {
          icon: <LibraryBig size={20} color="#c9a84c" />,
          title: 'Реестр отчётов',
          description: 'Общий каталог отчётов по всем разделам ALPHABASE.sale.',
          route: '/dashboard/reports/registry',
        },
      ]}
    />
  )
}
