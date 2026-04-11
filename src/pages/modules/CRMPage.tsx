import ModuleHub from '@/components/ModuleHub'
import { useAuth } from '@/context/AuthContext'
import { LayoutGrid, Sparkles, FolderOpen, Briefcase, UserRound } from 'lucide-react'

/** П. 13.2 — подписи на плитках без слов «Панель управления» / «Отчёт». */
export default function CRMPage() {
  const { currentUser } = useAuth()
  const isPartner = currentUser?.role === 'partner'

  const sections = [
    {
      icon: <LayoutGrid size={20} color="#c9a84c" />,
      title: 'CRM',
      description: '',
      route: '/dashboard/leads/poker',
    },
    {
      icon: <Sparkles size={20} color="#c9a84c" />,
      title: 'Модная CRM',
      description: '',
      externalUrl: 'https://crm.baza.sale/',
    },
    {
      icon: <FolderOpen size={20} color="#c9a84c" />,
      title: 'Документы',
      description: '',
      route: '/dashboard/crm/documents',
    },
    {
      icon: <Briefcase size={20} color="#c9a84c" />,
      title: 'По сделкам',
      description: '',
      route: '/dashboard/deals/report',
    },
    {
      icon: <UserRound size={20} color="#c9a84c" />,
      title: 'По менеджеру',
      description: '',
      route: '/dashboard/reports/manager',
    },
  ]

  const visible = isPartner ? sections.filter((s) => s.title === 'Модная CRM') : sections

  return (
    <ModuleHub
      moduleIcon={<LayoutGrid size={32} color="#c9a84c" />}
      moduleName="CRM"
      sections={visible}
    />
  )
}
