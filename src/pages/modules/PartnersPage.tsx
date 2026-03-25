import ModuleHub from '@/components/ModuleHub'
import { List, Handshake, Share2, Home, Receipt, Network } from 'lucide-react'

export default function PartnersPage() {
  return (
    <ModuleHub
      moduleIcon={<Handshake size={32} color="#c9a84c" />}
      moduleName="Партнёры"
      moduleDescription="Реестр рефералов, посредников и собственников. Комиссии, акты, реферальные ссылки."
      backRoute="/dashboard"
      sections={[
        {
          icon: <List size={20} color="#c9a84c" />,
          title: 'Общий реестр',
          description: 'Рефералы, посредники, собственники в единой базе.',
          route: '/dashboard/partners/list',
        },
        {
          icon: <Share2 size={20} color="#c9a84c" />,
          title: 'Рефералы',
          description: 'Переданные лиды, статусы, начисления.',
          route: '/dashboard/partners/list',
        },
        {
          icon: <Handshake size={20} color="#c9a84c" />,
          title: 'Посредники',
          description: 'Партнёрские сделки, условия сотрудничества.',
          route: '/dashboard/partners/list',
        },
        {
          icon: <Home size={20} color="#c9a84c" />,
          title: 'Собственники',
          description: 'Объекты, заявки, история размещения.',
          route: '/dashboard/partners/list',
        },
        {
          icon: <Receipt size={20} color="#c9a84c" />,
          title: 'Комиссии и акты',
          description: 'Расчёт вознаграждений и документы по выплатам.',
          route: '/dashboard/partners/list',
        },
        {
          icon: <Network size={20} color="#c9a84c" />,
          title: 'МЛМ аналитика',
          description: 'Отчёты по структуре, линиям и активности сети.',
          route: '/dashboard/partners/mlm',
        },
      ]}
    />
  )
}
