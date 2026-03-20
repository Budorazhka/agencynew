import ModuleHub from '@/components/ModuleHub'
import { Trello, FileText, BarChart2, ClipboardCheck, DollarSign, FolderOpen, Briefcase } from 'lucide-react'

export default function DealsPage() {
  return (
    <ModuleHub
      moduleIcon={<Briefcase size={32} color="#c9a84c" />}
      moduleName="Сделки"
      moduleDescription="Воронки первички и вторички, карточка сделки, финансы, чеклисты и документы."
      sections={[
        {
          icon: <Trello size={20} color="#c9a84c" />,
          title: 'Канбан сделок',
          description: 'Отдельные воронки для первички и вторички.',
          route: '/dashboard/deals/kanban',
          badge: 'soon',
        },
        {
          icon: <FileText size={20} color="#c9a84c" />,
          title: 'Карточка сделки',
          description: 'Клиент, объект, бюджет, этап, ответственный, ожидаемая дата закрытия.',
          route: '/dashboard/deals/card',
          badge: 'soon',
        },
        {
          icon: <BarChart2 size={20} color="#c9a84c" />,
          title: 'Статус-бар воронки',
          description: 'Визуальный прогресс по этапам сделки.',
          route: '/dashboard/deals/pipeline',
          badge: 'soon',
        },
        {
          icon: <ClipboardCheck size={20} color="#c9a84c" />,
          title: 'Чек-листы этапов',
          description: 'Обязательные поля и документы перед переходом на следующий этап.',
          route: '/dashboard/deals/checklists',
          badge: 'soon',
        },
        {
          icon: <DollarSign size={20} color="#c9a84c" />,
          title: 'Финансовый блок',
          description: 'Комиссия, платежи, ожидаемые выплаты.',
          route: '/dashboard/deals/finance',
          badge: 'soon',
        },
        {
          icon: <FolderOpen size={20} color="#c9a84c" />,
          title: 'Документы сделки',
          description: 'Генерация и хранение договоров, приложений, актов.',
          route: '/dashboard/deals/documents',
          badge: 'soon',
        },
      ]}
    />
  )
}
