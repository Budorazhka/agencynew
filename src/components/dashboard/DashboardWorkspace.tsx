import { useMemo, useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Check,
  CheckCircle,
  Clock,
  Flame,
  Info,
  ListTodo,
  Plus,
  Target,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useLeads } from '@/context/LeadsContext'
import { cn } from '@/lib/utils'
import { useNewsFeed } from '@/context/NewsFeedContext'
import { TASKS_MOCK } from '@/data/tasks-mock'
import { REMINDERS_MOCK } from '@/data/info-mock'
import {
  DASHBOARD_NOTIFICATIONS_PREVIEW,
  HOME_PROGRESS_MOCK,
  HOME_STREAK_MOCK,
} from '@/data/home-workspace-mock'
import { INITIAL_LEAD_MANAGERS } from '@/data/leads-mock'
import { MiniCalendar } from '@/components/dashboard/MiniCalendar'
import { WorkspaceDayEventsMenu } from '@/components/dashboard/WorkspaceDayEventsMenu'
import { PRIORITY_LABELS, STATUS_LABELS, type Task } from '@/types/tasks'
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, type Lead, type LeadSource } from '@/types/leads'
import { buildDeskBootstrapSeen, useDeskSeenState } from '@/hooks/useDeskSeenState'

/* ── constants ── */

const SOURCE_LABELS: Record<LeadSource, string> = {
  primary: 'Первичка',
  secondary: 'Вторичка',
  rent: 'Аренда',
  ad_campaigns: 'Реклама',
}

const DESK_PREVIEW = 6
const TASKS_PREVIEW = 12
const LEADS_PREVIEW = 12
const NOTIFS_PREVIEW = 8
const FEED_ITEM_HEIGHT_CLASS = 'h-[76px]'

const DAY_STATUS_LABEL = {
  done: 'Выполнено',
  on_track: 'В плане',
  at_risk: 'В зоне риска',
} as const

/* ── reusable primitives ── */

function HubWidgetShell({
  children,
  className,
  accent,
}: {
  children: React.ReactNode
  className?: string
  /** Thin top-border accent color */
  accent?: string
}) {
  return (
    <div
      className={cn(
        'flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg',
        'bg-[var(--workspace-card-bg)] backdrop-blur-xl',
        'shadow-[inset_0_0_0_1px_var(--workspace-card-ring)]',
        'transition-[background,box-shadow] duration-200',
        'hover:bg-[var(--workspace-card-hover)] hover:shadow-[inset_0_0_0_1px_var(--workspace-card-ring-hover)]',
        className,
      )}
      style={accent ? { borderTop: `2px solid ${accent}` } : undefined}
    >
      {children}
    </div>
  )
}

function WidgetHeader({
  icon,
  title,
  right,
  accentColor,
}: {
  icon: React.ReactNode
  title: string
  right?: React.ReactNode
  accentColor?: string
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[color:var(--workspace-row-border)] px-3 py-1.5">
      <div className="flex min-w-0 items-center gap-1.5">
        <div
          className="flex size-6 shrink-0 items-center justify-center rounded-md"
          style={{
            background: accentColor ? `${accentColor}18` : 'var(--workspace-widget-icon-bg)',
            color: accentColor ?? 'var(--workspace-widget-icon-fg)',
          }}
        >
          {icon}
        </div>
        <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[color:var(--workspace-widget-title)]">
          {title}
        </h3>
      </div>
      {right != null && <div className="shrink-0">{right}</div>}
    </div>
  )
}

function TabBtn({
  active,
  onClick,
  children,
  badge,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  badge?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors',
        active
          ? 'bg-[rgba(230,195,100,0.18)] text-[color:var(--workspace-text)]'
          : 'text-[color:var(--workspace-text-muted)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[color:var(--workspace-text)]',
      )}
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="flex size-4 items-center justify-center rounded-full bg-[#e11d48] text-[8px] font-bold leading-none text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  )
}

