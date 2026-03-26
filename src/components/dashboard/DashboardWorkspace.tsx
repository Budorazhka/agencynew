import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  AlarmClock,
  Bell,
  CalendarDays,
  Check,
  CheckCircle,
  Clock,
  Info,
  ListTodo,
  Newspaper,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { useNewsFeed } from '@/context/NewsFeedContext'
import { TASKS_MOCK } from '@/data/tasks-mock'
import { REMINDERS_MOCK } from '@/data/info-mock'
import { DASHBOARD_NOTIFICATIONS_PREVIEW } from '@/data/home-workspace-mock'
import { MiniCalendar } from '@/components/dashboard/MiniCalendar'

function HubWidgetShell({
  children,
  className,
  minH,
}: {
  children: React.ReactNode
  className?: string
  /** Tailwind min-height class, default matches CRM card feel */
  minH?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-md bg-[var(--workspace-card-bg)] backdrop-blur-xl',
        'shadow-[inset_0_0_0_1px_var(--workspace-card-ring)]',
        'p-5 transition-[background,box-shadow] duration-200',
        'hover:bg-[var(--workspace-card-hover)] hover:shadow-[inset_0_0_0_1px_var(--workspace-card-ring-hover)]',
        minH ?? 'min-h-[280px]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function WidgetTitle({
  icon,
  children,
  compact,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  /** Узкий заголовок для стека виджетов справа */
  compact?: boolean
}) {
  return (
    <div className={cn('flex items-center', compact ? 'mb-0 gap-2' : 'mb-4 gap-3')}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-[10px] border border-[rgba(230,195,100,0.2)] bg-[rgba(230,195,100,0.1)] text-[#e6c364]',
          compact ? 'size-8' : 'size-10',
        )}
      >
        {icon}
      </div>
      <h3 className={cn('font-bold uppercase tracking-[0.12em] text-[#e6c364]', compact ? 'text-[10px]' : 'text-[11px]')}>
        {children}
      </h3>
    </div>
  )
}

function notifIcon(type: (typeof DASHBOARD_NOTIFICATIONS_PREVIEW)[number]['type']) {
  switch (type) {
    case 'alert':
      return <AlertTriangle className="size-3.5 shrink-0 text-red-400" />
    case 'success':
      return <CheckCircle className="size-3.5 shrink-0 text-emerald-400" />
    case 'info':
      return <Info className="size-3.5 shrink-0 text-blue-400" />
    case 'auto':
      return <Zap className="size-3.5 shrink-0 text-amber-400" />
    default:
      return <Info className="size-3.5 shrink-0 text-[color:var(--workspace-text-dim)]" />
  }
}

