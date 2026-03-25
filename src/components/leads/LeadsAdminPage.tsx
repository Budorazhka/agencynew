import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldX, ArrowRight, Layers, AlertCircle, CheckCircle2, Clock, UserCheck, RefreshCw } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import './leads-secret-table.css'
import { Button } from '@/components/ui/button'
import { LeadAnalyticsTab } from './LeadAnalyticsTab'
import { useRolePermissions } from '@/hooks/useRolePermissions'
import { useAuth } from '@/context/AuthContext'
import { useLeads } from '@/context/LeadsContext'
import { INITIAL_LEAD_MANAGERS } from '@/data/leads-mock'
import { SlaTimer, getSlaLevel } from './SlaTimer'
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, type LeadStatus } from '@/types/leads'

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
    <div className="leads-page-root min-h-screen">
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

        {/* SLA — новые лиды без первого контакта */}
        {(() => {
          const newLeads = myLeads
            .filter(l => l.stageId === 'new' || l.stageId === 'contact')
            .slice(0, 8)
          if (newLeads.length === 0) return null
          return (
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgba(242,207,141,0.5)] mb-3">SLA — Первый контакт</p>
              <div className="flex flex-col gap-2">
                {newLeads.map(lead => {
                  const level = getSlaLevel(lead.createdAt)
                  const borderColor = level === 'ok' ? 'rgba(74,222,128,0.25)' : level === 'warning' ? 'rgba(251,146,60,0.35)' : 'rgba(239,68,68,0.35)'
                  return (
                    <div key={lead.id} className="rounded-xl border px-4 py-3 flex items-center justify-between gap-4"
                      style={{ borderColor, background: 'rgba(18,45,36,0.55)' }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-8 rounded-full bg-[rgba(242,207,141,0.1)] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[rgba(242,207,141,0.7)]">{(lead.name ?? '?')[0]}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#fcecc8] truncate">{lead.name ?? `Лид #${lead.id}`}</div>
                          <div className="text-xs text-[rgba(242,207,141,0.45)] capitalize">{lead.channel ?? 'Канал неизвестен'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <SlaTimer createdAt={lead.createdAt} />
                        <button
                          className="text-xs font-semibold px-3 py-1 rounded-lg border border-[rgba(242,207,141,0.3)] text-[rgba(242,207,141,0.8)] hover:bg-[rgba(242,207,141,0.08)] transition-colors"
                          onClick={() => navigate('/dashboard/leads/poker')}
                        >
                          Взять
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })()}

        {/* Статусы лидов менеджера */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgba(242,207,141,0.5)] mb-3">Мои лиды по статусу</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map(status => {
              const count = myLeads.filter(l => (l.status ?? 'in_progress') === status).length + (status === 'new' ? newCount : 0)
              return (
                <div key={status} className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(18,45,36,0.55)] px-3 py-3 text-center">
                  <div className="text-lg font-bold" style={{ color: LEAD_STATUS_COLORS[status] }}>{count}</div>
                  <div className="text-xs text-[rgba(255,255,255,0.4)] mt-0.5">{LEAD_STATUS_LABELS[status]}</div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

/** Панель Round-Robin для РОП/Директора */
function RoundRobinPanel() {
  const { state, dispatch } = useLeads()
  const [rrIndex, setRrIndex] = useState(0)

  const unassigned = state.leadPool.filter(l => l.stageId === 'new' && !l.managerId).slice(0, 6)
  const managers = INITIAL_LEAD_MANAGERS

  function assignNext() {
    if (unassigned.length === 0) return
    const lead = unassigned[0]
    const manager = managers[rrIndex % managers.length]
    dispatch({ type: 'ASSIGN_LEAD', leadId: lead.id, managerId: manager.id })
    setRrIndex(i => i + 1)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgba(242,207,141,0.5)]">Распределение Round-Robin</p>
        <span className="text-xs text-[rgba(242,207,141,0.35)]">Нераспределено: {unassigned.length}</span>
      </div>

      {/* Очередь менеджеров */}
      <div className="rounded-2xl border border-[rgba(242,207,141,0.15)] bg-[rgba(18,45,36,0.55)] overflow-hidden">
        <div className="grid grid-cols-4 gap-0 px-4 py-2 border-b border-[rgba(255,255,255,0.06)]">
          {['Менеджер', 'Очередь', 'Активных лидов', 'Источники'].map(h => (
            <span key={h} className="text-xs font-semibold uppercase tracking-widest text-[rgba(242,207,141,0.35)]">{h}</span>
          ))}
        </div>
        {managers.map((mgr, idx) => {
          const isNext = idx === rrIndex % managers.length
          const activeCnt = state.leadPool.filter(l => l.managerId === mgr.id).length
          return (
            <div key={mgr.id}
              className="grid grid-cols-4 gap-0 px-4 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0 items-center"
              style={{ background: isNext ? 'rgba(242,207,141,0.06)' : undefined }}>
              <div className="flex items-center gap-2">
                {isNext && <span className="size-1.5 rounded-full bg-[#f2cf8d] inline-block" />}
                <span className="text-sm text-[#fcecc8] font-medium">{mgr.name}</span>
              </div>
              <span className="text-sm font-bold" style={{ color: isNext ? '#f2cf8d' : 'rgba(255,255,255,0.4)' }}>
                #{(idx % managers.length) + 1}
              </span>
              <span className="text-sm text-[rgba(255,255,255,0.6)]">{activeCnt}</span>
              <span className="text-xs text-[rgba(255,255,255,0.35)]">{mgr.sourceTypes.join(', ')}</span>
            </div>
          )
        })}
      </div>

      {/* Нераспределённые лиды */}
      {unassigned.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(242,207,141,0.35)]">Ожидают распределения</p>
          {unassigned.map(lead => (
            <div key={lead.id} className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(18,45,36,0.5)] px-4 py-3">
              <div className="flex items-center gap-3">
                <UserCheck className="size-4 text-[rgba(242,207,141,0.4)]" />
                <div>
                  <span className="text-sm font-medium text-[#fcecc8]">{lead.name ?? `Лид #${lead.id}`}</span>
                  <span className="ml-2 text-xs text-[rgba(255,255,255,0.35)]">{lead.channel}</span>
                </div>
              </div>
              <SlaTimer createdAt={lead.createdAt} compact />
            </div>
          ))}
          <button
            onClick={assignNext}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[rgba(242,207,141,0.3)] bg-[rgba(242,207,141,0.08)] py-2.5 text-sm font-semibold text-[#f2cf8d] hover:bg-[rgba(242,207,141,0.14)] transition-colors"
          >
            <RefreshCw className="size-4" />
            Назначить следующему: {INITIAL_LEAD_MANAGERS[rrIndex % INITIAL_LEAD_MANAGERS.length].name}
          </button>
        </div>
      )}
    </section>
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
      <div className="leads-page-root min-h-screen">
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
    <div className="leads-page-root min-h-screen">
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

        <RoundRobinPanel />

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
