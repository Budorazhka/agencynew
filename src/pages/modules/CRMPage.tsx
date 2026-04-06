import ModuleHub from '@/components/ModuleHub'
import { useAuth } from '@/context/AuthContext'
import { LayoutGrid, Sparkles, FolderOpen, Briefcase, BarChart3, Users, CheckSquare } from 'lucide-react'

/**
 * Раздел 6.2 стартового ТЗ ALPHABASE.sale: CRM — панели и отчёты.
 * У партнёрского риелтора в матрице раздел «CRM» — О: только внешняя «Модная CRM», без внутренних отчётов и базы.
 */
export default function CRMPage() {
  const { currentUser } = useAuth()
  const isPartner = currentUser?.role === 'partner'

  const sections = [
    {
      icon: <LayoutGrid size={20} color="#c9a84c" />,
      title: 'Покерный стол лидов',
      description: 'Этапы воронки, задачи и контроль обработки лидов (как в ТЗ).',
      route: '/dashboard/leads/poker',
    },
    {
      icon: <Users size={20} color="#c9a84c" />,
      title: 'Клиенты',
      description: 'База клиентов, карточки и сегменты.',
      route: '/dashboard/clients',
    },
    {
      icon: <Briefcase size={20} color="#c9a84c" />,
      title: 'Сделки',
      description: 'Воронка, канбан и карточки сделок.',
      route: '/dashboard/deals',
    },
    {
      icon: <CheckSquare size={20} color="#c9a84c" />,
      title: 'Задачи',
      description: 'Мои, командные и автозадачи по срокам.',
      route: '/dashboard/tasks',
    },
    {
      icon: <Sparkles size={20} color="#c9a84c" />,
      title: 'Модная CRM',
      description: 'Расширенный веб-интерфейс CRM (внешний контур).',
      externalUrl: 'https://crm.baza.sale/',
    },
    {
      icon: <FolderOpen size={20} color="#c9a84c" />,
      title: 'Документы',
      description: 'Хранилище и реестр документов по сделкам и клиентам.',
      route: '/dashboard/crm/documents',
    },
    {
      icon: <Briefcase size={20} color="#c9a84c" />,
      title: 'Отчёт: по сделкам',
      description: 'Сводки и аналитика по сделкам агентства.',
      route: '/dashboard/deals/report',
    },
    {
      icon: <BarChart3 size={20} color="#c9a84c" />,
      title: 'Отчёт: по менеджеру / по команде / KPI / выполнению планов',
      description: 'Показатели сотрудников, команды и выполнение планов.',
      route: '/dashboard/team/kpi',
    },
  ]

  const visible = isPartner ? sections.filter((s) => s.title === 'Модная CRM') : sections

  return (
    <ModuleHub
      moduleIcon={<LayoutGrid size={32} color="#c9a84c" />}
      moduleName="CRM"
      moduleDescription={
        isPartner
          ? 'Ограниченный контур для партнёра: доступ к внешней CRM (матрица ALPHABASE, раздел CRM — О).'
          : 'Ключевой раздел: клиенты, сделки, задачи, коммуникации и документы — единая операционная среда.'
      }
      sections={visible}
    />
  )
}