function formatReminderDue(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function DashboardWorkspace() {
  const { currentUser } = useAuth()
  const { allArticles } = useNewsFeed()

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], [])

  const { todayTasks, todayTasksScope } = useMemo(() => {
    const pool = TASKS_MOCK.filter(t => t.dueDate === todayIso && t.status !== 'done')
    const mine = pool.filter(t => (currentUser?.id ? t.assignedToId === currentUser.id : true))
    const list = mine.length > 0 ? mine : pool
    list.sort((a, b) => (a.dueTime ?? '').localeCompare(b.dueTime ?? ''))
    return {
      todayTasks: list,
      todayTasksScope: mine.length > 0 ? ('mine' as const) : pool.length > 0 ? ('office' as const) : ('empty' as const),
    }
  }, [todayIso, currentUser?.id])

  const remindersPreview = useMemo(
    () => REMINDERS_MOCK.filter(r => !r.done).slice(0, 4),
    [],
  )
  const newsPreview = useMemo(() => allArticles.slice(0, 4), [allArticles])

  return (
    <div className="grid h-full min-h-0 w-full min-w-0 grid-cols-1 gap-3 lg:grid-cols-12 lg:grid-rows-1">
      {/* 1. Слева (кол. 1–4): только «План на сегодня» */}
      <HubWidgetShell className="h-full min-h-0 overflow-hidden p-4 lg:col-span-4 lg:col-start-1 lg:row-start-1" minH="min-h-0">
        <div className="mb-1 flex items-start justify-between gap-2">
          <WidgetTitle icon={<ListTodo className="size-5" strokeWidth={2} />}>План на сегодня</WidgetTitle>
          <Link
            to="/dashboard/tasks"
            className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#e6c364]/70 hover:text-[#e6c364]"
          >
            Все задачи
          </Link>
        </div>
        <p className="mb-3 text-[10px] leading-snug text-[color:var(--workspace-text-muted)]">
          {todayTasksScope === 'office'
            ? 'На сегодня у вас личных задач нет — показан общий реестр офиса.'
            : `Реестр задач с дедлайном на сегодня${currentUser?.name ? ` — ${currentUser.name.split(/\s+/)[0]}` : ''}.`}
        </p>
        {todayTasks.length === 0 ? (
          <p className="text-sm text-[color:var(--workspace-text-dim)]">На сегодня задач нет.</p>
        ) : (
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {todayTasks.map(t => (
              <li
                key={t.id}
                className="flex items-start gap-3 rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-3 py-2"
              >
                <div
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border',
                    t.status === 'in_progress'
                      ? 'border-[#60a5fa]/50 bg-[#60a5fa]/10'
                      : 'border-[rgba(230,195,100,0.35)]',
                  )}
                >
                  {t.status === 'in_progress' ? (
                    <Clock className="size-3 text-[#60a5fa]" />
                  ) : (
                    <Check className="size-3 text-[#e6c364]/40" strokeWidth={2.5} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-snug text-[color:var(--workspace-text)]">{t.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[10px] text-[color:var(--workspace-text-dim)]">
                    {t.dueTime && <span>{t.dueTime}</span>}
                    {t.entityLabel && <span className="truncate">{t.entityLabel}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </HubWidgetShell>

      {/* 2. Центр (кол. 5–8): только календарь */}
      <HubWidgetShell className="h-full min-h-0 overflow-hidden lg:col-span-4 lg:col-start-5 lg:row-start-1" minH="min-h-0">
        <WidgetTitle icon={<CalendarDays className="size-5" strokeWidth={2} />}>Календарь</WidgetTitle>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <MiniCalendar />
        </div>
      </HubWidgetShell>

      {/* 3. Справа (кол. 9–12): уведомления, напоминания, новости */}
      <div className="flex h-full min-h-0 flex-col gap-2 lg:col-span-4 lg:col-start-9 lg:row-start-1">
        <HubWidgetShell className="min-h-0 flex-1 overflow-hidden p-4" minH="min-h-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <WidgetTitle compact icon={<Bell className="size-4" strokeWidth={2} />}>
              Уведомления
            </WidgetTitle>
            <Link
              to="/dashboard/info"
              className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#e6c364]/70 hover:text-[#e6c364]"
            >
              Все
            </Link>
          </div>
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {DASHBOARD_NOTIFICATIONS_PREVIEW.map(n => (
              <li key={n.id} className="flex gap-2">
                {notifIcon(n.type)}
                <div className="min-w-0">
                  <p className="text-[11px] font-medium leading-snug text-[color:var(--workspace-text)]">{n.title}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-[color:var(--workspace-text-muted)]">{n.body}</p>
                  <p className="mt-0.5 text-[9px] text-[color:var(--workspace-text-dim)]">{n.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </HubWidgetShell>

        <HubWidgetShell className="min-h-0 flex-1 overflow-hidden p-4" minH="min-h-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <WidgetTitle compact icon={<AlarmClock className="size-4" strokeWidth={2} />}>
              Напоминания
            </WidgetTitle>
            <Link
              to="/dashboard/info/reminders"
              className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#e6c364]/70 hover:text-[#e6c364]"
            >
              Все
            </Link>
          </div>
          <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
            {remindersPreview.map(r => (
              <li
                key={r.id}
                className="flex items-start gap-2 rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)] px-2 py-1.5"
              >
                <div className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded border border-[rgba(230,195,100,0.25)]" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium leading-snug text-[color:var(--workspace-text)]">{r.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[9px] text-[#e6c364]/70">
                    <Clock className="size-2.5" />
                    {formatReminderDue(r.dueAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </HubWidgetShell>

        <HubWidgetShell className="min-h-0 flex-1 overflow-hidden p-4" minH="min-h-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <WidgetTitle compact icon={<Newspaper className="size-4" strokeWidth={2} />}>
              Новости
            </WidgetTitle>
            <Link
              to="/dashboard/info/news"
              className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#e6c364]/70 hover:text-[#e6c364]"
            >
              Все
            </Link>
          </div>
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {newsPreview.map(a => (
              <li key={a.id} className="border-l-2 border-[rgba(230,195,100,0.25)] pl-2.5">
                <p className="text-[11px] font-medium leading-snug text-[color:var(--workspace-text)]">
                  {a.emoji} {a.title}
                </p>
                <p className="mt-0.5 text-[9px] text-[color:var(--workspace-text-dim)]">
                  {new Date(a.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} · {a.author}
                </p>
              </li>
            ))}
          </ul>
        </HubWidgetShell>
      </div>
    </div>
  )
}
