import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Users, TrendingUp, DollarSign, Settings, type LucideIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useLeads } from '@/context/LeadsContext'
import { useTheme } from '@/hooks/useTheme'
import { StatCard } from '@/components/ui/StatCard'
import { cn } from '@/lib/utils'

// Стадии которые считаются "в работе" — всё кроме отказа и успешно закрытых
const ACTIVE_STAGES = ['new', 'contacted', 'qualified', 'proposal']

export function MainScreenOptimized() {
  const { currentUser } = useAuth()
  const { state } = useLeads()
  const { isFeltStyle } = useTheme()

  // Считаем статистику только когда меняется пул лидов.
  // isFeltStyle специально не в зависимостях — это данные, не UI.
  const stats = useMemo(() => {
    const leads = state.leadPool || []
    if (leads.length === 0) {
      return {
        totalLeads: 0,
        newLeads: 0,
        inProgress: 0,
        success: 0,
        totalCommission: 0,
        avgCommission: 0,
      }
    }

    const totalLeads = leads.length
    const newLeads = leads.filter(lead => lead.stageId === 'new' && !lead.managerId).length
    const inProgress = leads.filter(lead => ACTIVE_STAGES.includes(lead.stageId)).length
    const success = leads.filter(lead => lead.stageId === 'deal').length
    const totalCommission = leads.reduce((sum, lead) => sum + (lead.commissionUsd || 0), 0)
    const avgCommission = totalLeads > 0 ? Math.round(totalCommission / totalLeads) : 0

    return { totalLeads, newLeads, inProgress, success, totalCommission, avgCommission }
  }, [state.leadPool])

  // Конфиг карточек пересчитывается когда меняются данные или тема
  const statCards = useMemo(() => [
    {
      icon: Users,
      title: 'Лиды',
      rows: [
        { value: stats.totalLeads, label: 'Всего' },
        { value: stats.newLeads, label: 'Новые' },
      ],
      accentClass: isFeltStyle ? 'border-[var(--felt-accent-gold)]' : 'border-blue-500',
    },
    {
      icon: Building2,
      title: 'Объекты',
      rows: [
        { value: Math.round(stats.totalLeads * 0.3), label: 'Всего' },
        { value: Math.round(stats.success * 0.8), label: 'Продано' },
      ],
      accentClass: isFeltStyle ? 'border-[var(--felt-accent-gold)]' : 'border-green-500',
    },
    {
      icon: TrendingUp,
      title: 'Сделки',
      rows: [
        { value: stats.success, label: 'Всего' },
        { value: Math.round((stats.success / Math.max(stats.totalLeads, 1)) * 100), label: 'Конверсия %' },
      ],
      accentClass: isFeltStyle ? 'border-[var(--felt-accent-gold)]' : 'border-purple-500',
    },
    {
      icon: DollarSign,
      title: 'Комиссии',
      rows: [
        { value: `${stats.totalCommission.toLocaleString()} ₽`, label: 'Всего' },
        { value: `${stats.avgCommission.toLocaleString()} ₽`, label: 'Средний' },
      ],
      accentClass: isFeltStyle ? 'border-[var(--felt-accent-gold)]' : 'border-orange-500',
    },
  ], [stats, isFeltStyle])

  // Список разделов для навигационных карточек — пересчитывается только при смене темы
  const navigationCards = useMemo(() => [
    {
      title: 'Лиды',
      description: 'Управление потенциальными клиентами',
      href: '/dashboard/leads',
      icon: Users,
      variant: isFeltStyle ? ('felt' as const) : ('default' as const),
    },
    {
      title: 'Объекты',
      description: 'База недвижимости и предложений',
      href: '/dashboard/product',
      icon: Building2,
      variant: isFeltStyle ? ('felt' as const) : ('default' as const),
    },
    {
      title: 'Персонал',
      description: 'Сотрудники и роли',
      href: '/dashboard/personnel',
      icon: Users,
      variant: isFeltStyle ? ('felt' as const) : ('default' as const),
    },
    {
      title: 'Настройки',
      description: 'Конфигурация системы',
      href: '/dashboard/settings',
      icon: Settings,
      variant: isFeltStyle ? ('felt' as const) : ('default' as const),
    },
  ], [isFeltStyle])

  // Приветствие зависит только от пользователя, не от темы и не от лидов
  const welcomeMessage = useMemo(() => {
    if (!currentUser) return 'Добро пожаловать!'

    const firstName = currentUser.name.split(' ')[0]
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'

    return `${greeting}, ${firstName}!`
  }, [currentUser])

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className={cn(
        'text-center p-8 rounded-xl border',
        isFeltStyle
          ? 'bg-[var(--felt-surface)] border-[var(--felt-border)]'
          : 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200'
      )}>
        <h1 className={cn(
          'text-3xl font-bold mb-2',
          isFeltStyle
            ? 'text-[var(--felt-text-primary)]'
            : 'text-transparent bg-clip-text text-gradient-to-r from-blue-600 to-purple-600'
        )}>
          {welcomeMessage}
        </h1>
        <p className={cn(
          'text-lg opacity-80',
          isFeltStyle
            ? 'text-[var(--felt-text-secondary)]'
            : 'text-gray-600'
        )}>
          {currentUser?.role === 'owner'
            ? 'Добро пожаловать в систему управления агентством'
            : currentUser?.role === 'director'
            ? 'Панель управления для руководителя'
            : 'Рабочее пространство для эффективной работы'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {navigationCards.map((card, index) => (
          <NavigationCard key={index} {...card} />
        ))}
      </div>
    </div>
  )
}

// Навигационная карточка — ссылка на раздел с иконкой и описанием.
// Использует react-router Link чтобы не было полной перезагрузки страницы.
function NavigationCard({
  title,
  description,
  href,
  icon: Icon,
  variant
}: {
  title: string
  description: string
  href: string
  icon: LucideIcon
  variant: 'default' | 'felt'
}) {
  return (
    <Link
      to={href}
      className={cn(
        'block p-6 rounded-xl border transition-all duration-200 hover:scale-105 hover:shadow-lg',
        variant === 'felt'
          ? 'bg-[var(--felt-surface)] border-[var(--felt-border)] hover:bg-[var(--felt-hover-bg)]'
          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
      )}
    >
      <Icon className={cn(
        'w-8 h-8 mb-3',
        variant === 'felt'
          ? 'text-[var(--felt-accent-gold)]'
          : 'text-blue-600'
      )} />
      <h3 className={cn(
        'font-semibold text-lg mb-2',
        variant === 'felt'
          ? 'text-[var(--felt-text-primary)]'
          : 'text-gray-900'
      )}>
        {title}
      </h3>
      <p className={cn(
        'text-sm opacity-80',
        variant === 'felt'
          ? 'text-[var(--felt-text-secondary)]'
          : 'text-gray-600'
      )}>
        {description}
      </p>
    </Link>
  )
}
