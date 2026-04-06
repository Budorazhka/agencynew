import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle,
  Clock,
  Eye,
  Flame,
  Info,
  ListTodo,
  Phone,
  Plus,
  Target,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  getVisibleDashboardRailItems,
  isDashboardPathAllowedForRole,
} from '@/config/dashboard-rail'
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
import {
  formatWorkspaceDayShort,
  WorkspaceDayEventsMenu,
  WorkspaceDayEventsPanel,
} from '@/components/dashboard/WorkspaceDayEventsMenu'
import { PRIORITY_LABELS, STATUS_LABELS, type Task } from '@/types/tasks'
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, type Lead, type LeadSource } from '@/types/leads'
import { buildDeskBootstrapSeen, useDeskSeenState } from '@/hooks/useDeskSeenState'

/* ── константы ── */

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
const FEED_TITLE_CLASS = 'line-clamp-1 text-[13px] font-medium leading-snug text-[color:var(--workspace-text)]'
const FEED_BODY_CLASS = 'line-clamp-1 text-[12px] leading-snug text-[color:var(--workspace-text)]'
const FEED_META_CLASS = 'text-[11px] text-[color:var(--workspace-text-muted)]'

const DAY_STATUS_LABEL = {
  done: 'Выполнено',
  on_track: 'В плане',
  at_risk: 'В зоне риска',
} as const

/* ── переиспользуемые блоки ── */

function HubWidgetShell({
  children,
  className,
  accent,
}: {
  children: React.ReactNode
  className?: string
  /** Цвет тонкой верхней обводки (акцент). */
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
  title?: string | null
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
        {title ? (
          <h3 className="line-clamp-2 text-[12px] font-bold leading-snug tracking-tight text-[color:var(--workspace-widget-title)] sm:text-[13px]">
            {title}
          </h3>
        ) : null}
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
  variant = 'default',
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  badge?: number
  variant?: 'default' | 'deskMain'
}) {
  const main = variant === 'deskMain'
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center gap-0.5 transition-colors',
        main
          ? 'rounded-lg px-2.5 py-1 text-[13px] font-extrabold tracking-tight sm:text-[14px]'
          : 'rounded-md px-1.5 py-0.5 text-[12px] font-bold uppercase tracking-wide',
        active
          ? main
            ? 'bg-[color-mix(in_srgb,var(--gold)_24%,transparent)] text-[color:var(--workspace-text)]'
            : 'bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] text-[color:var(--workspace-text)]'
          : main
            ? 'text-[color:var(--workspace-text-muted)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[color:var(--workspace-text)]'
            : 'text-[color:var(--workspace-text-muted)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[color:var(--workspace-text)]',
      )}
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="flex size-4 items-center justify-center rounded-full bg-[#e11d48] text-[9px] font-bold leading-none text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  )
}

