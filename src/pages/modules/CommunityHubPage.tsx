import ModuleHub from '@/components/ModuleHub'
import { Handshake, MessagesSquare, PieChart } from 'lucide-react'

/** П. 13.9 */
export default function CommunityHubPage() {
  return (
    <ModuleHub
      moduleIcon={<MessagesSquare size={32} color="#c9a84c" />}
      moduleName="Сообщество"
      sections={[
        {
          icon: <MessagesSquare size={20} color="#c9a84c" />,
          title: 'Сообщество',
          description: '',
          route: '/dashboard/community/panel',
        },
        {
          icon: <Handshake size={20} color="#c9a84c" />,
          title: 'Партнёры сообщества',
          description: '',
          route: '/dashboard/partners/list',
        },
        {
          icon: <PieChart size={20} color="#c9a84c" />,
          title: 'О формировании сообщества партнёров',
          description: '',
          route: '/dashboard/community/report',
        },
      ]}
    />
  )
}
