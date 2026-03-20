import ModuleHub from '@/components/ModuleHub'
import { List, User, Share2, Handshake, Home, Receipt } from 'lucide-react'

export default function PartnersPage() {
  return (
    <ModuleHub
      moduleIcon={<Handshake size={32} color="#c9a84c" />}
      moduleName="Партнёры"
      moduleDescription="Реестр рефералов, посредников и собственников. Комиссии, акты, реферальные ссылки."
      sections={[
        {
          icon: <List size={20} color="#c9a84c" />,
          title: 'Общий реестр',
          description: 'Рефералы, посредники, собственники в единой базе.',
          route: '/dashboard/partners/list',
          badge: 'soon',
        },
        {
          icon: <User size={20} color="#c9a84c" />,
          title: 'Карточка партнёра',
          description: 'Данные, статус сотрудничества, история взаимодействий.',
          route: '/dashboard/partners/card',
          badge: 'soon',
        },
        {
          icon: <Share2 size={20} color="#c9a84c" />,
          title: 'Рефералы',
          description: 'Переданные лиды, статусы, начисления, реферальные ссылки.',
          route: '/dashboard/partners/referrals',
          badge: 'soon',
        },
        {
          icon: <Handshake size={20} color="#c9a84c" />,
          title: 'Посредники',
          description: 'Партнёрские сделки, условия сотрудничества, расчёты.',
          route: '/dashboard/partners/intermediaries',
          badge: 'soon',
        },
        {
          icon: <Home size={20} color="#c9a84c" />,
          title: 'Собственники',
          description: 'Объекты, заявки, история размещения и работы по объектам.',
          route: '/dashboard/partners/owners',
          badge: 'soon',
        },
        {
          icon: <Receipt size={20} color="#c9a84c" />,
          title: 'Комиссии и акты',
          description: 'Расчёт вознаграждений и документы по выплатам.',
          route: '/dashboard/partners/commissions',
          badge: 'soon',
        },
      ]}
    />
  )
}