/* ── helpers ── */

function notifIcon(type: 'alert' | 'success' | 'info' | 'auto') {
  const s = 'size-3.5 shrink-0'
  switch (type) {
    case 'alert':   return <AlertTriangle className={cn(s, 'text-red-400')} />
    case 'success': return <CheckCircle className={cn(s, 'text-emerald-400')} />
    case 'info':    return <Info className={cn(s, 'text-blue-400')} />
    case 'auto':    return <Zap className={cn(s, 'text-amber-400')} />
    default:        return <Info className={cn(s, 'text-[color:var(--workspace-text-dim)]')} />
  }
}

function formatReminderDue(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function isTaskOverdue(t: Task, todayIso: string): boolean {
  if (t.status === 'done') return false
  if (t.status === 'overdue') return true
  return t.dueDate < todayIso
}

function leadUrgency(lead: Lead): string {
  if (lead.taskOverdue) return 'Высокая'
  if (lead.hasTask) return 'Средняя'
  return 'Обычная'
}

function managerName(managerId: string | null): string {
  if (!managerId) return 'Не назначен'
  return INITIAL_LEAD_MANAGERS.find((m) => m.id === managerId)?.name ?? managerId
}

function workspaceCalDateInitial() {
  const t = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`
}

/* ── mini progress bar ── */
function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */

export function DashboardWorkspace() {
  const { currentUser } = useAuth()
  const { state } = useLeads()
  const { allArticles } = useNewsFeed()

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [workspaceCalDate, setWorkspaceCalDate] = useState(() => workspaceCalDateInitial())
  const isManager = currentUser?.role === 'manager'
  const managerId = isManager ? currentUser?.id ?? null : null

  /* ── data prep ── */

  const pool = useMemo(() => {
    return managerId ? state.leadPool.filter((l) => l.managerId === managerId) : state.leadPool
  }, [managerId, state.leadPool])

  const newLeads = useMemo(() => {
    return [...pool]
      .filter((l) => l.stageId === 'new')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
  }, [pool])

  const mineTask = useCallback(
    (t: Task) => t.status !== 'done' && (!currentUser?.id || t.assignedToId === currentUser.id),
    [currentUser?.id],
  )

  const attentionTasks = useMemo(() => {
    const list = TASKS_MOCK.filter(mineTask).filter(
      (t) => isTaskOverdue(t, todayIso) || t.dueDate === todayIso,
    )
    list.sort((a, b) => {
      const ao = isTaskOverdue(a, todayIso) ? 0 : 1
      const bo = isTaskOverdue(b, todayIso) ? 0 : 1
      if (ao !== bo) return ao - bo
      return a.dueDate.localeCompare(b.dueDate)
    })
    return list
  }, [mineTask, todayIso])

  const attentionTaskIds = useMemo(() => attentionTasks.map((t) => t.id), [attentionTasks])

  const newsSorted = useMemo(
    () => [...allArticles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
    [allArticles],
  )
  const newsIdsOrdered = useMemo(() => newsSorted.map((a) => a.id), [newsSorted])

  const undoneReminderIds = useMemo(() => REMINDERS_MOCK.filter((r) => !r.done).map((r) => r.id), [])
  const notifIds = useMemo(() => DASHBOARD_NOTIFICATIONS_PREVIEW.map((n) => n.id), [])

  const bootstrapSeen = useMemo(
    () =>
      buildDeskBootstrapSeen({
        leadIdsNewestFirst: newLeads.map((l) => l.id),
        taskAttentionIdsOrdered: attentionTaskIds,
        notifIds,
        reminderIds: undoneReminderIds,
        newsIdsNewestFirst: newsIdsOrdered,
      }),
    [newLeads, attentionTaskIds, notifIds, undoneReminderIds, newsIdsOrdered],
  )

  const { markSeen, unread } = useDeskSeenState(bootstrapSeen)

  useEffect(() => {
    markSeen('tasks', attentionTaskIds)
    markSeen('notifs', notifIds)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markSeen])

  /* ── UI state ── */

  const [mainTab, setMainTab] = useState<'tasks' | 'leads'>('tasks')
  const [taskMode, setTaskMode] = useState<'all' | 'today' | 'overdue'>('today')
  const [infoTab, setInfoTab] = useState<'notifs' | 'reminders' | 'news'>('notifs')

  const openMainTab = (tab: 'tasks' | 'leads') => {
    setMainTab(tab)
    if (tab === 'tasks') markSeen('tasks', attentionTaskIds)
    else markSeen('leads', newLeads.map((l) => l.id))
  }

  const openInfoTab = (tab: typeof infoTab) => {
    setInfoTab(tab)
    if (tab === 'notifs') markSeen('notifs', notifIds)
    if (tab === 'reminders') markSeen('reminders', undoneReminderIds)
    if (tab === 'news') markSeen('news', newsIdsOrdered)
  }

  const filteredTasks = useMemo(() => {
    const base = TASKS_MOCK.filter(mineTask)
    if (taskMode === 'today') return base.filter((t) => t.dueDate === todayIso && t.status !== 'done')
    if (taskMode === 'overdue') return base.filter((t) => isTaskOverdue(t, todayIso))
    return base.filter((t) => t.status !== 'done')
  }, [mineTask, taskMode, todayIso])

  filteredTasks.sort((a, b) => {
    const da = `${a.dueDate}T${a.dueTime ?? '00:00'}`
    const db = `${b.dueDate}T${b.dueTime ?? '00:00'}`
    return da.localeCompare(db)
  })

  /* ── badges ── */
  const leadTabIds = useMemo(() => newLeads.map((l) => l.id), [newLeads])
  const badgeLeads = mainTab === 'tasks' ? unread.leads(leadTabIds) : 0
  const badgeTasks = mainTab === 'leads' ? unread.tasks(attentionTaskIds) : 0

  const remindersPreview = useMemo(() => REMINDERS_MOCK.filter((r) => !r.done).slice(0, DESK_PREVIEW), [])
  const newsPreview = useMemo(() => newsSorted.slice(0, DESK_PREVIEW), [newsSorted])

  const badgeNotifs = infoTab !== 'notifs' ? unread.notifs(notifIds) : 0
  const badgeReminders = infoTab !== 'reminders' ? unread.reminders(undoneReminderIds) : 0
  const badgeNews = infoTab !== 'news' ? unread.news(newsIdsOrdered) : 0

  /* ── progress ── */
  const progress = HOME_PROGRESS_MOCK
  const streak = HOME_STREAK_MOCK
  const xpPct = streak.xpToday.goal > 0 ? Math.min(100, Math.round((streak.xpToday.current / streak.xpToday.goal) * 100)) : 0
  const dayPlanGapPct = Math.max(0, 100 - progress.dayPlanPercent)
  const focusKpi = useMemo(() => {
    if (!progress.activityKpis.length) return null
    return progress.activityKpis.reduce((worst, kpi) => {
      const worstRatio = worst.plan > 0 ? worst.current / worst.plan : 1
      const ratio = kpi.plan > 0 ? kpi.current / kpi.plan : 1
      return ratio < worstRatio ? kpi : worst
    })
  }, [progress.activityKpis])
  const focusGap = focusKpi ? Math.max(0, focusKpi.plan - focusKpi.current) : 0

  /* ═══════════════════ RENDER ═══════════════════ */

  /*
   * Layout: full-height left tasks, center calendar/plans, full-height right feed.
   * Everything fits in one viewport — no page-level scroll.
   *
   * ┌─────────────┬───────────────────┬──────────────┐
   * │ Tasks/Leads │     Calendar      │     Feed     │
   * │   (full)    ├───────────────────┤   (full)     │
   * │             │ Plans/Efficiency  │              │
   * └─────────────┴───────────────────┴──────────────┘
   */

  return (
    <div className="grid h-full min-h-0 w-full min-w-0 grid-cols-1 gap-1.5 lg:grid-cols-[minmax(300px,1.25fr)_minmax(0,1.55fr)_minmax(300px,1.35fr)] lg:grid-rows-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-1.5 lg:overflow-hidden">

      {/* ╔══════════════════════════════════════════╗
         ║  1. ЗАДАЧИ / НОВЫЕ ЛИДЫ  (top-left)     ║
         ╚══════════════════════════════════════════╝ */}
      <HubWidgetShell accent="rgba(230,195,100,0.6)" className="lg:row-span-2">
        <WidgetHeader
          icon={<ListTodo className="size-3.5" strokeWidth={2} />}
          title="Задачи / Лиды"
          accentColor="#e6c364"
          right={
            <div className="flex gap-0.5 rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-0.5">
              <TabBtn active={mainTab === 'tasks'} badge={badgeTasks} onClick={() => openMainTab('tasks')}>
                Задачи
              </TabBtn>
              <TabBtn active={mainTab === 'leads'} badge={badgeLeads} onClick={() => openMainTab('leads')}>
                Лиды
              </TabBtn>
            </div>
          }
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2.5 py-1">
          {mainTab === 'tasks' ? (
            <>
              <div className="mb-0.5 flex items-center gap-0.5">
                {([
                  { id: 'all' as const, label: 'Все' },
                  { id: 'today' as const, label: 'Сегодня' },
                  { id: 'overdue' as const, label: 'Просроч.' },
                ] as const).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setTaskMode(m.id)}
                    className={cn(
                      'rounded px-1 py-px text-[10px] font-semibold uppercase tracking-wide transition-colors',
                      taskMode === m.id
                        ? 'bg-[rgba(230,195,100,0.2)] text-[color:var(--workspace-text)]'
                        : 'text-[color:var(--workspace-text-muted)] hover:text-[color:var(--workspace-text)]',
                    )}
                  >
                    {m.label}
                  </button>
                ))}
                <Link
                  to="/dashboard/tasks"
                  className="ml-auto flex items-center gap-0.5 text-[11px] font-bold uppercase tracking-wider text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
                >
                  <Plus className="size-3" strokeWidth={2.5} />
                  В задачи
                </Link>
              </div>

              {filteredTasks.length === 0 ? (
                <p className="py-1 text-center text-[11px] text-[color:var(--workspace-text-dim)]">Нет задач</p>
              ) : (
                <ul className="min-h-0 flex-1 space-y-0.5 overflow-hidden">
                  {filteredTasks.slice(0, TASKS_PREVIEW).map((t) => {
                    const overdue = isTaskOverdue(t, todayIso)
                    return (
                      <li
                        key={t.id}
                        className={cn(
                          'rounded-md border px-2 py-1',
                          overdue
                            ? 'border-red-500/25 bg-red-500/[0.06]'
                            : 'border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)]',
                        )}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="line-clamp-1 text-[12px] font-medium leading-snug text-[color:var(--workspace-text)]">
                            {t.title}
                          </p>
                          <span className={cn(
                            'shrink-0 rounded px-1 py-px text-[9px] font-bold uppercase',
                            t.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                            t.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-[rgba(255,255,255,0.06)] text-[color:var(--workspace-text-dim)]',
                          )}>
                            {PRIORITY_LABELS[t.priority]}
                          </span>
                        </div>
                        <div className="mt-px flex flex-wrap items-center gap-x-1 text-[9px] text-[color:var(--workspace-text-dim)]">
                          <span className={cn(overdue && 'font-bold text-red-400')}>
                            {STATUS_LABELS[t.status]}
                          </span>
                          <span className="opacity-40">·</span>
                          <span>{t.dueDate}{t.dueTime ? ` ${t.dueTime}` : ''}</span>
                          {t.entityLabel && (
                            <>
                              <span className="opacity-40">·</span>
                              <span className="truncate text-[color:var(--theme-accent-link-dim)]">{t.entityLabel}</span>
                            </>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
              {filteredTasks.length > TASKS_PREVIEW && (
                <p className="mt-0.5 shrink-0 text-[10px] text-[color:var(--workspace-text-dim)]">
                  +ещё {filteredTasks.length - TASKS_PREVIEW} →{' '}
                  <Link to="/dashboard/tasks" className="font-semibold text-[color:var(--theme-accent-link-dim)] hover:underline">перейти в задачи</Link>
                </p>
              )}
            </>
          ) : (
            <>
              <div className="mb-0.5 flex items-center justify-between">
                <p className="text-[10px] text-[color:var(--workspace-text-muted)]">Очередь «Новый лид»</p>
                <Link
                  to="/dashboard/leads-hub"
                  className="flex items-center gap-0.5 text-[11px] font-bold uppercase tracking-wider text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
                >
                  <Plus className="size-3" strokeWidth={2.5} />
                  В лиды
                </Link>
              </div>
              {newLeads.length === 0 ? (
                <p className="py-1 text-center text-[11px] text-[color:var(--workspace-text-dim)]">Нет новых лидов</p>
              ) : (
                <ul className="min-h-0 flex-1 space-y-0.5 overflow-hidden">
                  {newLeads.slice(0, LEADS_PREVIEW).map((l) => {
                    const st = l.status ?? 'new'
                    return (
                      <li
                        key={l.id}
                        className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-1"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="line-clamp-1 text-[12px] font-medium text-[color:var(--workspace-text)]">
                            {l.name ?? l.id}
                          </p>
                          <span className="shrink-0 rounded px-1 py-px text-[9px] font-bold uppercase text-amber-400/90">
                            {leadUrgency(l)}
                          </span>
                        </div>
                        <div className="mt-px flex flex-wrap items-center gap-x-1 text-[9px] text-[color:var(--workspace-text-dim)]">
                          <span>{SOURCE_LABELS[l.source]}</span>
                          <span className="opacity-40">·</span>
                          <span>
                            {new Date(l.createdAt).toLocaleString('ru-RU', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                          <span className="opacity-40">·</span>
                          <span className="font-semibold" style={{ color: LEAD_STATUS_COLORS[st] }}>
                            {LEAD_STATUS_LABELS[st]}
                          </span>
                        </div>
                        <div className="mt-px text-[9px] text-[color:var(--workspace-text-muted)]">
                          Отв.: {managerName(l.managerId)}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
              {newLeads.length > LEADS_PREVIEW && (
                <p className="mt-0.5 shrink-0 text-[10px] text-[color:var(--workspace-text-dim)]">
                  +ещё {newLeads.length - LEADS_PREVIEW} в очереди
                </p>
              )}
            </>
          )}
        </div>
      </HubWidgetShell>

      {/* ╔══════════════════════════════════════════╗
         ║  2. КАЛЕНДАРЬ  (top-right, large)        ║
         ╚══════════════════════════════════════════╝ */}
      <HubWidgetShell accent="rgba(96,165,250,0.6)">
        <WidgetHeader
          icon={<CalendarDays className="size-3.5" strokeWidth={2} />}
          title="Календарь"
          accentColor="#60a5fa"
          right={
            <Link
              to="/dashboard/calendar"
              className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
            >
              Полный календарь →
            </Link>
          }
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-1.5">
          {/* calendar grid — fills entire widget */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)]/50 p-1.5">
            <MiniCalendar
              variant="workspace"
              hideFooterLink
              hideDayPanel
              selectedDate={workspaceCalDate}
              onSelectedDateChange={setWorkspaceCalDate}
            />
          </div>
          {/* bottom bar: events button + legend */}
          <div className="mt-1 flex shrink-0 items-center gap-2">
            <WorkspaceDayEventsMenu className="min-w-0 flex-1" dateIso={workspaceCalDate} />
            <div className="flex shrink-0 items-center gap-2.5 text-[10px] text-[color:var(--workspace-text-muted)]">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-blue-400" />Показ</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[color:var(--workspace-cal-meeting-dot)]" />Встреча</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-violet-400" />Звонок</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-400" />Подпис.</span>
            </div>
          </div>
        </div>
      </HubWidgetShell>

      {/* ╔══════════════════════════════════════════╗
         ║  3. УВЕДОМЛЕНИЯ / НАПОМИНАНИЯ / НОВОСТИ  ║
         ╚══════════════════════════════════════════╝ */}
      <HubWidgetShell accent="rgba(52,211,153,0.5)" className="lg:col-start-3 lg:row-span-2 lg:row-start-1">
        <WidgetHeader
          icon={<Bell className="size-3.5" strokeWidth={2} />}
          title="Лента"
          accentColor="#34d399"
          right={
            <div className="flex gap-0.5 rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-0.5">
              <TabBtn active={infoTab === 'notifs'} badge={badgeNotifs} onClick={() => openInfoTab('notifs')}>
                Уведомл.
              </TabBtn>
              <TabBtn active={infoTab === 'reminders'} badge={badgeReminders} onClick={() => openInfoTab('reminders')}>
                Напомин.
              </TabBtn>
              <TabBtn active={infoTab === 'news'} badge={badgeNews} onClick={() => openInfoTab('news')}>
                Новости
              </TabBtn>
            </div>
          }
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2.5 py-1">
          {infoTab === 'notifs' && (
            <>
              <Link
                to="/dashboard/info"
                className="mb-0.5 shrink-0 self-start text-[10px] font-bold uppercase tracking-wider text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
              >
                Все уведомления →
              </Link>
              <ul className="min-h-0 flex-1 space-y-0.5 overflow-hidden">
                {DASHBOARD_NOTIFICATIONS_PREVIEW.slice(0, NOTIFS_PREVIEW).map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      'flex gap-1.5 overflow-hidden rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-1',
                      FEED_ITEM_HEIGHT_CLASS,
                    )}
                  >
                    {notifIcon(n.type)}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <p className="line-clamp-1 text-[11px] font-medium leading-snug text-[color:var(--workspace-text)]">
                        {n.title}
                      </p>
                      <p className="line-clamp-1 text-[11px] leading-snug text-[color:var(--workspace-text-muted)]">
                        {n.body}
                      </p>
                      <p className="text-[10px] text-[color:var(--workspace-text-dim)]">{n.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {infoTab === 'reminders' && (
            <>
              <Link
                to="/dashboard/info/reminders"
                className="mb-0.5 shrink-0 self-start text-[10px] font-bold uppercase tracking-wider text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
              >
                Все напоминания →
              </Link>
              <ul className="min-h-0 flex-1 space-y-0.5 overflow-hidden">
                {remindersPreview.map((r) => (
                  <li
                    key={r.id}
                    className={cn(
                      'flex items-start gap-1.5 overflow-hidden rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-1',
                      FEED_ITEM_HEIGHT_CLASS,
                    )}
                  >
                    <Clock className="mt-0.5 size-3.5 shrink-0 text-[color:var(--theme-accent-link-dim)]" />
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <p className="line-clamp-1 text-[11px] font-medium leading-snug text-[color:var(--workspace-text)]">
                        {r.title}
                      </p>
                      <p className="flex items-center gap-0.5 text-[10px] text-[color:var(--theme-accent-link-dim)]">
                        {formatReminderDue(r.dueAt)}
                        {r.entityLabel && <span className="text-[color:var(--workspace-text-dim)]"> · {r.entityLabel}</span>}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {infoTab === 'news' && (
            <>
              <Link
                to="/dashboard/info/news"
                className="mb-0.5 shrink-0 self-start text-[10px] font-bold uppercase tracking-wider text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
              >
                Все новости →
              </Link>
              <ul className="min-h-0 flex-1 space-y-0.5 overflow-hidden">
                {newsPreview.map((a) => (
                  <li
                    key={a.id}
                    className={cn(
                      'flex flex-col justify-between overflow-hidden rounded-md border-l-2 border-[rgba(230,195,100,0.3)] bg-[var(--workspace-row-bg)] px-2 py-1',
                      FEED_ITEM_HEIGHT_CLASS,
                    )}
                  >
                    <p className="line-clamp-1 text-[11px] font-medium leading-snug text-[color:var(--workspace-text)]">
                      {a.emoji} {a.title}
                    </p>
                    <p className="text-[10px] text-[color:var(--workspace-text-dim)]">
                      {new Date(a.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} · {a.author}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </HubWidgetShell>

      {/* ╔══════════════════════════════════════════╗
         ║  4. ПЛАНЫ + STREAK + GAMIFICATION        ║
         ╚══════════════════════════════════════════╝ */}
      <HubWidgetShell accent="rgba(251,146,60,0.6)" className="lg:col-start-2 lg:row-start-2">
        <WidgetHeader
          icon={<Target className="size-3.5" strokeWidth={2} />}
          title="Планы и эффективность"
          accentColor="#fb923c"
          right={
            <Link
              to="/dashboard/my-report"
              className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
            >
              Отчёт →
            </Link>
          }
        />

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-3 py-2">
          <div className="grid shrink-0 grid-cols-1 gap-2 lg:grid-cols-2">
            <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2.5">
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-[color:var(--workspace-text-dim)]">
                <span>План дня</span>
                <span className="flex items-center gap-1 tabular-nums">
                  <span className="text-[14px] leading-none text-[color:var(--workspace-text)]">{progress.dayPlanPercent}%</span>
                  <span className={cn(
                    'rounded px-1.5 py-px text-[8px]',
                    progress.dayPlanStatus === 'done' ? 'bg-emerald-500/20 text-emerald-300' :
                    progress.dayPlanStatus === 'at_risk' ? 'bg-red-500/20 text-red-300' :
                    'bg-blue-500/20 text-blue-300',
                  )}>
                    {DAY_STATUS_LABEL[progress.dayPlanStatus]}
                  </span>
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, progress.dayPlanPercent)}%`, background: 'linear-gradient(90deg, #e6c364, #c9a84c)' }} />
              </div>
            </div>

            <div className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2.5">
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-[color:var(--workspace-text-dim)]">
                <span>План недели</span>
                <span className="text-[14px] leading-none tabular-nums text-[color:var(--workspace-text)]">{progress.weekPlanPercent}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, progress.weekPlanPercent)}%`, background: 'linear-gradient(90deg, #60a5fa, #3b82f6)' }} />
              </div>
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-1 gap-2 lg:grid-cols-3">
            {[
              { label: 'Выручка', value: progress.revenue.currentLabel, sub: `/ ${progress.revenue.planLabel}`, pct: progress.revenue.percent, color: '#e6c364' },
              { label: 'Воронка', value: `${progress.funnelProgress.percent}%`, sub: '', pct: progress.funnelProgress.percent, color: '#34d399' },
              { label: 'Лиды', value: `${progress.leadsToday.count}`, sub: `/ ${progress.leadsToday.plan}`, pct: progress.leadsToday.plan > 0 ? (progress.leadsToday.count / progress.leadsToday.plan) * 100 : 0, color: '#60a5fa' },
            ].map((m) => (
              <div key={m.label} className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--workspace-text-dim)]">{m.label}</p>
                <p className="mb-1 text-[24px] font-bold leading-none text-[color:var(--workspace-text)]">
                  {m.value}
                  {m.sub && <span className="text-[10px] font-normal text-[color:var(--workspace-text-muted)]"> {m.sub}</span>}
                </p>
                <MiniBar pct={m.pct} color={m.color} />
              </div>
            ))}
          </div>

          <div className="min-h-0 flex-1 rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)]/65 px-3 py-2">
            <div className="flex h-full min-h-0 flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--workspace-text-dim)]">
                  Фокус дня
                </p>
                <span className={cn(
                  'rounded px-1.5 py-px text-[8px] font-bold uppercase',
                  dayPlanGapPct > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300',
                )}>
                  {dayPlanGapPct > 0 ? `-${dayPlanGapPct}% к плану` : 'План закрыт'}
                </span>
              </div>

              {focusKpi ? (
                <p className="text-[12px] text-[color:var(--workspace-text)]">
                  Узкое место: <span className="font-semibold">{focusKpi.label}</span> ({focusKpi.current}/{focusKpi.plan})
                </p>
              ) : (
                <p className="text-[12px] text-[color:var(--workspace-text)]">
                  Все нормативы в норме.
                </p>
              )}

              <div className="mt-auto flex items-center justify-between gap-2">
                <p className="text-[10px] text-[color:var(--workspace-text-muted)]">
                  Следующий шаг: {focusGap > 0 ? `закрыть +${focusGap} по фокусу` : 'удержать текущий темп'}
                </p>
                <Link
                  to={focusGap > 0 ? '/dashboard/tasks' : '/dashboard/my-report'}
                  className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
                >
                  {focusGap > 0 ? 'Открыть задачи →' : 'К отчёту →'}
                </Link>
              </div>
            </div>
          </div>

          <div className="h-[104px] shrink-0 rounded-lg border border-orange-400/25 bg-gradient-to-r from-[#f97316]/[0.12] via-[#f97316]/[0.06] to-transparent px-3 py-1.5">
            <div className="flex h-full min-h-0 flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#fb923c] to-[#ea580c] shadow-md shadow-orange-900/30">
                  <Flame className="size-5 text-white" strokeWidth={2.2} fill="rgba(255,255,255,0.25)" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[22px] font-black tabular-nums leading-none text-[#fff7ed]">{streak.currentStreak}</span>
                    <span className="text-[11px] font-bold uppercase text-orange-200/80">дн. подряд</span>
                  </div>
                  <p className="text-[9px] text-orange-100/55">
                    рекорд: <span className="font-semibold text-orange-100">{streak.bestStreak}</span> дней
                  </p>
                </div>

                <div className="ml-auto flex shrink-0 gap-1">
                  {streak.slots.map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <div
                        className={cn(
                          'flex size-6 items-center justify-center rounded-full border-2 text-[8px] font-bold transition-colors',
                          s.active
                            ? 'border-[#fbbf24] bg-gradient-to-b from-[#fbbf24] to-[#f59e0b] text-[#422006] shadow shadow-amber-500/30'
                            : s.isToday
                              ? 'border-dashed border-[#fdba74] bg-[#f97316]/15'
                              : 'border-orange-200/20 bg-black/10 text-orange-100/40',
                        )}
                      >
                        {s.active ? <Check className="size-3.5" strokeWidth={3} /> : s.weekday[0].toUpperCase()}
                      </div>
                      <span className="text-[7px] font-semibold uppercase text-orange-100/50">{s.weekday}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto">
                <div className="mb-0.5 flex items-center justify-between text-[10px] font-bold uppercase text-orange-100/80">
                  <span>Цель дня</span>
                  <span className="text-[14px] leading-none tabular-nums">{streak.xpToday.current} / {streak.xpToday.goal}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/25">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#fde047] via-[#facc15] to-[#eab308] transition-all"
                    style={{ width: `${xpPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </HubWidgetShell>
    </div>
  )
}
