import { useMemo, useState } from 'react'
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
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { TASKS_MOCK } from '@/data/tasks-mock'
import { NEWS_MOCK, REMINDERS_MOCK } from '@/data/info-mock'
import {
  HOME_PROGRESS_MOCK,
  DASHBOARD_NOTIFICATIONS_PREVIEW,
} from '@/data/home-workspace-mock'
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
        'flex flex-col rounded-md bg-[rgba(15,35,30,0.8)] backdrop-blur-xl',
        'shadow-[inset_0_0_0_1px_rgba(230,195,100,0.15)]',
        'p-6 transition-[background,box-shadow] duration-200',
        'hover:bg-[rgba(25,46,40,0.9)] hover:shadow-[inset_0_0_0_1px_rgba(230,195,100,0.35)]',
        minH ?? 'min-h-[280px]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function WidgetTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(230,195,100,0.2)] bg-[rgba(230,195,100,0.1)] text-[#e6c364]">
        {icon}
      </div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#e6c364]">{children}</h3>
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
      return <Info className="size-3.5 shrink-0 text-[#d0e8df]/50" />
  }
}

function formatReminderDue(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function ProgressBar({ value, trackClass }: { value: number; trackClass?: string }) {
  const v = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-[rgba(0,17,13,0.65)]', trackClass)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#e6c364] to-[#9e8028]"
        style={{ width: `${v}%`, boxShadow: 'inset 0 0 6px rgba(255,255,255,0.12)' }}
      />
    </div>
  )
}

