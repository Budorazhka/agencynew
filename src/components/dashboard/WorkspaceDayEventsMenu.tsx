import { useState } from 'react'
import { CalendarClock, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CALENDAR_EVENTS_MOCK } from '@/data/calendar-events-mock'
import { cn } from '@/lib/utils'

type Props = {
  dateIso: string
  className?: string
}

function formatDayShort(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/** Inline-раскрытие мероприятий дня — без порталов и отдельных окон. */
export function WorkspaceDayEventsMenu({ dateIso, className }: Props) {
  const events = CALENDAR_EVENTS_MOCK.filter((e) => e.date === dateIso)
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('flex flex-col', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-center gap-1.5 rounded-md border border-[color:var(--workspace-row-border)]',
          'bg-[var(--workspace-row-bg)]/80 px-2 py-1.5 text-left text-[10px] font-semibold text-[color:var(--workspace-text)]',
          'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition-colors',
          'hover:border-[color:var(--hub-card-border-hover)] hover:bg-[var(--workspace-row-bg)]',
          open && 'border-[rgba(230,195,100,0.45)] bg-[rgba(230,195,100,0.08)]',
          'outline-none focus-visible:ring-2 focus-visible:ring-[rgba(230,195,100,0.35)]',
        )}
      >
        <CalendarClock className="size-3.5 shrink-0 text-[color:var(--theme-accent-link-dim)]" strokeWidth={2} />
        <span className="min-w-0 flex-1 truncate">
          Мероприятия · {formatDayShort(dateIso)}
        </span>
        <span className="shrink-0 tabular-nums text-[10px] font-bold text-[color:var(--workspace-text-muted)]">
          {events.length}
        </span>
        <ChevronDown
          className={cn('size-3 shrink-0 text-[color:var(--workspace-text-dim)] transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="mt-1 rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-card-bg)] p-1.5">
          {events.length === 0 ? (
            <p className="px-1 py-2 text-center text-[10px] text-[color:var(--workspace-text-dim)]">
              Нет мероприятий
            </p>
          ) : (
            <ul className="space-y-1">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="rounded-md border border-[color:var(--workspace-row-border)] bg-[var(--workspace-row-bg)]/40 px-2 py-1"
                >
                  <p className="text-[11px] font-medium leading-snug text-[color:var(--workspace-text)]">
                    <span className="font-bold text-[color:var(--theme-accent-link)]">{ev.time}</span> · {ev.title}
                  </p>
                  {ev.client && (
                    <p className="mt-0.5 text-[9px] text-[color:var(--workspace-text-dim)]">{ev.client}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/dashboard/calendar"
            className="mt-1.5 block rounded-md px-2 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-[color:var(--theme-accent-link-dim)] hover:bg-[rgba(230,195,100,0.08)] hover:text-[color:var(--theme-accent-link)]"
          >
            Полный календарь
          </Link>
        </div>
      )}
    </div>
  )
}