function InfoTabBtn({
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
        'relative flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md border px-1 py-1.5 text-[11px] font-bold transition-colors sm:px-1.5 sm:text-[12px]',
        active
          ? 'border-[color:var(--workspace-row-border)] bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-[color:var(--workspace-text)] shadow-[inset_0_-2px_0_0_var(--gold)]'
          : 'border-transparent text-[color:var(--workspace-text-muted)] hover:border-[color:var(--workspace-row-border)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[color:var(--workspace-text)]',
      )}
    >
      <span className="min-w-0 truncate">{children}</span>
      {badge != null && badge > 0 && (
        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#e11d48] text-[9px] font-bold leading-none text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  )
}

/* ── вспомогательные функции ── */

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

/* ── мини-полоса прогресса ── */
function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   ГЛАВНЫЙ КОМПОНЕНТ
   ════════════════════════════════════════════════════════════════ */

export function DashboardWorkspace() {
  const { currentUser } = useAuth()
  const { state } = useLeads()
  const { allArticles } = useNewsFeed()

  const deskRole = currentUser?.role ?? 'manager'
  const deskRailIds = useMemo(
    () => new Set(getVisibleDashboardRailItems(deskRole).map((i) => i.id)),
    [deskRole],
  )
  const deskShowTasks = isDashboardPathAllowedForRole('/dashboard/tasks', deskRole)
  const deskShowMlmAnalytics = isDashboardPathAllowedForRole('/dashboard/partners/mlm', deskRole)
  const deskShowLeads = deskRailIds.has('leads')
  const deskShowCalendar = isDashboardPathAllowedForRole('/dashboard/calendar/personal', deskRole)
  const deskShowInfo = isDashboardPathAllowedForRole('/dashboard/settings/info', deskRole)
  const canOpenMyReport = isDashboardPathAllowedForRole('/dashboard/my-report', deskRole)

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [workspaceCalDate, setWorkspaceCalDate] = useState(() => workspaceCalDateInitial())
  const todayLocalIso = useMemo(() => workspaceCalDateInitial(), [])
  const workspaceCalPrevRef = useRef(workspaceCalDate)
  const isManager = currentUser?.role === 'manager'
  const managerId = isManager ? currentUser?.id ?? null : null

  /* ── подготовка данных ── */

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

  /* ── состояние интерфейса ── */

  const [mainTab, setMainTab] = useState<'tasks' | 'leads'>('tasks')
  const [taskMode, setTaskMode] = useState<'all' | 'today' | 'overdue'>('today')
  const [infoTab, setInfoTab] = useState<'notifs' | 'reminders' | 'news'>('notifs')
  const [todayTasksOverlayOpen, setTodayTasksOverlayOpenState] = useState(false)
  const [workspaceEventsOpen, setWorkspaceEventsOpenState] = useState(false)

  const setTodayTasksOverlayOpen = useCallback((value: boolean | ((b: boolean) => boolean)) => {
    setTodayTasksOverlayOpenState((prev) => {
      const next = typeof value === 'function' ? (value as (b: boolean) => boolean)(prev) : value
      if (next) setWorkspaceEventsOpenState(false)
      return next
    })
  }, [])

  const setWorkspaceEventsOpen = useCallback((value: boolean | ((b: boolean) => boolean)) => {
    setWorkspaceEventsOpenState((prev) => {
      const next = typeof value === 'function' ? (value as (b: boolean) => boolean)(prev) : value
      if (next) setTodayTasksOverlayOpenState(false)
      return next
    })
  }, [])

  useEffect(() => {
    if (!deskShowCalendar) setWorkspaceEventsOpenState(false)
  }, [deskShowCalendar])

  useEffect(() => {
    if (!deskShowLeads && mainTab === 'leads') setMainTab('tasks')
    if (!deskShowTasks && mainTab === 'tasks' && deskShowLeads) setMainTab('leads')
  }, [deskShowLeads, deskShowTasks, mainTab])

  useEffect(() => {
    if (workspaceCalDate !== todayLocalIso) setTodayTasksOverlayOpen(false)
  }, [workspaceCalDate, todayLocalIso])

  useEffect(() => {
    const prev = workspaceCalPrevRef.current
    workspaceCalPrevRef.current = workspaceCalDate
    if (workspaceCalDate === todayLocalIso && prev !== workspaceCalDate) {
      setTodayTasksOverlayOpen(true)
    }
  }, [workspaceCalDate, todayLocalIso])

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

  const todayOverlayTasks = useMemo(() => {
    const base = TASKS_MOCK.filter(mineTask).filter((t) => t.dueDate === todayIso && t.status !== 'done')
    const list = [...base]
    list.sort((a, b) => {
      const da = `${a.dueDate}T${a.dueTime ?? '00:00'}`
      const db = `${b.dueDate}T${b.dueTime ?? '00:00'}`
      return da.localeCompare(db)
    })
    return list
  }, [mineTask, todayIso])

  /* ── бейджи ── */
  const leadTabIds = useMemo(() => newLeads.map((l) => l.id), [newLeads])
  const badgeLeads = mainTab === 'tasks' ? unread.leads(leadTabIds) : 0
  const badgeTasks = mainTab === 'leads' ? unread.tasks(attentionTaskIds) : 0

  const remindersPreview = useMemo(() => REMINDERS_MOCK.filter((r) => !r.done).slice(0, DESK_PREVIEW), [])
  const newsPreview = useMemo(() => newsSorted.slice(0, DESK_PREVIEW), [newsSorted])

  const badgeNotifs = infoTab !== 'notifs' ? unread.notifs(notifIds) : 0
  const badgeReminders = infoTab !== 'reminders' ? unread.reminders(undoneReminderIds) : 0
  const badgeNews = infoTab !== 'news' ? unread.news(newsIdsOrdered) : 0

  /* ── прогресс и показатели ── */
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

  const focusDeskHref =
    focusGap > 0 && deskShowTasks
      ? '/dashboard/tasks'
      : canOpenMyReport
        ? '/dashboard/my-report'
        : null
  const focusDeskLinkLabel =
    focusGap > 0 && deskShowTasks ? 'Открыть задачи →' : canOpenMyReport ? 'К отчёту →' : null

  /* ═══════════════════ ОТРИСОВКА ═══════════════════ */

  /*
   * Сетка: слева на всю высоту задачи/лиды, по центру календарь и планы, справа на всю высоту лента.
   * Всё помещается в один экран — без прокрутки всей страницы.
   *
   * ┌─────────────┬───────────────────┬──────────────┐
   * │ Задачи/лиды │    Календарь      │    Лента     │
   * │  (высота)   ├───────────────────┤   (высота)   │
   * │             │ Планы / эффектив. │              │
   * └─────────────┴───────────────────┴──────────────┘
   */

  return (
    <div className="grid h-full min-h-0 w-full min-w-0 grid-cols-1 gap-1.5 lg:grid-cols-[minmax(300px,1.25fr)_minmax(0,1.55fr)_minmax(300px,1.35fr)] lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-1.5 lg:overflow-hidden">

      {/* ╔══════════════════════════════════════════╗
         ║  1. ЗАДАЧИ / НОВЫЕ ЛИДЫ  (сверху слева) ║
         ╚══════════════════════════════════════════╝ */}
      <HubWidgetShell accent="color-mix(in srgb, var(--gold) 60%, transparent)" className="lg:row-span-2">
        <WidgetHeader
          icon={<ListTodo className="size-3.5" strokeWidth={2} />}
          title={
            deskShowTasks && deskShowLeads
              ? null
              : deskShowTasks
                ? 'Задачи'
                : deskShowLeads
                  ? 'Лиды'
                  : 'Рабочий стол'
          }
          right={
            deskShowTasks && deskShowLeads ? (
              <div className="flex gap-1 rounded-lg border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-1">
                <TabBtn
                  variant="deskMain"
                  active={mainTab === 'tasks'}
                  badge={badgeTasks}
                  onClick={() => openMainTab('tasks')}
                >
                  Задачи
                </TabBtn>
                <TabBtn
                  variant="deskMain"
                  active={mainTab === 'leads'}
                  badge={badgeLeads}
                  onClick={() => openMainTab('leads')}
                >
                  Лиды
                </TabBtn>
              </div>
            ) : deskShowTasks ? (
              <Link
                to="/dashboard/tasks"
                className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
              >
                Все задачи →
              </Link>
            ) : deskShowLeads ? (
              <Link
                to="/dashboard/leads/poker"
                className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
              >
                Все лиды →
              </Link>
            ) : null
          }
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2.5 py-1">
          {!deskShowTasks && !deskShowLeads ? (
            <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 px-1 py-2 text-center">
              <p className="text-[14px] font-semibold leading-snug text-[color:var(--workspace-text)]">
                Контур по роли
              </p>
              <p className="text-[13px] leading-relaxed text-[color:var(--workspace-text-muted)]">
                Задачи и лиды в этом виджете недоступны. Откройте разделы в левом меню.
              </p>
              <div className="flex flex-col gap-2 sm:mx-auto sm:max-w-[240px]">
                {deskRailIds.has('secondary') && (
                  <Link
                    to="/dashboard/objects"
                    className="rounded-lg border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2.5 text-[13px] font-semibold text-[color:var(--workspace-text)] hover:border-[color:var(--theme-accent-link-dim)]"
                  >
                    Вторичный рынок
                  </Link>
                )}
                {deskRailIds.has('newbuild') && (
                  <Link
                    to="/dashboard/new-buildings"
                    className="rounded-lg border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2.5 text-[13px] font-semibold text-[color:var(--workspace-text)] hover:border-[color:var(--theme-accent-link-dim)]"
                  >
                    Новостройки
                  </Link>
                )}
                {deskRailIds.has('mls') && (
                  <Link
                    to="/dashboard/mls"
                    className="rounded-lg border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2.5 text-[13px] font-semibold text-[color:var(--workspace-text)] hover:border-[color:var(--theme-accent-link-dim)]"
                  >
                    Партнёры (MLS)
                  </Link>
                )}
                {deskShowMlmAnalytics && (
                  <Link
                    to="/dashboard/partners/mlm"
                    className="rounded-lg border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2.5 text-[13px] font-semibold text-[color:var(--workspace-text)] hover:border-[color:var(--theme-accent-link-dim)]"
                  >
                    MLM-аналитика
                  </Link>
                )}
                {deskRailIds.has('community') && (
                  <Link
                    to="/dashboard/community"
                    className="rounded-lg border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2.5 text-[13px] font-semibold text-[color:var(--workspace-text)] hover:border-[color:var(--theme-accent-link-dim)]"
                  >
                    Сообщество
                  </Link>
                )}
                {deskRailIds.has('team') && (
                  <Link
                    to="/dashboard/team"
                    className="rounded-lg border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2.5 text-[13px] font-semibold text-[color:var(--workspace-text)] hover:border-[color:var(--theme-accent-link-dim)]"
                  >
                    Команда
                  </Link>
                )}
                {deskShowInfo && (
                  <Link
                    to="/dashboard/settings/info"
                    className="rounded-lg border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2.5 text-[13px] font-semibold text-[color:var(--workspace-text)] hover:border-[color:var(--theme-accent-link-dim)]"
                  >
                    Инфо
                  </Link>
                )}
              </div>
            </div>
          ) : mainTab === 'tasks' && deskShowTasks ? (
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
                      'rounded px-1 py-px text-[11px] font-semibold uppercase tracking-wide transition-colors',
                      taskMode === m.id
                        ? 'bg-[color-mix(in_srgb,var(--gold)_20%,transparent)] text-[color:var(--workspace-text)]'
                        : 'text-[color:var(--workspace-text-muted)] hover:text-[color:var(--workspace-text)]',
                    )}
                  >
                    {m.label}
                  </button>
                ))}
                <Link
                  to="/dashboard/tasks"
                  className="ml-auto flex items-center gap-0.5 text-[12px] font-bold uppercase tracking-wide text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
                >
                  <Plus className="size-3" strokeWidth={2.5} />
                  В задачи
                </Link>
              </div>

              {filteredTasks.length === 0 ? (
                <p className="py-1 text-center text-[12px] text-[color:var(--workspace-text-muted)]">Нет задач</p>
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
                          <p className="line-clamp-1 text-[14px] font-medium leading-snug text-[color:var(--workspace-text)]">
                            {t.title}
                          </p>
                          <span className={cn(
                            'shrink-0 rounded px-1 py-px text-[10px] font-bold uppercase',
                            t.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                            t.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-[rgba(255,255,255,0.06)] text-[color:var(--workspace-text-muted)]',
                          )}>
                            {PRIORITY_LABELS[t.priority]}
                          </span>
                        </div>
                        <div className="mt-px flex flex-wrap items-center gap-x-1 text-[11px] text-[color:var(--workspace-text-muted)]">
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
                <p className="mt-0.5 shrink-0 text-[11px] text-[color:var(--workspace-text-muted)]">
                  +ещё {filteredTasks.length - TASKS_PREVIEW} →{' '}
                  <Link to="/dashboard/tasks" className="font-semibold text-[color:var(--theme-accent-link-dim)] hover:underline">перейти в задачи</Link>
                </p>
              )}
            </>
          ) : deskShowLeads ? (
            <>
              <div className="mb-0.5 flex items-center justify-between">
                <p className="text-[12px] text-[color:var(--workspace-text-muted)]">Очередь «Новый лид»</p>
                <Link
                  to="/dashboard/leads/poker"
                  className="flex items-center gap-0.5 text-[12px] font-bold uppercase tracking-wide text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
                >
                  <Plus className="size-3" strokeWidth={2.5} />
                  В лиды
                </Link>
              </div>
              {newLeads.length === 0 ? (
                <p className="py-1 text-center text-[12px] text-[color:var(--workspace-text-muted)]">Нет новых лидов</p>
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
                          <p className="line-clamp-1 text-[14px] font-medium text-[color:var(--workspace-text)]">
                            {l.name ?? l.id}
                          </p>
                          <span className="shrink-0 rounded px-1 py-px text-[10px] font-bold uppercase text-amber-400/90">
                            {leadUrgency(l)}
                          </span>
                        </div>
                        <div className="mt-px flex flex-wrap items-center gap-x-1 text-[11px] text-[color:var(--workspace-text-muted)]">
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
                        <div className="mt-px text-[11px] text-[color:var(--workspace-text-muted)]">
                          Отв.: {managerName(l.managerId)}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
              {newLeads.length > LEADS_PREVIEW && (
                <p className="mt-0.5 shrink-0 text-[11px] text-[color:var(--workspace-text-muted)]">
                  +ещё {newLeads.length - LEADS_PREVIEW} в очереди
                </p>
              )}
            </>
          ) : null}
        </div>
      </HubWidgetShell>

      {/* ╔══════════════════════════════════════════╗
         ║  2–4. Центр: календарь + планы (оверлей дел) ║
         ╚══════════════════════════════════════════╝ */}
      <div className="flex min-h-0 flex-col gap-1.5 lg:col-start-2 lg:row-span-2 lg:row-start-1">
      <HubWidgetShell accent="rgba(96,165,250,0.6)" className="min-h-0 flex-1">
        <WidgetHeader
          icon={<CalendarDays className="size-3.5" strokeWidth={2} />}
          title="Календарь"
          accentColor="#60a5fa"
          right={
            deskShowCalendar ? (
              <Link
                to="/dashboard/calendar"
                className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
              >
                Полный календарь →
              </Link>
            ) : null
          }
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-1.5">
          {deskShowCalendar ? (
            <>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)]/50 p-1.5">
                <MiniCalendar
                  variant="workspace"
                  hideFooterLink
                  hideDayPanel
                  selectedDate={workspaceCalDate}
                  onSelectedDateChange={setWorkspaceCalDate}
                  onTodayReactivate={() => setTodayTasksOverlayOpen((o) => !o)}
                />
              </div>
              <div className="mt-1 flex shrink-0 items-center gap-2">
                <WorkspaceDayEventsMenu
                  className="min-w-0 flex-1"
                  dateIso={workspaceCalDate}
                  open={workspaceEventsOpen}
                  onOpenChange={setWorkspaceEventsOpen}
                />
                <div className="flex shrink-0 items-center gap-2.5 text-[12px] text-[color:var(--workspace-text-muted)]">
                  <span className="flex items-center gap-1">
                    <Eye className="size-3.5 text-blue-300" />
                    Показ
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="size-3.5 text-violet-300" />
                    Звонок
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5 text-[color:var(--workspace-cal-meeting-dot)]" />
                    Встреча
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)]/40 px-4 py-6 text-center">
              <p className="text-[13px] leading-relaxed text-[color:var(--workspace-text-muted)]">
                Полный календарь по этой роли недоступен. Мини-календарь на рабочем столе скрыт.
              </p>
            </div>
          )}
        </div>
      </HubWidgetShell>

      <div className="relative min-h-0 flex-1">
      {/* ╔══════════════════════════════════════════╗
         ║  4. ПЛАНЫ + СТРИК (нижняя половина центра)  ║
         ╚══════════════════════════════════════════╝ */}
      <HubWidgetShell accent="rgba(251,146,60,0.6)" className="flex h-full min-h-0 flex-col">
        <WidgetHeader
          icon={<Target className="size-3.5" strokeWidth={2} />}
          title="Выполнение планов"
          accentColor="#fb923c"
          right={
            canOpenMyReport ? (
              <Link
                to="/dashboard/my-report"
                className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
              >
                Отчёт →
              </Link>
            ) : null
          }
        />

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto px-3 py-2 pb-2.5">
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
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, progress.dayPlanPercent)}%`, background: 'linear-gradient(90deg, var(--gold), var(--gold-dark))' }} />
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
              { label: 'Выручка', value: progress.revenue.currentLabel, sub: `/ ${progress.revenue.planLabel}`, pct: progress.revenue.percent, color: 'var(--gold)' },
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

          <div className="shrink-0 rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)]/65 px-3 py-2">
            <div className="flex flex-col gap-2">
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

              <div className="flex flex-col gap-1 border-t border-[color:var(--workspace-row-border)] pt-2 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                <p className="min-w-0 text-[10px] leading-snug text-[color:var(--workspace-text-muted)]">
                  Следующий шаг: {focusGap > 0 ? `закрыть +${focusGap} по фокусу` : 'удержать текущий темп'}
                </p>
                {focusDeskHref && focusDeskLinkLabel ? (
                  <Link
                    to={focusDeskHref}
                    className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
                  >
                    {focusDeskLinkLabel}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          <div className="shrink-0 rounded-lg border border-orange-400/25 bg-gradient-to-r from-[#f97316]/[0.12] via-[#f97316]/[0.06] to-transparent px-3 py-2.5">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2">
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

              <div className="shrink-0">
                <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-bold uppercase leading-normal text-orange-100/80">
                  <span className="shrink-0">Цель дня</span>
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

      {workspaceEventsOpen && deskShowCalendar ? (
        <HubWidgetShell
          accent="rgba(96,165,250,0.65)"
          className="absolute inset-0 z-[24] flex min-h-0 flex-col overflow-hidden rounded-lg shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
        >
          <WidgetHeader
            icon={<CalendarClock className="size-3.5" strokeWidth={2} />}
            title={`Мероприятия · ${formatWorkspaceDayShort(workspaceCalDate)}`}
            accentColor="#60a5fa"
            right={
              <button
                type="button"
                onClick={() => setWorkspaceEventsOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-md border border-[color:var(--workspace-row-border)] text-[color:var(--workspace-text-muted)] transition-colors hover:bg-[var(--workspace-row-bg)] hover:text-[color:var(--workspace-text)]"
                aria-label="Закрыть мероприятия"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            }
          />
          <WorkspaceDayEventsPanel dateIso={workspaceCalDate} />
        </HubWidgetShell>
      ) : null}

      {todayTasksOverlayOpen && deskShowCalendar && deskShowTasks ? (
        <HubWidgetShell
          accent="rgba(96,165,250,0.65)"
          className="absolute inset-0 z-[25] flex min-h-0 flex-col overflow-hidden rounded-lg shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
        >
          <WidgetHeader
            icon={<ListTodo className="size-3.5" strokeWidth={2} />}
            title="Дела на сегодня"
            accentColor="#60a5fa"
            right={
              <button
                type="button"
                onClick={() => setTodayTasksOverlayOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-md border border-[color:var(--workspace-row-border)] text-[color:var(--workspace-text-muted)] transition-colors hover:bg-[var(--workspace-row-bg)] hover:text-[color:var(--workspace-text)]"
                aria-label="Закрыть список дел"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            }
          />
          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-2">
            {todayOverlayTasks.length === 0 ? (
              <p className="py-2 text-center text-[12px] text-[color:var(--workspace-text-muted)]">
                Нет задач на сегодня
              </p>
            ) : (
              <ul className="min-h-0 space-y-0.5">
                {todayOverlayTasks.map((t) => {
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
                        <p className="line-clamp-2 text-[13px] font-medium leading-snug text-[color:var(--workspace-text)]">
                          {t.title}
                        </p>
                        <span
                          className={cn(
                            'shrink-0 rounded px-1 py-px text-[10px] font-bold uppercase',
                            t.priority === 'critical'
                              ? 'bg-red-500/20 text-red-300'
                              : t.priority === 'high'
                                ? 'bg-orange-500/20 text-orange-300'
                                : 'bg-[rgba(255,255,255,0.06)] text-[color:var(--workspace-text-muted)]',
                          )}
                        >
                          {PRIORITY_LABELS[t.priority]}
                        </span>
                      </div>
                      <div className="mt-px flex flex-wrap items-center gap-x-1 text-[11px] text-[color:var(--workspace-text-muted)]">
                        <span className={cn(overdue && 'font-bold text-red-400')}>{STATUS_LABELS[t.status]}</span>
                        <span className="opacity-40">·</span>
                        <span>
                          {t.dueDate}
                          {t.dueTime ? ` ${t.dueTime}` : ''}
                        </span>
                        {t.entityLabel ? (
                          <>
                            <span className="opacity-40">·</span>
                            <span className="truncate text-[color:var(--theme-accent-link-dim)]">{t.entityLabel}</span>
                          </>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            <Link
              to="/dashboard/tasks"
              className="mt-1 shrink-0 text-center text-[11px] font-bold uppercase tracking-wide text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
            >
              Все задачи →
            </Link>
          </div>
        </HubWidgetShell>
      ) : null}
      </div>
      </div>

      {/* ╔══════════════════════════════════════════╗
         ║  3. УВЕДОМЛЕНИЯ / НАПОМИНАНИЯ / НОВОСТИ  ║
         ╚══════════════════════════════════════════╝ */}
      <HubWidgetShell accent="rgba(52,211,153,0.5)" className="lg:col-start-3 lg:row-span-2 lg:row-start-1">
        <WidgetHeader
          icon={<Bell className="size-3.5" strokeWidth={2} />}
          title={null}
          accentColor="#34d399"
          right={
            <div className="flex min-w-0 max-w-[min(100%,20rem)] gap-0.5 rounded-lg border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] p-0.5 sm:max-w-none">
              <InfoTabBtn active={infoTab === 'notifs'} badge={badgeNotifs} onClick={() => openInfoTab('notifs')}>
                Уведомления
              </InfoTabBtn>
              <InfoTabBtn active={infoTab === 'reminders'} badge={badgeReminders} onClick={() => openInfoTab('reminders')}>
                Напоминания
              </InfoTabBtn>
              <InfoTabBtn active={infoTab === 'news'} badge={badgeNews} onClick={() => openInfoTab('news')}>
                Новости
              </InfoTabBtn>
            </div>
          }
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2.5 py-1">
          {infoTab === 'notifs' && (
            <>
              {deskShowInfo ? (
                <Link
                  to="/dashboard/settings/info"
                  className="mb-0.5 shrink-0 self-start text-[11px] font-bold uppercase tracking-wide text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
                >
                  Все уведомления →
                </Link>
              ) : null}
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
                      <p className={FEED_TITLE_CLASS}>
                        {n.title}
                      </p>
                      <p className={FEED_BODY_CLASS}>
                        {n.body}
                      </p>
                      <p className={FEED_META_CLASS}>{n.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {infoTab === 'reminders' && (
            <>
              {deskShowInfo ? (
                <Link
                  to="/dashboard/settings/info/reminders"
                  className="mb-0.5 shrink-0 self-start text-[11px] font-bold uppercase tracking-wide text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
                >
                  Все напоминания →
                </Link>
              ) : null}
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
                      <p className="line-clamp-1 text-[12px] font-medium leading-snug text-[color:var(--workspace-text)]">
                        {r.title}
                      </p>
                      <p className="flex items-center gap-0.5 text-[11px] text-[color:var(--theme-accent-link)]">
                        {formatReminderDue(r.dueAt)}
                        {r.entityLabel && <span className="text-[color:var(--workspace-text-muted)]"> · {r.entityLabel}</span>}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {infoTab === 'news' && (
            <>
              {deskShowInfo ? (
                <Link
                  to="/dashboard/settings/info/news"
                  className="mb-0.5 shrink-0 self-start text-[11px] font-bold uppercase tracking-wide text-[color:var(--theme-accent-link-dim)] hover:text-[color:var(--theme-accent-link)]"
                >
                  Все новости →
                </Link>
              ) : null}
              <ul className="min-h-0 flex-1 space-y-0.5 overflow-hidden">
                {newsPreview.map((a) => (
                  <li
                    key={a.id}
                    className={cn(
                      'flex gap-1.5 overflow-hidden rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-1',
                      FEED_ITEM_HEIGHT_CLASS,
                    )}
                  >
                    <span className="flex size-3.5 shrink-0 items-center justify-center text-[12px] leading-none">
                      {a.emoji}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <p className={FEED_TITLE_CLASS}>
                        {a.title}
                      </p>
                      <p className={FEED_BODY_CLASS}>
                        {a.body}
                      </p>
                      <p className={FEED_META_CLASS}>
                        {new Date(a.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} · {a.author}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </HubWidgetShell>
    </div>
  )
}