export function DashboardWorkspace() {
  const { currentUser } = useAuth()
  const [feedTab, setFeedTab] = useState<'news' | 'notifications' | 'reminders'>('news')

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
    () => REMINDERS_MOCK.filter(r => !r.done).slice(0, 5),
    [],
  )

  const newsPreview = useMemo(() => NEWS_MOCK.slice(0, 5), [])

  const progress = HOME_PROGRESS_MOCK
  const leadsPct = Math.round((progress.leadsToday.count / Math.max(1, progress.leadsToday.plan)) * 100)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* 1. План на сегодня */}
      <HubWidgetShell>
        <div className="mb-1 flex items-start justify-between gap-2">
          <WidgetTitle icon={<ListTodo className="size-5" strokeWidth={2} />}>План на сегодня</WidgetTitle>
          <Link
            to="/dashboard/tasks"
            className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#e6c364]/70 hover:text-[#e6c364]"
          >
            Все задачи
          </Link>
        </div>
        <p className="mb-4 text-[11px] leading-snug text-[rgba(194,200,196,0.55)]">
          {todayTasksScope === 'office'
            ? 'На сегодня у вас личных задач нет — показан общий реестр офиса.'
            : `Реестр задач с дедлайном на сегодня${currentUser?.name ? ` — ${currentUser.name.split(/\s+/)[0]}` : ''}.`}
        </p>
        {todayTasks.length === 0 ? (
          <p className="text-sm text-[rgba(194,200,196,0.45)]">На сегодня задач нет.</p>
        ) : (
          <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
            {todayTasks.map(t => (
              <li
                key={t.id}
                className="flex items-start gap-3 rounded-md border border-[rgba(230,195,100,0.08)] bg-[rgba(0,17,13,0.35)] px-3 py-2"
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
                  <p className="text-[13px] font-medium leading-snug text-[#d0e8df]">{t.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[10px] text-[#d0e8df]/40">
                    {t.dueTime && <span>{t.dueTime}</span>}
                    {t.entityLabel && <span className="truncate">{t.entityLabel}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </HubWidgetShell>

      {/* 2. Мой прогресс */}
      <HubWidgetShell>
        <WidgetTitle icon={<TrendingUp className="size-5" strokeWidth={2} />}>Мой прогресс</WidgetTitle>
        <p className="mb-5 text-[11px] leading-snug text-[rgba(194,200,196,0.55)]">
          Ключевые метрики: выручка, движение по воронке от «Новый лид» к сделке (без отказов), лиды за сегодня.
        </p>

        <div className="space-y-5">
          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#d0e8df]/45">План по выручке</span>
              <span className="text-xs font-bold text-[#d0e8df]">
                {progress.revenue.currentLabel}{' '}
                <span className="text-[#d0e8df]/40">/ {progress.revenue.planLabel}</span>
              </span>
            </div>
            <ProgressBar value={progress.revenue.percent} />
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#d0e8df]/45">Прогресс по воронке</span>
              <span className="text-xs font-bold text-[#e6c364]">{progress.funnelProgress.percent}%</span>
            </div>
            <p className="mb-1.5 text-[10px] leading-snug text-[#d0e8df]/35">{progress.funnelProgress.subtitle}</p>
            <ProgressBar value={progress.funnelProgress.percent} />
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#d0e8df]/45">Лиды за сегодня</span>
              <span className="text-xs font-bold text-[#d0e8df]">
                {progress.leadsToday.count}{' '}
                <span className="text-[#d0e8df]/40">/ {progress.leadsToday.plan}</span>
              </span>
            </div>
            <ProgressBar value={leadsPct} />
          </div>
        </div>
      </HubWidgetShell>

      {/* 3. Новости / уведомления / напоминания */}
      <HubWidgetShell className="min-h-[320px]">
        <WidgetTitle icon={<Newspaper className="size-5" strokeWidth={2} />}>Лента</WidgetTitle>

        <div className="mb-3 flex gap-1 border-b border-[rgba(230,195,100,0.12)]">
          {(
            [
              { id: 'news' as const, label: 'Новости', Icon: Newspaper },
              { id: 'notifications' as const, label: 'Уведомления', Icon: Bell },
              { id: 'reminders' as const, label: 'Напоминания', Icon: AlarmClock },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFeedTab(id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 border-b-2 px-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors',
                feedTab === id
                  ? 'border-[#e6c364] text-[#e6c364]'
                  : 'border-transparent text-[#d0e8df]/35 hover:text-[#d0e8df]/55',
              )}
            >
              <Icon className="size-3.5 shrink-0 opacity-80" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="min-h-[200px] flex-1 overflow-y-auto pr-1">
          {feedTab === 'news' && (
            <ul className="space-y-3">
              {newsPreview.map(a => (
                <li key={a.id} className="border-l-2 border-[rgba(230,195,100,0.25)] pl-3">
                  <p className="text-[12px] font-medium leading-snug text-[#d0e8df]">{a.emoji} {a.title}</p>
                  <p className="mt-1 text-[10px] text-[#d0e8df]/35">
                    {new Date(a.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} · {a.author}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {feedTab === 'notifications' && (
            <ul className="space-y-3">
              {DASHBOARD_NOTIFICATIONS_PREVIEW.map(n => (
                <li key={n.id} className="flex gap-2.5">
                  {notifIcon(n.type)}
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium leading-snug text-[#d0e8df]">{n.title}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-[#d0e8df]/45">{n.body}</p>
                    <p className="mt-1 text-[10px] text-[#d0e8df]/30">{n.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {feedTab === 'reminders' && (
            <ul className="space-y-2.5">
              {remindersPreview.map(r => (
                <li key={r.id} className="flex items-start gap-2 rounded-md border border-[rgba(230,195,100,0.08)] bg-[rgba(0,17,13,0.35)] px-2.5 py-2">
                  <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-[rgba(230,195,100,0.25)]" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium leading-snug text-[#d0e8df]">{r.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#e6c364]/70">
                      <Clock className="size-3" />
                      {formatReminderDue(r.dueAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-3 border-t border-[rgba(66,72,70,0.2)] pt-3 text-right">
          <Link
            to={feedTab === 'news' ? '/dashboard/info/news' : feedTab === 'reminders' ? '/dashboard/info/reminders' : '/dashboard/info'}
            className="text-[10px] font-semibold uppercase tracking-wider text-[#e6c364]/70 hover:text-[#e6c364]"
          >
            Открыть раздел
          </Link>
        </div>
      </HubWidgetShell>

      {/* 4. Календарь — на всю ширину нижнего ряда */}
      <HubWidgetShell className="lg:col-span-3 lg:min-h-[340px]" minH="min-h-[320px]">
        <WidgetTitle icon={<CalendarDays className="size-5" strokeWidth={2} />}>Календарь</WidgetTitle>
        <div className="min-h-[260px] lg:min-h-[280px]">
          <MiniCalendar />
        </div>
      </HubWidgetShell>
    </div>
  )
}
