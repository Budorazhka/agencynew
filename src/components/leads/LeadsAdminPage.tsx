import { useNavigate } from 'react-router-dom'
import { ShieldX, ArrowRight, Layers, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import './leads-secret-table.css'
import { Button } from '@/components/ui/button'
import { LeadAnalyticsTab } from './LeadAnalyticsTab'
import { useRolePermissions } from '@/hooks/useRolePermissions'
import { useAuth } from '@/context/AuthContext'
import { useLeads } from '@/context/LeadsContext'

const LEADS_WORKSPACE_HERO = `${import.meta.env.BASE_URL}ff6dd1b2-a0c7-4100-b51c-49d5cc39f05f.png`

function PokerHeroCard({
  title,
  onClick,
}: {
  title: string
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="leads-poker-hero">
      <div className="leads-poker-hero-media">
        <img src={LEADS_WORKSPACE_HERO} alt="" className="leads-poker-hero-image" />
      </div>
      <div className="leads-poker-hero-copy">
        <span className="leads-poker-hero-kicker">Рабочая область</span>
        <h2 className="leads-poker-hero-title">{title}</h2>
        <span className="leads-poker-hero-action">
          Перейти в рабочую область <ArrowRight className="size-4" />
        </span>
      </div>
    </button>
  )
}

/** Упрощённый вид «Мои лиды» для роли Менеджер */
function ManagerLeadsView() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { state } = useLeads()

  const myLeads = state.leadPool.filter((l) => l.managerId === currentUser?.id)
  const overdueCount = myLeads.filter((l) => l.taskOverdue).length
  const withTaskCount = myLeads.filter((l) => l.hasTask).length
  const newCount = myLeads.filter((l) => l.stageId === 'new' || l.stageId === 'contact').length

  const firstName = currentUser?.name?.split(' ')[0] ?? 'Менеджер'

  return (
    <div className="leads-page-root -m-6 min-h-[calc(100vh+3rem)] lg:-m-8 lg:min-h-[calc(100vh+4rem)]">
      <div className="leads-page-bg" aria-hidden />
      <div className="leads-page-ornament" aria-hidden />
      <div className="leads-page relative z-10 space-y-8 p-6 lg:p-8">
        <Header
          title="Мои лиды"
          breadcrumbs={[{ label: 'Обзор', href: '/dashboard' }, { label: 'Мои лиды' }]}
        />

        {/* Приветствие */}
        <div>
          <h2 className="text-2xl font-bold text-[#fcecc8]">Добро пожаловать, {firstName}!</h2>
          <p className="mt-1 text-sm text-[rgba(242,207,141,0.55)]">{currentUser?.companyName} · Менеджер</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[rgba(242,207,141,0.18)] bg-[rgba(18,45,36,0.65)] px-4 py-4">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="size-4 text-[rgba(242,207,141,0.55)]" />
              <span className="text-xs text-[rgba(242,207,141,0.55)] uppercase tracking-wide">Всего</span>
            </div>
            <p className="text-2xl font-bold text-[#fcecc8]">{myLeads.length}</p>
            <p className="text-xs text-[rgba(242,207,141,0.4)] mt-0.5">назначено на меня</p>
          </div>

          <div className="rounded-xl border border-[rgba(242,207,141,0.18)] bg-[rgba(18,45,36,0.65)] px-4 py-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="size-4 text-[rgba(242,207,141,0.55)]" />
              <span className="text-xs text-[rgba(242,207,141,0.55)] uppercase tracking-wide">Новые</span>
            </div>
            <p className="text-2xl font-bold text-[#fcecc8]">{newCount}</p>
            <p className="text-xs text-[rgba(242,207,141,0.4)] mt-0.5">требуют обработки</p>
          </div>

          <div className="rounded-xl border border-[rgba(242,207,141,0.18)] bg-[rgba(18,45,36,0.65)] px-4 py-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="size-4 text-[rgba(242,207,141,0.55)]" />
              <span className="text-xs text-[rgba(242,207,141,0.55)] uppercase tracking-wide">С задачами</span>
            </div>
            <p className="text-2xl font-bold text-[#fcecc8]">{withTaskCount}</p>
            <p className="text-xs text-[rgba(242,207,141,0.4)] mt-0.5">есть активные задачи</p>
          </div>

          <div className={`rounded-xl border px-4 py-4 ${overdueCount > 0 ? 'border-[rgba(239,68,68,0.35)] bg-[rgba(60,15,15,0.55)]' : 'border-[rgba(242,207,141,0.18)] bg-[rgba(18,45,36,0.65)]'}`}>
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className={`size-4 ${overdueCount > 0 ? 'text-[rgba(239,68,68,0.8)]' : 'text-[rgba(242,207,141,0.55)]'}`} />
              <span className="text-xs text-[rgba(242,207,141,0.55)] uppercase tracking-wide">Просроченные</span>
            </div>
            <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-400' : 'text-[#fcecc8]'}`}>{overdueCount}</p>
            <p className="text-xs text-[rgba(242,207,141,0.4)] mt-0.5">задачи с просрочкой</p>
          </div>
        </div>

        <PokerHeroCard
          title="Открыть рабочую область"
          onClick={() => navigate('/dashboard/leads/poker')}
        />
      </div>
    </div>
  )
}

export function LeadsAdminPage() {
  const navigate = useNavigate()
  const { isManager, isMarketer, isRopOrAbove, canViewLeadAnalytics } = useRolePermissions()

  // Менеджер видит только свой упрощённый вид
  if (isManager) {
    return <ManagerLeadsView />
  }

  // Маркетолог видит только аналитику лидов
  if (isMarketer) {
    return (
      <div className="leads-page-root -m-6 min-h-[calc(100vh+3rem)] lg:-m-8 lg:min-h-[calc(100vh+4rem)]">
        <div className="leads-page-bg" aria-hidden />
        <div className="leads-page-ornament" aria-hidden />
        <div className="leads-page relative z-10 space-y-8 p-6 lg:p-8">
          <Header title="Кабинет маркетолога" breadcrumbs={[{ label: 'Обзор', href: '/dashboard' }, { label: 'Кабинет маркетолога' }]} />
          <LeadAnalyticsTab />
        </div>
      </div>
    )
  }

  // Если нет никакой роли — страница недоступна (фолбэк)
  if (!isRopOrAbove) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <div className="flex max-w-sm flex-col items-center gap-5 rounded-2xl border border-slate-200 bg-white px-10 py-12 text-center shadow-sm">
          <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <ShieldX className="size-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-900">Нет доступа</h2>
            <p className="text-sm text-slate-600">
              У вас нет прав для просмотра раздела «Контроль лидов».
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="default" className="rounded-full px-6">
            На главную
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="leads-page-root -m-6 min-h-[calc(100vh+3rem)] lg:-m-8 lg:min-h-[calc(100vh+4rem)]">
      <div className="leads-page-bg" aria-hidden />
      <div className="leads-page-ornament" aria-hidden />
      <div className="leads-page relative z-10 space-y-8 p-6 lg:p-8">
        <Header
          title="Контроль лидов"
          breadcrumbs={[{ label: 'Обзор', href: '/dashboard' }, { label: 'Контроль лидов' }]}
        />
        <PokerHeroCard
          title="Открыть рабочую область"
          onClick={() => navigate('/dashboard/leads/poker')}
        />

        {canViewLeadAnalytics && (
          <section className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgba(242,207,141,0.5)]">Аналитика</p>
              <h2 className="mt-2 text-2xl font-bold text-[#fcecc8]">Кабинет маркетолога</h2>
            </div>
            <LeadAnalyticsTab />
          </section>
        )}
      </div>
    </div>
  )
}
